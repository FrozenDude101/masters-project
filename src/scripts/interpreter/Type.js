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
        return `{${this.t1} ${this.t2}}`;
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

    canMatch(t3) {
        switch (t3.typeType) {
            case Type.APPLICATION:
                return this.t1.canMatch(t3.t1) && this.t2.canMatch(t3.t2);
            case Type.LITERAL:
                return false;
            case Type.FUNCTION:
                return false;
            case Type.UNBOUND:
                return true;
        }
    }
    getConstraints(t3) {
        if (t3.typeType === Type.UNBOUND) {
            return t3.getConstraints(this);
        }
        return this.t1.getConstraints(t3.t1).concat(this.t2.getConstraints(t3.t2));
    }
    substituteConstraint(s, t) {
        return new ApplicationType(this.t1.substituteConstraint(s, t), this.t2.substituteConstraint(s, t));
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

    canMatch(t2) {
        switch (t2.typeType) {
            case Type.APPLICATION:
                return false;
            case Type.LITERAL:
                return this.value === t2.value;
            case Type.FUNCTION:
                return false;
            case Type.UNBOUND:
                return true;
        }
    }
    getConstraints(t2) {
        if (t2.typeType === Type.UNBOUND) {
            return t2.getConstraints(this);
        }
        return [];
    }
    substituteConstraint(s, t) {
        return this.clone();
    }
}

class UnboundType extends Type {

    typeType = Type.UNBOUND;

    constructor(symbol) {
        super();
        this.symbol = symbol;
    }
    clone() {
        return new UnboundType(this.symbol);
    }
    toString() {
        return `${this.symbol}`;
    }

    equals(t2) {
        return this.typeType === t2.typeType && this.symbol === t2.symbol;
    }

    getSymbols() {
        return [this.symbol];
    }
    alphaConvert(rs) {
        if (this.symbol in rs)
            return new UnboundType(rs[this.symbol]);
        return this.clone();
    }

    canMatch(t2) {
        return true;
    }
    getConstraints(t2) {
        let ret = [[this.symbol, t2]];
        if (t2.typeType === Type.UNBOUND) {
            ret.push([t2.symbol, this]);
        }
        return ret;
    }
    substituteConstraint(s, t) {
        return this.symbol === s ? t.clone() : this.clone();
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
        return `(${this.t1} -> ${this.t2})`;
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

    canMatch(t3) {
        switch (t3.typeType) {
            case Type.APPLICATION:
                return false;
            case Type.LITERAL:
                return false;
            case Type.FUNCTION:
                return this.t1.canMatch(t3.t1) && this.t2.canMatch(t3.t2);
            case Type.UNBOUND:
                return true;
        }
    }
    getConstraints(t3) {
        if (t3.typeType === Type.UNBOUND) {
            return t3.getConstraints(this);
        }
        return this.t1.getConstraints(t3.t1).concat(this.t2.getConstraints(t3.t2));
    }
    substituteConstraint(s, t) {
        return new FunctionType(this.t1.substituteConstraint(s, t), this.t2.substituteConstraint(s, t));
    }

    bind(t3) {
        let s1 = this.getSymbols();
        let s2 = t3.getSymbols();
        let intersection = s1.filter(s => s2.includes(s));
        if (intersection.length) {
            let replacements = {};
            let i = 0;
            do {
                for (let item of intersection) {
                    replacements[item] = item + i;
                }
                i += 1;
                intersection = Object.keys(replacements).filter(v =>
                    s1.includes(replacements[v]) ||
                    s2.includes(replacements[v])
                );
            } while (intersection.length);
            t3 = t3.alphaConvert(replacements);
        }

        if (!this.t1.canMatch(t3))
            throw `Cannot bind ${t3} to ${this}.`

        let cs = this.t1.getConstraints(t3);
        let ucs = this.unifyConstraints(cs);
        
        let rt2 = this.t2.clone();
        for (let s in ucs) {
            rt2 = rt2.substituteConstraint(s, ucs[s]);
        }

        return rt2;
    }

}

let a = new UnboundType("a");
let b = new UnboundType("b");

let int = new LiteralType("Integer");
let str = new LiteralType("String");

let maybe = new LiteralType("Maybe");
let maybe_int = new ApplicationType(maybe, int);

let a_b_a_b = new FunctionType(a, new FunctionType(b, new FunctionType(a, b)));