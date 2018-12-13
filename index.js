const { adt, match } = require("@masaeedu/adt");
const { Fn } = require("@masaeedu/fp");

const cata = F => alg => {
  const rec = x => alg(F.map(rec)(x));
  return rec;
};

// :: type Fix f = f (Fix f)
// :: type ULCExprFDT r = { Var: [Int], Lam: [r], App: [r, r] }
// :: type ULCExprF r = Value (ULCExprFDT r)
// :: type ULCExpr = Fix ULCExprF

// :: ADT ULCExprFDT
const ULCExprF = adt({
  Var: ["Int"],
  Lam: ["r"],
  App: ["r", "r"]
});
const { Var, Lam, App } = ULCExprF;

// :: Functor ULCExprF
const F = (() => {
  const map = f =>
    match({
      Var,
      Lam: b => Lam(f(b)),
      App: h => v => App(f(h))(f(v))
    });

  return { map };
})();

// :: ULCExpr -> String
const show = cata(F)(
  match({
    Var: n => `#${n}`,
    Lam: x => `(λ ${x})`,
    App: f => v => `($ ${f} ${v})`
  })
);

// Increment the depth of all the free variables in an expression by some amount
// :: Int -> ULCExpr -> ULCExpr
const deepen = n => {
  const rec = d =>
    match({
      Var: n_ => Var(n_ > d ? n_ + n : n_),
      Lam: b => Lam(rec(d + 1)(b)),
      App: f => a => App(rec(d)(f))(rec(d)(a))
    });
  return rec(-1);
};

// :: Int -> ULCExpr -> ULCExpr -> ULCExpr
const subst = v => {
  const rec = d =>
    match({
      // If the variable is referencing the lambda argument we're eliminating,
      // perform a substitution (adjusting free variables in the substituted expression)
      //
      // If the variable references an argument entirely beyond the current depth,
      // decrement it, as it's a free variable
      //
      // Otherwise, leave the variable unchanged
      Var: n_ => (n_ === d ? deepen(d)(v) : n_ > d ? Var(n_ - 1) : Var(n_)),
      Lam: b => Lam(rec(d + 1)(b)),
      App: f => a => App(rec(d)(f))(rec(d)(a))
    });

  return rec(0);
};

// Eliminates a beta redex of the form `App (Lam b) v` by substituting `v` throughout `b`
// Leaves any other expressions alone
// :: ULCExpr -> ULCExpr
const beta = match({
  Var,
  Lam,
  App: match({
    Var: n => App(Var(n)),
    App: f => v => App(App(f)(v)),
    Lam: Fn.flip(subst)
  })
});

// Repeatedly eliminate beta redexes throughout an expression until it is in
// beta normal form, or at least until it is idempotent with respect to beta
// reduction (an example of this latter case is the omega combinator)
// :: ULCExpr -> ULCExpr
const beta_ = expr => {
  let done = false;
  while (!done) {
    const result = cata(F)(beta)(expr);
    done = show(expr) === show(result);
    expr = result;
  }
  return expr;
};

module.exports = {
  Var,
  Lam,
  App,
  show,
  beta,
  beta_
};
