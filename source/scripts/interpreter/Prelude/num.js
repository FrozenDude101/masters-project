console.log("================ Num ================");

Parser.Prelude(`
class (Eq a, Show a) => Num a where
    (+) :: a -> a -> a
    (-) :: a -> a -> a
    (*) :: a -> a -> a
    negate :: a -> a
    abs :: a -> a
    signum :: a -> a
    fromInteger :: Integer -> a
`);

Program.registerInstance("Prelude", "Num", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "(+)", (a) => (b) => a+b);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "(-)", (a) => (b) => a-b);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "(*)", (a) => (b) => a*b);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "negate", (a) => -a);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "abs", (a) => Math.abs(a));
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "signum", (a) => Math.sign(a));
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Integer"), "fromInteger", (a) => a);

Program.registerInstance("Prelude", "Num", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "(+)", (a) => (b) => a+b);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "(-)", (a) => (b) => a-b);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "(*)", (a) => (b) => a*b);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "negate", (a) => -a);
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "abs", (a) => Math.abs(a));
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "signum", (a) => Math.sign(a));
Program.registerInstanceMethod("Prelude", "Num", Program.getType("Float"), "fromInteger", (a) => a);

Parser.Prelude(`
class (Num a, Ord a) => Real a where
    toRational :: a -> Rational
`);

Program.registerInstance("Prelude", "Real", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Real", Program.getType("Integer"), "toRational", (a) => a);

Program.registerInstance("Prelude", "Real", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Real", Program.getType("Float"), "toRational", (a) => a);

Parser.Prelude(`
class (Real a, Enum a) => Integral a where
    quot :: a -> a -> a
    rem :: a -> a -> a
    div :: a -> a -> a
    mod :: a -> a -> a
    -- quotRem :: a -> a -> (a,a)
    -- divMod :: a -> a -> (a,a)
    toInteger :: a -> Integer
`);

Program.registerInstance("Prelude", "Integral", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Integer"), "quot", (a) => (b) => Math.round(a/b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Integer"), "rem", (a) => (b) => Math.round(a%b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Integer"), "div", (a) => (b) => Math.floor(a/b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Integer"), "mod", (a) => (b) => Math.floor(a%b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Integer"), "toInteger", (a) => a);

Program.registerInstance("Prelude", "Integral", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Float"), "quot", (a) => (b) => Math.round(a/b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Float"), "rem", (a) => (b) => Math.round(a%b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Float"), "div", (a) => (b) => Math.floor(a/b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Float"), "mod", (a) => (b) => Math.floor(a%b));
Program.registerInstanceMethod("Prelude", "Integral", Program.getType("Float"), "toInteger", (a) => Math.floor(a));

Parser.Prelude(`
class (Num a) => Fractional a where
    (/) :: a -> a -> a
    recip :: a -> a
    fromRational :: Rational -> a
`);

Program.registerInstance("Prelude", "Fractional", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Fractional", Program.getType("Float"), "(/)", (a) => (b) => a/b);
Program.registerInstanceMethod("Prelude", "Fractional", Program.getType("Float"), "rem", (a) => 1/a);
Program.registerInstanceMethod("Prelude", "Fractional", Program.getType("Float"), "fromRational", (a) => a);

Parser.Prelude(`
class (Fractional a) => Floating a where
    pi :: a
    exp :: a -> a
    log :: a -> a
    sqrt :: a -> a
    (**) :: a -> a -> a
    logBase :: a -> a -> a
    sin :: a -> a
    cos :: a -> a
    tan :: a -> a
    asin :: a -> a
    acos :: a -> a
    atan :: a -> a
    sinh :: a -> a
    cosh :: a -> a
    tanh :: a -> a
    asinh :: a -> a
    acosh :: a -> a
    atanh :: a -> a
`);

Program.registerInstance("Prelude", "Floating", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "pi", new Pattern(), new LiteralThunk(Math.PI, Program.getType("Float")));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "exp", (a) => Math.exp(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "log", (a) => Math.log(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "sqrt", (a) => Math.sqrt(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "(**)", (a) => (b) => Math.pow(a, b));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "logBase", (a) => (b) => Math.log(a)/Math.log(b));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "sin", (a) => Math.sin(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "cos", (a) => Math.cos(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "tan", (a) => Math.tan(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "asin", (a) => Math.asin(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "acos", (a) => Math.acos(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "atan", (a) => Math.atan(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "sinh", (a) => Math.sinh(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "cosh", (a) => Math.cosh(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "tanh", (a) => Math.tanh(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "asinh", (a) => Math.asinh(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "acosh", (a) => Math.acosh(a));
Program.registerInstanceMethod("Prelude", "Floating", Program.getType("Float"), "atanh", (a) => Math.atanh(a));

Parser.Prelude(`
    class (Real a, Fractional a) => RealFrac a where
        -- properFraction :: (Integral b) => a -> (b,a)
        truncate :: (Integral b) => a -> b
        round :: (Integral b) => a -> b
        ceiling :: (Integral b) => a -> b
        floor :: (Integral b) => a -> b
`);

Program.registerInstance("Prelude", "RealFrac", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "RealFrac", Program.getType("Float"), "truncate", (a) => Math.trunc(a));
Program.registerInstanceMethod("Prelude", "RealFrac", Program.getType("Float"), "round", (a) => Math.round(a));
Program.registerInstanceMethod("Prelude", "RealFrac", Program.getType("Float"), "ceiling", (a) => Math.ceil(a));
Program.registerInstanceMethod("Prelude", "RealFrac", Program.getType("Float"), "floor", (a) => Math.floor(a));

Parser.Prelude(`
class (RealFrac a, Floating a) => RealFloat a where
    -- floatRadix :: a -> Integer
    -- floatDigits :: a -> Integer
    -- floatRange :: a -> (Int,Int)
    -- decodeFloat :: a -> (Integer,Int)
    -- encodeFloat :: Integer -> Integer -> a
    -- exponent :: a -> Integer
    -- significand :: a -> a
    -- scaleFloat :: Integer -> a -> a
    isNaN :: a -> Bool
    isInfinite :: a -> Bool
    -- isDenormalized :: a -> Bool
    isNegativeZero :: a -> Bool
    -- isIEEE :: a -> Bool
    atan2 :: a -> a -> a
`);

Program.registerInstance("Prelude", "RealFloat", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "RealFloat", Program.getType("Float"), "isNaN", (a) => isNaN(a));
Program.registerInstanceMethod("Prelude", "RealFloat", Program.getType("Float"), "isInfinite", (a) => !isFinite(a));
Program.registerInstanceMethod("Prelude", "RealFloat", Program.getType("Float"), "isNegativeZero", (a) => a === 0 && Math.sign(a) === -1);
Program.registerInstanceMethod("Prelude", "RealFloat", Program.getType("Float"), "atan2", (a) => (b) => Math.atan2(a, b));