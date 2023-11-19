class Program {

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

}

let p = new Program();