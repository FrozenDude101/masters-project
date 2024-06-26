class Type {
    static APPLICATION = "application";
    static LITERAL     = "literal";
    static FUNCTION    = "function";
    static UNBOUND     = "unbound";

    unifyConstraints(cs) {
        let closed = {};
        while (cs.length) {
            let [s,t] = cs.pop();

            if (!(s in closed)) {
                closed[s] = t;
                cs = cs.map((c) => [c[0], c[1].substituteConstraint(s, t)]);
                for (let key in closed) {
                    closed[key] = closed[key].substituteConstraint(s, t);
                }
                continue;
            }

            if (closed[s].equals(t))
                continue;
            if (!closed[s].canMatch(t))
                throw `Type Unification Error:\nCan't match\n${closed[s]}\n${t}`;

            if (closed[s].typeType === Type.UNBOUND) {
                let s2 = closed[s].symbol;
                cs = cs.map((c) => [c[0], c[1].substituteConstraint(s2, t)]);
                for (let key in closed) {
                    closed[key] = closed[key].substituteConstraint(s2, t);
                }
                continue;
            } 

            if (t.typeType === Type.UNBOUND) {
                cs = cs.map((c) => [c[0], c[1].substituteConstraint(s, closed[s])]);
                for (let key in closed) {
                    closed[key] = closed[key].substituteConstraint(s, closed[s]);
                }
                continue;
            }

            throw "I haven't accounted for this case yet.";
        }

        return closed;
    }
}

class ApplicationType extends Type {

    typeType = Type.APPLICATION;

    constructor(t1, t2) {
        super();
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new ApplicationType(this.t1.clone(), this.t2.clone());
    }
    toString() {
        if (this.t2 instanceof ApplicationType)
            return `${this.t1} (${this.t2})`;
        return `${this.t1} ${this.t2}`;
    }

    equals(t3) {
        return this.typeType === t3.typeType && this.t1.equals(t3.t1) && this.t2.equals(t3.t2);
    }

    getSymbols() {
        return this.t1.getSymbols().concat(this.t2.getSymbols());
    }
    alphaConvert(rs) {
        return new ApplicationType(this.t1.alphaConvert(rs), this.t2.alphaConvert(rs));
    }

    canMatch(t3, strict=null) {
        if (strict === null) strict = this.getSymbols();
        switch (t3.typeType) {
            case Type.APPLICATION:
                return this.t1.canMatch(t3.t1, strict) && this.t2.canMatch(t3.t2, strict);
            case Type.LITERAL:
                return false;
            case Type.FUNCTION:
                return false;
            case Type.UNBOUND:
                return t2.symbol.endsWith("_u");
        }
    }
    getConstraints(t3) {
        if (t3.typeType === Type.UNBOUND)
            return [[t3.symbol, this]]
        return this.t1.getConstraints(t3.t1).concat(this.t2.getConstraints(t3.t2));
    }
    substituteConstraint(s, t) {
        return new ApplicationType(this.t1.substituteConstraint(s, t), this.t2.substituteConstraint(s, t));
    }

    annotateTypes(n) {
        let t = this.clone();
        t.t1 = t.t1.annotateTypes(n);
        t.t2 = t.t2.annotateTypes(n);
        return t;
    }

}

class LiteralType extends Type {

    typeType = Type.LITERAL;

    constructor(value) {
        super();
        this.value = value;
    }
    clone() {
        return new LiteralType(this.value);
    }
    toString() {
        return `${this.value}`;
    }

    equals(t2) {
        return this.typeType === t2.typeType && this.value === t2.value;
    }

    getSymbols() {
        return [];
    }
    alphaConvert(rs) {
        return this.clone();
    }

    canMatch(t2, strict=null) {
        if (strict === null) strict = this.getSymbols();
        switch (t2.typeType) {
            case Type.APPLICATION:
                return false;
            case Type.LITERAL:
                return this.value === t2.value;
            case Type.FUNCTION:
                return false;
            case Type.UNBOUND:
                return t2.symbol.endsWith("_u");
        }
    }
    getConstraints(t2) {
        if (t2.typeType === Type.UNBOUND)
            return [[t2.symbol, this]]
        return [];
    }
    substituteConstraint(s, t) {
        return this.clone();
    }

    annotateTypes(n) {
        return this.clone();
    }
}

class UnboundType extends Type {

    typeType = Type.UNBOUND;

    constructor(symbol, cs=null) {
        super();
        this.symbol = symbol;
        if (this.symbol.split("_").length === 1) {
            this.symbol += "_u";
        }
        this.cs = cs;
    }
    clone() {
        return new UnboundType(this.symbol);
    }
    toString() {
        return `${this.symbol.split("_")[0]}`;
    }

    equals(t2) {
        return this.typeType === t2.typeType && (this.symbol.split("_").slice(0,-1).join("_") === t2.symbol.split("_").slice(0,-1).join("_"));
    }

    getSymbols() {
        return [this.symbol];
    }
    alphaConvert(rs) {
        if (this.symbol in rs)
            return new UnboundType(rs[this.symbol]);
        return this.clone();
    }

    canMatch(t2, strict=null) {
        if (strict === null) strict = this.getSymbols();
        switch (t2.typeType) {
            case Type.APPLICATION:
                return this.cs === null;
            case Type.LITERAL:
                return this.cs === null;
            case Type.FUNCTION:
                return this.cs === null;
            case Type.UNBOUND:
                if (strict.includes(t2.symbol))
                    return t2.symbol === this.symbol;
                if (this.symbol.split("_").slice(0,-1).join("_") === t2.symbol.split("_").slice(0,-1).join("_"))
                    return true
                return this.cs === null;
        }
    }
    getConstraints(t2) {
        return [[this.symbol, t2]]
    }
    substituteConstraint(s, t) {
        if (this.symbol.split("_").slice(-1)[0] === "u" && this.symbol.split("_").slice(0, -1).join("_") === s)
            return t.clone();
        return this.symbol === s ? t.clone() : this.clone();
    }

    annotateTypes(n) {
        let t = this.clone();
        let ts = t.symbol.split("_");
        ts.pop();
        ts.push(n);
        t.symbol = ts.join("_");
        return t;
    }

}

class FunctionType extends Type {

    typeType = Type.FUNCTION;

    constructor(t1, t2) {
        super();
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new FunctionType(this.t1.clone(), this.t2.clone());
    }
    toString() {
        if (this.t1 instanceof FunctionType)
            return `(${this.t1}) -> ${this.t2}`;
        return `${this.t1} -> ${this.t2}`;
    }

    equals(t3) {
        return this.typeType === t3.typeType && this.t1.equals(t3.t1) && this.t2.equals(t3.t2);
    }

    getSymbols() {
        return this.t1.getSymbols().concat(this.t2.getSymbols());
    }
    alphaConvert(rs) {
        return new FunctionType(this.t1.alphaConvert(rs), this.t2.alphaConvert(rs));
    }

    canMatch(t3, strict=null) {
        if (strict === null) strict = this.getSymbols();
        switch (t3.typeType) {
            case Type.APPLICATION:
                return false;
            case Type.LITERAL:
                return false;
            case Type.FUNCTION:
                return this.t1.canMatch(t3.t1, strict) && this.t2.canMatch(t3.t2, strict);
            case Type.UNBOUND:
                return t2.symbol.endsWith("_u");
        }
    }
    getConstraints(t3) {
        if (t3.typeType === Type.UNBOUND)
            return [[t3.symbol, this]]
        return this.t1.getConstraints(t3.t1).concat(this.t2.getConstraints(t3.t2));
    }
    substituteConstraint(s, t) {
        return new FunctionType(this.t1.substituteConstraint(s, t), this.t2.substituteConstraint(s, t));
    }

    bind(t3) {
        let strict = this.getSymbols();

        if (!this.t1.canMatch(t3, strict))
            throw `Cannot bind '${t3}' to '${this}'`

        let cs = this.t1.getConstraints(t3, strict);
        let ucs = this.unifyConstraints(cs);

        let rt2 = this.t2.clone();
        for (let s in ucs) {
            rt2 = rt2.substituteConstraint(s, ucs[s]);
        }

        return rt2;
    }
    getUCS(t3) {
        let strict = this.getSymbols();

        if (!this.t1.canMatch(t3, strict))
            throw `Cannot bind ${t3} to ${this}`

        let cs = this.t1.getConstraints(t3, strict);
        let ucs = this.unifyConstraints(cs);

        return ucs;
    }

    annotateTypes(n) {
        let t = this.clone();
        t.t1 = t.t1.annotateTypes(n);
        t.t2 = t.t2.annotateTypes(n);
        return t;
    }

}