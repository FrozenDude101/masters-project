let dashes       = reg("dashes", /-{2,}/);

let special      = any("(", ")", ",", ";", "[", "]", "`", "{", "}");

let small        = reg("small",  /[_a-z]/);
let large        = reg("large",  /[A-Z]/);
let symbol       = reg("symbol", /[!#$%&*+.\/<=>?@\\^|\-~:]/);
let digit        = reg("digit",  /[0-9]/);
let octit        = reg("octit",  /[0-7]/);
let hexit        = reg("octit",  /[0-9A-Fa-f]/);