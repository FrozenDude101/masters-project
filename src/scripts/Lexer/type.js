/*
    type   → btype [-> type]                (function type)
    btype  → atype [btype]                  (type application)
    atype  → gtycon
           | tyvar
           | ( type1 , . . . , typek )      (tuple type, k ≥ 2 )
           | [ type ]                       (list type)
           | ( type )                       (parenthesised constructor)
    gtycon → qtycon
           | ()                             (unit type)
           | []                             (list constructor)
           | (->)                           (function constructor)
           | (,{,})                         (tupling constructors)
*/

let [ttype,  tbtype,  tatype,  tgtycon,  tqtycon,  ttycon] = FunctionReference.n(
    "ttype","tbtype","tatype","tgtycon","tqtycon","ttycon"
);

ttype.set(all(tbtype, opt(all(rightArrow, ttype))));
tbtype.set(all(tatype, opt(all(space, tbtype))));

tatype.set(any(
    tgtycon,
    all(openBracket, ttype, closeBracket),
    all(openParen, ttype, closeParen),
));

tgtycon.set(any(
    tqtycon,
    all(openParen, closeParen),
    all(openBracket, closeBracket),
    merge(all(openParen, rightArrow, closeParen), Token.IDENTIFIER),
))

tqtycon.set(ttycon);
ttycon.set(tconid);