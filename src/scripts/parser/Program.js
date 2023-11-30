class Program {

    static Prelude = {};
    static register(name, thunk) {
        this.Prelude[name] = thunk;
    }
    static get(name) {
        return this.Prelude[name];
    }
    static contains(name) {
        return name in this.Prelude;
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

        for (let f in this.functions) {
            let thunk = new FunctionThunk(f);
            Program.register(f, thunk);
            let data = this.functions[f];
            for (let i = 0; i < data.patterns.length; i++) {
                let pat = data.patterns[i];
                let pThunk = pat.map(p => p.toThunk());

                let impl = data.implementations[i];
                let iThunk = impl.toThunk(thunk);

                thunk.setPattern(...pThunk, iThunk);
            }
            x = thunk;
        }

        console.log(x.name);

        x = x.bind(new LiteralThunk(5)).bind(new LiteralThunk(5));

    }

}

let x;
let p = new Program();