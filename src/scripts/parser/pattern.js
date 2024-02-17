class PatternNode {

    static INTEGER = "integer";
    static FLOAT   = "float";
    static CHAR    = "character";
    static STRING  = "string";

    static VAR = "var";
    static CON = "constructor";
    static WILD = "wild";

    constructor(type, value, children) {

        this.type = type;
        this.value = value;
        this.children = children;

    }

    toString() {

        switch (this.type) {
            default:
                return this.value;
        }

    }

    toArgument() {
        switch (this.type) {
            case PatternNode.INTEGER:
                return new LiteralArgument(this.value, new LiteralType("Integer"));
            case PatternNode.FLOAT:
                return new LiteralArgument(this.value, new LiteralType("Float"));
            case PatternNode.CHAR:
                return new LiteralArgument(this.value, new LiteralType("Char"));
            case PatternNode.STRING:
                return new LiteralArgument(this.value, new LiteralType("String"));
            case PatternNode.VAR:
                return new UnboundArgument(this.value);
            case PatternNode.WILD:
                return new WildcardArgument();
            case PatternNode.CON:
                let arg = new ConstructorArgument(this.value);
                for (let c of this.children) {
                    arg = new ApplicationArgument(arg, c.toArgument());
                }
                return arg;
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
                if (Array.from(t.value).every(c => c === "_"))
                    node = new PatternNode(PatternNode.WILD, null, []);
                else
                    node = new PatternNode(PatternNode.VAR, t.value, []);
                terms.push(node);
                break;
            case Token.CONID:
                node = new PatternNode(PatternNode.CON, t.value, []);
                terms.push(node);
                break;
            case Token.INT_LITERAL:
                node = new PatternNode(PatternNode.INTEGER, parseInt(t.value), []);
                terms.push(node);
                break;
            case Token.FLOAT_LITERAL:
                node = new PatternNode(PatternNode.FLOAT, parseFloat(t.value), []);
                terms.push(node);
                break;
            case Token.HEX_LITERAL:
                node = new PatternNode(PatternNode.INTEGER, parseInt(t.value, 16), []);
                terms.push(node);
                break;
            case Token.OCT_LITERAL:
                node = new PatternNode(PatternNode.INTEGER, parseInt(t.value, 8), []);
                terms.push(node);
                break;
            case Token.CHAR_LITERAL:
                node = new PatternNode(PatternNode.CHAR, t.value, []);
                terms.push(node);
                break;
            case Token.STRING_LITERAL:
                node = new PatternNode(PatternNode.STRING, t.value, []);
                terms.push(node);
                break;
            case Token.SPECIAL:
                switch (t.value) {
                    case "(":
                        t = tokens.shift();
                        if (t.type === Token.CONID) {
                            node = new PatternNode(PatternNode.CON, t.value, parsePattern(tokens));
                            terms.push(node);
                        }
                        break;
                    case ")":
                        return terms;
                }
                break;
            case Token.OP:
                if (t.value !== "=")
                    throw new ParserError(`Unexpected operator '${t.value}' in pattern match.`, t.index, t.length);
                return terms;
        }
    }

    throw new ParserError(`Expected '=' at end of pattern match.`, null, null);

}