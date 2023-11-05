class Token {

    static NONE       = "_";
    static WHITESPACE = "white";
    static COMMENT    = "comment";

    static TYPEVAR    = "typevar";
    static TYPECON    = "typecon";
    static TYPECLASS  = "typeclass";

    static VARID      = "varid";
    static VARSYM     = "varsym";
    static CONID      = "conid";
    static CONSYM     = "consym";

    static MODULE     = "module";

    static KEYWORD    = "keyword";
    static OP         = "op";
    static LITERAL    = "literal";

    constructor(type, value) {

        this.type = type;
        this.value = value;

    }

}