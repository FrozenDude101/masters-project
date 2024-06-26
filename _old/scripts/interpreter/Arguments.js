class EArgument {

    static VARIABLE    = "variable";
    static LITERAL     = "literal";
    static WILD        = "wild";

}

class UnboundArgument {

    argumentType = EArgument.VARIABLE;

    constructor(symbol, type=undefined) {
        this.symbol = symbol;
        this.type = type ? type.clone() : new UnboundType(this.symbol);
    }
    clone() {
        return new UnboundArgument(this.symbol, this.type.clone());
    }
    toString() {
        return `${this.symbol}`;
    }

    requiresSteps(t) {
        return false;
    }
    matches(t, rs) {
        rs[this.symbol] = t;
        return true;
    }

    getSymbols() {
        return [this.symbol];
    }

    getConstraints(t1) {
        if (!this.type.canMatch(t1))
            throw `${t1} cannot bind to ${this.type}`
        return [[this.type, t1]];
    }
    applyTypeConstraints(cs) {
        if (this.symbol in cs) {
            this.type = cs[this.symbol];
        }
        if (this.type.symbol in cs) {
            this.type = cs[this.type.symbol];
        }
        for (let k in cs) {
            this.type.substituteConstraint(k, cs[k]);
        }
    }
    applyType(t1) {
        if (this.symbol === "xs")
            console.log("XS "+t1);
        if (t1 === undefined) return;
        this.type = t1;
    }

    getReplacements() {
        return [[this.symbol, this.type]];
    }

}

class ConstructorArgument {

    constructor(name) {
        this.name = name;
        this.type = Program.get(this.name).type.clone();
    }
    clone() {
        return new ConstructorArgument(this.name);
    }
    toString() {
        return `${this.name}`;
    }

    requiresSteps(t) {
        return t.canStep();
    }
    matches(t,_) {
        if (!(t.thunk instanceof ConstructorThunk))
            return false;
        if (t.thunk.name !== this.name)
            return false;
        return true;
    }
    getSymbols() {
        return [];
    }

    getTypeToConstrain(n) {
        let as = [];
        let t = this.type.clone();
        for (let i = 0; i < Program.get(this.name).patterns[0].length(); i++) {
            as.push(t.t1);
            t = t.t2;
        }
        as.reverse();
        return as.slice(n)[0];
    }
    getConRetType() {
        let t = this.type.clone();
        for (let i = 0; i < Program.get(this.name).patterns[0].length(); i++) {
            t = t.t2;
        }
        return t;
    }
    getCon() {
        return Program.get(this.name);
    }

    getConstraints(t1) {
        return [];
    }
    applyTypeConstraints(cs) {
        return;
    }
    applyType(t1) {
    }
    applyType2(t1) {
    }

    getReplacements() {
        return [];
    }

}

class ApplicationArgument {

    constructor(a1, a2) {
        this.a1 = a1;
        this.a2 = a2;
    }
    clone() {
        return new ApplicationArgument(this.a1.clone(), this.a2.clone());
    }
    toString() {
        if (this.a2 instanceof ApplicationArgument)
            return `${this.a1} (${this.a2})`;
        return `${this.a1} ${this.a2}`;
    }

    requiresSteps(t) {
        if (!(t.t instanceof ApplicationThunk))
            return false;
        return this.a1.requiresSteps(t.t.t1) || this.a2.requiresSteps(t.t.t2);
    }
    matches(t,rs) {
        if (!(t.thunk instanceof ApplicationThunk))
            return false;
        return this.a1.matches(t.t.t1, rs) && this.a2.matches(t.t.t2, rs);
    }
    getSymbols() {
        return this.a1.getSymbols().concat(this.a2.getSymbols());
    }

    getTypeToConstrain(n=0) {
        return this.a1.getTypeToConstrain(n-1);
    }
    getConRetType() {
        return this.a1.getConRetType();
    }
    getCon() {
        return this.a1.getCon();
    }

    getConstraints(t1) {
        return [];
    }
    applyTypeConstraints(cs) {
        this.a1.applyTypeConstraints(cs);
        this.a2.applyTypeConstraints(cs);
    }
    applyType(t1) {
        let crt = this.getConRetType();
        console.log(""+t1);
        console.log(""+crt);
        console.log(t1.unifyConstraints(crt.getConstraints(t1)));

        let con = this.getCon();
        let patt = con.patterns[0].clone();
        patt.applyTypeConstraints(
            t1.unifyConstraints(crt.getConstraints(t1))
        );

        this.applyType2(patt.args.map(a => a.type).reverse());
    }
    applyType2(ts) {
        this.a1.applyType2(ts.slice(1));
        this.a2.applyType(ts[0]);
    }

    getReplacements() {
        return this.a1.getReplacements().concat(this.a2.getReplacements());
    }

}

class LiteralArgument {

    argumentType = EArgument.LITERAL;

    constructor(value) {
        this.value = value;
        switch (typeof this.value) {
            case "boolean":
                this.type = new LiteralType("Bool");
                break;
            case "number":
                if (Number.isInteger(this.value))
                    this.type = new LiteralType("Integer");
                else
                    this.type = new LiteralType("Float");
                break;
            case "string":
                this.type = new LiteralType("String");
                break;
            default:
                this.type = `Unknown value type for ${this.value}`;
        }
    }
    clone() {
        return new LiteralArgument(this.value);
    }
    toString() {
        return `${this.value}`;
    }

    requiresSteps(t) {
        return t.canStep();
    }
    matches(t,_) {
        if (!(t.thunk instanceof LiteralThunk))
            return false;
        if (t.thunk.value !== this.value)
            return false;
        return true;
    }
    getSymbols() {
        return [];
    }

    getConstraints(t1) {
        return [];
    }
    applyTypeConstraints(cs) {
        return;
    }
    applyType(t1) {
        if (!this.type.canMatch(t1))
            throw `${t1} cannot bind to ${this.type}`
        this.type = t1;
    }

    getReplacements() {
        return [];
    }
}

class WildcardArgument {

    argumentType = EArgument.WILD;

    clone() {
        return new WildcardArgument();
    }
    toString() {
        return `_`;
    }

    requiresSteps(t) {
        return false;
    }
    matches(t,_) {
        return true;
    }
    getSymbols() {
        return [];
    }

    getConstraints(t1) {
        return [];
    }
    applyTypeConstraints(cs) {
        return;
    }
    applyType(t1) {
    }

    getReplacements() {
        return [];
    }

}