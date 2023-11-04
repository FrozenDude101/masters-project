/*
    small     -> ascSmall | uniSmall | _
    ascSmall  -> a | b | . . . | z
    uniSmall  -> any Unicode lowercase letter

    large     -> ascLarge | uniLarge
    ascLarge  -> A | B | . . . | Z
    uniLarge  -> any uppercase or titlecase Unicode letter

    symbol    -> ascSymbol | uniSymbol⟨special⟩ | _ | " | ’i
    ascSymbol -> ! | # | $ | % | & | * | + | . | / | < | = | > | ? | @
               | \ | ˆ | | | - | ~ | :
    uniSymbol -> any Unicode symbol or punctuation
    
    digit     -> ascDigit | uniDigit
    ascDigit  -> 0 | 1 | . . . | 9
    uniDigit  -> any Unicode decimal digit
    octit     -> 0 | 1 | . . . | 7
    hexit     -> digit | A | . . . | F | a | . . . | f
*/


let [dashes,  special,  small,  large,  symbol,  digit,  octit,  hexit,] = FunctionReference.n(
    "dashes","special","small","large","symbol","digit","octit","hexit",
)

dashes.set(all("--", many("-")));

special.set(any("(),;[]`{}"));

small.set(any(..."_abcdefghijkmlnopqrstuvwxyz"));
large.set(any(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
symbol.set(any(..."!#$%&*+./<=>?@\\^|-~:"));
digit.set(any(..."0123456789"));
octit.set(any(..."01234567"));
hexit.set(any(..."0123456789ABCDEFabcdef"));