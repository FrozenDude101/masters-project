class Lexer {

    static cache = {};

    static lexer(f) {

        let func = (inputs) => {

            if (!Array.isArray(inputs)) inputs = [inputs];
            
            let results = [];
            for (let input of inputs) {

                let result;
                if (f instanceof FunctionReference) result = f.call(input.child());
                else if (f instanceof Function)     result = f(input.child());
                else                                result = this.str(f)(input.child());

                if (!Array.isArray(result)) result = [result];
                result = result.flat();

                this.cache[name][input.hash()] = [];
                for (let r of result) {
                    r.prependTokens(input);
                    results.push(r);
                    this.cache[name][input.hash()].push(r.clone());
                }

            }

            return results;

        };
    
        let name = f.name ? f.name : f;
        if (!this.cache[name]) this.cache[name] = {};

        Object.defineProperty(func, "name", { value: name });
        return func;
    
    }
    
    static all(...fs) {

        let func = (input) => {

            for (let f of fs) {
                input = this.lexer(f)(input);                
            }

            return input;

        }

        let name = `all: [${fs.map(f => (f.name ? f.name : f)).join(", ")}]`;
        Object.defineProperty(func, "name", { value: name });
        return func;

    }
    static any(...fs) {

        let func = (input) => {

            let results = []
            for (let f of fs) {
                results.push(this.lexer(f)(input));
            }

            return results;

        }

        let name = `any: ${fs.map(f => (f.name ? f.name : f))}`;
        Object.defineProperty(func, "name", { value: name });
        return func;

    }
    static opt(f) {

        let func = (input) => {
    
            try {
                return [input, this.lexer(f)(input)];
            } catch (e) {
                if (e instanceof LexerError) return input;
                throw (e);
            }
        }

        let name = `opt: ${f.name ? f.name : f}`;
        Object.defineProperty(func, "name", { value: name });
        return func;

    }
    static many(f) {
    
        let func = (input) => {

            input = [input];
            let results = [input];

            while (input.length) {
                input = this.lexer(f)(input);
                results.push(input);
            }

            return results;
        };
    
        let name = "many: " + (f.name ? f.name : f);
        Object.defineProperty(func, "name", { value: name });
        return func;
    
    }
    static diff(f, g) {
    
        let func = (input) => {
    
            let results = this.lexer(f)(input.child());
            let others = this.lexer(g)(input.child());

            let noMatches = [];

            for (let result of results) {
                let noMatch = true;
                for (let other of others) {
                    let rT = result.tokens.map(t => t.value).join("");
                    let oT = other.tokens.map(t => t.value).join("");
                    if (rT === oT) {
                        noMatch = false;
                        break;
                    }
                }
                if (noMatch) noMatches.push(result);
            }

            for (let nM of noMatches) {
                nM.prependTokens(input);
            }

            return noMatches;
    
        };
    
        let name = `diff: [${f.name ? f.name : f}, ${g.name ? g.name : g}]`;
        Object.defineProperty(func, "name", { value: name });
        return func;
    
    }

    static str(s) {

        let func = (input) => {

            if (!input.startsWith(s)) return [];
            input.addToken(Token.NONE, s);
            input.advance(s.length);
    
            return input;

        }
    
        let name = s;
        Object.defineProperty(func, "name", { value: name });
        return func;
    }
    static reg(r) {

        let func = (input) => {

            let match = input.startsWithRegEx(r);
            if (!match) return [];

            let matchString = match[0];
            input.addToken(Token.NONE, matchString);
            input.advance(matchString.length);

            return input;

        }

        let name = r;
        Object.defineProperty(func, "name", { value: name });
        return func;

    }

    static tok(f, tokenType) {

        let func = (input) => {

            let results = this.lexer(f)(input);
            let LIs = [];
            for (let result of results) {
                let tokenValue = result.tokens.reduce((a, t) => a + t.value, "");
    
                let lI = result.child();
                lI.addToken(tokenType, tokenValue);
                lI.prependTokens(input);
                LIs.push(lI);
            }

            return LIs;

        }

        let name = "tok: " + (f.name ? f.name : f);
        Object.defineProperty(func, "name", { value: name });
        return func;

    }

    static max(f, w) {

        let func = (input) => {

            let results = this.lexer(f)(input);
            let weights = results.map(w);
            let maxValue = Math.max(...weights);
            let maxIndex = weights.indexOf(maxValue);

            if (maxIndex === -1) return [];
            return results[maxIndex];

        }

        let name = `max: ${f.name ? f.name : f}`;
        Object.defineProperty(func, "name", { value: name });
        return func;

    }
    static index = (lI) => lI.index;

}

class LexerError extends Error {}

function test(t, input) {

    let t1 = performance.now();

    let LOs = Lexer.lexer(t)(LexerInput.fromInput(input));
    console.log(`${LOs.length} successful run${LOs.length === 1 ? "" : "s"}.`);
    console.log(`${LOs[0].tokens.map((t) => "(" + t.type + ", " + t.value + ")").join("")}`);

    let t2 = performance.now();

    console.log("Took ", (t2-t1)/1000);
    document.getElementById("time").innerText = `Time Taken: ${(t2-t1)/1000}s.`

    let div = document.getElementById("tokens");
    div.innerHTML = "";
    printTokens(LOs[0].tokens);

}

function printTokens(ts) {

    if (!ts.length) return;

    let div = document.getElementById("tokens");
    let t = ts[0];
    if ([...t.value].includes("\n")) div.innerHTML += "<br>".repeat(t.value.split("\n").length - 1);
    if (![Token.NONE, Token.WHITESPACE].includes(t.type)) div.innerHTML += `${t.value}, `;
    setTimeout(() => printTokens(ts.slice(1)), 0);

}

all   = Lexer.all.bind(Lexer);
any   = Lexer.any.bind(Lexer);
opt   = Lexer.opt.bind(Lexer);
many  = Lexer.many.bind(Lexer);
diff  = Lexer.diff.bind(Lexer);

str   = Lexer.str.bind(Lexer);
reg   = Lexer.reg.bind(Lexer);

tok   = Lexer.tok.bind(Lexer);

max   = Lexer.max.bind(Lexer);
index = Lexer.index.bind(Lexer);