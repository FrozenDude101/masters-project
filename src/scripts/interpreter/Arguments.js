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

}