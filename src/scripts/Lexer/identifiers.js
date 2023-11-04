/*
    varid      -> (small {small | large | digit | ’ })⟨reservedid⟩
    conid      -> large {small | large | digit | ’ }
    reservedid -> case | class | data | default | deriving | do | else
                | foreign | if | import | in | infix | infixl
                | infixr | instance | let | module | newtype | of
                | then | type | where | _
*/

let [tvarid,  tconid,  treservedid] = FunctionReference.n(
    "tvarid","tconid","treservedid"
)

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

treservedid.set(reg("reservedId",
    /(case)|(class)|(data)|(default)|(deriving)|(do)|(else)|(foreign)|(if)|(import)|(in)|(infix)|(infixl)|(infixr)|(instance)|(let)|(module)|(newtype)|(of)|(then)|(type)|(where)/,
    Token.IDENTIFIER
));