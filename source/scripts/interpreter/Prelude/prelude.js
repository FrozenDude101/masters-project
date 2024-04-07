console.log("================ Prelude ================")

Program.modules.Prelude.functions["error"] = new JSThunk("error", new FunctionType(new UnboundType("a"), new LiteralType("_|_")), (e) => { throw new PreludeError(e); })
class PreludeError extends Error {}

Program.Prelude.registerType("List", new ApplicationType(new LiteralType("List"), new UnboundType("a")));
Program.Prelude.registerConstructor("List", "[]", new ConstructorThunk("[]", Program.getType("List")));
let listConsType = new FunctionType(new UnboundType("a"), new FunctionType(Program.getType("List"), Program.getType("List")));
let listCons = new FunctionThunk("(:)", listConsType);
listCons.setCase(
    new Pattern(new UnboundArgument("a"), new UnboundArgument("b")),
    new ApplicationThunk(new ApplicationThunk(new ConstructorThunk("(:)", listConsType), new UnboundThunk("a")), new UnboundThunk("b")),
);
Program.Prelude.registerConstructor("List", "(:)", listCons);

Program.Prelude.registerType("String", new ApplicationType(new LiteralType("List"), new LiteralType("Char")));

Program.Prelude.registerType("()");
Program.Prelude.registerConstructor("()", "()", new ConstructorThunk("()", Program.getType("()")));

Parser.Prelude(`
data Bool = True | False
data Char
data Integer
data Float
data IO a = IO a
data IOError a = IOError a
data Maybe a = Nothing | Just a
data Either a b = Left a | Right b
data Ordering = LT | EQ | GT
`);

Parser.Prelude(`
id :: a -> a
id a = a

const :: a -> b -> a
const a _ = a

(.) :: (b -> c) -> (a -> b) -> a -> c
(.) f g x = f (g x)

flip :: (a -> b -> c) -> b -> a -> c
flip f b a = f a b

($) :: (a -> b) -> a -> b
($) f a = f a

ite :: Bool -> a -> a -> a
ite True  a _ = a
ite False _ a = a

until :: (a -> Bool) -> (a -> a) -> a -> a
until p f a = ite (p a) (until p f (f a)) a
`);

Parser.Prelude(`
class Eq a where
    (==) :: a -> a -> Bool
    (/=) :: a -> a -> Bool

instance Eq Bool where
    (==) True  True  = True
    (==) False False = True
    (==) _     _     = False
    (/=) True  True  = False
    (/=) False False = False
    (/=) _     _     = True

instance Eq Ordering where
    (==) LT LT = True
    (==) EQ EQ = True
    (==) GT GT = True
    (==) _  _  = False
    (/=) LT LT = False
    (/=) EQ EQ = False
    (/=) GT GT = False
    (/=) _  _  = True
`);

Program.registerInstance("Prelude", "Eq", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Eq", Program.getType("Integer"), "(==)", (a) => (b) => a === b);
Program.registerInstanceMethod("Prelude", "Eq", Program.getType("Integer"), "(/=)", (a) => (b) => a !== b);

Program.registerInstance("Prelude", "Eq", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Eq", Program.getType("Float"), "(==)", (a) => (b) => a === b);
Program.registerInstanceMethod("Prelude", "Eq", Program.getType("Float"), "(/=)", (a) => (b) => a !== b);

Parser.Prelude(`
class (Eq a) => Ord a where
    compare :: a -> a -> Ordering
    (<) :: a -> a -> Bool
    (<=) :: a -> a -> Bool
    (>=) :: a -> a -> Bool
    (>) :: a -> a -> Bool
    max :: a -> a -> a
    min :: a -> a -> a

instance Ord Integer where
    compare a b = ite (a < b) LT (ite (a > b) GT EQ)

instance Ord Float where
    compare a b = ite (a < b) LT (ite (a > b) GT EQ) 
`);

Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Integer"), "(<)", (a) => (b) => a < b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Integer"), "(<=)", (a) => (b) => a <= b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Integer"), "(>=)", (a) => (b) => a >= b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Integer"), "(>)", (a) => (b) => a > b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Integer"), "min", (a) => (b) => Math.min(a, b));
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Integer"), "max", (a) => (b) => Math.max(a, b));

Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Float"), "(<)", (a) => (b) => a < b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Float"), "(<=)", (a) => (b) => a <= b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Float"), "(>=)", (a) => (b) => a >= b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Float"), "(>)", (a) => (b) => a > b);
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Float"), "min", (a) => (b) => Math.min(a, b));
Program.registerInstanceMethod("Prelude", "Ord", Program.getType("Float"), "max", (a) => (b) => Math.max(a, b));;

Parser.Prelude(`
class Show a where
    show :: a -> String
    showList :: List a -> String
`);

Program.registerInstance("Prelude", "Show", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Show", Program.getType("Integer"), "show", (a) => a.toString());

Program.registerInstance("Prelude", "Show", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Show", Program.getType("Float"), "show", (a) => a.toString());

Program.registerInstance("Prelude", "Show", Program.getType("Char"));
Program.registerInstanceMethod("Prelude", "Show", Program.getType("Char"), "show", (a) => `'${a}'`);

Program.registerInstance("Prelude", "Show", Program.getType("String"));
Program.registerInstanceMethod("Prelude", "Show", Program.getType("String"), "show", (a) => `"${a}"`);

Parser.Prelude(`
class Enum a where
    succ :: a -> a
    pred :: a -> a
    toEnum :: Integer -> a
    fromEnum :: a -> Integer
    enumFrom :: a -> List a
    enumFromThen :: a -> a -> List a
    enumFromTo :: a -> a -> List a
    enumFromThenTo :: a -> a -> a -> List a
`);

Program.registerInstance("Prelude", "Enum", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Integer"), "succ", (a) => a+1);
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Integer"), "pred", (a) => a-1);
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Integer"), "toEnum", (a) => a);
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Integer"), "fromEnum", (a) => a);

Program.registerInstance("Prelude", "Enum", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Float"), "succ", (a) => a+1);
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Float"), "pred", (a) => a-1);
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Float"), "toEnum", (a) => Math.floor(a));
Program.registerInstanceMethod("Prelude", "Enum", Program.getType("Float"), "fromEnum", (a) => a);

Parser.Prelude(`
class Bounded a where
    minBound :: a
    maxBound :: a
`);

Program.registerInstance("Prelude", "Bounded", Program.getType("Integer"));
Program.registerInstanceMethod("Prelude", "Bounded", Program.getType("Integer"), "minBound", new Pattern(), new LiteralThunk(Number.MIN_SAFE_INTEGER, Program.getType("Integer")));
Program.registerInstanceMethod("Prelude", "Bounded", Program.getType("Integer"), "maxBound", new Pattern(), new LiteralThunk(Number.MAX_SAFE_INTEGER, Program.getType("Integer")));

Program.registerInstance("Prelude", "Bounded", Program.getType("Float"));
Program.registerInstanceMethod("Prelude", "Bounded", Program.getType("Float"), "minBound", new Pattern(), new LiteralThunk(Number.MIN_VALUE, Program.getType("Float")));
Program.registerInstanceMethod("Prelude", "Bounded", Program.getType("Float"), "maxBound", new Pattern(), new LiteralThunk(Number.MAX_VALUE, Program.getType("Float")));

