class Pattern {

    constructor(...args) {
        this.args = args;
        for (let a of args)
            a.parent = this;
    }
    clone() {
        return new Pattern(...this.args.map(a => a.clone()));
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
        return ""+this.args.reduce((a, v) => a+", "+v);
    }

    getConstraints(t1) {
        let cs = [];
        for (let i = 0; i < this.length(); i++) {
            let t = t1 instanceof FunctionType ? t1.t1 : t1;
            cs.push(...this.args[i].getConstraints(t))
            t1 = t1.t2;
        }
        return cs;
    }
    applyTypeConstraints(cs) {
        for (let a of this.args) {
            a.applyTypeConstraints(cs);
        }
    }

}