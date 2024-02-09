class ThunkWrapper {

    get type() {
        return this.t.type;
    }
    get thunk() {
        return this.t;
    }

    constructor(t) {
        this.t = t;
        this.normaliseWrappers();
    }
    clone() {
        return new ThunkWrapper(this.thunk.clone());
    }
    toString() {
        return `${this.t}`;
    }

    normaliseWrappers() {
        while (this.t instanceof ThunkWrapper)
            this.t = this.t.t;
        return this;
    }

    canStep() {
        return this.t.canStep();
    }
    step() {
        if (!this.canStep())
            throw `Can't bind to ${this.t.constructor.name}`
        this.t = this.t.step();
        return this.normaliseWrappers();
    }

    canBind() {
        return this.t.canBind();
    }
    bind(t1) {
        if (!this.canBind())
            throw `Can't bind to ${this.t.constructor.name}`
        this.t = this.t.bind(t1);
        return this.normaliseWrappers();
    }

    replaceUnboundThunks(rs) {
        this.t = this.t.replaceUnboundThunks(rs);
        return this;
    }
    applyTypeConstraints(cs) {
        this.t = this.t.applyTypeConstraints(cs);
        return this;
    }

}

class LiteralThunk {

    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
    clone() {
        return new LiteralThunk(this.value, this.type.clone());
    }
    toString() {
        return `${this.value}`;
    }

    canStep() {
        return false;
    }
    canBind() {
        return false;
    }

    replaceUnboundThunks(rs) {
        return this.clone();
    }
    applyTypeConstraints(cs) {
        return this.clone();
    }
}

class UnboundThunk {

    constructor(symbol, type = undefined) {
        this.symbol = symbol;
        this.type = type === undefined ? new UnboundType(this.symbol) : type;
    }
    clone() {
        return new UnboundThunk(this.symbol, this.type.clone());
    }
    toString() {
        return `${this.symbol}`;
    }

    canStep() {
        return false;
    }
    canBind() {
        return false;
    }

    replaceUnboundThunks(rs) {
        if (this.symbol in rs)
            return rs[this.symbol];
        return this;
    }
    applyTypeConstraints(cs) {
        if (this.symbol in cs)
            this.type = cs[this.symbol];
        return this;
    }
}

class ApplicationThunk {

    get type() {
        return this.t1.type.bind(this.t2.type);
    }

    constructor(t1, t2) {
        this.id = Math.random(); // Probably unique.
        this.t1 = new ThunkWrapper(t1);
        this.t2 = new ThunkWrapper(t2);
    }
    clone() {
        return new ApplicationThunk(this.t1.clone(), this.t2.clone());
    }
    toString() {
        let content;
        if (this.t2.thunk instanceof ApplicationThunk)
            content = `${this.t1} ${this.t2}`;
        else
            content = `${this.t1} ${this.t2}`;
        return `
            <span class="application"
                id="${this.parent.id}"
                onclick="applicationClick(event, ${this.id})"
                onmouseover="applicationMouseOver(event, ${this.id})"
                onmouseout="applicationMouseOut(event, ${this.id})"
            >${content}</span>
        `.trim();
    }

    canStep() {
        return true;
    }
    canBind() {
        return false;
    }

    step() {
        if (this.t1.canBind())
            return this.t1.bind(this.t2);
        return new ApplicationThunk(this.t1.step(), this.t2);
    }

    replaceUnboundThunks(rs) {
        return new ApplicationThunk(
            this.t1.replaceUnboundThunks(rs),
            this.t2.replaceUnboundThunks(rs)
        );
    }
    applyTypeConstraints(cs) {
        return new ApplicationThunk(
            this.t1.applyTypeConstraints(cs),
            this.t2.applyTypeConstraints(cs)
        )
    }
}

class JSThunk {

    constructor(name, func, type) {
        this.name = name;
        this.func = func;
        this.type = type;
    }
    clone() {
        return new JSThunk(this.name, this.func, this.type);
    }
    toString() {
        return `${this.name}`;
    }
    
    canStep() {
        return false;
    }
    canBind() {
        return true;
    }

    bind(t1) {
        if (t1.canStep())
            return new ApplicationThunk(this, t1.step(), true);

        if (!(t1.thunk instanceof LiteralThunk))
            throw `Only a LiteralThunk can be bound to a JSThunk. Not ${t1.thunk.constructor.name}.`

        let value = t1.thunk.value;
        let result = this.func(value);
        let type = this.type.bind(t1.type);
        
        if (result instanceof Function)
            return new JSThunk(`${this.name} ${value}`, result, type);

        return new LiteralThunk(result, type);
    }

    replaceUnboundThunks(rs) {
        return this.clone();
    }
    applyTypeConstraints(cs) {
        return this.clone();
    }
}

class FunctionThunk {

    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.patterns        = []
        this.implementations = []
    }
    clone() {
        return this;
    }
    toString() {
        return this.name;
    }

    setCase(pattern, impl) {
        let patternLength = Math.max(...this.patterns.map(p => p.length()));
        if (patternLength !== -Infinity && pattern.length() !== patternLength)
            throw "All patterns must have any equal number of arguments.";

        let constraints = pattern.getConstraints(this.type);
        constraints = new Type().unifyConstraints(constraints);
        impl = new ThunkWrapper(impl.applyTypeConstraints(constraints));

        this.patterns.push(pattern);
        this.implementations.push(impl);
    }

    canStep() {
        return this.implementations.length === 1;
    }
    canBind() {
        return true;
    }

    bind(t1) {
        let name = `${this.name} ${t1}`;
        let nextFunction = new PartialFunctionThunk(name, this.type.bind(t1.type));
        for (let i = 0; i < this.patterns.length; i++) {
            let patt = this.patterns[i];

            if (patt.requiresSteps(t1))
                return new ApplicationThunk(this, t1.step(), true);
            
            let rs = patt.matches(t1);
            if (!rs)
                continue;
            let impl = this.implementations[i].clone().replaceUnboundThunks(rs);

            patt = patt.next();
            if (patt.finishedMatching()) {
                return impl;
            }
            nextFunction.setCase(patt, impl, name);
        }
        return nextFunction;
    }
    step() {
        return this.implementations[0].clone();
    }

    replaceUnboundThunks(rs) {
        let nextFunction = new PartialFunctionThunk(`${this.name}`, this.type.clone());
        for (let i = 0; i < this.patterns.length; i++) {
            let patt = this.patterns[i];
            let impl = this.implementations[i];

            let overwritten = patt.getSymbols();
            let keys = Object.keys(rs).filter(k => !overwritten.includes(k));

            if (keys.length !== 0) {
                let rsClone = {};
                for (let key of keys) {
                    rsClone[key] = rs[key];
                }
                impl = impl.replaceUnboundThunks(rsClone);
            }

            nextFunction.setCase(patt, impl);
        }
        return nextFunction;
    }
    applyTypeConstraints(cs) {
        for (let i = 0; i < this.patterns.length; i++) {
            let patt = this.patterns[i];
            let impl = this.implementations[i];

            let overwritten = patt.getSymbols();

            let cs2 = {};
            for (let c in cs) {
                if (overwritten.includes(c))
                    continue
                cs2[c] = cs[c];
            }

            if (Object.keys(cs2).length === 0) continue;

            patt.applyTypeConstraints(cs2);
            impl.applyTypeConstraints(cs2);
        }
        return this;
    }
}

class PartialFunctionThunk extends FunctionThunk {

    clone() {
        let pT = new PartialFunctionThunk(this.name, this.type);
        for (let i = 0; i < this.patterns.length; i++) {
            pT.setCase(this.patterns[i], this.implementations[i].thunk);
        }
        return pT;
    }

}