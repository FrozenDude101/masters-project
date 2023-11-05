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
    modid      -> {conid .} conid                                           (modules)
    
    varsym     -> (symbol⟨:⟩ {symbol} )⟨reservedop | dashes⟩
    consym     -> (: {symbol})⟨reservedop⟩

    qvarid     -> [modid .] varid                                           (qualified variables)
    qconid     -> [modid .] conid                                           (qualified constructors)
    qtycon     -> [modid .] tycon                                           (qualified type constructors)
    qtycls     -> [modid .] tycls                                           (qualified type classes)
    qvarsym    -> [modid .] varsym                                          (qualified variable symbols)
    qconsym    -> [modid .] consym                                          (qualified constructor symbols)
*/

let [t_reservedid, t_reservedop, t_varid, t_conid, t_tyvar, t_tycon, t_tycls, t_modid, t_varsym,
     t_consym, t_qvarid, t_qconid, t_qtycon, t_qtycls, t_qvarsym, t_qconsym] = FunctionReference.n(
      "reservedid", "reservedop", "varid", "conid", "tyvar", "tycon", "tycls", "modid", "varsym",
      "consym", "qvarid", "qconid", "qtycon", "qtycls", "qvarsym", "qconsym",
);

t_dashes = ()=>[]

t_reservedid.set(tok(any(
    "case", "class", "data", "default", "deriving", "do", "else", "foreign", "if", "import", "in",
    "infix", "infixl", "infixr", "instance", "let", "module", "newtype", "of", "then", "type", "where",
), Token.KEYWORD));
t_reservedop.set(tok(any(
    "..", ":", "::", "=", "\\", "|", "<-", "->", "@", "~", "=>",
), Token.OP));

t_varid.set(tok(diff(
    all(t_small, many(any(t_small, t_large, t_digit, "'"))),
    t_reservedid,
), Token.VARID));
t_conid.set(tok(all(
    t_large, many(any(t_small, t_large, t_digit, "'"))
), Token.CONID));

t_varsym.set(tok(diff(
    all(diff(t_symbol, ":"), many(t_symbol)),
    any(t_reservedop, t_dashes),
), Token.VARSYM));
t_consym.set(tok(diff(
    all(":", many(t_symbol)),
    t_reservedop,
), Token.CONSYM));

t_tyvar.set(tok(t_varid, Token.TYPEVAR));
t_tycon.set(tok(t_conid, Token.TYPECON));
t_tycls.set(tok(t_conid, Token.TYPECLASS));
t_modid.set(tok(all(
    many(all(t_conid, ".")),
    t_conid,
), Token.MODULE));

t_qvarid.set(all(opt(all(t_modid, ".")), t_varid));
t_qconid.set(all(opt(all(t_modid, ".")), t_conid));
t_qtycon.set(all(opt(all(t_modid, ".")), t_tycon));
t_qtycls.set(all(opt(all(t_modid, ".")), t_tycls));
t_qvarsym.set(all(opt(all(t_modid, ".")), t_varsym));
t_qconsym.set(all(opt(all(t_modid, ".")), t_consym));