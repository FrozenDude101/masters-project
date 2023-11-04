/*
    type   → btype [-> type]                (function type)
    btype  → [btype] atype                  (type application)
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

let [ttype,  tbtype,  tatype,  tgtycon] = FunctionReference.n(
    "ttype","tbtype","tatype","tgtycon",
);

ttype.set(all(tbtype, opt(all("->", ttype))));
tbtype.set(all(tatype, opt(all(" ", tbtype))));

tatype.set(any(
    tgtycon,
    all("[", ttype, "]"),
    all("(", ttype, ")"),
));

tgtycon.set(any(
    tqtycon,
    "()",
    "[]",
    "(->)",
));