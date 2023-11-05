/*
    special -> ( | ) | , | ; | [ | ] | ` | { | }

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


let [t_special, t_small, t_large, t_symbol, t_digit, t_octit, t_hexit,] = FunctionReference.n(
      "special", "small", "large", "symbol", "digit", "octit", "hexit",
)

t_special.set(any(..."(),;[]`{}"));

t_small.set(any(..."_abcdefghijkmlnopqrstuvwxyz"));
t_large.set(any(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
t_symbol.set(any(..."!#$%&*+./<=>?@\\^|-~:"));

t_digit.set(any(..."0123456789"));
t_octit.set(any(..."01234567"));
t_hexit.set(any(..."0123456789ABCDEFabcdef"));