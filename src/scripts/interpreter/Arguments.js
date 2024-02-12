class EArgument {

    static VARIABLE    = "variable";
    static LITERAL     = "literal";

}

class UnboundArgument {

    argumentType = EArgument.VARIABLE;

    constructor(symbol) {
        this.symbol = symbol;
    }
    clone() {
        return new UnboundArgument(this.symbol, this.type.clone());
    }
    toString() {
        return `${this.symbol}`;
    }

    requiresSteps(t) {
        return false;
    }
    matches(t, rs) {
        rs[this.symbol] = t;
        return true;
    }

    getSymbols() {
        return [this.symbol];
    }

    getConstraints(t1) {
        if (!this.type.canMatch(t1))
            throw `${t1} cannot bind to ${this.type}`
        return [[this.type, t1]];
    }
    applyTypeConstraints(cs) {
        if (this.symbol in cs) {
            this.type = cs[this.symbol];
        }
    }
    applyType(t1) {
        this.type = t1;
    }

    getReplacements() {
        return [[this.symbol, this.type]];
    }

}

class LiteralArgument {

    argumentType = EArgument.LITERAL;

    constructor(value) {
        this.value = value;
        switch (typeof this.value) {
            case "boolean":
                this.type = new LiteralType("Bool");
                break;
            case "number":
                if (Number.isInteger(this.value))
                    this.type = new LiteralType("Integer");
                else
                    this.type = new LiteralType("Float");
                break;
            case "string":
                this.type = new LiteralType("String");
                break;
            default:
                this.type = `Unknown value type for ${this.value}`;
        }
    }
    clone() {
        return new LiteralArgument(this.value);
    }
    toString() {
        return `${this.value}`;
    }

    requiresSteps(t) {
        return t.canStep();
    }
    matches(t,_) {
        if (!(t.thunk instanceof LiteralThunk))
            return false;
        if (t.thunk.value !== this.value)
            return false;
        return true;
    }
    getSymbols() {
        return [];
    }

    getConstraints(t1) {
        return [];
    }
    applyTypeConstraints(cs) {
        return;
    }
    applyType(t1) {
        if (!this.type.canMatch(t1))
            throw `${t1} cannot bind to ${this.type}`
        this.type = t1;
    }

    getReplacements() {
        return [];
    }
}