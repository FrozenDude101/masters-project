let symbol_plus = new JSThunk("(+)", (a) => (b) => a + b);

let add = new FunctionThunk("add");
add.setPattern(new ArgumentThunk("a"), new ArgumentThunk("b"),
    new ApplicationThunk(
        new ApplicationThunk(
            symbol_plus,
            new UnboundThunk(add, "a"),
        ),
        new UnboundThunk(add, "b"),
    ),
);

let one = new LiteralThunk(1);
let two = new LiteralThunk(2);

let foo = new FunctionThunk("foo");
foo.setPattern(
    new LiteralArgumentThunk(0),
    new LiteralThunk(-1),
);
foo.setPattern(
    new ArgumentThunk("a"),
    new UnboundThunk(foo, "a"),
);