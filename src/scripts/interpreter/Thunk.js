class EThunk {

    static APPLICATION        = "Application";
    static FUNCTION           = "Function";
    static PARTIAL_FUNCTION   = "PartialFunction";
    static ARGUMENT           = "Argument";
    static LITERAL_ARGUMENT   = "LiteralArgument";
    static UNBOUND            = "Unbound";
    static LITERAL            = "Literal";
    static JAVASCRIPT         = "JavaScript";
    static PARTIAL_JAVASCRIPT = "PartialJavaScript";

}

class Thunk {

    replaceUnboundThunks(fT, args) {
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
            case EThunk.PARTIAL_FUNCTION:
                return this.t1.bind(this.t2);
            case EThunk.ARGUMENT:
            case EThunk.LITERAL_ARGUMENT:
                throw new ThunkError("Argument thunk cannot be applied to.");
            case EThunk.UNBOUND:
                throw new ThunkError("Unbound thunk cannot be applied to.");
            case EThunk.LITERAL:
                throw new ThunkError("Literal thunk cannot be applied to.");
            case EThunk.JAVASCRIPT:
            case EThunk.PARTIAL_JAVASCRIPT:
                return this.t1.bind(this.t2);
        }
    }

    replaceUnboundThunks(fT, args) {
        this.t1 = this.t1.replaceUnboundThunks(fT, args);
        this.t2 = this.t2.replaceUnboundThunks(fT, args);
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
        let partial = new PartialFunctionThunk(this);
        partial.bind(t2);
        return partial;
    }

    call(...args) {
        let impl, replacements;
        for (let i = 0; i < this.patterns.length; i++) {
            replacements = patternMatch(this.patterns[i], args);
            if (replacements) {
                impl = this.impls[i];
                break;
            }
        }

        if (!impl)
            throw new ThunkError("No pattern match found.");

        impl = impl.clone().replaceUnboundThunks(this, replacements);
        return impl;
    }

    step() {
        return this.call();
    }

    toString() {
        return this.name;
    }

}

class PartialFunctionThunk extends Thunk {

    type = EThunk.PARTIAL_FUNCTION;

    constructor(fT) {
        super();
        this.fT = fT;
        this.args = [];
    }
    clone() {
        let clonedPFT = new PartialFunctionThunk(this.fT);
        for (let a of this.args) {
            clonedPFT.bind(a.clone());
        }
        return clonedPFT;
    }

    bind(t2) {
        this.args.push(t2);
        return this;
    }

    step() {
        return this.fT.call(...this.args);
    }

    replaceUnboundThunks(fT, args) {
        this.args = this.args.map(t => t.replaceUnboundThunks(fT, args));
    }

    toString() {
        let s = this.fT.name;
        for (let a of this.args) {
            s = `{${s} ${a}}`;
        }
        return s;
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

    toString() {
        return this.value;
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
        let p = new PartialJSThunk(this);
        p.bind(t2);
        return p;
    }

    call(...args) {
        for (let i = 0; i < args.length; i++) {
            while (args[i] instanceof Thunk) {
                args[i] = args[i].step();
            }
        }
        return new LiteralThunk(this.f(...args));
    }

    step() {
        return this.call();
    }

    toString() {
        return this.name;
    }

}

class PartialJSThunk extends Thunk {

    type = EThunk.JAVASCRIPT;

    constructor(jsT) {
        super();
        this.jsT = jsT;
        this.args = [];
    }
    clone() {
        let clonedPJST = new PartialJSThunk(this.fT);
        for (let a of this.args) {
            clonedPJST.bind(a.clone());
        }
        return clonedPJST;
    }

    bind(t2) {
        this.args.push(t2);
        return this;
    }

    step() {
        return this.jsT.call(...this.args);
    }

    replaceUnboundThunks(fT, args) {
        this.args = this.args.map(t => t.replaceUnboundThunks(fT, args));
    }

    toString() {
        let s = this.jsT.name;
        for (let a of this.args) {
            s = `{${s} ${a}}`;
        }
        return s;
    }

}

class ThunkError extends Error {}


function patternMatch(pattern, args) {
    let replacements = {};
    
    for (let i = 0; i < pattern.length; i++) {
        let p = pattern[i];
        let arg = args[i];

        switch (p.type) {
            case EThunk.ARGUMENT:
                replacements[p.symbol] = arg;
                break;
            case EThunk.LITERAL_ARGUMENT:
                if (arg.type !== EThunk.LITERAL)
                    return false;
                if (p.value !== arg.value)
                    return false;
                break;
            default:
                return false;
        }
    }

    return replacements;
}