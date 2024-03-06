const MAIN_TYPE = document.getElementById("main-type");
const MAIN_INPUT = document.getElementById("main-input");

MAIN_INPUT.oninput = ((e) => {
    clearErrors();
    STDOUT.value = "";
    MAIN_TYPE.value = "";
    RETURN_VALUE.value = "";
    try {
        let input = MAIN_INPUT.value;
        if (input === "")
            return; 
        
        let tokens = Lexer.lex(input);
        let impl = Parser.parseImplementation(tokens, new Token(Token.SPECIAL, "\n"));
        Program.setFunctionCase("main", "main", impl.clone());

        MAIN_TYPE.value = typeToString(impl.type);

        if (!(input.includes("getChar") || input.includes("getLine"))) {
            let i = 0;
            while (i < 1000 && impl.canStep()) {
                impl = impl.step();
                i += 1;
            }
            if (i !== 1000)
                RETURN_VALUE.value = `${impl}`;
        } else {
            RETURN_VALUE.value = `Not exectued due to input IO.`;
        }

        setupState();
    } catch (e) {
        console.warn(e);
        addError(e);
    }
});