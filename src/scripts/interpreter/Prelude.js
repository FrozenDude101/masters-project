/*  The below JS corresponds directly to this Haskell.

    minus_one = -1
    zero      =  0
    one       =  1
    two       =  2
    ten       = 10

    (+) = primitive operation

    add a b = (+) a b

    succ = add 1
    pred = add (-1)

    decrementToZero 0 = 0
    decrementToZero a = decrementToZero (pred a)

    multiply 0 a = 0
    multiply a b = (+) b (multiply (pred a) b)
*/

let symbol_plus  = new JSThunk("(+)", (a) => (b) => a + b);
Program.register("(+)", symbol_plus);

let pred = new JSThunk("pred", (a) => a-1);
Program.register("pred", pred);