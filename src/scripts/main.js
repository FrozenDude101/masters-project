
let codeInput          = document.getElementById("code-input");
let cytoscapeContainer = document.getElementById("ctyoscape-container");

let functionSelector   = document.getElementById("function-selector");

let parseTimeout = null;
codeInput.addEventListener("input", () => {
    clearTimeout(parseTimeout);
    parseTimeout = setTimeout(() => {
        console.log("Lexing");
        let input = LexerInput.fromInput(CODE_INPUT.value + "\n");
        let tokens = Lexer.lexer(t_program)(input)[0].tokens;
        tokens = tokens.filter((t) => t.type !== Token.WHITESPACE || t.value.includes("\n"));
        tokens = tokens.map((t) => t.value.includes("\n") ? new Token(Token.SPECIAL, "\n", t.index) : t);

        cytoscapeContainer.innerHTML = "";

        console.log("Parsing");
        let program;
        try {
            program = parse(tokens);
        } catch (e) {
            cytoscapeContainer.innerHTML = `
                ${e}<br>
                At: ${e.index === null ? "End of Input" : e.index}.
            `;
            return;
        }

        for (let f in program.functions) {
            let type = program.functions[f].type;
            let patterns = program.functions[f].patterns;
            let implementations = program.functions[f].implementations;

            let contents = `${f}<br>${type}<br>`;
            for (let i = 0; i < patterns.length; i++) {
                contents += `${patterns[i]} = ${implementations[i]}<br>`;
            }
            contents += "<br>";

            cytoscapeContainer.innerHTML += contents;
            
        }

        functionSelector.innerHTML = `<option>${NO_SELECTION}</option>`;
        for (let f in program.functions) {
            functionSelector.innerHTML += `<option>${f}</option>`
        }

    }, 1);
});

codeInput.dispatchEvent(new InputEvent("input"));

function run() {

    let input = LexerInput.fromInput(document.getElementById("ta").value + "\n");
    let tokens = Lexer.lexer(t_program)(input)[0].tokens;

    let tokens2 = [];
    for (let t of tokens) {
        if (t.type !== Token.WHITESPACE) {
            tokens2.push(t);
            continue;
        }

        if (!t.value.includes("\n")) continue;
        tokens2.push(new Token(Token.SPECIAL, "\n", t.index));
    }

    document.getElementById("parsed").innerHTML = "";

    try {
        parse(tokens2);
    } catch (e) {
        document.getElementById("parsed").innerHTML = `
            ${e}<br>
            At: ${e.index === null ? "End of Input" : e.index}.
        `;
        return;
    }

    document.getElementById("parsed").innerHTML += `
        {A B} is application, where B is applied to A.<br>
        (A B C) is an infix operator, where A and C are the operands.<br>
        <br>
    `;

    for (let f in p.functions) {
        let type = p.functions[f].type;
        let patterns = p.functions[f].patterns;
        let implementations = p.functions[f].implementations;

        let contents = `${f}<br>${type}<br>`;
        for (let i = 0; i < patterns.length; i++) {
            contents += `${patterns[i]} = ${implementations[i]}<br>`;
        }
        contents += "<br>";

        document.getElementById("parsed").innerHTML += contents;
        
    }

}