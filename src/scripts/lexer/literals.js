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

let [t_decimal, t_octal, t_hexadecimal, t_integer, t_float, t_exponent,] = FunctionReference.n(
      "decimal", "octal", "hexadecimal", "integer", "float", "exponent",
);

t_decimal.set(tok(all(t_digit, many(t_digit)), Token.INT_LITERAL));
t_octal.set(tok(all(t_octit, many(t_octit)), Token.OCT_LITERAL));
t_hexadecimal.set(tok(all(t_hexit, many(t_hexit)), Token.HEX_LITERAL));

t_integer.set(any(
    t_decimal,
    all("0", "o", t_octal),
    all("0", "O", t_octal),
    all("0", "x", t_hexadecimal),
    all("0", "X", t_hexadecimal),
));

t_float.set(tok(any(
    all(t_decimal, ".", t_decimal, opt(t_exponent)),
    all(t_decimal, t_exponent)
), Token.FLOAT_LITERAL));

t_exponent.set(all(
    any("e", "E"),
    opt(any("+", "-")),
    t_decimal,
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

let [t_char, t_string, t_escape, t_charesc, t_ascii, t_cntrl, t_gap,] = FunctionReference.n(
      "char", "string", "escape", "charesc", "ascii", "cntrl", "gap",
);

t_char.set(all(
    "'",
    tok(any(
        diff(t_graphic, any("'", "/")),
        " ",
        diff(t_escape, all("/", "&")),
    ), Token.CHAR_LITERAL),
    "'",
));

t_string.set(all(
    "\"",
    tok(many(any(
        diff(t_graphic, any("\"", "\\")),
        t_space,
        t_escape,
        t_gap,
    )), Token.STRING_LITERAL),
    "\"",
));

t_escape.set(all("\\", any(
    t_charesc, t_ascii, t_decimal,
    all("o", t_octal),
    all("x", t_hexadecimal),
)));

t_charesc.set(any("a", "b", "f", "n", "r", "t", "v", "\\", "\"", "'", "&"));
t_ascii.set(any(
    all("^", t_cntrl),
    "NUL", "SOH", "STX", "ETX", "EOT", "ENQ", "ACK", "BEL", "BS", "HT", "LF", "VT", "FF", "CR",
    "SO", "SI", "DLE", "DC1", "DC2", "DC3", "DC4", "NAK", "SYN", "ETB", "CAN", "EM", "SUB", "ESC",
    "FS", "GS", "RS", "US", "SP", "DEL",
));
t_cntrl.set(any(t_large, "@", "[", "\\", "]", "^"));
t_gap.set(all("\\", t_whitechar, many(t_whitechar), "\\"));