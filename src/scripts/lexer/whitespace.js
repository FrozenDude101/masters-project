/*
    whitespace -> whitestuff { whitestuff }
    whitestuff -> whitechar | comment | ncomment
    whitechar  -> newline | vertab | space | tab | uniWhite
    newline    -> return linefeed | return | linefeed | formfeed
    return     -> a carriage return
    linefeed   -> a line feed
    vertab     -> a vertical tab
    formfeed   -> a form feed
    space      -> a space
    tab        -> a horizontal tab
    uniWhite   -> any Unicode character defined as whitespace
*/

let [t_whitespace, t_whitestuff, t_whitechar, t_newline, t_return, t_linefeed, t_vertab, t_formfeed,
     t_space, t_tab] = FunctionReference.n(
      "whitespace", "whitestuff", "whitechar", "newline", "return", "linefeed", "vertab", "formfeed",
      "space", "tab",
);

let [t_comment, t_dashes, t_opencom, t_closecom, t_ncomment, t_ANYseq, t_ANY, t_any, t_graphic] = FunctionReference.n(
      "comment", "dashes", "opencom", "closecom", "ncomment", "ANYseq", "ANY", "any", "graphic",
)

t_whitespace.set(all(t_whitestuff, many(t_whitestuff)));
t_whitestuff.set(any(t_whitechar, t_comment, t_ncomment));
t_whitechar.set(any(t_newline, t_vertab, t_space, t_tab));
t_newline.set(any(all(t_return, t_linefeed), t_return, t_linefeed, t_formfeed));
t_return.set(str("\r"));
t_linefeed.set(str("\n"));
t_vertab.set(str("\v"));
t_formfeed.set(str("\f"));
t_space.set(str(" "));
t_tab.set(str("\t"));

/*
    comment  -> dashes [any⟨symbol⟩ {any}] newline
    dashes   -> -- {-}
    opencom  -> {-
    closecom -> -}
    ncomment -> opencom ANYseq {ncomment ANYseq} closecom
    ANYseq   -> {ANY}⟨{ANY} (opencom | closecom) {ANY}⟩
    ANY      -> graphic | whitechar
    any      -> graphic | space | tab
    graphic  -> small | large | symbol | digit | special | " | ’
*/

t_comment.set(tok(all(
    t_dashes, opt(all(diff(t_any, t_symbol), many(t_any))), t_newline,
), Token.COMMENT));
t_dashes.set(reg(
    /---*/,
));

t_opencom.set(reg(
    /{-/,
));
t_closecom.set(reg(
    /-}/,
));
t_ncomment.set(tok(all(
    t_opencom, t_ANYseq, many(all(t_ncomment, t_ANYseq)), t_closecom,
), Token.COMMENT));

t_ANYseq.set(all(diff(
    many(t_any), 
    all(
        many(t_any),
        any(t_opencom, t_closecom), 
        many(t_any)
    )
)));
t_ANY.set(any(
    t_graphic, t_whitechar,
));
t_any.set(any(
    t_graphic, t_space, t_tab,
));
t_graphic.set(any(
    t_small, t_large, t_symbol, t_digit, t_special, "\"", "'",
));