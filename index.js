const util = require("util");
const { adt, match } = require("@masaeedu/adt");
const { Obj, Arr, Fn } = require("@masaeedu/fp");

const cata = F => alg => {
  const rec = x => alg(F.map(rec)(x));
  return rec;
};

const hylo = F => alg => coalg => {
  const rec = x => alg(F.map(rec)(coalg(x)));
  return rec;
};

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

const iterate = n => f => Fn.pipe(Arr.replicate(n)(f));

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
  Var: n => `#${n}`,
  Lam: x => `(λ ${show(x)})`,
  App: f => v => `($ ${show(f)} ${show(v)})`
});

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

// :: type ULCExprF r = Value (ULCExprFDT r)
// :: type ULCExpr = Fix ULCExprF

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

// Eliminates a beta redex of the form `(Lam b) v` by substituting `v` throughout `b`
// Leaves any other expressions alone
// :: ULCExpr -> ULCExpr
const beta = match({
  Var,
  Lam,
  App: match({
    Var: n => App(Var(n)),
    App: f => v => v_ => App(App(f)(v))(v_),
    Lam: b => v => subst(v)(b)
  })
});

const beta_ = hylo(F)(beta)(beta);

// Test

const tests = (() => {
  const I = Lam(Var(0));
  const M = Lam(App(Var(0))(Var(0)));

  const K = Lam(Lam(Var(1)));
  const C = Lam(Lam(Lam(App(App(Var(2))(Var(0)))(Var(1)))));

  const NOT = C;
  const T = K;
  const F = App(NOT)(T);

  const AND = Lam(Lam(App(App(Var(1))(Var(0)))(F)));
  const OR = Lam(Lam(App(App(Var(1))(T))(Var(0))));

  const T1 = App(App(AND)(T))(F);
  const T2 = App(App(AND)(T))(T);
  const T3 = App(App(OR)(F))(F);
  const T4 = App(App(OR)(T))(F);

  return { I, M, K, C, NOT, T, F, AND, T1, T2, T3, T4 };
})();

const test = expr => ({ i: show(expr), o: show(beta_(expr)) });
log(Obj.map(test)(tests));

module.exports = {
  Var,
  Lam,
  App,
  show,
  tests,
  test,
  subst,
  beta,
  beta_,
  iterate
};
