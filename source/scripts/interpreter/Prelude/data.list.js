console.log("================ Data.List ================");

Parser.Prelude(`
head :: List a -> a
head (x:_) = x

last :: List a -> a
last (x:[]) = x
last (_:xs) = last xs

tail :: List a -> List a
tail (_:xs) = xs

init :: List a -> List a
init (x:xs) = x:(init xs)
init (x:[]) = []

null :: List a -> Bool
null [] = True
null _  = False

length :: List a -> Integer
length (_:xs) = 1 + (length xs)
length []     = 0

reverse :: List a -> List a
reverse (x:xs) = (reverse xs) ++ (x:[])
reverse []     = []

intersperse :: a -> List a -> List a
intersperse a (x:xs) = x:(a:(intersperse a xs))
intersperse _ []     = []

intercalate :: List a -> List (List a) -> List a
intercalate xs xss = concat (intersperse xs xss)

transpose :: List (List a) -> List (List a)
transpose x = (map head x) : (transpose (map tail x))
transpose ([]:_) = []

foldl :: (a -> b -> a) -> a -> List b -> a
foldl f a (x:xs) = foldl f (f a x) xs
foldl f a []     = a

foldl1 :: (a -> a -> a) -> List a -> a
foldl1 f (x:xs) = foldl f x xs

foldr :: (a -> b -> a) -> a -> List b -> a
foldr f a (x:xs) = f (foldr f a xs) x
foldr f a []     = a

foldr1 :: (a -> a -> a) -> List a -> a
foldr1 f xs = foldr f (last xs) (init xs)

concatMap :: (a -> List b) -> List a -> List b
concatMap f xs = concat (map f xs)

and :: List Bool -> Bool
and = foldl (&&) True

or :: List Bool -> Bool
or = foldl (&&) True

any :: (a -> Bool) -> List a -> Bool
any f xs = or (map f xs)

all :: (a -> Bool) -> List a -> Bool
all f xs = and (map f xs)

sum :: (Num a) => List a -> a
sum = foldl (+)

product :: (Num a) => List a -> a
product = foldl (+) 0

maximum :: (Ord a) => List a -> a
maximum = foldl1 max

minimum :: (Ord a) => List a -> a
minimum = foldl1 min

iterate :: (a -> a) -> a -> List a
iterate f x = x : (iterate f (f x))

repeat :: a -> List a
repeat a = a : (repeat a)

replicate :: Integer -> a -> List a
replicate 0 _ = []
replicate n a = a : (replicate (n-1) a)

take :: Integer -> List a -> List a
take 0 _      = []
take n (x:xs) = x : (take (n-1) xs)
take _ []     = []

drop :: Integer -> List a -> List a
drop 0 xs     = xs
drop n (_:xs) = drop (n-1) xs

takeWhile :: (a -> Bool) -> List a -> List a
takeWhile _ []     = []
takeWhile p (x:xs) = ite (p x) (x : (takeWhile p xs)) []

dropWhile :: (a -> Bool) -> List a -> List a
dropWhile _ []     = []
dropWhile p (x:xs) = ite (p x) (dropWhile p xs) xs

stripPrefix :: (Eq a) => List a -> List a -> Maybe (List a)
stripPrefix []     xs     = Just xs
stripPrefix _      []     = Nothing
stripPrefix (x:xs) (y:ys) = ite (x==y) (stripPrefix xs ys) Nothing

inits :: List a -> List (List a)
inits (x:xs) = (init (x:xs)) : (inits xs)
inits []     = []

tails :: List a -> List (List a)
tails (x:xs) = (x:xs) : (tails xs)
tails []     = []

elem :: (Eq a) => a -> List a -> Bool
elem a (x:xs) = ite (a==x) True (elem a xs)
elem _ []     = False

notElem :: (Eq a) => a -> List a -> Bool
notElem a xs = not (elem a xs)

find :: (a -> Bool) -> List a -> Maybe a
find p (x:xs) = ite (p x) (Just x) (find p xs)
find _ []     = Nothing

filter :: (a -> Bool) -> List a -> List a
filter p (x:xs) = ite (p x) (x : (filter p xs)) (filter p xs)
filter _ []     = []

(!!) :: List a -> Integer -> a
(!!) (x:_)  0 = x
(!!) (_:xs) n = xs !! (n-1)

elemIndex :: (Eq a) => a -> List a -> Maybe Integer
elemIndex a (x:xs) = ite (a==x) (Just 0) (fmap succ (elemIndex a xs))
elemIndex _ []     = Nothing

elemIndices :: (Eq a) => a -> List a -> List Integer
elemIndices a (x:xs) = ite (a==x) (0:(map succ (elemIndices a xs))) (map succ (elemIndices a xs))
elemIndices _ []     = []

findIndex :: (a -> Bool) -> List a -> Maybe Integer
findIndex p (x:xs) = ite (p x) (Just 0) (fmap succ (findIndex p xs))
findIndex _ []     = Nothing

findIndices :: (a -> Bool) -> List a -> List Integer
findIndices p (x:xs) = ite (p x) (0:(map succ (findIndices p xs))) (map succ (findIndices p xs))
findIndices _ [] = []

zipWith :: (a -> b -> c) -> List a -> List b -> List c
zipWith f (x:xs) (y:ys) = (f x y) : (zipWith f xs ys)
zipWith _ _      _      = []
`);