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

treservedid.set(reg("reservedId",
    /(case)|(class)|(data)|(default)|(deriving)|(do)|(else)|(foreign)|(if)|(import)|(in)|(infix)|(infixl)|(infixr)|(instance)|(let)|(module)|(newtype)|(of)|(then)|(type)|(where)/,
    Token.IDENTIFIER
));
treservedop.set(reg("reservedOp",
    /(\.\.)|(:)|(::)|(=)|(\\)|(\|)|(<-)|(->)|(@)|(~)|(=>)/,
    Token.IDENTIFIER,
));

tvarid.set(diff(
    merge(
        all(small, many(any(small, large, digit, quote))),
        Token.IDENTIFIER
    ),
    treservedid,
));
tconid.set(merge(
    all(large, many(any(small, large, digit, quote))),
    Token.IDENTIFIER
));
ttyvar.set(tvarid);
ttycon.set(tconid);
ttycls.set(tconid);
tmodid.set(tconid);

tvarsym.set(diff(
    merge(all(
        diff(symbol, colon),
        many(symbol),
    ), Token.IDENTIFIER),
    any(treservedop, dashes),
));
tconsym.set(diff(
    merge(all(
        colon,
        many(symbol),
    ), Token.IDENTIFIER),
    any(treservedop),
));

tqvarid.set(all(opt(all(tmodid, dot)), tvarid));
tqconid.set(all(opt(all(tmodid, dot)), tconid));
tqtycon.set(all(opt(all(tmodid, dot)), ttycon));
tqtycls.set(all(opt(all(tmodid, dot)), ttycls));
tqvarsym.set(all(opt(all(tmodid, dot)), tvarsym));
tqconsym.set(all(opt(all(tmodid, dot)), tconsym));