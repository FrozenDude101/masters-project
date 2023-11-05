/*
    program -> { lexeme | whitespace }
    lexeme  -> qvarid | qconid | qvarsym | qconsym
             | literal | special | reservedop | reservedid
    literal -> integer | float | char | string
*/

let [tprogram,  tlexeme,  tliteral,] = FunctionReference.n(
    "tprogram","tlexeme","tliteral",
)

tprogram.set(many(any(tlexeme, twhitespace)));
tlexeme.set(any(tqvarid, tqconid, tqvarsym, tqconsym, tliteral, tspecial, treservedop, treservedid));
tliteral.set(any(tinteger, tfloat, tchar, tstring));