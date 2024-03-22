const PRESET_SELECT = document.getElementById("presets")
const PRESETS = {
    none: {
        name: "Load a preset!",
        body: [""],
        main: "",
    },
    helloworld: {
        name: "Hello, World!",
        body: [
            "helloWorld :: IO ()",
            "helloWorld = print \"Hello, World!\"",
        ],
        main: "helloWorld",
    },
    echo: {
        name: "Hello, World!",
        body: [
        ],
        main: "getLine >>= print",
    },
    datatypes: {
        name: "Data Types",
        body: [
            "data Bin a = Leaf | Node a (Bin a) (Bin a)",
            "",
            "-- hasNothing",
            "hN :: Bin (Maybe a) -> Bool",
            "hN Leaf = False",
            "hN (Node Nothing _ _) = True",
            "hN (Node _ l r) = (hN l) || (hN r)",
            "",
            "-- removeJust",
            "rJ :: Bin (Maybe a) -> Bin a",
            "rJ Leaf = Leaf",
            "rJ (Node (Just a) l r) = Node a (rJ l) (rJ r)",
            "",
            "-- runAll",
            "rA :: Bin (Maybe a) -> Maybe (Bin a)",
            "rA t = ite (hN t) Nothing (Just (rJ t))",
            "",
            "-- Just (Node 4 (Node 7 Leaf Leaf) (Node 1 Leaf Leaf))",
            "t1 :: Bin (Maybe Integer)",
            "t1 = Node (Just 4) (Node (Just 7) Leaf Leaf) (Node (Just 1) Leaf Leaf)",
            "",
            "-- Nothing",
            "t2 :: Bin (Maybe Integer)",
            "t2 = Node (Just True) Leaf (Node Nothing Leaf Leaf)",
        ],
        main: "rA t1",
    },
    tuples: {
        name: "Tuples",
        body: [
            "data T2 a b = T2 a b",
            "",
            "zip2 :: List a -> List b -> List (T2 a b)",
            "zip2 []     _      = []",
            "zip2 _      []     = []",
            "zip2 (x:xs) (y:ys) = (T2 x y) : (zip2 xs ys)"
        ],
        main: "zip2 (1:(2:(3:[]))) ('a':('b':('c':[])))",
    },
    monads: {
        name: "Functors",
        body: [
            "-- class Functor f where",
            "-- fmap :: (a -> b) -> f a -> f b",
            "",
            "-- instance Functor (Maybe a) where",
            "-- fmap f Nothing  = Nothing",
            "-- fmap f (Just a) = Just (f a)",
            "",
            "-- The Functor typeclass describes how values can be transformed.",
            "-- For Maybe, if it doesn't have a value, it remains as Nothing.",
            "-- If it has a value (Just a), it can be transformed (Just (f a)).",
            "",
            "f1 :: List Integer",
            "f1 = 0:(1:(10:[]))",
            "f2 :: Maybe Integer",
            "f2 = Just 4",
            "f3 :: Maybe Integer",
            "f3 = Nothing",
        ],
        main: "fmap (2*) f1"
    },
    syntax: {
        name: "Syntax",
        body: [
            "-- You can click the area on the right to step through the main function.",
            "-- You can also click individual applications to look at their type information in a separate scope!",
            "-- Not all of the syntax has been implemented yet, but the core features have been:",
            "",
            "class TypeClass var where",
            "method :: var -> var -> var",
            "",
            "data DataType var = Recursive (DataType var) | Con var | NilCon",
            "",
            "instance TypeClass (DataType var) where",
            "method _ _ = NilCon",
            "",
            "function :: (TypeClass var) => var -> var",
            "function arg = method arg arg",
            "",
            "-- Lines are only separated by actual new lines, not by wrapping. So all of this is the same comment!",
        ],
        main: "map function (NilCon:((Con 1):((Recursive NilCon):[])))",
    },
}

for (let k in PRESETS) {
    let data = PRESETS[k];
    PRESET_SELECT.innerHTML += `<option value="${k}">${data.name}</option>`;
}

PRESET_SELECT.addEventListener("change", (e) => {
    let k = PRESET_SELECT.value;
    let data = PRESETS[k];
    CODE_INPUT.value = data.body.join("\n");
    MAIN_INPUT.value = data.main;

    CODE_INPUT.dispatchEvent(new InputEvent("input"));
});