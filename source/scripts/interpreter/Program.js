class Program {

    static Prelude = {
        registerType: (name, type) => Program.registerType("Prelude", name, type),
        registerConstructor: (type, name, func) => Program.registerConstructor("Prelude", type, name, func),
    }

    static modulePriority = ["main", "Prelude"];
    static modules = {
    };
    static _createModule(m) {
        this.modules[m] = {
            typeclasses: {},
            methods: {},
            types: {},
            constructors: {},
            functions: {},
        }
    }
    static _getModule(m) {
        if (!(m in this.modules))
            this._createModule(m);
        return this.modules[m];
    }

    static _getTypeclassData(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.typeclasses)
                return m.typeclasses[name];
        }
        throw new UnknownTypeError(name);
    }
    static _getMethodData(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.methods)
                return m.methods[name];
        }
        throw new UnknownMethodError(name);
    }
    static _getTypeData(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.types)
                return m.types[name];
        }
        throw new UnknownTypeError(name);
    }
    static _getConstructorData(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.constructors)
                return m.constructors[name];
        }
        throw new UnknownConstructorError(name);
    }

    static resetMain() {
        this._createModule("main");
    }

    static registerTypeclass(module, name, symbol, typeConstraints) {
        console.log(module, name, symbol);
        let m = this._getModule(module);
        if (name in m.typeclasses)
            throw new DuplicateTypeclassDefinitionError(module, name);
        m.typeclasses[name] = {
            symbol: symbol,
            instances: [],
            methods: {},
            constraints: typeConstraints,
        };
    }
    static registerMethod(module, typeclass, name, type) {
        console.log(module, typeclass, name);
        let m = this._getModule(module);
        let tc = this._getTypeclassData(typeclass);
        if (name in m.methods || name in m.functions)
            throw new DuplicateTypeclassMethodDefinitionError(module, name);

        type = type.applyClassConstraints(tc.constraints);
        let requiredArgs = 0;
        let t = type;
        let found = false;
        while (!found && t instanceof FunctionType) {
            requiredArgs += 1;
            if (t.t1.getSymbols().includes(tc.symbol))
                found = true;
            t = t.t2;
        }
        if (!found)
            requiredArgs = -1;

        m.methods[name] = {
            requiredArgs: requiredArgs,
            typeSetter: new FunctionType(new UnboundType(tc.symbol).applyClassConstraints(tc.constraints), type.clone())
        };
        m.functions[name] = new FunctionThunk(name, type.clone());
    }
    static registerInstance(module, typeclass, type) {
        let tName = type;
        while (tName.t1) tName = tName.t1;
        tName = tName.name;
        let t = this._getTypeData(tName);
        console.log(module, typeclass, tName);

        let m = this._getModule(module);
        let tc = this._getTypeclassData(typeclass);

        if (t.classes.includes(typeclass))
            throw new DuplicateInstanceDefinitionError(module, `${typeclass} (${type})`);
        tc.instances.push(tName);
        t.classes.push(typeclass);
    }
    static registerInstanceMethod(module, typeclass, type, method, pattern, implementation) {
        let tName = type;
        while (tName.t1) tName = tName.t1;
        tName = tName.name;
        console.log(module,typeclass,tName,method);

        let m = this._getModule(module);
        let tc = this._getTypeclassData(typeclass);
        let me = this._getMethodData(method);

        let trs = preAlphaConvert(type, me.typeSetter);
        let typeSetter = me.typeSetter.alphaConvert(trs);

        if (pattern instanceof Function) {
            me[tName] = new JSThunk(method, typeSetter.bind(new LiteralType(tName)), pattern);
            return;
        }

        let reset = false;
        try {
            if (!(tName in me)) {
                me[tName] = new FunctionThunk(method, typeSetter.bind(new LiteralType(tName)));
                reset = true;
            }
            me[tName].setCase(pattern, implementation);
        } catch {
            if (reset || !(tName in me))
                me[tName] = new FunctionThunk(method, typeSetter.bind(type));
            me[tName].setCase(pattern, implementation);
        }
    }

    static registerType(module, name, type=undefined) {
        console.log(module, name);
        let m = this._getModule(module);
        if (name in m.types)
            throw new DuplicateTypeDefinitionError(module, name);
        m.types[name] = {
            type: type ? type.clone() : new LiteralType(type ? type : name),
            classes: [],
            constructors: [],
        };
    }
    static registerConstructor(module, type, name, func) {
        let m = this._getModule(module);
        let t = this._getTypeData(type);
        if (name in m.constructors)
            throw new DuplicateConstructorDefinitionError(module, name);
        console.log(module, type, name);

        let funcSymbols = [];
        if (func instanceof FunctionThunk) {
            let t2 = func.type;
            for (let i = 0; i < func.patterns[0].length; i++) {
                funcSymbols.push(...t2.t1.getSymbols());
                t2 = t2.t2;
            }
        }
        func.type = func.type.nullifyUnboundTypes(funcSymbols);

        m.constructors[name] = {
            typeSetter: new FunctionType(t.type.clone().annotate(name), func.type.clone()),
            function: func.clone(),
        };
        t.constructors.push(name);
        m.functions[name] = m.constructors[name].function;
    }

    static registerFunction(module, type, name) {
        console.log(module, name);
        let m = this._getModule(module);
        if (name in m.functions)
            throw new DuplicateFunctionDefinitionError(module, name);
        m.functions[name] = new FunctionThunk(name, type);
    }
    static setFunctionCase(module, fName, pattern, implementation) {
        let m = this._getModule(module);
        if (!(pattern instanceof Pattern)) {
            console.log(module, fName);
            pattern.type;
            m.functions[fName] = pattern;
        } else if (pattern.length === 0) {
            console.log(module, fName);
            implementation.type;
            m.functions[fName] = implementation;
        } else {
            console.log(module, fName, `x${m.functions[fName].patterns.length}`);
            let f = this.getFunction(fName);
            m.functions[fName] = f.setCase(pattern, implementation);
        }
    }

    static isFunction(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.functions || name in m.methods)
                return true;
        }
        return false;
    }

    static isMethod(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.methods)
                return true;
        }
        return false;
    }
    static hasEnoughArguments(name, count) {
        let m = this._getMethodData(name);
        return m.requiredArgs <= count;
    }

    static getType(name) {
        return this._getTypeData(name).type.clone();
    }
    static getTypeInstances(name) {
        let classes = this._getTypeData(name).classes;
        let length;
        do {
            length = classes.length;
            classes = classes.map(c => Object.values(Program._getTypeclassData(c).constraints)).flat(100);
            classes = classes.reduce((a, c) => a.includes(c) ? a : a.concat([c]), []);
        } while (length !== classes.length);
        return [...classes];
    }
    static getTypeSetter(name) {
        return this._getConstructorData(name).typeSetter.clone();
    }
    static getConstructor(name) {
        return this._getConstructorData(name).function.clone();
    }
    static getFunction(name) {
        for (let mName of this.modulePriority) {
            let m = this._getModule(mName);   
            if (name in m.functions)
                return m.functions[name].clone();
        }
        throw new UnknownFunctionError(name);
    }
    static getMethod(name, type) {
        let m = this._getMethodData(name);
        if (!(type in m))
            throw new UnknownInstanceMethodError(`${name} (${type})`);
        return m[type];
    }

    static run() {
        let x = Program.getFunction("main");
        let history = [];
        while (x.canStep()) {
            console.log(""+x);
            x = x.step();
            history.push(x.clone());
        }
        console.log(""+x);
        return history;
    }

}
Program._createModule("Prelude");


class UnknownXError extends Error {
    constructor(x, t) {
        super(`Couldn't find ${x} '${t}' in 'main' or 'Prelude'.`);
    }
}
class UnknownMethodError extends UnknownXError {
    constructor(t) {
        super("method", t);
    }
}
class UnknownInstanceMethodError extends UnknownXError {
    constructor(t) {
        super("instance method", t);
    }
}
class UnknownTypeError extends UnknownXError {
    constructor(t) {
        super("type", t);
    }
}
class UnknownConstructorError extends UnknownXError {
    constructor(t) {
        super("constructor", t);
    }
}
class UnknownFunctionError extends UnknownXError {
    constructor(t) {
        super("function", t);
    }
}

class DuplicateXDefinitionError extends Error {
    constructor(x, module, name) {
        super(`Duplicate ${x} definition of '${name}' in module '${module}'.`);
    }
}
class DuplicateTypeclassDefinitionError extends DuplicateXDefinitionError {
    constructor(module, name) {
        super("typeclass", module, name);
    }
}
class DuplicateTypeclassMethodDefinitionError extends DuplicateXDefinitionError {
    constructor(module, name) {
        super("typeclass method", module, name);
    }
}
class DuplicateInstanceDefinitionError extends DuplicateXDefinitionError {
    constructor(module, name) {
        super("instance", module, name);
    }
}
class DuplicateTypeDefinitionError extends DuplicateXDefinitionError {
    constructor(module, name) {
        super("type", module, name);
    }
}
class DuplicateConstructorDefinitionError extends DuplicateXDefinitionError {
    constructor(module, name) {
        super("type", module, name);
    }
}
class DuplicateFunctionDefinitionError extends DuplicateXDefinitionError {
    constructor(module, name) {
        super("type", module, name);
    }
}

let t;
let p;
let i;