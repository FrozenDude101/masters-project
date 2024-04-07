class ConstructorThunk {

    constructor(name, type=undefined) {
        this.name = name;
        this.type = type ? type : Program.getConstructor(this.name).type;
    }
    clone() {
        return new ConstructorThunk(this.name, this.type.clone());
    }
    toString() {
        return `${this.name}`;
    }
    toHtml() {
        return `${this}`;
    }

    annotateUnannotated(name) {
        return this.clone();
    }

    replaceTypes(trs) {
        return this.clone();
    }
    replaceThunks(trs) {
        return this.clone();
    }

    canStep() {
        return false;
    }

    nullifyUnboundTypes(safe) {
        return new ConstructorThunk(this.name, this.type.nullifyUnboundTypes(safe));
    }
    applyTypeConstraints(tcs) {
        return this.clone();
    }

    getThunkById(rid) {
        return undefined;
    }

}

class LiteralThunk {

    constructor(value, type) {
        this.value = value;
        this.type = type;
    }
    clone() {
        return new LiteralThunk(this.value, this.type.clone());
    }
    toString() {
        if (this.type.equals(Program.getType("Char")))
            return `'${this.value}'`;
        return `${this.value}`;
    }
    toHtml() {
        return `${this}`;
    }

    annotateUnannotated(name) {
        return new LiteralThunk(this.value, this.type.annotateUnannotated(name));
    }

    replaceTypes(trs) {
        return this.clone();
    }
    replaceThunks(trs) {
        return this.clone();
    }

    canStep() {
        return false;
    }

    nullifyUnboundTypes(safe) {
        return new LiteralThunk(this.value, this.type.nullifyUnboundTypes(safe));
    }
    applyTypeConstraints(tcs) {
        return this.clone();
    }

    getThunkById(rid) {
        return undefined;
    }

}

class UnboundThunk {

    constructor(symbol, type=undefined) {
        this.symbol = symbol;
        this.type = type ? type : new AllType();
    }
    clone() {
        return new UnboundThunk(this.symbol, this.type.clone());
    }
    toString() {
        return `${this.symbol}`;
    }
    toHtml() {
        return `${this}`;
    }

    annotateUnannotated(name) {
        return new UnboundThunk(this.symbol, this.type.annotateUnannotated(name));
    }

    replaceTypes(trs) {
        if (this.symbol in trs)
            return new UnboundThunk(this.symbol, trs[this.symbol].clone());
        return this.clone();
    }
    replaceThunks(trs) {
        if (this.symbol in trs)
            return trs[this.symbol].clone();
        return this.clone();
    }

    canStep() {
        return false;
    }

    nullifyUnboundTypes(safe) {
        return new UnboundThunk(this.symbol, this.type.nullifyUnboundTypes(safe));
    }
    applyTypeConstraints(tcs) {
        if (this.symbol in tcs)
            return new UnboundThunk(this.symbol, tcs[this.symbol].clone());
        return this.clone();
    }

    getThunkById(rid) {
        return undefined;
    }

}

class ApplicationThunk {

    get type() {
        return this.t1.type.bind(this.t2.type);
    }

    constructor(t1, t2, rid=undefined) {
        this.t1 = t1;
        this.t2 = t2;
        this.rid = rid ? rid : Math.random();
    }
    clone() {
        return new ApplicationThunk(this.t1.clone(), this.t2.clone(), this.rid);
    }
    toString() {

        // TODO
        //  t1   t2  
        // (t1)  t2  t1 is 
        //  t1  (t2) t2 is app / function
        // (t1) (t2) 
        if (this.t1.t1 instanceof FunctionReferenceThunk || this.t1.t1 instanceof FunctionThunk || this.t1.t1 instanceof ConstructorThunk) {
            if (this.t1.t1.name.startsWith("(") && this.t1.t1.name.endsWith(")")) {
                let h1 = `${this.t1.t2}`;
                let h2 = `${this.t2}`;
                if (!(this.t1.t2 instanceof LiteralThunk || this.t1.t2 instanceof ConstructorThunk || this.t1.t2 instanceof UnboundThunk)) 
                    h1 = `(${h1})`;
                if (!(this.t2 instanceof LiteralThunk || this.t2 instanceof ConstructorThunk || this.t2 instanceof UnboundThunk)) 
                    h2 = `(${h2})`;
                return `${h1}${`${this.t1.t1}`.slice(1,-1)}${h2}`;
            }
        }

        let h1 = `${this.t1}`;
        let h2 = `${this.t2}`;
        if (!(this.t1 instanceof LiteralThunk || this.t1 instanceof ConstructorThunk || this.t1 instanceof UnboundThunk)) 
            h1 = `(${h1})`;
        if (!(this.t2 instanceof LiteralThunk || this.t2 instanceof ConstructorThunk || this.t2 instanceof UnboundThunk)) 
            h2 = `(${h2})`;
        return `${h1} ${h2}`;
    }
    toHtml() {
        return `
            <span class="application ${this.rid}"
                onclick="applicationClick(event, ${this.rid})"
                onmouseover="applicationMouseOver(event, ${this.rid})"
                onmouseout="applicationMouseOut(event, ${this.rid})"
            >${this.t1.toHtml()} ${this.t2.toHtml()}</span>
        `.trim();
    }

    annotateUnannotated(name) {
        return new ApplicationThunk(this.t1.annotateUnannotated(name), this.t2.annotateUnannotated(name), this.rid);
    }

    replaceTypes(trs) {
        return new ApplicationThunk(this.t1.replaceTypes(trs), this.t2.replaceTypes(trs), this.rid);
    }
    replaceThunks(trs) {
        return new ApplicationThunk(this.t1.replaceThunks(trs), this.t2.replaceThunks(trs), this.rid);
    }

    canStep() {
        return this.t1.canStep(this.t2) || this.t2.canStep();
    }
    step() {
        if (this.t1.canStep())
            return new ApplicationThunk(this.t1.step(), this.t2.clone(), this.rid);
        if (this.t1.canStep(this.t2))
            return this.t1.step(this.t2);
        if (this.t2.canStep())
            return new ApplicationThunk(this.t1.clone(), this.t2.step(), this.rid);
        return this.clone();
    }

    nullifyUnboundTypes(safe) {
        return new ApplicationThunk(this.t1.nullifyUnboundTypes(safe), this.t2.nullifyUnboundTypes(safe), this.rid);
    }
    applyTypeConstraints(tcs) {
        return new ApplicationThunk(this.t1.applyTypeConstraints(tcs), this.t2.applyTypeConstraints(tcs), this.rid);
    }

    getThunkById(rid) {
        return ((this.rid === rid) && this)|| this.t1.getThunkById(rid) || this.t2.getThunkById(rid);
    }
    
}

class FunctionThunk {

    constructor(name, type) {
        this.name = name;
        this.type = type.annotate(name);
        this.patterns = [];
        this.implementations = [];
    }
    clone() {
        let next = new FunctionThunk(this.name, this.type.clone());
        for (let i = 0; i < this.patterns.length; i++) {
            let pattern = this.patterns[i];
            let implementation = this.implementations[i];
            next.setCase(pattern.clone(), implementation.clone());
        }
        return next;
    }
    toString() {
        return `${this.name}`;
    }
    toHtml() {
        return `${this}`;
    }

    replaceTypes(trs) {
        return this.clone();
    }
    replaceThunks(trs) {
        return this.clone();
    }

    setCase(pattern, implementation) {
        if (this.patterns.length && this.patterns[0].length !== pattern.length)
            throw new PatternLengthError(this.patterns[0].length, pattern.length);

        pattern = pattern.applyType(this.type);
        let typeConstraints = pattern.getTypeConstraints();
        implementation = implementation.applyTypeConstraints(typeConstraints);

        let returnType = this.type;
        for (let i = 0; i < pattern.length; i++)
            returnType = returnType.t2;
        if (!returnType.canMatch(implementation.type))
            throw new TypeEqualError(returnType, implementation.type);

        this.patterns.push(pattern.clone());
        this.implementations.push(implementation.clone());
        return this;
    }

    canStep(t) {
        return t !== undefined;
    }
    step(t) {
        if (this.patterns[0].length === 0)
            return new ApplicationThunk(this.implementations[0].clone(), t);

        let nextName = "This should never be seen.";
        let n = this.name.replace(/[\(\)]/g, "").split(" ");
        if (Program.isFunction(`(${n.slice(-1)})`)) {
            if (n.length === 1)
                nextName = `(${t} ${n.slice(-1)})`;
            else
                nextName = `${n.join(" ")} ${t}`;
        } else {
            if (!(t instanceof LiteralThunk || t instanceof UnboundThunk || t instanceof ConstructorThunk || (t instanceof FunctionThunk && t.name.split(" ").length === 1)))
                nextName = `${n} (${t})`;
            else
                nextName = `${n} ${t}`;
        }
        let nextType = this.type.bind(t.type);
        let next = new FunctionThunk(nextName, nextType);

        for (let i = 0; i < this.patterns.length; i++) {
            let pattern = this.patterns[i];
            let implementation = this.implementations[i];

            if (pattern.requiresSteps(t))
                return new ApplicationThunk(this, t.step());
            
            if (!pattern.canMatch(t))
                continue;

            let trs = pattern.match(t);
            implementation = implementation.replaceThunks(trs);
            pattern = pattern.next();
            
            if (pattern.length === 0)
                return implementation;

            next.setCase(pattern, implementation);
        }

        if (next.patterns.length === 0)
            throw new NoValidPatternsError(next.name);

        return next;
    }

    nullifyUnboundTypes(safe) {
        let next = new FunctionThunk(this.name, this.type.nullifyUnboundTypes(safe));
        for (let i = 0; i < this.patterns.length; i++) {
            let pattern = this.patterns[i];
            let implementation = this.implementations[i].nullifyUnboundTypes(safe);
            next.setCase(pattern.clone(), implementation.clone());
        }
        return next;
    }
    applyTypeConstraints() {
        return this.clone();
    }

    getThunkById(rid) {
        return undefined;
    }
    
}

class FunctionReferenceThunk {

    constructor(name, type=undefined, storedArgs=undefined) {
        this.name = name;
        this.type = type ? type : Program.getFunction(name).type;
        this.storedArgs = storedArgs ? storedArgs : [];
    }
    clone() {
        return new FunctionReferenceThunk(this.name, this.type.clone(), this.storedArgs.map(a => a.clone()));
    }
    toString() {
        let as = this.storedArgs.reduce(a => `${a}`, " ");
        if (as === " ") as = "";
        return `${this.name}${as}`;
    }
    toHtml() {
        return `${this}`;
    }

    annotateUnannotated(name) {
        return this.clone();
    }

    replaceTypes(trs) {
        return this.clone();
    }
    replaceThunks(trs) {
        return this.clone();
    }

    canStep(t) {
        if (Program.isMethod(this.name))
            return !!t;
        return true;
    }
    step(t) {
        if (!Program.isMethod(this.name))
            return t ? new ApplicationThunk(Program.getFunction(this.name), t.clone()) : Program.getFunction(this.name);

        this.storedArgs.push(t);
        this.type = this.type.bind(t.type);
        if (!Program.hasEnoughArguments(this.name, this.storedArgs.length))
            return this.clone();

        let type = t.type;
        while (type.t1) type = type.t1;
        let f = Program.getMethod(this.name, type.name);

        for (let a of this.storedArgs)
            f = new ApplicationThunk(f, a);
        for (let a of this.storedArgs)
            f = f.step();
        return f;
    }

    nullifyUnboundTypes(safe) {
        return this.clone();
    }
    applyTypeConstraints() {
        return this.clone();
    }

    getThunkById(rid) {
        return undefined;
    }

}

class JSThunk {

    constructor(name, type, func) {
        this.name = name;
        this.type = type;
        this.func = func;
    }
    clone() {
        return new JSThunk(this.name, this.type.clone(), this.func);
    }
    toString() {
        return `${this.name}`;
    }
    toHtml() {
        return `${this}`;
    }

    annotateUnannotated(name) {
        return this.clone();
    }

    replaceTypes(trs) {
        return this.clone();
    }
    replaceThunks(trs) {
        return this.clone();
    }

    canStep(t) {
        return t instanceof LiteralThunk || !(this.type instanceof FunctionType) || t?.type.equals(Program.getType("String"));
    }
    step(t) {
        if (!(this.type instanceof FunctionType)) {
            if (this.type instanceof ApplicationType) {
                if (this.type.t2.equals(Program.getType("String"))) {
                    let next = this.func();
                    let val = new ConstructorThunk("[]");
                    for (let c of [...next].reverse()) {
                        val = new ApplicationThunk(
                            new ApplicationThunk(new ConstructorThunk("(:)"), new LiteralThunk(c, new LiteralType("Char"))),
                            val,
                        );
                    }
                    return new ApplicationThunk(Program.getConstructor("IO"), val);
                }
                return new ApplicationThunk(
                    Program.getConstructor("IO"),
                    new LiteralThunk(this.func(), this.type.t2.clone()),
                );
            }
            return new LiteralThunk(this.func(), this.type.clone());
        }

        if (t.canStep())
            return new ApplicationThunk(this.clone(), t.step());

        let nextType = this.type.bind(t.type);
        let next;

        if (t.type.equals(Program.getType("String"))) {
            let s = "";
            let cT = t;
            while (cT instanceof ApplicationThunk) {
                s += cT.t1.t2.value;
                cT = cT.t2;
            }
            next = this.func(s);
        } else {
            if (!(t instanceof LiteralThunk))
                throw new JSRequiresLiteralError(this, t);
            next = this.func(t.value);
        }
        
        if (next instanceof Function)
            return new JSThunk(`${this.name} ${t}`, nextType, next);

        if (next === true)
            return new ConstructorThunk("True");
        if (next === false)
            return new ConstructorThunk("False");

        if (nextType.equals(Program.getType("String"))) {
            let val = new ConstructorThunk("[]");
            for (let c of [...next].reverse()) {
                val = new ApplicationThunk(
                    new ApplicationThunk(new ConstructorThunk("(:)"), new LiteralThunk(c, new LiteralType("Char"))),
                    val,
                );
            }
            return val;
        }

        if (nextType.equals(new ApplicationType(new LiteralType("IO"), Program.getType("String")))) {
            let val = new ConstructorThunk("[]");
            for (let c of [...next].reverse()) {
                val = new ApplicationThunk(
                    new ApplicationThunk(new ConstructorThunk("(:)"), new LiteralThunk(c, new LiteralType("Char"))),
                    val,
                );
            }
            return new ApplicationThunk(Program.getConstructor("IO"), val);
        }

        if (nextType.equals(new ApplicationType(new LiteralType("IO"), Program.getType("Char")))) {
            return new ApplicationThunk(Program.getConstructor("IO"), new LiteralThunk(next, Program.getType("Char")));
        }


        return new LiteralThunk(next, nextType);
    }


    nullifyUnboundTypes(safe) {
        return this.clone();
    }
    applyTypeConstraints() {
        return this.clone();
    }
    
}

class PatternLengthError extends Error {
    constructor(l1, l2) {
        super(`Expected pattern length of ${l1}, but received ${l2}.\nAll patterns to a function must be the same length.`);
    }
}

class JSRequiresLiteralError extends Error {
    constructor(js, t) {
        super(`'${js} was passed a non-literal '${t}'.\nJSThunks only work with LiteralThunks.`);
    }
}

class NoValidPatternsError extends Error {
    constructor(fN) {
        super(`No valid patterns remaining in ${fN}.`);
    }
}