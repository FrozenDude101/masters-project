class ImplNode {

    static VARID   = "varid";
    static CONID   = "conid";
    static APP     = "app";
    static INFIX   = "infix";

    static INTEGER = "integer";
    static FLOAT   = "float";
    static CHAR    = "character";
    static STRING  = "string";

    constructor(type, value, children) {

        this.type = type;
        this.value = value;
        this.children = children;

    }

    toString() {

        switch (this.type) {
            case ImplNode.INTEGER:
            case ImplNode.FLOAT:
            case ImplNode.CHAR:
            case ImplNode.STRING:
            case ImplNode.VARID:
            case ImplNode.CONID:
                return this.value;
            case ImplNode.APP:
                return `{${this.children[0]} ${this.children[1]}}`;
            case ImplNode.INFIX:
                return `(${this.children[0]} ${this.value} ${this.children[1]})`;
        }

    }

    toThunk() {

        switch (this.type) {
            case ImplNode.INTEGER:
                return new LiteralThunk(this.value, new LiteralType("Integer"));
            case ImplNode.FLOAT:
                return new LiteralThunk(this.value, new LiteralType("Float"));
            case ImplNode.CHAR:
                return new LiteralThunk(this.value, new LiteralType("Char"));
            case ImplNode.STRING:
                return new LiteralThunk(this.value, new LiteralType("String"));
            case ImplNode.VARID:
                if (Program.contains(this.value))
                    return Program.get(this.value);
                return new UnboundThunk(this.value);
            case ImplNode.APP:
                return new ApplicationThunk(
                    this.children[0].toThunk(),
                    this.children[1].toThunk(),
                );
            case ImplNode.INFIX:
                return new ApplicationThunk(
                    new ApplicationThunk(
                        Program.get("(" + this.value + ")"),
                        this.children[0].toThunk(),
                    ),
                    this.children[1].toThunk(),
                );
            default:
                throw "Womp Womp";
        }

    }

}

function parseImplementation(tokens, endChar = "\n") {
    let impl = null;

    while (tokens.length) {
        let t = tokens.shift();

        let node;
        switch (t.type) {
            case Token.INT_LITERAL:
                node = new ImplNode(ImplNode.INTEGER, parseInt(t.value), []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.FLOAT_LITERAL:
                node = new ImplNode(ImplNode.FLOAT, parseFloat(t.value), []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.HEX_LITERAL:
                node = new ImplNode(ImplNode.INTEGER, parseInt(t.value, 16), []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.OCT_LITERAL:
                node = new ImplNode(ImplNode.INTEGER, parseInt(t.value, 8), []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.CHAR_LITERAL:
                node = new ImplNode(ImplNode.CHAR, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.STRING_LITERAL:
                node = new ImplNode(ImplNode.STRING, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.CONID:
                node = new ImplNode(ImplNode.CONID, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.VARID:
                if (Array.from(t.value).every(c => c === "_"))
                    throw "Invalid wildcard symbol in function body"
                node = new ImplNode(ImplNode.VARID, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.OP:
            case Token.VARSYM:
                node = parseImplementation(tokens, endChar);
                if (node === null) throw new ParserError(`Expected expression after operator/symbol.`, t.index, t.value.length);
                impl = new ImplNode(ImplNode.INFIX, t.value, [impl, node]);
                break;
            case Token.SPECIAL:
                if (t.value === endChar) {
                    tokens.unshift(t);
                    return impl;
                }
                switch (t.value) {
                    case "(":
                        node = parseImplementation(tokens, ")");
                        tokens.shift();
                        if (node === null) node = new ImplNode(ImplNode.CONID, "()", []);
                        impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                        break;

                    default:
                        throw new ParserError(`Unexpected ${t.value}.`, t.index, t.value.length);
                }
                break;
            default:
                throw "Unknown " + t.type + "\n" + t.value;
        }
    }

    throw new ParserError(`Expected ${endChar === "\n" ? "newline" : endChar}.`, null, null);

}