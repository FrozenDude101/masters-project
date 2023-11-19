class TypeNode {

    static TYVAR = "tyvar";
    static TYCON = "tycon";
    static TYAPP = "tyapp";
    static ARROW = "arrow";
    static LIST  = "list";

    constructor(type, value, children) {

        this.type = type;
        this.value = value;
        this.children = children;

    }

    toString() {

        switch (this.type) {
            case TypeNode.TYVAR:
            case TypeNode.TYCON:
                return this.value;
            case TypeNode.TYAPP:
                return `(${this.children[0]} ${this.children[1]})`;
            case TypeNode.ARROW:
                return `(${this.children[0]} -> ${this.children[1]})`;
            case TypeNode.LIST:
                return `[${this.children[0]}]`;
        }

    }

}

function parseType(tokens, endChar = "\n") {
    let type = null;

    while (tokens.length) {
        let t = tokens.shift();

        let node;
        switch (t.type) {
            case Token.CONID:
                node = new TypeNode(TypeNode.TYCON, t.value, []);
                type = type === null ? node : new TypeNode(TypeNode.TYAPP, null, [type, node]);
                break;
            case Token.VARID:
                node = new TypeNode(TypeNode.TYVAR, t.value, []);
                type = type === null ? node : new TypeNode(TypeNode.TYAPP, null, [type, node]);
                break;
            case Token.OP:
                if (t.value !== "->") throw new SyntaxError(t.index);
                node = parseType(tokens, endChar);
                if (node === null) {
                    throw "Expected type variable, or type constructor.";
                }
                type = new TypeNode(TypeNode.ARROW, null, [type, node]);
                break;
            case Token.SPECIAL:
                if (t.value === endChar) {
                    tokens.unshift(t);
                    return type;
                }
                switch (t.value) {
                    case "(":
                        node = parseType(tokens, ")");
                        tokens.shift();
                        if (node === null) node = new TypeNode(TypeNode.TYCON, "()", []);
                        type = type === null ? node : new TypeNode(TypeNode.TYAPP, null, [type, node]);
                        break;

                    case "[":
                        node = parseType(tokens, "]");
                        tokens.shift();
                        if (node === null) throw "Expected type in list type."
                        node = new TypeNode(TypeNode.LIST, null, [node]);
                        type = type === null ? node : new TypeNode(TypeNode.TYAPP, null, [type, node]);
                        break;

                    default:
                        throw `Unexpected ${t.value}.`;
                }
        }
    }

    throw "Expected " + (endChar === "\n" ? "\\n" : endChar);

}