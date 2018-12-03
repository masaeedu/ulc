const util = require("util");
const { adt, match } = require("@masaeedu/adt");
const { Obj } = require("@masaeedu/fp");

const log = v => {
  console.log(util.inspect(v, null, null));
};

const trace = f => input => {
  let output = undefined;
  try {
    output = f(typeof input === "function" ? trace(input) : input);
    return typeof output === "function" ? trace(output) : output;
  } finally {
    log({ input, output });
  }
};

// Untyped lambda calculus
// :: type ULCExprFDT r = { Var: [Int], Lam: [r], App: [r, r] }

// :: ADT ULCExprFDT
const ULCExprF = adt({
  Var: ["Int"],
  Lam: ["r"],
  App: ["r", "r"]
});
const { Var, Lam, App } = ULCExprF;

// :: ULCExpr -> String
const show = match({
  Var: n => `(Var ${n})`,
  Lam: x => `(Lam ${show(x)})`,
  App: f => v => `(App ${show(f)} ${show(v)})`
});

// :: type ULCExprF r = Value (ULCExprFDT r)
// :: type ULCExpr = Fix ULCExprF

const tests = (() => {
  const I = Lam(Var(0));
  const K = Lam(Lam(Var(1)));
  const C = Lam(Lam(Lam(App(App(Var(2))(Var(0)))(Var(1)))));

  const NOT = C;
  const T = K;
  const F = App(NOT)(T);

  return { I, K, C, NOT, T, F };
})();

// TODO: There's a bug either in subst or in beta that gives the wrong result for
// beta (App (Lam (Lam (Var (1)))) (Var (0)))
// This produces:
// Lam (Var (0))
// Which is wrong; it mixes up scopes. When substituting expressions, the depth of
// all free variables in the expression being substituted needs to be bumped by 1

// :: Int -> ULCExpr -> ULCExpr -> ULCExpr
const subst = n => v =>
  match({
    Var: n_ => (n_ === n ? v : Var(n_)),
    Lam: b => Lam(subst(n + 1)(v)(b)),
    App: f => a => App(subst(n)(v)(f))(subst(n)(v)(a))
  });

// Eliminates a beta redex of the form `(Lam b) v` by substituting `v` throughout `b`
// Leaves any other expressions alone
// :: ULCExpr -> ULCExpr
const beta = match({
  Var,
  Lam,
  App: match({
    Var: n => App(Var(n)),
    App: f => v => v_ => App(App(f)(v))(v_),
    Lam: b => v => subst(0)(v)(b)
  })
});

// :: Functor ULCExprF
const F = {
  map: f =>
    match({
      Var,
      Lam: b => Lam(f(b)),
      App: f => v => App(beta(f))(beta(v))
    })
};

const hylo = F => alg => coalg => {
  const rec = x => alg(F.map(rec)(coalg(x)));
  return rec;
};

const beta_ = hylo(F)(beta)(beta);

// Test
const test = expr => log({ inp: show(expr), out: show(beta(expr)) });
Obj.map(test)(tests);

module.exports = { Var, Lam, App, show, tests, test, subst, beta };
