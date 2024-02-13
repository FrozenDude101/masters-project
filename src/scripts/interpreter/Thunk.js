class ThunkWrapper {

    get type() {
        return this.t.type;
    }
    get thunk() {
        return this.t;
    }

    constructor(t) {
        this.id = Math.random();
        this.t = t;
        this.normaliseWrappers();
    }
    clone() {
        return new ThunkWrapper(this.thunk.clone());
    }
    toString(raw=true, root=false) {
        if (raw || !(this.t instanceof ApplicationThunk || root))
            return `${this.t}`;
        let content = this.t.toString(raw);
        return `
            <span class="application ${this.id}"
                onclick="applicationClick(event, '${this.collection}', ${this.id})"
                onmouseover="applicationMouseOver(event, ${this.id})"
                onmouseout="applicationMouseOut(event, ${this.id})"
            >${content}</span>
        `.trim();
    }

    annotate(c) {
        this.collection = c;
        this.t.annotate(c);
    }
    normaliseWrappers() {
        while (this.t instanceof ThunkWrapper) {
            for (let k in states) {
                if (states[k] === this.t)
                    states[k] = this;
            }
            this.t = this.t.t;
        }
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

    getById(id) {
        if (this.id === id) return this;
        return this.t.getById(id);
    }

    verifyType() {
        this.t.verifyType();
    }

    annotateTypes(n) {
        this.t.annotateTypes();
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

    annotate(c) {
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

    getById(id) {
        return null;
    }

    verifyType() {
    }

    annotateTypes(n) {
    }
}

class UnboundThunk {

    constructor(symbol, type = undefined) {
        this.symbol = symbol;
        this.type = type === undefined ? new UnboundType(`${symbol}_unknown`) : type;
    }
    clone() {
        return new UnboundThunk(this.symbol, this.type.clone());
    }
    toString() {
        return `${this.symbol}`;
    }

    annotate(c) {
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
        for (let c of cs) {
            if (c[0] !== this.symbol) continue;
            this.type = c[1].clone();
        }
        return this;
    }

    getById(id) {
        return null;
    }

    verifyType() {
    }

    annotateTypes(n) {
        this.type = this.type.annotateTypes(n);
    }
}

class ApplicationThunk {

    get type() {
        return this.t1.type.bind(this.t2.type);
    }

    constructor(t1, t2) {
        this.t1 = new ThunkWrapper(t1);
        this.t2 = new ThunkWrapper(t2);
    }
    clone() {
        return new ApplicationThunk(this.t1.clone(), this.t2.clone());
    }
    toString(raw) {
        if (this.t2.thunk instanceof ApplicationThunk)
            return `${this.t1.toString(raw)} (${this.t2.toString(raw)})`;
        return `${this.t1.toString(raw)} ${this.t2.toString(raw)}`;
    }

    annotate(c) {
        this.t1.annotate(c);
        this.t2.annotate(c);
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

    getById(id) {
        return this.t1.getById(id) || this.t2.getById(id);
    }

    verifyType() {
        if (this.t1.typeType === Type.UNBOUND) return;
        this.type;
    }

    annotateTypes(n) {
        this.t1.annotateTypes(n);
        this.t2.annotateTypes(n);
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

    annotate(c) {
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

    getById(id) {
        return null;
    }

    verifyType() {};

    annotateTypes(n) {
    }
}

class FunctionThunk {

    constructor(name, type) {
        this.name = name;
        this.type = type;
        this.patterns        = []
        this.implementations = []

        this.type = this.type.annotateTypes(this.name);
    }
    clone() {
        return this;
    }
    toString() {
        return this.name;
    }

    annotate(c) {
    }

    setCase(pattern, impl) {
        let patternLength = Math.max(...this.patterns.map(p => p.length()));
        if (patternLength !== -Infinity && pattern.length() !== patternLength)
            throw "All patterns must have any equal number of arguments.";

        pattern.applyType(this.type);
        let constraints = pattern.getConstraints(this.type);
        let uc = new Type().unifyConstraints(constraints);
        pattern.applyTypeConstraints(uc);

        let rs = pattern.getReplacements();
        impl = new ThunkWrapper(impl.applyTypeConstraints(rs));

        impl.verifyType();

        // TODO, verify return type matches.

        this.patterns.push(pattern);
        this.implementations.push(impl);
    }

    canStep() {
        return this.patterns.length === 1 && this.patterns[0].length() === 0;
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
        return this;
    }

    getById(id) {
        return null;
    }

    verifyType() {
        for (let i = 0; i < this.implementations.length; i++) {
            this.implementations[i].verifyType();
        }
    }

    annotateTypes(n) {
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

    annotate(c) {
        for (let i = 0; i < this.implementations.length; i++) {
            this.implementations[i].annotate(c);
        }
    }
    applyTypeConstraints(cs) {
        for (let i = 0; i < this.patterns.length; i++) {
            let patt = this.patterns[i];
            let impl = this.implementations[i];

            let overwritten = patt.getSymbols();

            let cs2 = [];
            for (let c in cs) {
                if (overwritten.includes(c[0]))
                    continue
                cs2.push(c);
            }

            if (cs2.length === 0) continue;

            patt.applyTypeConstraints(cs2);
            impl.applyTypeConstraints(cs2);
        }
        return this;
    }

}