class FunctionReference {

    constructor(name) {
        this.name = name;
        this.function = null;
    }
    static n(...ns) {

        let lfs = []
        for (let n of ns) {
            lfs.push(new FunctionReference(n));
        }

        return lfs;

    }

    set(f) {

        this.function = f;

    }

    call(...args) {

        if (this.function === null) {
            throw new FunctionNotSetError(`FunctionReference ${this.name} called before set.`);
        }

        if (this.function instanceof FunctionReference) {
            return this.function.call(...args);
        }

        return this.function(...args);;

    }

}

class FunctionNotSetError extends Error {}