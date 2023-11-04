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

let [twhitespace,  twhitestuff,  twhitechar,  tnewline,  treturn,  tlinefeed,  tvertab,  tformfeed,
     tspace,  ttab,  tuniWhite] = FunctionReference.n(
    "twhitespace","twhitestuff","twhitechar","tnewline","treturn","tlinefeed","tvertab","tformfeed",
    "tspace","ttab","tuniWhite",
);

let [tcomment,  tdashes,  topencom,  tclosecom,  tncomment,  tANYseq,  tANY,  tany,  tgraphic] = FunctionReference.n(
    "tcomment","tdashes","topencom","tclosecom","tncomment","tANYseq","tANY","tany","tgraphic",
)

twhitespace.set(all(twhitestuff, many(twhitestuff)));
twhitestuff.set(any(twhitechar, tcomment, tncomment));
twhitechar.set(any(tnewline, tvertab, tspace, ttab, tuniWhite));
tnewline.set(any(all(treturn, tlinefeed), treturn, tlinefeed, tformfeed));
treturn.set(str("\r"));
tlinefeed.set(str("\n"));
tvertab.set(str("\v"));
tformfeed.set(str("\f"));
tspace.set(str(" "));
ttab.set(str("\t"));
tuniWhite.set(err);

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


tcomment.set(all(tdashes, opt(diff(tany, tsymbol), many(tANY)), tnewline));
tdashes.set(all("--", many("-")));
topencom.set(str("{-"));
tclosecom.set(str("-}"));
tncomment.set(all(topencom, tANYseq, many(all(tncomment, tANYseq)), tclosecom));
tANYseq.set(diff(
    tANY,
    all(tANY, any(topencom, tclosecom), tANY),
));
tANY.set(any(tgraphic, twhitechar));
tany.set(any(tgraphic, tspace, ttab));
tgraphic.set(any(tsmall, tlarge, tsymbol, tdigit, tspecial, "\"", "'"));