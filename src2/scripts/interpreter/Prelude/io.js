console.log("================ IO ================");

const STDOUT = document.getElementById("stdout");

let io = new LiteralType("IO");
let ioType = new ApplicationType(io, Program.getType("()"));
let ioThunk = new ApplicationThunk(Program.getConstructor("IO"), Program.getConstructor("()"));

Program.setFunctionCase("Prelude", "putChar", new JSThunk("putChar",
    new FunctionType(Program.getType("Char"), ioType),
    (c) => { STDOUT.value += c; return ioThunk },
));
Program.setFunctionCase("Prelude", "putStr", new JSThunk("putStr",
    new FunctionType(Program.getType("String"), ioType),
    (c) => { STDOUT.value += c; return ioThunk },
));
Program.setFunctionCase("Prelude", "putStrLn", new JSThunk("putStrLn",
    new FunctionType(Program.getType("String"), ioType),
    (c) => { STDOUT.value += c + "\n"; return ioThunk },
));

Program.setFunctionCase("Prelude", "print", new JSThunk("print",
    new FunctionType(new UnboundType("a", ["Show"]), ioType),
    (c) => { STDOUT.value += c+"\n"; return ioThunk },
));

Program.setFunctionCase("Prelude", "getChar", new JSThunk("getChar",
    new ApplicationType(io, Program.getType("Char")),
    () => {
        let x;
        do {
            x = prompt("getChar");
        } while (!x.length);
        return x[0];
}));
Program.setFunctionCase("Prelude", "getLine", new JSThunk("getLine",
    new ApplicationType(io, Program.getType("String")),
    () => prompt("getLine"),
));