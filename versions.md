# lexer_v1
This was the original lexer design.
It implements "maximal munch" in a simplified, but incorrect way.
This is because it was greedy at every step.

The following would fail:
all("a", opt("b"), "b")("ab")

This is because opt("b") would consume the "b", and not leave it for the final character.
This is addressed in the next version by keeping track of all possible accepting states.
"opt", "any", and "many", which can have multiple accepting states now return an array of accepting
states, instead of greedily consuming as much as possible.