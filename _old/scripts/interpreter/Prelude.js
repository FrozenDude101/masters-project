let symbol_plus = new JSThunk("(+)", a => b => a+b, new FunctionType(new LiteralType("Integer"), new FunctionType(new LiteralType("Integer"), new LiteralType("Integer"))))
Program.Prelude("(+)", symbol_plus);