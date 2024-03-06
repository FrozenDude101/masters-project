console.log("================ Prelude 2 ================");

Parser.Prelude(`
(++) :: List a -> List a -> List a
(++) []     [] = []
(++) []     ys = ys
(++) xs     [] = xs
(++) (x:xs) ys = x:(xs++ys)

concat :: List (List a) -> List a
concat []     = []
concat (x:xs) = x ++ (concat xs)

map :: (a -> b) -> List a -> List b
map f (x:xs) = (f x):(map f xs)
map _ []     = []

(&&) :: Bool -> Bool -> Bool
(&&) True True = True
(&&) _    _    = False

(||) :: Bool -> Bool -> Bool
(||) False False = False
(||) _     _     = True

not :: Bool -> Bool
not True  = False
not False = True

subtract :: (Num a) => a -> a -> a
subtract a b = a - b

even :: (Integral a) => a -> Bool
even n = (rem n 2) == 0
odd :: (Integral a) => a -> Bool
odd n = (rem n 2) /= 0

gcd :: (Integral a) => a -> a -> a
gcd x y = ite (y == 0) x (gcd y (rem x y))

lcm :: (Integral a) => a -> a -> a
lcm x y = ite ((x==0) || (y==0)) 0 (abs ((quot x (gcd x y)) * y))
`);