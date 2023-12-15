class EArgument {

    static VARIABLE    = "variable";
    static LITERAL     = "literal";

}

class VariableArgument {

    argumentType = EArgument.VARIABLE;

    constructor(symbol) {
        this.symbol = symbol;
    }
    toString() {
        return `${this.symbol}`;
    }

    getType() {
        return new UnboundType(this.symbol);
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

}

class LiteralArgument {

    argumentType = EArgument.LITERAL;

    constructor(value) {
        this.value = value;
    }
    toString() {
        return `${this.value}`;
    }

    getType() {
        switch (typeof this.value) {
            case "boolean":
                return new VariableType("Bool");
            case "number":
                return new VariableType("Integer");
            case "string":
                return new VariableType("String");
            default:
                throw `Unknown value type for ${this.value}`;
        }
    }

    requiresSteps(t) {
        return t.canStep();
    }
    matches(t,_) {
        console.log(t.thunkType, EThunk.LITERAL);
        if (t.thunkType !== EThunk.LITERAL)
            return false;
        console.log(t.value, this.value);
        if (t.value !== this.value)
            return false;
        return true;
    }
    getSymbols() {
        return [];
    }

}