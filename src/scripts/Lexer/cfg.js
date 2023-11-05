class CFG {
    static module       = new FunctionReference("module");
    static body         = new FunctionReference("body");
    static impdecls     = new FunctionReference("impdecls");
    static exports      = new FunctionReference("exports");
    static export       = new FunctionReference("export");
    static impdecl      = new FunctionReference("impdecl");
    static impspec      = new FunctionReference("impspec");
    static import       = new FunctionReference("import");
    static cname        = new FunctionReference("cname");
    static topdecls     = new FunctionReference("topdecls");
    static topdecl      = new FunctionReference("topdecl");
    static decls        = new FunctionReference("decls");
    static decl         = new FunctionReference("decl");
    static cdecls       = new FunctionReference("cdecls");
    static cdecl        = new FunctionReference("decl");
    static idecls       = new FunctionReference("idecls");
    static idecl        = new FunctionReference("idecl");
    static gendecl      = new FunctionReference("gendecl");
    static ops          = new FunctionReference("ops");
    static vars         = new FunctionReference("vars");
    static fixity       = new FunctionReference("fixity");
    static type         = new FunctionReference("type");
    static btype        = new FunctionReference("btype");
    static atype        = new FunctionReference("atype");
    static gtycon       = new FunctionReference("gtycon");
    static context      = new FunctionReference("context");
    static class        = new FunctionReference("class");
    static scontext     = new FunctionReference("scontext");
    static simpleclass  = new FunctionReference("simpleclass");
    static simpletype   = new FunctionReference("simpletype");
    static constrs      = new FunctionReference("constrs");
    static constr       = new FunctionReference("constr");
    static newconstr    = new FunctionReference("newconstr");
    static fielddecl    = new FunctionReference("fielddecl");
    static deriving     = new FunctionReference("deriving");
    static dclass       = new FunctionReference("dclass");
    static inst         = new FunctionReference("inst");
    static fdecl        = new FunctionReference("fdecl");
    static callconv     = new FunctionReference("callconv");
    static impent       = new FunctionReference("impent");
    static expent       = new FunctionReference("expent");
    static safety       = new FunctionReference("safety");
    static ftype        = new FunctionReference("ftype");
    static frtype       = new FunctionReference("frtype");
    static fatype       = new FunctionReference("fatype");
    static funlhs       = new FunctionReference("funlhs");
    static rhs          = new FunctionReference("rhs");
    static gdrhs        = new FunctionReference("gdrhs");
    static guards       = new FunctionReference("guards");
    static guard        = new FunctionReference("guard");
    static exp          = new FunctionReference("exp");
    static infixexp     = new FunctionReference("infixexp");
    static lexp         = new FunctionReference("lexp");
    static fexp         = new FunctionReference("fexp");
    static aexp         = new FunctionReference("aexp");
    static qual         = new FunctionReference("qual");
    static alts         = new FunctionReference("alts");
    static alt          = new FunctionReference("alt");
    static gdpat        = new FunctionReference("gdpat");
    static stmts        = new FunctionReference("stmts");
    static stmt         = new FunctionReference("stmt");
    static fbind        = new FunctionReference("fbind");
    static pat          = new FunctionReference("pat");
    static lpat         = new FunctionReference("lpat");
    static apat         = new FunctionReference("apat");
    static fpat         = new FunctionReference("fpat");
    static gcon         = new FunctionReference("gcon");
    static var          = new FunctionReference("var");
    static qvar         = new FunctionReference("qvar");
    static con          = new FunctionReference("con");
    static qcon         = new FunctionReference("qcon");
    static varop        = new FunctionReference("varop");
    static qvarop       = new FunctionReference("qvarop");
    static conop        = new FunctionReference("conop");
    static qconop       = new FunctionReference("qconop");
    static op           = new FunctionReference("op");
    static qop          = new FunctionReference("qop");
    static gconsym      = new FunctionReference("gconsym");
}

CFG.module.set(any(
    all("module", tmodid, opt(CFG.exports), "where", CFG.body),
    CFG.body,
));
CFG.body.set(any(
    all("{", CFG.impdecls, ";", CFG.topdecls, "}"),
    all("{", CFG.impdecls, "}"),
    all("{", CFG.topdecls, "}"),
));
CFG.impdecls.set(all(
    CFG.impdecl,
    many(all(";", CFG.impdecl)),
));
CFG.exports.set(all(
    "(", many(all(CFG.export, ",")), ")",
));
CFG.export.set(any(
    CFG.qvar,
    all(tqtycon, opt(any("(..)", "()", all("(", CFG.cname, many(all(",", CFG.cname)), ")")))),
    all(tqtycls, opt(any("(..)", "()", all("(", CFG.qvar, many(all(",", CFG.qvar)), ")")))),
    all("module", tmodid),
));
CFG.impdecl.set(opt(
    all("import", opt("qualified"), tmodid, opt(all("as", tmodid)), opt(CFG.impspec)),
));
CFG.impspec.set(all(
    opt("hiding"), "(", many(all(CFG.import, ",")), ")"),
);
CFG.import.set(any(
    CFG.var,
    all(ttycon, opt(any("(..)", "()", all("(", CFG.cname, many(all(",", CFG.cname)), ")")))),
    all(ttycls, opt(any("(..)", "()", all("(", CFG.var, many(all(",", CFG.var)), ")")))),
));
CFG.cname.set(any(CFG.var, CFG.con));
CFG.topdecls.set(opt(all(
    CFG.topdecl,
    many(all(";", CFG.topdecl)),
)));
CFG.topdecl.set(any(
    all("type", CFG.simpletype, "=", CFG.type),
    all("data", opt(all(CFG.context, "=>")), CFG.simpletype, opt(all("=", CFG.constrs)), opt(CFG.deriving)),
    all("newtype", opt(all(CFG.context, "=>")), CFG.simpletype, "=", CFG.newconstr, opt(CFG.deriving)),
    all("class", opt(all(CFG.scontext, "=>")), ttycls, ttyvar, opt(all("where", CFG.cdecls))),
    all("instance", opt(all(CFG.scontext, "=>")), tqtycls, CFG.inst, opt(all("where", CFG.idecls))),
    all("default", "(", many(all(CFG.type, ",")), ")"),
    all("foreign", CFG.fdecl),
    CFG.decl,
));
CFG.decls.set(all(
    "{", many(all(CFG.decl, ";")), "}",
));
CFG.decl.set(any(
    CFG.gendecl,
    all(any(CFG.funlhs, CFG.pat), CFG.rhs),
));
CFG.cdecls.set(all(
    "{", many(all(CFG.cdecl, ";")), "}",
));
CFG.cdecl.set(any(
    CFG.gendecl,
    all(any(CFG.funlhs, CFG.var), CFG.rhs),
));
CFG.idecls.set(all(
    "{", many(all(CFG.idecl, ";")), "}",
));
CFG.idecl.set(opt(all(
    any(CFG.funlhs, CFG.var), CFG.rhs,
)));
CFG.gendecl.set(opt(any(
    all(CFG.vars, "::", opt(all(CFG.context, "=>")), CFG.type),
    all(CFG.fixity, tinteger, CFG.ops),
)));
CFG.ops.set(all(
    CFG.op, many(all(",", CFG.op)),
));
CFG.vars.set(all(
    CFG.var, many(all(",", CFG.var)),
));
CFG.fixity.set(any(
    "infixl", "infixr", "infix",
));
CFG.type.set(all(
    CFG.btype, opt(all("->", CFG.type)),
));
CFG.btype.set(all(
    CFG.atype, many(CFG.atype),
));
CFG.atype.set(any(
    CFG.gtycon,
    ttyvar,
    all("(", CFG.type, ",", CFG.type, many(all(",", CFG.type)), ")"),
    all("[", CFG.type, "]"),
    all("(", CFG.type, ")"),
));
CFG.gtycon.set(any(
    tqtycon, "()", "[]", "(->)", all("(,", many(","), ")"),
));
CFG.context.set(any(
    CFG.class,
    all("(", many(all(CFG.class, ",")), ")")
));
CFG.class.set(any(
    all(tqtycls, ttyvar),
    all(tqtycls, "(", CFG.atype, many(CFG.atype), ")"),
));
CFG.scontext.set(any(
    CFG.simpleclass,
    all("(", many(all(CFG.simpleclass, ",")), ")"),
));
CFG.simpleclass.set(all(
    tqtycls, ttyvar,
));
CFG.simpletype.set(all(
    ttycon, many(ttyvar),
));
CFG.constrs.set(all(
    CFG.constr,
    many(all("|", CFG.constr)),
));
CFG.constr.set(any(
    all(CFG.con, many(all(opt("!"), CFG.type))),
    all(any(CFG.btype, all("!", CFG.atype)), CFG.conop, any(CFG.btype, all("!", CFG.atype))),
    all(CFG.con, "{", many(all(CFG.fielddecl, ",")), "}"),
));
CFG.newconstr.set(any(
    all(CFG.con, CFG.atype),
    all(CFG.con, "{", CFG.var, "::", CFG.type, "}"),
));
CFG.fielddecl.set(all(
    CFG.vars, "::", any(CFG.type, all("!", CFG.atype))
));
CFG.deriving.set(all(
    "deriving", any(CFG.dclass, all("(", many(CFG.dclass, ","), ")")),
));
CFG.dclass.set(tqtycls);
CFG.inst.set(any(
    CFG.gtycon,
    all("(", CFG.gtycon, many(all(ttyvar, ",")), ")"),
    all("(", many(all(ttyvar, ",")), ")"),
    all("[", ttyvar, "]"),
    all("(", ttyvar, "->", ttyvar, ")"),
));
CFG.fdecl.set(any(
    all("import", CFG.callconv, opt(CFG.safety), CFG.impent, CFG.var, "::", CFG.ftype),
    all("export", CFG.callconv, CFG.expent, CFG.var, "::", CFG.ftype),
));
CFG.callconv.set(any(
    "ccall", "stdcall", "cplusplus", "jvm", "dotnet",
));
CFG.impent.set(opt(tstring));
CFG.expent.set(opt(tstring));
CFG.safety.set(any(
    "unsafe", "safe"
));
CFG.ftype.set(any(
    CFG.frtype,
    all(CFG.fatype, "->", CFG.ftype),
));
CFG.frtype.set(any(
    CFG.fatype,
    "()",
));
CFG.fatype.set(all(
    tqtycon, many(CFG.atype),
));
CFG.funlhs.set(any(
    all(CFG.var, CFG.apat, many(CFG.apat)),
    all(CFG.pat, CFG.varop, CFG.pat),
    all("(", CFG.funlhs, ")", CFG.apat, many(CFG.apat)),
));
CFG.rhs.set(any(
    all("=", CFG.exp, opt(all("where", CFG.decls))),
    all(CFG.gdrhs, opt(all("where", CFG.decls))),
));
CFG.gdrhs.set(all(
    CFG.guards, "=", CFG.exp, opt(CFG.gdrhs),
));
CFG.guards.set(all(
    "|", CFG.guard, many(CFG.guard),
));
CFG.guard.set(any(
    all(CFG.pat, "<-", CFG.infixexp),
    all("let", CFG.decls),
    CFG.infixexp,
));
CFG.exp.set(any(
    all(CFG.infixexp, "::", opt(all(CFG.context, "=>")), CFG.type),
    CFG.infixexp,
));
CFG.infixexp.set(any(
    all(CFG.lexp, CFG.qop, CFG.infixexp),
    all("-", CFG.infixexp),
    CFG.lexp,
));
CFG.lexp.set(any(
    all("\\", CFG.apat, many(CFG.apat), "->", CFG.exp),
    all("let", CFG.decls, "in", CFG.exp),
    all("if", CFG.exp, opt(";"), "then", CFG.exp, opt(";"), "else", CFG.exp),
    all("case", CFG.exp, "of", "{", CFG.alts, "}"),
    all("do", "{", CFG.stmts, "}"),
    CFG.fexp,
));
CFG.fexp.set(all(
    CFG.aexp, many(CFG.aexp),
));
CFG.aexp.set(any(
    CFG.qvar,
    CFG.gcon,
    tliteral,
    all("(", CFG.exp, ")"),
    all("(", CFG.exp, ",", CFG.exp, many(all(",", CFG.exp)), ")"),
    all("[", CFG.exp, many(all(",", CFG.exp)), "]"),
    all("[", CFG.exp, opt(all(",", CFG.exp)), "..", opt(CFG.exp), "]"),
    all("[", CFG.exp, "|", CFG.qual, many(all(",", CFG.qual)), "]"),
    all("(", CFG.infixexp, CFG.qop, ")"),
    all("(", diff(CFG.qop, "-"), CFG.infixexp, ")"),
    all(CFG.qcon, "{", many(all(CFG.fbind, ",")), "}"),
    all(diff(CFG.aexp, CFG.qcon), "{", CFG.fbind, many(all(",", CFG.fbind)), "}"),
));
CFG.qual.set(any(
    all(CFG.pat, "<-", CFG.exp),
    all("let", CFG.decls),
    CFG.exp,
));
CFG.alts.set(all(
    CFG.alt, many(all(";", CFG.alt)),
));
CFG.alt.set(opt(any(
    all(CFG.pat, "->", CFG.exp, opt(all("where", CFG.decls))),
    all(CFG.pat, CFG.gdpat, opt(all("where", CFG.decls))),
)));
CFG.gdpat.set(all(
    CFG.guards, "->", CFG.exp, opt(CFG.gdpat),
));
CFG.stmts.set(all(
    many(CFG.stmt), CFG.exp, opt(";")
));
CFG.stmt.set(any(
    all(CFG.exp, opt(";")),
    all(CFG.pat, "<-", CFG.exp, ";"),
    all("let", CFG.decls, ";"),
    ";",
));
CFG.fbind.set(all(
    CFG.qvar, "=", CFG.exp,
));
CFG.pat.set(any(
    all(CFG.lpat, CFG.qconop, CFG.pat),
    CFG.lpat,
));
CFG.lpat.set(any(
    CFG.apat,
    all("-", any(tinteger, tfloat)),
    all(CFG.gcon, CFG.apat, many(CFG.apat)),
));
CFG.apat.set(any(
    all(CFG.var, opt(all("@", CFG.apat))),
    CFG.gcon,
    all(CFG.gcon, "{", many(all(CFG.fpat, ",")), "}"),
    tliteral,
    "_",
    all("(", CFG.pat, ")"),
    all("(", CFG.pat, ",", CFG.pat, many(all(",", CFG.pat))),
    all("[", CFG.pat, many(all(",", CFG.pat)), "]"),
    all("~", CFG.apat),
));
CFG.fpat.set(all(
    CFG.qvar, "=", CFG.pat,
));
CFG.gcon.set(any(
    "()", "[]", all("(", ",", many(","), ")"), CFG.qcon,
));
CFG.var.set(any(
    tvarid, all("(", tvarsym, ")"),
));
CFG.qvar.set(any(
    tqvarid, all("(", tqvarsym, ")"),
));
CFG.con.set(any(
    tconid, all("(", tconsym, ")"),
));
CFG.qcon.set(any(
    tqconid, all("(", CFG.gconsym, ")"),
));
CFG.varop.set(any(
    tvarsym, all("`", tvarid, "`"),
));
CFG.qvarop.set(any(
    tqvarsym, all("`", tqvarid, "`"),
));
CFG.conop.set(any(
    tconsym, all("`", tconid, "`"),
));
CFG.qconop.set(any(
    CFG.gconsym, all("(", tqconid, ")"),
));
CFG.op.set(any(
    CFG.varop, CFG.conop,
));
CFG.qop.set(any(
    CFG.qvarop, CFG.qconop,
));
CFG.gconsym.set(any(
    ":", tqconsym,
));