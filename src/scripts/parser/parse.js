function parse(tokens) {

    p = new Program();

    while (tokens.length) {
        parseDeclarations(tokens);
        while (tokens[0]?.value === "\n") tokens.shift();
    }
    
    p.convertToThunks();

    return p;

}

class ParserError extends Error {

    constructor(message, index, length) {
        super(message);
        this.index = index;
        this.length = length;
    }

}