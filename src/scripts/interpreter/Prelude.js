let symbol_plus = new JSThunk("(+)", (a) => (b) => a+b,
    new FunctionType(
        new VariableType("Integer"),
        new FunctionType(
            new VariableType("Integer"),
            new VariableType("Integer"),
        ),
    ),
);
Program.register("(+)", symbol_plus);

let pred = new JSThunk("pred", (a) => a-1, new FunctionType(new VariableType("Integer"), new VariableType("Integer")));
Program.register("pred", pred);