function parse(tokens) {

    p = new Program();

    while (tokens.length) {
        parseDeclarations(tokens);

        while (tokens[0]?.value === "\n") tokens.shift();
    }    

}