console.log("================ Control.Monad ================");

Parser.Prelude(`
class Functor f where
    fmap :: (a -> b) -> f a -> f b

instance Functor (List a) where
    fmap = map

instance Functor (IO a) where
    fmap f (IO a) = IO (f a)

instance Functor (Maybe a) where
    fmap f Nothing  = Nothing
    fmap f (Just a) = Just (f a)

class Monad m where
    (>>=) :: m a -> (a -> m b) -> m b
    (>>) :: m a -> m b -> m b
    return :: a -> m a
    fail :: String -> m a

instance Monad (List a) where
    (>>=) xs f = concat (map f xs)
    (>>) _ ys = ys
    return x = x:[]

instance Monad (IO a) where
    (>>=) (IO a) f = f a
    (>>) _ b = b
    return a = IO a

instance Monad (Maybe a) where
    (>>=) Nothing  f = Nothing
    (>>=) (Just a) f = f a
    (>>) _ b = b
    return = Just

class (Monad m) => MonadPlus m where
    mzero :: m a 
    mplus :: m a -> m a -> m a

instance MonadPlus (List a) where
    mzero = []
    mplus xs ys = xs ++ ys

instance MonadPlus (Maybe a) where
    mzero = Nothing
    mplus Nothing r = r
    mplus l _ = l
`);