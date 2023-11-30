class EThunk {

    static APPLICATION        = "Application";
    static FUNCTION           = "Function";
    static ARGUMENT           = "Argument";
    static LITERAL_ARGUMENT   = "LiteralArgument";
    static UNBOUND            = "Unbound";
    static LITERAL            = "Literal";
    static JAVASCRIPT         = "JavaScript";

}

class Thunk {

    replaceUnboundThunks(fT, args) {
        return this;
    }
    rebindUnboundThunks(before, after) {
        return this;
    }

}

class ApplicationThunk extends Thunk {

    type = EThunk.APPLICATION;

    constructor(t1, t2) {
        super();
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new ApplicationThunk(this.t1.clone(), this.t2.clone());
    }

    step() {
        switch (this.t1.type) {
            case EThunk.APPLICATION:
                return new ApplicationThunk(this.t1.step(), this.t2);
            case EThunk.FUNCTION:
                return this.t1.bind(this.t2);
            case EThunk.ARGUMENT:
            case EThunk.LITERAL_ARGUMENT:
                throw new ThunkError("Argument thunk cannot be applied to.");
            case EThunk.UNBOUND:
                throw new ThunkError("Unbound thunk cannot be applied to.");
            case EThunk.LITERAL:
                throw new ThunkError("Literal thunk cannot be applied to.");
            case EThunk.JAVASCRIPT:
                let vals = this.t1.bind(this.t2);
                if (vals[0])
                    return vals[1];
                this.t2 = vals[1];
                return this;
        }
    }

    replaceUnboundThunks(fT, args) {
        this.t1 = this.t1.replaceUnboundThunks(fT, args);
        this.t2 = this.t2.replaceUnboundThunks(fT, args);
        return this;
    }
    rebindUnboundThunks(before, after) {
        this.t1 = this.t1.rebindUnboundThunks(before, after);
        this.t2 = this.t2.rebindUnboundThunks(before, after);
        return this;
    }

    toString() {
        return `{${this.t1} ${this.t2}}`;
    }

}

class FunctionThunk extends Thunk {

    type = EThunk.FUNCTION;

    constructor(name) {
        super();
        this.name = name;
        this.patterns = [];
        this.impls = [];
    }
    clone() {
        return this;
    }

    setPattern(...pattern) {
        let impl = pattern.pop();
        this.patterns.push(pattern);
        this.impls.push(impl);
    }

    bind(t2) {
        let c = new FunctionThunk(`${this.name}$${t2}`);
        for (let i = 0; i < this.patterns.length; i++) {
            let pattern = this.patterns[i];
            let replacements = patternMatch(pattern, t2);
            if (replacements) {
                let impl = this.impls[i]
                    .clone()
                    .replaceUnboundThunks(this, replacements)
                    .rebindUnboundThunks(this, c);
                if (pattern.length === 1)
                    return impl;
                c.setPattern(...pattern.slice(1), impl);
            }
        }
        return c;
    }

    rename(name) {
        this.name = name;
        return this;
    }

    toString() {
        return this.name;
    }

}

class ArgumentThunk extends Thunk {

    type = EThunk.ARGUMENT;

    constructor(symbol) {
        super();
        this.symbol = symbol;
    }

}

class LiteralArgumentThunk extends Thunk {

    type = EThunk.LITERAL_ARGUMENT;

    constructor(value) {
        super();
        this.value = value;
    }

    toString() {
        return this.value;
    }

}

class UnboundThunk extends Thunk {

    type = EThunk.UNBOUND;

    constructor(fT, symbol) {
        super();
        this.boundTo = fT;
        this.symbol = symbol;
    }
    clone() {
        return new UnboundThunk(this.boundTo, this.symbol);
    }
    
    isBoundTo(fT) {
        return this.boundTo === fT;
    }
    rebind(fT) {
        this.boundTo = fT;
    }

    replaceUnboundThunks(fT, args) {
        if (!this.isBoundTo(fT))
            return this;

        if (!Object.keys(args).includes(this.symbol))
            return this;

        return args[this.symbol];
    }
    rebindUnboundThunks(before, after) {
        if (this.boundTo === before)
            this.boundTo = after;
        return this;
    }

    toString() {
        return this.symbol;
    }

}

class LiteralThunk extends Thunk {

    type = EThunk.LITERAL;

    constructor(value) {
        super();
        this.value = value;
    }
    clone() {
        return this;
    }

    step() {
        return this.value;
    }

    toString() {
        return this.value;
    }

}

class JSThunk extends Thunk {

    type = EThunk.JAVASCRIPT;

    constructor(name, f) {
        super();
        this.name = name;
        this.f = f;
    }
    clone() {
        return this;
    }

    bind(t2) {
        t2 = t2.step();
        if (t2 instanceof Thunk) 
            return [false, t2];

        let fv = this.f(t2);

        if (fv instanceof Function)
            return [true, new JSThunk(`${this.name}$${t2}`, fv)];

        return [true, new LiteralThunk(fv)];
    }

    toString() {
        return this.name;
    }

}

class ThunkError extends Error {}


function patternMatch(pattern, arg) {
    let replacements = {};

    let p = pattern[0];
    switch (p.type) {
        case EThunk.ARGUMENT:
            replacements[p.symbol] = arg;
            break;
        case EThunk.LITERAL_ARGUMENT:
            while (arg instanceof Thunk) {
                arg = arg.step();
            }
            arg = new LiteralThunk(arg);
            if (arg.type !== EThunk.LITERAL)
                return false;
            if (p.value !== arg.value)
                return false;
            break;
        default:
            return false;
    }

    return replacements;
}