/*
    type   -> btype [-> type] (function type)
    btype  -> [btype] atype (type application)
    atype  -> gtycon
            | tyvar
            | ( type1 , . . . , typek ) (tuple type, k ≥ 2 )
            | [ type ] (list type)
            | ( type ) (parenthesised constructor)
    gtycon -> qtycon
            | () (unit type)
            | [] (list constructor)
            | (->) (function constructor)
            | (,{,}) (tupling constructors)
*/

let [t_type, t_btype, t_atype, t_gtycon,] = FunctionReference.n(
      "type", "btype", "atype", "gtycon",
)

t_type.set(all(
    t_btype,
    opt(all(tok("->", Token.OP), t_type)),
));
t_btype.set(all(
    t_atype,
    opt(t_btype),
));

t_atype.set(any(
    t_gtycon,
    t_tyvar,
    all("(", t_type, ",", t_type, many(all(",", t_type)), ")"),
    all("[", t_type, "]"),
    all("(", t_type, ")"),
));

t_gtycon.set(any(
    t_qtycon,
    tok(all("(", ")"), Token.TYPECON),
    tok(all("[", "]"), Token.TYPECON),
    tok(all("(", "->", ")"), Token.TYPECON),
    tok(all("(", ",", many(","), ")"), Token.TYPECON),
))