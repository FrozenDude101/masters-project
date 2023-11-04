let openParen    = reg("(",      /\(/);
let closeParen   = reg(")",      /\)/);

let openBracket  = reg("[",      /\[/);
let closeBracket = reg("]",      /]/);

let openBrace    = reg("{",      /{/);
let closeBrace   = reg("}",      /}/);

let dot          = reg(".",      /\./);
let comma        = reg(",",      /,/);
let semicolon    = reg(";",      /;/);
let colon        = reg(":",      /:/);

let rightArrow   = reg("->",     /->/);

let hyphen       = reg("-",      /-/);
let quote        = reg("'",      /'/);
let speech       = reg("\"",     /"/);
let grave        = reg("`",      /`/)

let space        = reg("space",  / /);

let dashes       = reg("dashes", /-{2,}/)

let special      = any(openParen, closeParen, comma, semicolon, openBracket, closeBracket, grave, openBrace, closeBrace);

let small        = reg("small",  /[_a-z]/);
let large        = reg("large",  /[A-Z]/);
let symbol       = reg("symbol", /[!#$%&*+.\/<=>?@\\^|\-~:]/);
let digit        = reg("digit",  /[0-9]/);
let octit        = reg("octit",  /[0-7]/);
let hexit        = reg("octit",  /[0-9A-Fa-f]/);