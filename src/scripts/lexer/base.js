/*
    program -> { lexeme | whitespace }
    lexeme  -> qvarid | qconid | qvarsym | qconsym
             | literal | special | reservedop | reservedid
    literal -> integer | float | char | string
*/

let [t_program,  t_lexeme,  t_literal,] = FunctionReference.n(
    "t_program","t_lexeme","t_literal",
)

t_program.set(max(many(
    max(any(
        t_lexeme, t_whitespace,
    ), index),
), index));
t_lexeme.set(max(any(
    t_qvarid, t_qconid, t_qvarsym, t_qconsym, t_literal, t_special, t_reservedop, t_reservedid
), index));
t_literal.set(tok(any(t_integer, t_float, t_char, t_string), Token.LITERAL));