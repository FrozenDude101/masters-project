let symbol_plus = new JSThunk("(+)", (a) => (b) => a+b);
Program.register("(+)", symbol_plus);

let pred = new JSThunk("pred", (a) => a-1);
Program.register("pred", pred);