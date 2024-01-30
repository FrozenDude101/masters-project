class EArgument {

    static VARIABLE    = "variable";
    static LITERAL     = "literal";

}

class UnboundArgument {

    argumentType = EArgument.VARIABLE;

    constructor(symbol) {
        this.symbol = symbol;
        this.type = new UnboundType(this.symbol);
    }
    clone() {
        return new UnboundArgument(this.symbol);
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
        return [[this.symbol, t1]];
    }
    applyConstraints(cs) {
        if (this.symbol in cs) {
            this.type = cs[this.symbol];
        }
    }

}

class LiteralArgument {

    argumentType = EArgument.LITERAL;

    constructor(value) {
        this.value = value;
        switch (typeof this.value) {
            case "boolean":
                this.type = new LiteralType("Bool");
            case "number":
                if (Number.isInteger(this.value))
                    this.type = new LiteralType("Integer");
                else
                    this.type = new LiteralType("Float");
            case "string":
                this.type = new LiteralType("String");
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
        if (t.thunkType !== EThunk.LITERAL)
            return false;
        if (t.value !== this.value)
            return false;
        return true;
    }
    getSymbols() {
        return [];
    }

    getConstraints(t1) {
        return [];
    }
    applyConstraints(cs) {
        return;
    }

}