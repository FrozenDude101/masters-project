let symbol_plus = new JSThunk("(+)", (a) => (b) => a+b);

let add = new FunctionThunk("add");
add.setCase(
    new Pattern(new VariableArgument("a"), new VariableArgument("b")),
    new ApplicationThunk(
        new ApplicationThunk(
            symbol_plus,
            new UnboundThunk("a"),
        ),
        new UnboundThunk("b"),
    ),
);

let t1 = new ApplicationThunk(
    new ApplicationThunk(
        add,
        new LiteralThunk(1),
    ),
    new LiteralThunk(2),
)