class Pattern {

    constructor(...args) {
        this.args = args;
    }
    static p(s) {
        // TODO: parse a Pattern from a string
    }

    length() {
        return this.args.length;
    }
    finishedMatching() {
        return !this.length();
    }

    getSymbols() {
        return this.args.map(a => a.getSymbols()).flat();
    }

    requiresSteps(t) {
        return this.finishedMatching() || this.args[0].requiresSteps(t); 
    }
    matches(t) {
        let replacements = {};
        let matched = this.args[0].matches(t, replacements);
        if (!matched)
            return false;
        return replacements;
    }

    next() {
        return new Pattern(...this.args.slice(1));
    }

    toString() {
        return this.args.reduce((a, v) => a+", "+v);
    }

}