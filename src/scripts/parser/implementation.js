class ImplNode {

    static VARID   = "varid";
    static CONID   = "conid";
    static APP     = "app";
    static INFIX   = "infix";
    static LITERAL = "literal";

    constructor(type, value, children) {

        this.type = type;
        this.value = value;
        this.children = children;

    }

    toString() {

        switch (this.type) {
            case ImplNode.LITERAL:
            case ImplNode.VARID:
            case ImplNode.CONID:
                return this.value;
            case ImplNode.APP:
                return `(${this.children[0]} ${this.children[1]})`;
            case ImplNode.INFIX:
                return `(${this.children[0]} ${this.value} ${this.children[1]})`;
        }

        console.log(this.type);

    }

}

function parseImplementation(tokens, endChar = "\n") {
    let impl = null;

    while (tokens.length) {
        let t = tokens.shift();

        let node;
        switch (t.type) {
            case Token.LITERAL:
                node = new ImplNode(ImplNode.LITERAL, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.CONID:
                node = new ImplNode(ImplNode.CONID, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.VARID:
                node = new ImplNode(ImplNode.VARID, t.value, []);
                impl = impl === null ? node : new ImplNode(ImplNode.APP, null, [impl, node]);
                break;
            case Token.OP:
            case Token.VARSYM:
                node = parseImplementation(tokens, endChar);
                if (node === null) throw new ParserError(`Expected expression after operator / symbol.`, t.index, t.value.length);
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
        }
    }

    throw new ParserError(`Expected ${endChar === "\n" ? "newline" : endChar}.`, null, null);

}