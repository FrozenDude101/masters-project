class Pattern {

    get length() {
        return this.args.length;
    }

    constructor(...args) {
        this.args = args;

        let symbols = this.args.reduce((s, a) => s.concat(a.getSymbols()), []);
        symbols.reduce((ss, s) => {
            if (ss.includes(s))
                throw new PatternSymbolError(this, s);
            return ss.concat([s]);
        }, []);
    }
    clone() {
        return new Pattern(...this.args.map(a => a.clone()));
    }
    toString() {
        return this.args.reduce((s, a) => a instanceof ApplicationArgument ? `${s} (${a})` : `${s} ${a}`, "").trim();
    }

    next() {
        return new Pattern(...this.args.slice(1));
    }

    getSymbols() {
        return this.args.reduce((s, a) => s.concat(a.getSymbols()), []);
    }
    getTypeSymbols() {
        return this.args.reduce((s, a) => s.concat(a.getTypeSymbols()), []);
    }

    requiresSteps(t) {
        return this.args[0].requiresSteps(t);
    }
    canMatch(t) {
        return this.args[0].canMatch(t);
    }
    match(t) {
        return this.args[0].match(t);
    }

    applyType(t) {
        let newArgs = [];
        for (let i = 0; i < this.length; i++) {
            newArgs.push(this.args[i].applyType(t.t1));
            t = t.t2;
        }
        return new Pattern(...newArgs);
    }
    getTypeConstraints(rs={}) {
        return this.args.reduce((tcs, a) => a.getTypeConstraints(tcs), {});
    }

}

class PatternSymbolError extends Error {
    constructor(p, s) {
        super(`Duplicate symbol '${s}' in pattern '${p}'.\nEach symbol in a pattern must only occur once.`);
    }
}