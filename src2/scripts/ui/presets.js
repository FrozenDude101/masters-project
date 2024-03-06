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
    debug: {
        name: "Debug",
        body: [
            "class Foo a where",
            "d :: a -> a",
            "",
            "data Bar a = Baz a | Car Integer | Nil",
            "",
            "instance Foo (Bar a) where",
            "d (Baz a) = Baz a",
            "d (Car a) = Car (succ a)",
            "d Nil     = Nil",
        ],
        main: "",
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