class TypeConstraints {

    constructor() {
        this.cs = [];
    }

    contains(key) {
        return key in this.cs;
    }

    set(key, type) {
        this.cs.push([key, type]);
        return this;
    }

    unify() {
        let cs = this.cs.map(([k,t]) => [k, t.clone()]);

        let trs = {};
        while (cs.length) {
            let [s, t] = cs.pop();

            if (!(s in trs)) {
                trs[s] = t.clone();

                cs = cs.map(([k,kt]) => [
                    k === s && t instanceof UnboundType ? t.symbol : k,
                    kt.replace(trs)
                ]);

                for (let k in trs)
                    trs[k] = trs[k].replace(trs);
                continue;
            }

            if (trs[s].equals(t))
                continue;
            if (!trs[s].canMatch(t, []))
                throw new TypeMatchError(trs[s], t);

            let cs2 = trs[s].match(t, new TypeConstraints());
            let tr2 = cs2.unify();
            cs = Object.keys(tr2).map(k => [k, tr2[k]]).concat(cs);
        }
        return trs;
    }

}

class AllType {

    constructor(rid) {
        this.rid = rid ? rid : Math.random();
    }
    clone() {
        return new AllType(this.rid);
    }
    toString() {
        return `forall-${this.rid.toFixed(3)}`;
    }
    toFancyString(rs) {
        return rs[this.rid];
    }
    
    getSymbols() {
        return [];
    }

    equals(t3) {
        return t3 instanceof AllType;
    }

    canMatch(t3, strictSet=[]) {
        return true;
    }
    match(t3, tcs) {
        return tcs.set(this.rid, t3);
    }
    replace(rs) {
        if (this.rid in rs)
            return rs[this.rid].clone();
        return this.clone();
    }

    alphaConvert(rs) {
        return this.clone();
    }

    nullifyUnboundTypes(safe) {
        return this.clone();
    }

    annotate(name) {
        return this.clone();
    }

    applyClassConstraints(cs) {
        return this.clone();
    }

    getClassConstraints(cs) {
        return cs;
    }
    getAllVariables() {
        return [this.rid];
    }

}

class LiteralType {

    constructor(name) {
        this.name = name;
    }
    clone() {
        return new LiteralType(this.name);
    }
    toString() {
        return `${this.name}`;
    }
    toFancyString(rs) {
        return this.name;
    }
    
    getSymbols() {
        return [];
    }

    equals(t3) {
        return t3 instanceof AllType || (t3 instanceof LiteralType && this.name === t3.name);
    }

    canMatch(t3, strictSet=[]) {
        if (t3 instanceof LiteralType)
            return this.name === t3.name;
        return t3 instanceof UnboundType || t3 instanceof AllType;
    }
    match(t3, tcs) {
        if (t3 instanceof UnboundType)
            tcs = tcs.set(t3.symbol, this);
        if (t3 instanceof AllType)
            tcs = tcs.set(t3.rid, this);
        return tcs;
    }
    replace(rs) {
        return this.clone();
    }

    alphaConvert(rs) {
        return this.clone();
    }

    nullifyUnboundTypes(safe) {
        return this.clone();
    }

    annotate(name) {
        return this.clone();
    }

    applyClassConstraints(cs) {
        return this.clone();
    }

    getClassConstraints(cs) {
        return cs;
    }
    getAllVariables() {
        return [];
    }

}

class UnboundType {

    constructor(symbol, cs=undefined) {
        this.symbol = symbol;
        this.cs = cs ? cs : [];
        this.cs = this.cs.reduce((a, c) => a.includes(c) ? a : a.concat([c]), []);
    }
    clone() {
        return new UnboundType(this.symbol, [...this.cs]);
    }
    toString() {
        if (this.cs.length)
            return `${this.symbol}-(${this.cs.reduce((a, v) => `${a}, ${v}`)})`
        return `${this.symbol}`;
    }
    toFancyString(rs) {
        return rs[this.symbol];
    }

    getSymbols() {
        return [this.symbol];
    }

    equals(t3) {
        return t3 instanceof AllType || (t3 instanceof UnboundType && this.symbol === t3.symbol);
    }

    canMatch(t3, strictSet=[]) {
        if (t3 instanceof UnboundType) {
            if (this.symbol === t3.symbol)
                return true;
            if (strictSet.includes(t3.symbol))
                return false;
            
            let classes = [...t3.cs];
            let length;
            do {
                length = classes.length;
                classes = classes.map(c => Object.values(Program._getTypeclassData(c).constraints)).flat(100);
                classes = classes.reduce((a, c) => a.includes(c) ? a : a.concat([c]), []);
            } while (length !== classes.length);

            return this.cs.filter(c => !classes.includes(c)).length === 0
        }

        if (t3 instanceof ApplicationType || t3 instanceof LiteralType) {
            let type = t3;
            while (type.t1) type = type.t1;
            let typeName = type.name;
            let instances = Program.getTypeInstances(typeName);
            return this.cs.filter(c => !instances.includes(c)).length === 0;
        }

        return t3 instanceof AllType || this.cs.length === 0;
    }
    match(t3, tcs) {
        if (t3 instanceof UnboundType)
            tcs = tcs.set(t3.symbol, this);
        if (t3 instanceof AllType)
            return tcs.set(t3.rid, this);
        return tcs.set(this.symbol, t3);
    }
    replace(rs) {
        return this.symbol in rs ? rs[this.symbol].clone() : this.clone();
    }

    alphaConvert(rs) {
        return this.symbol in rs ? new UnboundType(rs[this.symbol], [...this.cs]) : this.clone();
    }

    nullifyUnboundTypes(safe) {
        if (safe.includes(this.symbol))
            return this.clone();
        return new AllType();
    }

    annotate(name) {
        return new UnboundType(this.symbol.includes("_") ? this.symbol : `${this.symbol}_${name}`, [...this.cs]);
    }

    applyClassConstraints(cs) {
        return new UnboundType(this.symbol, this.symbol in cs ? this.cs.concat(cs[this.symbol]) : this.cs);
    }

    getClassConstraints(cs) {
        if (!(this.symbol in cs))
            cs[this.symbol] = [];
        cs[this.symbol].push(...this.cs);
        return cs;
    }
    getAllVariables() {
        return [this.symbol];
    }

}

class ApplicationType {

    constructor(t1, t2) {
        this.t1 = t1;
        this.t2 = t2;
    }
    clone() {
        return new ApplicationType(this.t1.clone(), this.t2.clone());
    }
    toString() {
        let h1 = `${this.t1}`;
        let h2 = `${this.t2}`;
        if (this.t1 instanceof FunctionType) 
            h1 = `(${h1})`;
        if (this.t2 instanceof ApplicationType || this.t2 instanceof FunctionType)
            h2 = `(${h2})`;
        return `${h1} ${h2}`;
    }
    toFancyString(rs) {
        let h1 = `${this.t1.toFancyString(rs)}`;
        let h2 = `${this.t2.toFancyString(rs)}`;
        if (this.t1 instanceof FunctionType) 
            h1 = `(${h1})`;
        if (this.t2 instanceof ApplicationType || this.t2 instanceof FunctionType)
            h2 = `(${h2})`;
        return `${h1} ${h2}`;
    }

    getSymbols() {
        return this.t1.getSymbols().concat(this.t2.getSymbols());
    }

    equals(t3) {
        return t3 instanceof AllType || (t3 instanceof ApplicationType && this.t1.equals(t3.t1) && this.t2.equals(t3.t2));
    }

    canMatch(t3, strictSet=[]) {
        if (t3 instanceof ApplicationType)
            return this.t1.canMatch(t3.t1, strictSet) && this.t2.canMatch(t3.t2, strictSet);
        return t3 instanceof UnboundType || t3 instanceof AllType;
    }
    match(t3, tcs) {
        if (t3 instanceof UnboundType)
            return tcs.set(t3.symbol, this);
        if (t3 instanceof AllType)
            return tcs.set(t3.rid, this);
        tcs = this.t1.match(t3.t1, tcs)
        return this.t2.match(t3.t2, tcs);
    }
    replace(rs) {
        return new ApplicationType(this.t1.replace(rs), this.t2.replace(rs));
    }

    alphaConvert(rs) {
        return new ApplicationType(this.t1.alphaConvert(rs), this.t2.alphaConvert(rs));
    }

    nullifyUnboundTypes(safe) {
        return new ApplicationType(this.t1.nullifyUnboundTypes(safe), this.t2.nullifyUnboundTypes(safe));
    }

    annotate(name) {
        return new ApplicationType(this.t1.annotate(name), this.t2.annotate(name));
    }

    applyClassConstraints(cs) {
        return new ApplicationType(this.t1.applyClassConstraints(cs), this.t2.applyClassConstraints(cs));
    }

    getClassConstraints(cs) {
        cs = this.t1.getClassConstraints(cs);
        return this.t2.getClassConstraints(cs);
    }
    getAllVariables() {
        return this.t1.getAllVariables().concat(this.t2.getAllVariables());
    }

}

class FunctionType {

    constructor(t1, t2) {
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
    toFancyString(rs) {
        if (this.t1 instanceof FunctionType)
            return `(${this.t1.toFancyString(rs)}) -> ${this.t2.toFancyString(rs)}`;
        return `${this.t1.toFancyString(rs)} -> ${this.t2.toFancyString(rs)}`;
    }

    getSymbols() {
        return this.t1.getSymbols().concat(this.t2.getSymbols());
    }

    equals(t3) {
        return t3 instanceof AllType || (t3 instanceof FunctionType && this.t1.equals(t3.t1) && this.t2.equals(t3.t2));
    }

    canMatch(t3, strictSet=[]) {
        if (t3 instanceof FunctionType)
            return this.t1.canMatch(t3.t1, strictSet) && this.t2.canMatch(t3.t2, strictSet);
        return t3 instanceof UnboundType || t3 instanceof AllType;
    }
    match(t3, tcs) {
        if (t3 instanceof UnboundType)
            return tcs.set(t3.symbol, this);
        if (t3 instanceof AllType)
            return tcs.set(t3.rid, this);
        tcs = this.t1.match(t3.t1, tcs)
        return this.t2.match(t3.t2, tcs);
    }
    replace(rs) {
        return new FunctionType(this.t1.replace(rs), this.t2.replace(rs));
    }

    bind(t3, symbols=undefined) {
        symbols = symbols ? symbols : this.getSymbols();

        if (!this.t1.canMatch(t3, symbols))
            throw new TypeBindError(this, t3);

        let tcs = this.t1.match(t3, new TypeConstraints());
        let trs = tcs.unify();
        let r = this.t2.replace(trs);

        return r;
    }

    alphaConvert(rs) {
        return new FunctionType(this.t1.alphaConvert(rs), this.t2.alphaConvert(rs));
    }

    nullifyUnboundTypes(safe) {
        return new FunctionType(this.t1.nullifyUnboundTypes(safe), this.t2.nullifyUnboundTypes(safe));
    }

    annotate(name) {
        return new FunctionType(this.t1.annotate(name), this.t2.annotate(name));
    }

    applyClassConstraints(cs) {
        return new FunctionType(this.t1.applyClassConstraints(cs), this.t2.applyClassConstraints(cs));
    }

    getClassConstraints(cs) {
        cs = this.t1.getClassConstraints(cs);
        return this.t2.getClassConstraints(cs);
    }
    getAllVariables() {
        return this.t1.getAllVariables().concat(this.t2.getAllVariables());
    }

}

function preAlphaConvert(t1, t2) {
    return preAlphaConvert2(t1.getSymbols(), t2.getSymbols());
}
function preAlphaConvert2(s1, s2) {
    let overlap = s2.filter(s => s1.includes(s));
    if (overlap.length === 0)
        return {};

    let trs = {};
    for (let s of overlap) {
        if (s in trs)
            continue;

        let n = 0;
        while (s1.includes(`${s}${n}`) || s2.includes(`${s}${n}`) || Object.values(trs).includes(`${s}${n}`)) n++;
        trs[s] = `${s}${n}`;
    }

    return trs;
}

function getFinalVarName(t, varName="a") {
    let allVariables = t.getAllVariables();
    allVariables = allVariables.reduce((a, v) => a.includes(v) ? a : a.concat([v]), []);

    let varNameMap = {};
    for (let v of allVariables) {
        varNameMap[v] = varName;
        varName = String.fromCodePoint(varName.codePointAt() + 1);
    }

    return varName;
}
function typeToString(t, varName="a") {
    let classConstraints = t.getClassConstraints({});
    Object.keys(classConstraints).map(k => classConstraints[k] = classConstraints[k].reduce((a, v) => a.includes(v) ? a : a.concat([v]), []));
    let allVariables = t.getAllVariables();
    allVariables = allVariables.reduce((a, v) => a.includes(v) ? a : a.concat([v]), []);

    let varNameMap = {};
    for (let v of allVariables) {
        varNameMap[v] = varName;
        varName = String.fromCodePoint(varName.codePointAt() + 1);
    }

    let classConstraints2 = {};
    for (let k in classConstraints) {
        classConstraints2[k] = [];
        for (let cc of classConstraints[k]) {
            let skip = false;
            for (let cc2 of classConstraints2[k]) {
                if (cc === cc2) continue;
                let children = Object.values(Program._getTypeclassData(cc2).constraints).flat();
                if (children.includes(cc))
                    skip = true;
            }
            if (skip) continue;
            let children = Object.values(Program._getTypeclassData(cc).constraints).flat();
            classConstraints2[k] = classConstraints2[k].filter(c => !children.includes(c));
            classConstraints2[k].push(cc);
        }
    }
    classConstraints = classConstraints2;

    let classConstraintsString = "";
    if ([].concat(...Object.values(classConstraints)).length) {
        classConstraintsString = "(";
        for (let k in classConstraints) {
            for (let c of classConstraints[k]) {
                classConstraintsString += `${c} ${varNameMap[k]}, `;
            }
        }
        classConstraintsString = classConstraintsString.slice(0, -2);
        classConstraintsString += ") => ";
    }

    return classConstraintsString + t.toFancyString(varNameMap);
}

class TypeBindError extends Error {
    constructor(t1, t2) {
        super(`Can't bind ${typeToString(t2)} to ${typeToString(t1, getFinalVarName(t2))}.`)
    }
}
class TypeEqualError extends Error {
    constructor(t1, t2) {
        super(`Incompatible types ${typeToString(t1)} and ${typeToString(t2, getFinalVarName(t1))}.`)
    }
}
class TypeMatchError extends Error {
    constructor(t1, t2) {
        super(`'${typeToString(t2)}' cannot match '${typeToString(t1, getFinalVarName(t2))}'.`)
    }
}