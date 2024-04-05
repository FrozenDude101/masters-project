// data <...>
// ConID <varid...> = ConID <varid ...> | ConID <varid ...> \n
// ------Type------   ---Constructor---   ---Constructor---
//  T <a b ...>       C <a b ...>          C a      C
//                 a -> b -> ... -> T a b ...    T a b ...
//                                    a -> T a b ...

function parseCustomType(tokens) {
    let t = tokens.shift();
    if (t.type !== Token.CONID)
        throw "Expected constructor ID after data keyword."

    let returnType = new LiteralType(t.value);
    let usedSymbols = [];
    t = tokens.shift();
    while (t.type === Token.VARID) {
        usedSymbols.push(t.value);
        returnType = new ApplicationType(returnType, new UnboundType(t.value));
        t = tokens.shift();
    }

    if (t.type !== Token.OP && t.value !== "=")
        throw "Unexpected token in data declaration, expected varid or '='."

    do {
        t = tokens.shift();
        if (t.type !== Token.CONID)
            throw "Expected constructor ID after '=' or '|'."

        let cName = t.value;
        let cTypes = [];
        let cFunc = new ConstructorThunk(cName, returnType);
        let cPattern = new Pattern();

        t = tokens.shift();
        while (t.type === Token.VARID || t.type === Token.CONID || (t.type === Token.SPECIAL && t.value !== "\n")) {
            if (t.type === Token.VARID) {
                cFunc = new ApplicationThunk(cFunc, new UnboundThunk(t.value));
                cTypes.push(new UnboundType(t.value));
                cPattern.args.push(new UnboundArgument(t.value));
            } else if (t.type === Token.CONID) {
                let symbol = "a";
                while (usedSymbols.includes(symbol)) {
                    symbol = String.fromCharCode("a".charCodeAt()+1)
                }
                usedSymbols.push(symbol);

                cFunc = new ApplicationThunk(cFunc, new UnboundThunk(symbol, new LiteralType(t.value)));
                cTypes.push(new LiteralType(t.value));
                cPattern.args.push(new UnboundArgument(symbol));
            } else if (t.type === Token.SPECIAL) {
                if (t.value !== "(")
                    throw `Expected '(', but received '${t.value}'.`;
                let cType2 = parseCustomTypeInCustomType(tokens);

                let symbol = "a";
                while (usedSymbols.includes(symbol)) {
                    symbol = String.fromCharCode("a".charCodeAt()+1)
                }
                usedSymbols.push(symbol);

                cFunc = new ApplicationThunk(cFunc, new UnboundThunk(symbol, cType2.clone()));
                cTypes.push(cType2.clone());
                cPattern.args.push(new UnboundArgument(symbol));
            }
            t = tokens.shift();
        }

        let cType = returnType.clone();
        while (cTypes.length) {
            cType = new FunctionType(cTypes.pop().clone(), cType.clone());
        }

        let thunk = cFunc;
        while (!(thunk instanceof ConstructorThunk)) {
            thunk = thunk.t1.t;
        }
        thunk.type = cType.clone();

        let fT = new FunctionThunk(cName, cType);
        fT.setCase(cPattern, cFunc);
        Program.register(cName, fT);

        if (t.type === Token.SPECIAL && t.value === "\n")
            break;            

    } while (true)
}

function parseCustomTypeInCustomType(tokens) {
    t = tokens.shift();
    if (t.type !== Token.CONID)
        throw "Expected constructor ID after '=' or '|'."

    let cType = new LiteralType(t.value);

    t = tokens.shift();
    while (t.type === Token.VARID || t.type === Token.CONID || (t.type === Token.SPECIAL && t.value !== ")")) {
        if (t.type === Token.VARID) {
            cType = new ApplicationType(cType, new UnboundType(t.value));
        } else if (t.type === Token.CONID) {
            cType = new ApplicationType(cType, new LiteralType(t.value));
        } else if (t.type === Token.SPECIAL) {
            if (t.value !== "(")
                throw `Expected '(', but received '${t.value}'.`;
            let cType2 = parseCustomTypeInCustomType(tokens);
            cType = new ApplicationType(cType, cType2);
        }
        t = tokens.shift();
    }
    return cType;
}