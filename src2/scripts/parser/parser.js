class Parser {

    static Prelude(s) {
        this.parse("Prelude", s);
    }

    static main(s) {
        Program.resetMain();
        this.parse("main", s);
    }

    static parse(module, ss) {
        for (let s of ss.split("\n\n")) {
            let tokens = Lexer.lex(s);

            while (tokens.length) {
                let t = tokens[0];
    
                switch (t.type) {
                    case Token.KEYWORD:
                        switch (t.value) {
                            case "class":
                                this.parseTypeclass(module, tokens);
                                break;
                            case "instance":
                                this.parseClassInstance(module, tokens);
                                break;
                            case "data":
                                this.parseDataType(module, tokens);
                                break;
                            default:
                                throw new UnexpectedTokenError(t, "declaration");
                        }
                        break;
                    case Token.VARID:
                        this.parseFunction(module, tokens);
                        break;
                    case Token.SPECIAL:
                        if (t.value === "(")
                            this.parseFunction(module, tokens);
                        else
                            tokens.shift();
                        break;
                    default:
                        tokens.shift();
                }
            }
        }
    }

    static parseTypeclass(module, tokens) {
        let t = tokens.shift();
        if (t.type !== Token.KEYWORD || t.value !== "class")
            throw new TokenParseError(new Token(Token.KEYWORD, "class"), t);

        t = tokens.shift();
        let typeConstraints = {};
        if (t.type === Token.SPECIAL && t.value === "(") {
            typeConstraints = this.parseTypeConstraints(tokens);
            t = tokens.shift();
        }

        if (t.type !== Token.CONID)
            throw new TokenParseError(new Token(Token.CONID), t);
        let typeclassName = t.value;
        
        t = tokens.shift();
        if (t.type !== Token.VARID)
            throw new TokenParseError(new Token(Token.VARID), t);
        let typeclassSymbol = t.value;

        if (!(typeclassSymbol in typeConstraints)) typeConstraints[typeclassSymbol] = [];
        typeConstraints[typeclassSymbol].push(typeclassName);

        let filtered = Object.keys(typeConstraints).filter(s => s !== typeclassSymbol);
        if (filtered.length)
            throw new FloatingTypeConstraintError(filtered[0], `${typeclassName} ${typeclassSymbol}`);
        Program.registerTypeclass(module, typeclassName, typeclassSymbol, typeConstraints);

        t = tokens.shift();
        if (t.type !== Token.KEYWORD || t.value !== "where")
            throw new TokenParseError(new Token(Token.KEYWORD, "where"), t);

        t = tokens.shift();
        if (t.type !== Token.SPECIAL || t.value !== "\n")
            throw new TokenParseError(new Token(Token.SPECIAL, "\\n"), t);

        t = tokens.shift();
        do {
            let mName;
            if (t.type === Token.VARID)
                mName = t.value;
            else if (t.type === Token.SPECIAL && t.value === "(") {
                t = tokens.shift();
                mName = `(${t.value})`;
                t = tokens.shift();
                if (t.type !== Token.SPECIAL || t.value !== ")")
                    throw UnexpectedTokenError(new Token(Token.SPECIAL, ")"), t);
            } else
                throw new TokenParseError(new Token(Token.VARID), t);

            t = tokens.shift();
            if (t.type !== Token.OP || t.value !== "::")
                throw new TokenParseError(new Token(Token.OP, "::"), t);

            t = tokens.shift();
            let typeConstraints = {};
            try {
                this.parseTypeConstraints([...tokens]);
                typeConstraints = this.parseTypeConstraints(tokens);
            } catch (e) {
                tokens.unshift(t);
            }

            let mType = this.parseType(tokens, new Token(Token.SPECIAL, "\n"));
            Program.registerMethod(module, typeclassName, mName, mType);
            t = tokens.shift();
            t = tokens.shift();
        } while (t && (t.type === Token.VARID || (t.type === Token.SPECIAL && t.value === "(")));
    }
    static parseClassInstance(module, tokens) {
        let t = tokens.shift();
        if (t.type !== Token.KEYWORD || t.value !== "instance")
            throw new TokenParseError(new Token(Token.KEYWORD, "instance"), t);

        t = tokens.shift();
        if (t.type !== Token.CONID)
            throw new TokenParseError(new Token(Token.CONID), t);
        let typeclassName = t.value;
        
        t = tokens.shift();
        let instance;
        if (t.type === Token.SPECIAL && t.value === "(") {
            instance = this.parseType(tokens, new Token(Token.SPECIAL, ")"));
            tokens.shift();
        } else if (t.type === Token.CONID) {
            instance = new LiteralType(t.value);
        } else {
            throw new TokenParseError(new Token(Token.CONID), t);
        }

        Program.registerInstance(module, typeclassName, instance);

        t = tokens.shift();
        if (t.type !== Token.KEYWORD || t.value !== "where")
            throw new TokenParseError(new Token(Token.KEYWORD, "where"), t);

        t = tokens.shift();
        if (t.type !== Token.SPECIAL || t.value !== "\n")
            throw new TokenParseError(new Token(Token.SPECIAL, "\\n"), t);

        t = tokens.shift();
        do {
            let mName;
            if (t.type === Token.VARID)
                mName = t.value;
            else if (t.type === Token.SPECIAL && t.value === "(") {
                t = tokens.shift();
                mName = `(${t.value})`;
                t = tokens.shift();
                if (t.type !== Token.SPECIAL || t.value !== ")")
                    throw UnexpectedTokenError(new Token(Token.SPECIAL, ")"), t);
            } else
                throw new TokenParseError(new Token(Token.VARID), t);

            let pattern = this.parsePattern(tokens, new Token(Token.OP, "="));

            t = tokens.shift();
            if (t.type !== Token.OP || t.value !== "=")
                throw new TokenParseError(new Token(Token.OP, "="), t);

            let implementation = this.parseImplementation(tokens, new Token(Token.SPECIAL, "\n"));

            Program.registerInstanceMethod(module, typeclassName, instance, mName, pattern, implementation);
            
            t = tokens.shift();
            t = tokens.shift();
        } while (t && (t.type === Token.VARID || (t.type === Token.SPECIAL && t.value === "(")));
    }

    static parseDataType(module, tokens) {
        let t = tokens.shift();
        if (t.type !== Token.KEYWORD || t.value !== "data")
            throw new TokenParseError(new Token(Token.KEYWORD, "data"), t);

        t = tokens.shift();
        if (t.type !== Token.CONID)
            throw new TokenParseError(new Token(Token.CONID), t);
        let typeName = t.value;
        let type = new LiteralType(typeName);
        
        t = tokens.shift();
        while (t.type === Token.VARID) {
            if (type.getSymbols().includes(t.value))
                throw new DataTypePatternSymbolError(`${type} ${t.value}`, t.value);
            type = new ApplicationType(type, new UnboundType(t.value));
            t = tokens.shift();
        }

        Program.registerType(module, typeName, type);

        if (t.type === Token.SPECIAL && t.value === "\n")
            return;
        if (t.type !== Token.OP || t.value !== "=")
            throw new TokenParseError(new Token(Token.OP, "="), t);

        do {
            t = tokens.shift();
            if (t.type !== Token.CONID)
                throw new TokenParseError(new Token(Token.CONID), t);
            let conName = t.value;

            let symbol = "a";
            let conFuncPatt = new Pattern();
            t = tokens.shift();
            while (t && !((t.type === Token.OP && t.value === "|") || (t.type === Token.SPECIAL && t.value === "\n"))) {
                let aType;
                switch (t.type) {
                    case Token.VARID:
                        aType = new UnboundType(t.value);
                        break;

                    case Token.CONID: 
                        aType = new LiteralType(t.value);
                        break;

                    case Token.SPECIAL:
                        if (t.value !== "(")
                            throw new TokenParseError(new Token(Token.SPECIAL, "("), t);
                        aType = this.parseType(tokens, new Token(Token.SPECIAL, ")"));
                        t = tokens.shift();
                        if (aType === null)
                            aType = Program.getType("()");
                        break;

                    default:
                        throw new TokenParseError(new Token(`${Token.VARID}/${Token.CONID}`, t));
                }
                conFuncPatt.args.push(new UnboundArgument(symbol, aType));
                symbol = String.fromCharCode(symbol.charCodeAt()+1);
                t = tokens.shift();
            }

            let conFuncType = type.clone();
            for (let i = conFuncPatt.length-1; i >= 0; i--)
                conFuncType = new FunctionType(conFuncPatt.args[i].type, conFuncType);

            let conFuncImpl = new ConstructorThunk(conName, conFuncType);
            for (let a of conFuncPatt.args)
                conFuncImpl = new ApplicationThunk(conFuncImpl, new UnboundThunk(a.symbol));

            let conFunc;
            if (conFuncPatt.length === 0) 
                conFunc = conFuncImpl;
            else {
                conFunc = new FunctionThunk(conName, conFuncType);
                conFunc.setCase(conFuncPatt, conFuncImpl);
            }
            Program.registerConstructor(module, typeName, conName, conFunc);
        } while (t && t.type === Token.OP && t.value === "|");
    }
    static parseType(tokens, endToken) {
        let type = null;
        let t = tokens.shift();
        while (t && (endToken.type !== t.type || endToken.value !== t.value)) {
            let next;
            switch (t.type) {
                case Token.VARID:
                    next = new UnboundType(t.value);
                    type = type ? new ApplicationType(type, next) : next;
                    break;

                case Token.CONID:
                    next = t.value === "String" ? Program.getType("String") : new LiteralType(t.value);
                    type = type ? new ApplicationType(type, next) : next;
                    break;

                case Token.OP:
                    if (t.value !== "->")
                        throw new TokenParseError(new Token(Token.OP, "->"), t);
                    next = this.parseType(tokens, endToken);
                    type = new FunctionType(type, next);
                    break;

                case Token.SPECIAL:
                    if (t.value !== "(")
                        throw new TokenParseError(new Token(Token.SPECIAL, "("), t);
                    next = this.parseType(tokens, new Token(Token.SPECIAL, ")"));
                    t = tokens.shift();
                    if (next === null)
                        next = Program.getType("()");
                    type = type ? new ApplicationType(type, next) : next;
                    break;
            }
            t = tokens.shift();
        }
        if (!t)
            throw new EndOfTokensError(endToken);
        tokens.unshift(t);
        return type;
    }
    static parseTypeConstraints(tokens) {
        let tc = {};
        let t = tokens.shift();
        while (t.type !== Token.SPECIAL || t.value !== ")") {
            if (t.type !== Token.CONID)
                throw new TokenParseError(new Token(Token.CONID), t);
            let typeclass = t.value;

            t = tokens.shift();
            if (t.type !== Token.VARID)
                throw new TokenParseError(new Token(Token.VARID), t);
            let symbol = t.value;

            if (!(symbol in tc))
                tc[symbol] = [];
            tc[symbol].push(typeclass);

            t = tokens.shift();
            if (t.type === Token.SPECIAL && t.value === ",")
                t = tokens.shift();
            else if (t.type !== Token.SPECIAL || t.value !== ")")
                throw new TokenParseError(new Token(Token.SPECIAL, ")"), t);
        }

        t = tokens.shift();
        if (t.type !== Token.OP || t.value !== "=>")
            throw new TokenParseError(new Token(Token.OP, "=>"), t);

        return tc;
    }

    static parseFunction(module, tokens) {
        let t = tokens.shift();
        let fName;
        if (t.type === Token.VARID)
            fName = t.value;
        else if (t.type === Token.SPECIAL && t.value === "(") {
            t = tokens.shift();
            fName = `(${t.value})`;
            t = tokens.shift();
            if (t.type !== Token.SPECIAL || t.value !== ")")
                throw UnexpectedTokenError(new Token(Token.SPECIAL, ")"), t);
        } else
            throw new TokenParseError(new Token(Token.VARID), t);

        t = tokens.shift();
        switch (t.type) {
            case Token.OP:
                switch (t.value) {
                    case "::":
                        t = tokens.shift();
                        let typeConstraints = {};
                        try {
                            this.parseTypeConstraints([...tokens]);
                            typeConstraints = this.parseTypeConstraints(tokens);
                        } catch (e) {
                            tokens.unshift(t);
                        }

                        let type = this.parseType(tokens, new Token(Token.SPECIAL, "\n"));
                        type = type.applyClassConstraints(typeConstraints);
                        Program.registerFunction(module, type, fName);
                        break;
                    case "=":
                        let implementation = this.parseImplementation(tokens, new Token(Token.SPECIAL, "\n"));
                        tokens.shift();
                        Program.setFunctionCase(module, fName, new Pattern(), implementation);
                        break;
                    default:
                        throw new UnexpectedTokenError(t, "function");
                }
                break;
            default:
                tokens.unshift(t);
                let pattern = this.parsePattern(tokens, new Token(Token.OP, "="));
                t = tokens.shift();
                if (t.type !== Token.OP || t.value !== "=")
                    throw new TokenParseError(new Token(Token.OP, "="), t);
                let implementation = this.parseImplementation(tokens, new Token(Token.SPECIAL, "\n"));
                Program.setFunctionCase(module, fName, pattern, implementation);
        }
    }
    static parsePattern(tokens, endToken) {
        let args = [];
        let t = tokens.shift();
        while (t && (endToken.type !== t.type || endToken.value !== t.value)) {
            let next;
            switch (t.type) {
                case Token.INT_LITERAL:
                    next = new LiteralArgument(parseInt(t.value), Program.getType("Integer"));
                    args.push(next);
                    break;
                case Token.FLOAT_LITERAL:
                    next = new LiteralArgument(parseFloat(t.value), Program.getType("Float"));
                    args.push(next);
                    break;
                case Token.HEX_LITERAL:
                    next = new LiteralArgument(parseInt(t.value, 16), Program.getType("Integer"));
                    args.push(next);
                    break;
                case Token.OCT_LITERAL:
                    next = new LiteralArgument(parseInt(t.value, 8), Program.getType("Integer"));
                    args.push(next);
                    break;
                case Token.CHAR_LITERAL:
                    next = new LiteralArgument(t.value, Program.getType("Char"));
                    args.push(next);
                    break;
                case Token.STRING_LITERAL:
                    next = new ConstructorArgument("[]");
                    for (let c of [...t.value].reverse()) {
                        next = new ApplicationArgument(
                            new ApplicationArgument(new ConstructorArgument("(:)"), new LiteralArgument(c, new LiteralType("Char"))),
                            next,
                        );
                    }
                    args.push(next);
                    break;

                case Token.VARID:
                    next = t.value === "_" ? new WilcardArgument() : new UnboundArgument(t.value);
                    args.push(next);
                    break;

                case Token.CONID:
                    next = new ConstructorArgument(t.value);
                    args.push(next);
                    break;

                case Token.VARSYM:
                    next = new ConstructorArgument(`(${t.value})`);
                    args.push(new ApplicationArgument(next, args.pop()));
                    break;    

                case Token.SPECIAL:
                    if (t.value === "[") {
                        t = tokens.shift();
                        if (t.type !== Token.SPECIAL || t.value !== "]")
                            throw new TokenParseError(new Token(Token.SPECIAL, "]"), t);
                        next = new ConstructorArgument(`[]`);
                        if (args.at(-1)?.t1?.name === ":")
                            args.push(new ApplicationArgument(args.pop(), next));
                        else
                            args.push(next);
                        break;
                    }

                    if (t.value !== "(")
                        throw new TokenParseError(new Token(Token.SPECIAL, "("), t);
                    next = this.parsePattern(tokens, new Token(Token.SPECIAL, ")"));
                    tokens.shift();
                    if (next.length === 0)
                        next = new ConstructorArgument("()");
                    else
                        next = next.args.reduce((a, v) => new ApplicationArgument(a, v))
                    args.push(next);
                    break;
        
            }
            t = tokens.shift();
        }
        tokens.unshift(t);
        return new Pattern(...args);
    }
    static parseImplementation(tokens, endToken) {
        let implementation = null;
        let t = tokens.shift();
        while (t && (endToken.type !== t.type || endToken.value !== t.value)) {
            let next;
            switch (t.type) {
                case Token.INT_LITERAL:
                    next = new LiteralThunk(parseInt(t.value), Program.getType("Integer"));
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;
                case Token.FLOAT_LITERAL:
                    next = new LiteralThunk(parseFloat(t.value), Program.getType("Float"));
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;
                case Token.HEX_LITERAL:
                    next = new LiteralThunk(parseInt(t.value, 16), Program.getType("Integer"));
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;
                case Token.OCT_LITERAL:
                    next = new LiteralThunk(parseInt(t.value, 8), Program.getType("Integer"));
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;
                case Token.CHAR_LITERAL:
                    next = new LiteralThunk(t.value, Program.getType("Char"));
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;
                case Token.STRING_LITERAL:
                    next = new ConstructorThunk("[]");
                    for (let c of [...t.value].reverse()) {
                        next = new ApplicationThunk(
                            new ApplicationThunk(new ConstructorThunk("(:)"), new LiteralThunk(c, new LiteralType("Char"))),
                            next,
                        );
                    }
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;

                case Token.VARID:
                    next = Program.isFunction(t.value) ? new FunctionReferenceThunk(t.value) : new UnboundThunk(t.value);
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;

                case Token.CONID:
                    next = Program.getConstructor(t.value);
                    implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;

                case Token.VARSYM:
                    next = new FunctionReferenceThunk(`(${t.value})`);
                    implementation = implementation ? new ApplicationThunk(next, implementation) : next;
                    break;

                case Token.SPECIAL:
                    if (t.value === "[") {
                        t = tokens.shift();
                        if (t.type !== Token.SPECIAL || t.value !== "]")
                            throw new TokenParseError(new Token(Token.SPECIAL, "]"), t);
                        next = Program.getConstructor("[]");
                        implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                        break;
                    }

                    if (t.value !== "(")
                        throw new TokenParseError(new Token(Token.SPECIAL, "("), t);

                    if (tokens[0].type === Token.VARSYM) {
                        t = tokens.shift();
                        next = new FunctionReferenceThunk(`(${t.value})`);
                        implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                        t = tokens.shift();
                        if (t.type !== Token.SPECIAL || t.value !== ")")
                            throw new UnexpectedTokenError(new Token(Token.SPECIAL, ")"), t);
                        break;
                    }
                    
                    next = this.parseImplementation(tokens, new Token(Token.SPECIAL, ")"));
                    tokens.shift();
                    if (next === null)
                        next = Program.getConstructor("()");
                        implementation = implementation ? new ApplicationThunk(implementation, next) : next;
                    break;
        
            }
            t = tokens.shift();
        }
        if (!t)
            throw new EndOfTokensError(endToken);
        tokens.unshift(t);
        return implementation;
    }

}

class EndOfTokensError extends Error {
    constructor(t) {
        super(`Expected token ${t}, but ran out of tokens.`);
    }
}

class TokenParseError extends Error {
    constructor(t1, t2) {
        super(`Expected token ${t1}, but received token ${t2}.`);
    }
}

class UnexpectedTokenError extends Error {
    constructor(t, e) {
        super(`Unexpected token ${t} when parsing ${e}.`);
    }
}

class DataTypePatternSymbolError extends Error {
    constructor(p, s) {
        super(`Duplicate symbol '${s}' in datatype pattern '${p}'.\nEach symbol in a pattern must only occur once.`);
    }
}

class FloatingTypeConstraintError extends Error {
    constructor(s, t) {
        super(`Floating type constraint '${s}', which is not used in the type '${t}'.`)
    }
}

class TODOError extends Error {
    constructor(n) {
        super(`${n} has not been implemented yet.`);
    }
}