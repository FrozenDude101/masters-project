function tokenize(f) {

    let func = (input) => {

        if (f instanceof FunctionReference) {
            result = f.call(input.child());
        } else {
            result = f(input.child());
        }

        result.prependTokens(input);

        return result;

    }

    Object.defineProperty(func, "name", { value: f.name });

    return func;

}

function all(...fs) {

    let func = (input) => {

        for (let f of fs) {
            let result = tokenize(f)(input.child());
            result.prependTokens(input);
            input = result;
        }

        return input;

    }

    let name = "all: [" + fs.map(f => f.name).join(", ") + "]"
    Object.defineProperty(func, "name", { value: name });

    return func;

}
function any(...fs) {

    let func = (input) => {

        let results = [];

        for (let f of fs) {
            try {
                let result = tokenize(f)(input.child());
                result.prependTokens(input);
                results.push(result);
            } catch (e) {
                if (e instanceof LexerError) continue;
                throw e;
            }
        }

        if (!results.length) throw new LexerError("No matches!");

        return results.reduce((a, b) => a.input.length < b.input.length ? a : b);

    }

    let name = "any: [" + fs.map(f => f.name).join(", ") + "]"
    Object.defineProperty(func, "name", { value: name });

    return func;

}
function opt(f) {

    let func = (input) => {

        try {
            let result = tokenize(f)(input.child());
            result.prependTokens(input);
            input = result;
        } catch (e) {
            if (!(e instanceof LexerError)) throw e;
        } finally {
            return input;
        }

    }

    let name = "opt: " + f.name;
    Object.defineProperty(func, "name", { value: name });

    return func;

}

function many(f) {

    let func = (input) => {
        result = opt(all(f, many(f)))(input.child());
        result.prependTokens(input);
        return result;
    };

    let name = "many: " + f.name;
    Object.defineProperty(func, "name", { value: name });

    return func;

}

function reg(name, regex) {

    let func = (input) => {

        let matches = input.startsWith(regex);
        if (!matches) throw new LexerError("Invalid!");
        input.addToken(Token.NONE, matches[0]);
        input.advance(matches[0].length);

        return input;

    };

    Object.defineProperty(func, "name", { value: name });

    return func;

}

function merge(f, tokenType) {

    let func = (input) => {

        let result = tokenize(f)(input.child());
        let tokenValue = result.tokens.reduce((a, t) => a + t.value, "");
        let token = new Token(tokenType, tokenValue, [...result.tokens[0].pos]);

        let lI = new LexerInput(result.input, [token], [...result.pos]);
        lI.prependTokens(input);

        return lI;

    }

    let name = "merge: " + f.name;
    Object.defineProperty(func, "name", { value: name });

    return func;

}

class LexerError extends Error {}

function test(t, input) {

    console.log("" + tokenize(t)(LexerInput.fromInput(input)));

}