class LexerInput {

    constructor(input, tokens, pos) {

        this.input = input;
        this.tokens = tokens;
        this.pos = pos;

    }
    static fromInput(input) {

        return new LexerInput([...input], [], [0, 0]);

    }
    child() {

        return new LexerInput(
            [...this.input],
            [],
            [...this.pos],
        );

    }

    addToken(type, value) {

        let token = new Token(type, value, [...this.pos]);
        this.tokens.push(token);

    }
    prependTokens(lI) {

        this.tokens.unshift(...lI.tokens);

    }

    advance(n) {

        for (let i = 0; i < n; i++) {
            this.pos[0] += 1;
            if (this.input[0] === "\n") {
                this.pos[0] = 0;
                this.pos[1] += 1;
            }
            this.input.shift();
        }

    }

    match(regex) {

        return this.input.join("").match(regex);

    }
    startsWith(regex) {

        return this.match(new RegExp("^" + regex.source));

    }

    toString() {

        return `I: ${this.input.join("")}\nT: ${this.tokens.map(t => `(${t.type}, ${t.value})`)}\nP: ${this.pos}`

    }

}