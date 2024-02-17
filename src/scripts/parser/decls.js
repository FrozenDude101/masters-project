function parseDeclarations(tokens) {

    let t0 = tokens.shift();

    switch (t0.type) {
        case Token.KEYWORD:
            switch (t0.value) {
                case "data":
                    parseCustomType(tokens);
                    break;
            }
            break;
        default:
            let t1 = tokens.shift();
            switch (t1.value) {
                case "::":
                    let type = parseType(tokens);
                    p.registerFunction(t0.value, type);
                    break;
                default:
                    tokens.unshift(t1);
                    let pattern = parsePattern(tokens);
                    p.registerPattern(t0.value, pattern);
                    let implementation = parseImplementation(tokens);
                    p.registerImplementation(t0.value, implementation);
                    break;
            }
    }

}