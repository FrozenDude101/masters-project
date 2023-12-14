class EThunk {

    static APPLICATION = "application";
    static LITERAL     = "literal";
    static FUNCTION    = "function";
    static UNBOUND     = "unbound";
    static JAVASCRIPT  = "javascript";

}

class ApplicationThunk {

    thunkType = EThunk.APPLICATION;

    constructor(t1, t2) {
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new ApplicationThunk(this.t1.clone(), this.t2.clone());
    }
    toString() {
        return `{${this.t1} ${this.t2}}`;
    }

    canStep() {
        return true;
    }
    step() {
        switch (this.t1.thunkType) {
            case EThunk.APPLICATION:
                return new ApplicationThunk(this.t1.step(), this.t2);
            case EThunk.FUNCTION:
            case EThunk.JAVASCRIPT:
                return this.t1.bind(this.t2);
            default:
                throw `Can't bind ${this.t2} to ${this.t1}.`;
        }
    }

    replaceUnboundThunks(rs) {
        return new ApplicationThunk(this.t1.replaceUnboundThunks(rs), this.t2.replaceUnboundThunks(rs));
    }

}

class LiteralThunk {

    thunkType = EThunk.LITERAL;

    constructor(value) {
        this.value = value;
    }
    clone() {
        return this;
    }
    toString() {
        return `${this.value}`;
    }

    canStep() {
        return false;
    }

    replaceUnboundThunks(rs) {
        return this;
    }

}

class FunctionThunk {

    thunkType = EThunk.FUNCTION;

    constructor(name) {

        this.name = name;
        this.patterns        = []
        this.implementations = []
    }
    clone() {
        return new FunctionThunk(this.name, this.patterns.map((p,i) => [p, this.implementations[i].clone()]).flat())
    }
    toString() {
        return `${this.name}`;
    }

    setCase(pattern, impl) {
        let patternLength = Math.max(...this.patterns.map(p => p.length()));
        if (patternLength !== -Infinity && pattern.length() !== patternLength)
            throw "All patterns must have any equal number of arguments.";

        this.patterns.push(pattern);
        this.implementations.push(impl);
    }

    bind(t1) {
        let nextFunction = new FunctionThunk(`${this.name}$${t1}`);
        for (let i = 0; i < this.patterns.length; i++) {
            let patt = this.patterns[i];

            if (patt.requiresSteps(t1))
                return new ApplicationThunk(this, t1.step());

            let rs = patt.matches(t1);
            if (!rs)
                continue;
            let impl = this.implementations[i].replaceUnboundThunks(rs);

            patt = patt.next();
            if (patt.finishedMatching()) {
                return impl;
            }
            nextFunction.setCase(patt, impl);
        }
        return nextFunction;
    }
    canStep() {
        return false;
    }

    replaceUnboundThunks(rs) {
        let args = [this.name];
        for (let i = 0; i < this.patterns.length; i++) {
            let patt = this.patterns[i];
            let impl = this.implementations[i];

            let overwritten = patt.getSymbols();
            let keys = Object.keys(rs).filter(k => !overwritten.includes(k));

            if (keys.length !== 0) {
                for (let key of keys) {
                    let rsClone = {};
                    rsClone[key] = rs[key];
                    impl = impl.replaceUnboundThunks(rsClone);
                }
            }

            args.push(patt, impl);
        }
        return new FunctionThunk(...args);
    }

}

class UnboundThunk {

    thunkType = EThunk.UNBOUND;

    constructor(symbol) {
        this.symbol = symbol;
    }
    clone() {
        return this;
    }
    toString() {
        return `${this.symbol}`;
    }

    canStep() {
        return false;
    }

    replaceUnboundThunks(rs) {
        if (this.symbol in rs)
            return rs[this.symbol];
        return this;
    }

}

class JSThunk {

    thunkType = EThunk.JAVASCRIPT;

    constructor(name, func) {
        this.name = name;
        this.func = func;
    }
    clone() {
        return this;
    }
    toString() {
        return this.name;
    }

    bind(t1) {
        if (t1.canStep())
            return new ApplicationThunk(this, t1.step());

        let value = t1.value;
        let result = this.func(value);
        
        console.log(result);
        if (result instanceof Function)
            return new JSThunk(`${this.name}$${value}`, result);

        return new LiteralThunk(result);
    }
    canStep() {
        return false;
    }

    replaceUnboundThunks(rs) {
        return this;
    }

}