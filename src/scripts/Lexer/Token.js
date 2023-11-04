class Token {

    static NONE       = 0;
    static IDENTIFIER = 1;
    static LITERAL    = 2;
    static DELIMITER  = 3;
    static COMMENT    = 4;

    constructor(type, value, pos) {
        this.type = type;
        this.value = value;
        this.pos = pos;
    }

}