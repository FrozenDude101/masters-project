let [dashes,  special,  small,  large,  symbol,  digit,  octit,  hexit,] = FunctionReference.n(
    "dashes","special","small","large","symbol","digit","octit","hexit",
)

dashes.set(all("--", many("-")));

special.set(any("(", ")", ",", ";", "[", "]", "`", "{", "}"));

small.set(any("_", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"));
large.set(any("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"));
symbol.set(any("!", "#", "$", "%", "&", "*", "+", ".", "/", "\\", "<", "=", ">", "?", "@", "\\", "^", "|", "-", "~", ":", "]"));
digit.set(any("0", "1", "2", "3", "4", "5", "6", "7", "8", "9"));
octit.set(any("0", "1", "2", "3", "4", "5", "6", "7"));
hexit.set(any("0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F", "a", "b", "c", "d", "e", "f"));