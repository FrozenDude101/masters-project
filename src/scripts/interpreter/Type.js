class Type {

    static APPLICATION = "application";
    static VARIABLE    = "variable";
    static UNBOUND     = "unbound";
    static FUNCTION    = "function";

}

class ApplicationType extends Type {

    type = Type.APPLICATION;

    constructor(t1, t2) {
        super();
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new ApplicationType(this.t1.clone(), this.t2.clone());
    }

    getSymbols() {
        return [...new Set([...this.t1.getSymbols(), ...this.t2.getSymbols()])];
    }
    alphaConvert(rs) {
        return new ApplicationType(this.t1.alphaConvert(rs), this.t2.alphaConvert(rs));
    }
    betaReduce(rs) {
        return new ApplicationType(this.t1.betaReduce(rs), this.t2.betaReduce(rs));
    }

    equals(t3) {
        return this.type === t3.type && this.t1.equals(t3.t1) && this.t2.equals(t3.t2);
    }
    matches(t3) {
        switch (t3.type) {
            case Type.APPLICATION:
                return [this.t1.matches(t3.t1), this.t2.matches(t3.t2)].flat();
            case Type.FUNCTION:
                return [false];
            case Type.UNBOUND:
                return t3.matches(this);
            case Type.VARIABLE:
                return [false];
        }
    }

    toString() {
        return `{${this.t1} ${this.t2}}`;
    }

}

class VariableType extends Type {

    type = Type.VARIABLE;

    constructor(value) {
        super();
        this.value = value;
    }
    clone() {
        return new VariableType(this.value);
    }

    getSymbols() {
        return []
    }
    alphaConvert(rs) {
        return new VariableType(this.value);
    }
    betaReduce(rs) {
        return new VariableType(this.value);
    }

    equals(t3) {
        return this.type === t3.type && this.value === t3.value;
    }
    matches(t3) {
        switch (t3.type) {
            case Type.APPLICATION:
                return [false];
            case Type.FUNCTION:
                return [false];
            case Type.UNBOUND:
                return t3.matches(this);
            case Type.VARIABLE:
                return [this.value === t3.value];
        }
    }

    toString() {
        return this.value;
    }

}

class UnboundType extends Type {

    type = Type.UNBOUND;

    constructor(symbol) {
        super();
        this.symbol = symbol;
    }
    clone() {
        return new UnboundType(this.symbol);
    }

    getSymbols() {
        return [this.symbol];
    }
    alphaConvert(rs) {
        return new UnboundType(this.symbol in rs ? rs[this.symbol] : this.symbol);
    }
    betaReduce(rs) {
        return this.symbol in rs ? rs[this.symbol].clone() : new UnboundType(this.symbol);
    }

    equals(t3) {
        return this.type === t3.type && this.symbol === t3.symbol;
    }
    matches(t3) {
        let rs = {};
        rs[this.symbol] = t3;
        if (t3.type !== this.type) return [rs];
        let rs2 = {};
        rs2[t3.symbol] = this;
        return [rs, rs2];
    }

    toString() {
        return this.symbol;
    }

}

class FunctionType extends Type {

    type = Type.FUNCTION;

    constructor(t1, t2) {
        super();
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new FunctionType(this.t1.clone(), this.t2.clone());
    }

    getSymbols() {
        return [...new Set([...this.t1.getSymbols(), ...this.t2.getSymbols()])];
    }
    alphaConvert(rs) {
        return new FunctionType(this.t1.alphaConvert(rs), this.t2.alphaConvert(rs));
    }
    betaReduce(rs) {
        return new FunctionType(this.t1.betaReduce(rs), this.t2.betaReduce(rs));
    }

    equals(t3) {
        return this.type === t3.type && this.t1.equals(t3.t1) && this.t2.equals(t3.t2);
    }
    matches(t3) {
        switch (t3.type) {
            case Type.APPLICATION:
                return [false];
            case Type.FUNCTION:
                return [this.t1.matches(t3.t1), this.t2.matches(t3.t2)].flat();
            case Type.UNBOUND:
                return t3.matches(this);
            case Type.VARIABLE:
                return [false];
        }
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

        let objects = [this.t1.matches(t3)].flat();
        if (objects.includes(false)) {
            console.log("Can't bind.");
            return;
        }
        objects = objects.filter(r => typeof r === "object");
        let rs = {};
        for (let object of objects) {
            let key = Object.keys(object);
            let value = object[key];
            if (!(key in rs))
                rs[key] = [];
            rs[key].push(value);
        }

        let replacements = {};
        while (Object.keys(rs).length) {

            let filtered = {};
            for (let key in rs) {
                filtered[key] = rs[key].filter(t => t.type !== Type.UNBOUND);
            }
            let keys = Object.keys(rs).sort((a, b) => filtered[a].length - filtered[b].length);
            let key = keys.pop();
            let values = filtered[key];
            let replacement = values.pop();
            delete rs[key];

            for (let v of values) {
                if (replacement.equals(v)) continue;

                let objects2 = replacement.matches(v).flat();
                if (objects2.includes(false)) {
                    console.log("Incompatible types?");
                    console.log(""+replacement, ""+v);
                    console.log("Can't bind.");
                    return;
                }
                for (let object of objects2) {
                    let key = Object.keys(object);
                    let value = object[key];
                    if (!(key in rs))
                        rs[key] = [];
                    rs[key].push(value);
                }
            }

            replacements[key] = replacement;
            for (let rsKey in rs) {
                rs[rsKey] = rs[rsKey].map(t => t.type !== Type.UNBOUND || t.symbol !== key ? t : replacement);
            }

        }

        return this.t2.betaReduce(replacements);
    }

    toString() {
        return `(${this.t1} -> ${this.t2})`;
    }

}