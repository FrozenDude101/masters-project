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

let [decimal,   octal,   hexadecimal,   integer,   float,   exponent,] = FunctionReference.n(
    "decimal", "octal", "hexadecimal", "integer", "float", "exponent",
);

decimal.set(all(digit, many(digit)));
octal.set(all(octit, many(octit)));
hexadecimal.set(all(hexit, many(hexit)));

integer.set(merge(any(
    decimal,
    all("0", "o", octal),
    all("0", "O", octal),
    all("0", "x", hexadecimal),
    all("0", "X", hexadecimal),
), Token.LITERAL));

float.set(merge(any(
    all(decimal, ".", decimal, opt(exponent)),
    all(decimal, exponent)
), Token.LITERAL));

exponent.set(all(
    any("e", "E"),
    opt(any("+", "-")),
    decimal,
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
        diff(graphic, any("'", "/")),
        " ",
        diff(tescape, all("/", "&")),
    ),
    "'",
), Token.LITERAL));

tstring.set(merge(all(
    "\"",
    any(
        diff(graphic, any("\"", "\\")),
        " ",
        tescape,
        tgap,
    ),
    "\"",
), Token.LITERAL));

tescape.set(all("\\", any(
    tcharesc, tascii, decimal,
    all("o", octal),
    all("x", hexadecimal),
)));

tcharesc.set(any("a", "b", "f", "n", "r", "t", "v", "\\", "\"", "'", "&"));
tascii.set(any(
    all("^", tcntrl),
    "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "HT", "LF", "VT", "FF", "CR",
    "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC",
    "FS", "GS", "RS", "US", "SP", "DEL",
));
tcntrl.set(any(large, "@", "[", "\\", "]", "^"));
tgap.set(all("\\", whitechar, many(whitechar), "\\"));