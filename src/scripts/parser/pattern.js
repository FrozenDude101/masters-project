class PatternNode {

    static VAR = "var";

    constructor(type, value, children) {

        this.type = type;
        this.value = value;
        this.children = this.children;

    }

    toString() {

        switch (this.type) {
            case PatternNode.VAR:
                return this.value;
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
            case Token.OP:
                if (t.value !== "=") throw `Unexpected operator '${t.value}' in pattern match.`;
                return terms;
        }
    }

    throw "Expected '=' to signify end of pattern match.";

}