function tokenize(f) {

    let func = (input) => {

        let result;
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
            input = tokenize(f)(input);
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
                results.push(tokenize(f)(input));
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
            input = tokenize(f)(input);
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
        result = opt(all(f, many(f)))(input);
        return result;
    };

    let name = "many: " + f.name;
    Object.defineProperty(func, "name", { value: name });
    return func;

}
function diff(f, g) {

    let func = (input) => {

        let result = tokenize(f)(input.child());
        let rTokens = result.tokens.map((t) => t.value);
        result.prependTokens(input);

        try {
            let other  = tokenize(g)(input.child());
        } catch (e) {
            if (e instanceof LexerError) return result;
            throw e;
        }
        
        let oTokens = other.tokens.map((t) => t.value);

        if (rTokens.length !== oTokens.length) {
            return result;
        }

        for (let i = 0; i < rTokens.length; i++) {
            if (rTokens[i] !== oTokens[i]) {
                return result;
            }
        }

        throw new LexerError("Tokens matched in diff.");

    };

    let name = `diff: [${f.name}, ${g.name}]`;
    Object.defineProperty(func, "name", { value: name });
    return func;

}

function reg(name, regex, tokenType = Token.NONE) {

    let func = (input) => {

        let matches = input.startsWith(regex);
        if (!matches) throw new LexerError("No regex match!");
        input.addToken(tokenType, matches[0]);
        input.advance(matches[0].length);

        return input;

    };

    Object.defineProperty(func, "name", { value: name });
    return func;

}

function merge(f, tokenType) {

    let func = (input) => {

        let result = tokenize(f)(input);
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