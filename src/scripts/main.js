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
            ${e}>br>
            At: ${e.index === null ? "End of Input" : e.index}.
        `;
        return;
    }

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