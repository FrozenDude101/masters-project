class Token {

    static NONE           = "_";
    static WHITESPACE     = "white";
    static COMMENT        = "comment";

    static TYPEVAR        = "typevar";
    static TYPECON        = "typecon";
    static TYPECLASS      = "typeclass";

    static VARID          = "varid";
    static VARSYM         = "varsym";
    static CONID          = "conid";
    static CONSYM         = "consym";

    static MODULE         = "module";

    static KEYWORD        = "keyword";
    static OP             = "op";

    static INT_LITERAL    = "integer";
    static FLOAT_LITERAL  = "float";
    static HEX_LITERAL    = "hexadecimal";
    static OCT_LITERAL    = "octal";
    static CHAR_LITERAL   = "character";
    static STRING_LITERAL = "string";

    static SPECIAL        = "special";
    static NEWLINE        = "newline";

    constructor(type, value, index = 0) {

        this.type = type;
        this.value = value;
        this.index = index;

    }

}