console.log("================ Data.Maybe ================");

Parser.Prelude(`
isJust :: Maybe a -> Bool
isJust Nothing = False
isJust _       = True

isNothing :: Maybe a -> Bool
isNothing a = not (isJust a)

fromJust :: Maybe a -> a
fromJust (Just a) = a

fromMaybe :: a -> Maybe a -> a
fromMaybe a Nothing  = a
fromMaybe _ (Just a) = a

listToMaybe :: List a -> Maybe a
listToMaybe []    = Nothing
listToMaybe (x:_) = Just x

maybeToList :: Maybe a -> List a
maybeToList Nothing  = []
maybeToList (Just a) = a : []

catMaybes :: List (Maybe a) -> List a
catMaybes []            = []
catMaybes (Nothing:xs)  = catMaybes xs
catMaybes ((Just x):xs) = x : (catMaybes xs)

mapMaybe :: (a -> Maybe b) -> List a -> List b
mapMaybe f xs = catMaybes (map f xs)
`);