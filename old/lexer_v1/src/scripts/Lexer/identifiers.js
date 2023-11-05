/*
    reservedid -> case | class | data | default | deriving | do | else
                | foreign | if | import | in | infix | infixl
                | infixr | instance | let | module | newtype | of
                | then | type | where | _
    reservedop -> .. | : | :: | = | \ | | | <- | -> | @ | ~ | =>

    varid      -> (small {small | large | digit | ’ })⟨reservedid⟩          (variables)
    conid      -> large {small | large | digit | ’ }                        (constructors)

    tyvar      -> varid (type variables)                                    (type variables)
    tycon      -> conid (type constructors)                                 (type constructors)
    tycls      -> conid (type classes)                                      (type classs)
    modid      -> {conid .} conid (modules)                                 (modules)
    
    varsym     -> (symbol⟨:⟩ {symbol} )⟨reservedop | dashes⟩
    consym     -> (: {symbol})⟨reservedop⟩

    qvarid     -> [modid .] varid                                           (qualified variables)
    qconid     -> [modid .] conid                                           (qualified constructors)
    qtycon     -> [modid .] tycon                                           (qualified type constructors)
    qtycls     -> [modid .] tycls                                           (qualified type classes)
    qvarsym    -> [modid .] varsym                                          (qualified variable symbols)
    qconsym    -> [modid .] consym                                          (qualified constructor symbols)
*/

let [treservedid,  treservedop,  tvarid,  tconid,  ttyvar,  ttycon,  ttycls,  tmodid,  tvarsym,  tconsym,
     tqvarid,  tqconid,  tqtycon,  tqtycls,  tqvarsym,  tqconsym] = FunctionReference.n(
    "treservedid","treserevedop","tvarid","tconid","ttyvar","ttycon","ttycls","tmodid","tvarsym","tconsym",
    "tqvarid","tqconid","tqtycon","tqtycls","tqvarsym","tqconsym",
);

treservedid.set(merge(any(
    "case", "class", "data", "default", "deriving", "do", "else", "foreign", "if", "import", "in",
    "infix", "infixl", "infixr", "instance", "let", "module", "newtype", "of", "then", "type", "where",
), Token.IDENTIFIER));
treservedop.set(merge(any(
    "..", ":", "::", "=", "\\", "|", "<-", "->", "@", "~", "=>",
), Token.IDENTIFIER));

tvarid.set(diff(
    merge(
        all(tsmall, many(any(tsmall, tlarge, tdigit, "'"))),
        Token.IDENTIFIER
    ),
    treservedid,
));
tconid.set(merge(
    all(tlarge, many(any(tsmall, tlarge, tdigit, "'"))),
    Token.IDENTIFIER
));
ttyvar.set(tvarid);
ttycon.set(tconid);
ttycls.set(tconid);
tmodid.set(tconid);

tvarsym.set(diff(
    merge(all(
        diff(tsymbol, ":"),
        many(tsymbol),
    ), Token.IDENTIFIER),
    any(treservedop, tdashes),
));
tconsym.set(diff(
    merge(all(
        ":",
        many(tsymbol),
    ), Token.IDENTIFIER),
    any(treservedop),
));

tqvarid.set(all(opt(all(tmodid, ".")), tvarid));
tqconid.set(all(opt(all(tmodid, ".")), tconid));
tqtycon.set(all(opt(all(tmodid, ".")), ttycon));
tqtycls.set(all(opt(all(tmodid, ".")), ttycls));
tqvarsym.set(all(opt(all(tmodid, ".")), tvarsym));
tqconsym.set(all(opt(all(tmodid, ".")), tconsym));