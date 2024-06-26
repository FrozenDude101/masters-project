class LexerInput {

    constructor(input, tokens, index = 0) {

        this.input  = input;
        this.tokens = tokens;
        this.index  = index;

    }
    static fromInput(input) {

        return new LexerInput([...input], []);

    }
    child() {

        return new LexerInput(
            [...this.input],
            [],
            this.index,
        );

    }
    clone() {

        return new LexerInput(
            [...this.input],
            [...this.tokens],
            this.index,
        )

    }

    addToken(type, value) {

        let token = new Token(type, value, this.index - value.length);
        this.tokens.push(token);

    }
    appendTokens(lI) {

        this.tokens.push(...lI);

    }
    prependTokens(lI) {

        this.tokens.unshift(...lI.tokens);

    }

    advance(n) {

        this.index += n;

    }

    startsWith(s) {

        return this.input.slice(this.index).join("").startsWith(s);

    }
    startsWithRegEx(r) {

        return this.input.slice(this.index).join("").match(RegExp(`^${r.source}`));

    }

    toString() {

        return `I: ${this.input.slice(this.index).join("")}\nT: ${this.tokens.map(t => `(${t.type}, ${t.value})`)}\nP: ${this.index}`

    }
    hash() {
        return this.input.slice(this.index).join("");
    }

}