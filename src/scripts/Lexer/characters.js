let openParen    = reg("(",     /\(/);
let closeParen   = reg(")",     /\)/);

let openBracket  = reg("[",     /\[/);
let closeBracket = reg("]",     /]/);

let openBrace    = reg("{",     /{/);
let closeBrace   = reg("}",     /}/);

let comma        = reg(",",     /,/);

let rightArrow   = reg("->",    /->/);
let hyphen       = reg("-",     /-/);

let space        = reg("space", / /);

let small        = reg("small", /[_a-z]/);
let large        = reg("lower", /[A-Z]/);
let digit        = reg("digit", /[0-9]/);
let quote        = reg("'", /'/);

let reservedId   = reg("reservedId",   /(case)|(class)|(data)|(default)|(deriving)|(do)|(else)|(foreign)|(if)|(import)|(in)|(infix)|(infixl)|(infixr)|(instance)|(let)|(module)|(newtype)|(of)|(then)|(type)|(where)/, Token.IDENTIFIER);
let reservedOp   = reg("reservedOp",   /(\.\.)|(:)|(::)|(=)|(\\)|(\|)|(<-)|(->)|(@)|(~)|(=>)/);