class PatternNode {

    static LITERAL = "literal";
    static VAR = "var";

    constructor(type, value, children) {

        this.type = type;
        this.value = value;
        this.children = this.children;

    }

    toString() {

        switch (this.type) {
            case PatternNode.LITERAL:
            case PatternNode.VAR:
                return this.value;
        }

    }

    toThunk() {

        switch (this.type) {
            case PatternNode.LITERAL:
                return new LiteralArgumentThunk(parseInt(this.value));
            case PatternNode.VAR:
                return new ArgumentThunk(this.value);
        }

    }

}

function parsePattern(tokens) {
    let terms = [];

    while (tokens.length) {
        let t = tokens.shift();

        let node;
        switch (t.type) {
            case Token.VARID:
                node = new PatternNode(PatternNode.VAR, t.value, []);
                terms.push(node);
                break;
            case Token.LITERAL:
                node = new PatternNode(PatternNode.LITERAL, t.value, []);
                terms.push(node);
                break;
            case Token.OP:
                if (t.value !== "=") throw new ParserError(`Unexpected operator '${t.value}' in pattern match.`, t.index, t.length);
                return terms;
        }
    }

    throw new ParserError(`Expected '=' at end of pattern match.`, null, null);

}