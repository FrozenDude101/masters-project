function tokenize(f) {

    let func = (input) => {

        let result;
        if (f instanceof FunctionReference) {
            result = f.call(input.child());
        } else if (f instanceof Function){
            result = f(input.child());
        } else {
            result = str(f)(input.child());
        }

        console.log(input.input, f.name ? f.name : f);

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

    let name = "all: [" + fs.map(f => f.name ? f.name : f).join(", ") + "]"
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

    let name = "any: [" + fs.map(f => f.name ? f.name : f).join(", ") + "]"
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

    let name = "opt: " + (f.name ? f.name : f);
    Object.defineProperty(func, "name", { value: name });
    return func;

}

function many(f) {

    let func = (input) => {
        return opt(all(f, many(f)))(input);
    };

    let name = "many: " + (f.name ? f.name : f);
    Object.defineProperty(func, "name", { value: name });
    return func;

}
function diff(f, g) {

    let func = (input) => {

        let result = tokenize(f)(input.child());
        let rTokens = result.tokens.map((t) => t.value);
        result.prependTokens(input);

        let oTokens;
        try {
            let other = tokenize(g)(input.child());
            oTokens = other.tokens.map((t) => t.value);
        } catch (e) {
            if (e instanceof LexerError) return result;
            throw e;
        }
        

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

    let name = `diff: [${f.name ? f.name : f}, ${g.name ? g.name : g}]`;
    Object.defineProperty(func, "name", { value: name });
    return func;

}

let err = (input) => { throw new LexerError("Null"); };

function str(s) {

    let func = (input) => {

        if (!input.input.join("").startsWith(s)) throw new LexerError("No char match!");
        input.addToken(Token.NONE, s);
        input.advance(s.length);

        return input;

    };

    Object.defineProperty(func, "name", { value: s });
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

    let name = "merge: " + (f.name ? f.name : f);
    Object.defineProperty(func, "name", { value: name });

    return func;

}

class LexerError extends Error {}

function test(t, input) {

    console.log("" + tokenize(t)(LexerInput.fromInput(input)));

}