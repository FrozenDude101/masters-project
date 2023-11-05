/*
    decimal     -> digit {digit}
    octal       -> octit {octit}
    hexadecimal -> hexit {hexit}
    integer     -> decimal
                 | 0o octal | 0O octal
                 | 0x hexadecimal | 0X hexadecimal
    float       -> decimal . decimal [exponent]
                 | decimal exponent
    exponent    -> (e | E) [+ | -] decimal
*/

let [tdecimal,   toctal,   thexadecimal,   tinteger,   tfloat,   texponent,] = FunctionReference.n(
    "tdecimal", "toctal", "thexadecimal", "tinteger", "tfloat", "texponent",
);

tdecimal.set(all(tdigit, many(tdigit)));
toctal.set(all(toctit, many(toctit)));
thexadecimal.set(all(thexit, many(thexit)));

tinteger.set(merge(any(
    tdecimal,
    all("0", "o", toctal),
    all("0", "O", toctal),
    all("0", "x", thexadecimal),
    all("0", "X", thexadecimal),
), Token.LITERAL));

tfloat.set(merge(any(
    all(tdecimal, ".", tdecimal, opt(texponent)),
    all(tdecimal, texponent)
), Token.LITERAL));

texponent.set(all(
    any("e", "E"),
    opt(any("+", "-")),
    tdecimal,
));

/*
    char    -> ’ (graphic⟨'|\⟩ | space | escape⟨\&⟩) '
    string  -> " {graphic⟨"|\⟩ | space | escape | gap} "
    escape  -> \ ( charesc | ascii | decimal | o octal | x hexadecimal )
    charesc -> a | b | f | n | r | t | v | \ | " | ’ | &
    ascii   -> ^ cntrl | NUL | SOH | STX | ETX | EOT | ENQ | ACK
             | BEL | BS | HT | LF | VT | FF | CR | SO | SI | DLE
             | DC1 | DC2 | DC3 | DC4 | NAK | SYN | ETB | CAN
             | EM | SUB | ESC | FS | GS | RS | US | SP | DEL
    cntrl   -> ascLarge | @ | [ | \ | ] | ˆ | _
    gap     -> \ whitechar {whitechar} \
*/

let [tchar,  tstring,  tescape,  tcharesc,  tascii,  tcntrl,  tgap,] = FunctionReference.n(
    "tchar","tstring","tescape","tcharesc","tascii","tcntrl","tgap",
);

tchar.set(merge(all(
    "'",
    any(
        diff(tgraphic, any("'", "/")),
        " ",
        diff(tescape, all("/", "&")),
    ),
    "'",
), Token.LITERAL));

tstring.set(merge(all(
    "\"",
    any(
        diff(tgraphic, any("\"", "\\")),
        " ",
        tescape,
        tgap,
    ),
    "\"",
), Token.LITERAL));

tescape.set(all("\\", any(
    tcharesc, tascii, tdecimal,
    all("o", toctal),
    all("x", thexadecimal),
)));

tcharesc.set(any("a", "b", "f", "n", "r", "t", "v", "\\", "\"", "'", "&"));
tascii.set(any(
    all("^", tcntrl),
    "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "HT", "LF", "VT", "FF", "CR",
    "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC",
    "FS", "GS", "RS", "US", "SP", "DEL",
));
tcntrl.set(any(tlarge, "@", "[", "\\", "]", "^"));
tgap.set(all("\\", twhitechar, many(twhitechar), "\\"));