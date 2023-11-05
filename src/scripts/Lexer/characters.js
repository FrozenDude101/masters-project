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


let [tspecial,  tsmall,  tlarge,  tsymbol,  tdigit,  toctit,  thexit,] = FunctionReference.n(
    "tspecial","tsmall","tlarge","tsymbol","tdigit","toctit","thexit",
)

tspecial.set(any("(),;[]`{}"));

tsmall.set(any(..."_abcdefghijkmlnopqrstuvwxyz"));
tlarge.set(any(..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"));
tsymbol.set(any(..."!#$%&*+./<=>?@\\^|-~:"));
tdigit.set(any(..."0123456789"));
toctit.set(any(..."01234567"));
thexit.set(any(..."0123456789ABCDEFabcdef"));