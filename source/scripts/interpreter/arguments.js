class ConstructorArgument {

    constructor(name) {
        this.name = name;
    }
    clone() {
        return new ConstructorArgument(this.name);
    }
    toString() {
        return `${this.name}`;
    }

    getSymbols() {
        return [];
    }
    getTypeSymbols() {
        return [];
    }

    getConstructorName() {
        return this.name;
    }
    getConstructor() {
        return Program.getConstructor(this.name);
    }
    getTypeSetter() {
        return Program.getTypeSetter(this.name);
    }
    depth() {
        return 0;
    }

    requiresSteps(t) {
        return t.canStep();
    }
    canMatch(t) {
        if (!(t instanceof ConstructorThunk) && !(t instanceof FunctionThunk))
            return false;
        return this.name === t.name;
    }
    match(t, rs={}) {
        return rs;
    }

    applyType(t) {
        return this.clone();
    }
    applyType2(t) {
        return this.clone();
    }

    getTypeConstraints(tcs={}) {
        return tcs;
    }

}

class LiteralArgument {

    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
    clone() {
        return new LiteralArgument(this.value, this.type.clone());
    }
    toString() {
        return this.value;
    }

    getSymbols() {
        return [];
    }
    getTypeSymbols() {
        return [];
    }

    requiresSteps(t) {
        return t.canStep();
    }
    canMatch(t) {
        if (!(t instanceof LiteralThunk))
            return false;
        if (!(this.type.canMatch(t.type)))
            return false;
        return this.value === t.value;
    }
    match(t, rs={}) {
        return rs;
    }

    applyType(t) {
        if (!this.type.equals(t))
            throw new TypeEqualError(this.type, t);
        return this.clone();
    }
    getTypeConstraints(tcs={}) {
        return tcs;
    }

}

class UnboundArgument {

    constructor(symbol, type=undefined) {
        this.symbol = symbol;
        this.type = type ? type : new AllType();
    }
    clone() {
        return new UnboundArgument(this.symbol, this.type.clone());
    }
    toString() {
        return `${this.symbol}`;
    }

    getSymbols() {
        return [this.symbol];
    }
    getTypeSymbols() {
        return this.type.getSymbols();
    }

    requiresSteps(t) {
        return false;
    }
    canMatch(t) {
        return this.type.canMatch(t.type);
    }
    match(t, rs={}) {
        rs[this.symbol] = t;
        return rs;
    }

    applyType(t) {
        if (!this.type.canMatch(t) && !(this.type instanceof AllType))
            throw new TypeMatchError(this.type, t);
        return new UnboundArgument(this.symbol, t.clone());
    }
    getTypeConstraints(tcs) {
        tcs[this.symbol] = this.type.clone();
        return tcs;
    }

}

class WilcardArgument {

    constructor() {
    }
    clone() {
        return new WilcardArgument();
    }
    toString() {
        return `_`;
    }

    getSymbols() {
        return [];
    }
    getTypeSymbols() {
        return [];
    }

    requiresSteps(t) {
        return false;
    }
    canMatch(t) {
        return true;
    }
    match(t, rs={}) {
        return rs;
    }

    applyType(t) {
        return this.clone();
    }
    getTypeConstraints(tcs) {
        return tcs;
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

    getSymbols() {
        return this.a1.getSymbols().concat(this.a2.getSymbols());
    }
    getTypeSymbols() {
        return this.a1.getTypeSymbols().concat(this.a2.getTypeSymbols());
    }

    getConstructorName() {
        return this.a1.getConstructorName();
    }
    getConstructor() {
        return this.a1.getConstructor();
    }
    getTypeSetter() {
        return this.a1.getTypeSetter();
    }
    depth() {
        return this.a1.depth() + 1;
    }

    requiresSteps(t) {
        if (t instanceof FunctionReferenceThunk || t instanceof FunctionThunk) return true;
        let d = this.depth();
        let t2 = t;
        for (let i = 0; i < d; i++)
            t2 = t2?.t1;
        if (t2 && t2 instanceof ConstructorThunk && t2.name === this.getConstructorName())
            return false
        return t.canStep();
    }
    canMatch(t) {
        if (!(t instanceof ApplicationThunk))
            return false;
        return this.a1.canMatch(t.t1) && this.a2.canMatch(t.t2);
    }
    match(t, rs={}) {
        rs = this.a1.match(t.t1, rs);
        return this.a2.match(t.t2, rs);
    }

    applyType(t) {
        let con = this.getConstructor();
        let ts = this.getTypeSetter();
        ts = ts.bind(t);

        let ta = [];
        if (con instanceof FunctionThunk)
            for (let i = 0; i < con.patterns[0].length; i++) {
                ta.unshift(ts.t1);
                ts = ts.t2;
            }
        else
            return this.clone();

        return this.applyType2(ta);
    }
    applyType2(ts) {
        return new ApplicationArgument(this.a1.applyType2(ts.slice(1)), this.a2.applyType(ts[0]));
    }
    getTypeConstraints(tcs={}) {
        tcs = this.a1.getTypeConstraints(tcs);
        return this.a2.getTypeConstraints(tcs);
    }

}