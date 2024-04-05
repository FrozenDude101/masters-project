class Program {

    static modulePriority = ["main", "Prelude"];
    static modules = {};

    static register(name, thunk, module="main") {
        if (!this.modules[module])
            this.modules[module] = {};
        this.modules[module][name] = thunk;
    }
    static Prelude(name, thunk) {
        this.register(name, thunk, "Prelude");
    }
    static get(name) {
        for (let m of this.modulePriority) {
            if (this.modules?.[m]?.[name])
                return this.modules[m][name];
        }
    }
    static contains(name) {
        return !!this.get(name);
    }
    static reset() {
        this.modules["main"] = {};
    }

    functions = {};

    registerFunction(name, type) {

        if (name in this.functions) {
            throw "Function already declared!"
        }

        this.functions[name] = {
            type: type,
            patterns: [],
            implementations: [],
            fixityDir: "L",
            fixityVal: 9,
        }

    }
    registerPattern(name, pattern) {

        if (!(name in this.functions)) {
            throw "Function not declared!"
        }
        let f = this.functions[name];
        
        f.patterns.push(pattern);

    }
    registerImplementation(name, implementation) {

        if (!(name in this.functions)) {
            throw "Function not declared!"
        }
        let f = this.functions[name];

        if (f.patterns.length-1 > f.implementations.length) {
            throw "Too many patterns declared."
        }
        if (f.patterns.length-1 < f.implementations.length) {
            throw "Too few patterns declared."
        }
        
        this.functions[name].implementations.push(implementation);

    }

    convertToThunks() {
        clearErrors();
        for (let f in this.functions) {
            try {
                let thunk = new FunctionThunk(f, this.functions[f].type.toType());
                Program.register(f, thunk);
                let data = this.functions[f];
                for (let i = 0; i < data.patterns.length; i++) {
                    let patt = data.patterns[i];
                    patt = new Pattern(...patt.map(p => p.toArgument()));
    
                    let impl = data.implementations[i];
                    impl = impl.toThunk();
    
                    thunk.setCase(patt, impl);
                }
            } catch (e) {
                addError(`${e} in function ${f}`);
            }
        }
    }

}

let p = new Program();