let symbol_plus = new JSThunk("(+)", (a) => (b) => a+b,
    new FunctionType(
        new LiteralType("Integer"),
        new FunctionType(
            new LiteralType("Integer"),
            new LiteralType("Integer"),
        ),
    ),
);
Program.register("(+)", symbol_plus);

let pred = new JSThunk("pred", (a) => a-1, new FunctionType(new LiteralType("Integer"), new LiteralType("Integer")));
Program.register("pred", pred);