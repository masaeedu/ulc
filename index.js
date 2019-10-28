const { adt, match } = require("@masaeedu/adt");
const { Fn, cata } = require("@masaeedu/fp");

// We're going to make a quick and dirty implementation of the untyped lambda calculus:
// - Frilly features like a syntax, named variables, or literals will be eschewed. :)
// - Programs are defined directly as JS values of the expression ADT (which are serializable to JSON)
// - As with any good untyped lambda calculus, the implementation is Turing complete, so we can
//   (extremely tediously) implement the fibonacci function

const exprF = (() => {
  // The constructors of the ADT
  const a = adt({ ref: ["int"], lam: ["r"], app: ["r", "r"] });

  // The functor (we want to map over recursive positions)
  const map = f =>
    match({
      ref,
      lam: b => lam(f(b)),
      app: h => v => app(f(h))(f(v))
    });

  return { ...a, map };
})();

const { ref, lam, app } = exprF;

// Serializing expressions
const show = cata(exprF)(
  match({
    ref: n => `#${n}`,
    lam: x => `(λ ${x})`,
    app: f => v => `($ ${f} ${v})`
  })
);

// Ok, now we're going to dive directly into the runtime semantics of the language

// The only thing we need to implement is beta reduction, which...

// Eliminates a "beta redex" of the form `app (lam f) v` by substituting `v` throughout `f`
// Leaves any other expressions alone
const beta = match({
  ref,
  lam,
  app: match({
    ref: n => app(ref(n)),
    app: f => v => app(app(f)(v)),
    lam: f => v => subst(v)(f) // If we do have an `app (lam f) v`, we need to substitute it
  })
});

// Given some expression, use it to replace all references to the bound variable of a
// lambda expression within its body
const subst = v => {
  const alg = match({
    // If the variable is referencing the lambda argument we're eliminating, perform a
    // substitution ("deepening" free variables in the substituted expression). See
    // `deepen` below

    // If the variable references an argument entirely beyond the current depth,
    // decrement it, as it's a free variable

    // Otherwise, leave the variable unchanged
    ref: n_ => d => (n_ === d ? deepen(d)(v) : n_ > d ? ref(n_ - 1) : ref(n_)),
    lam: b => d => lam(b(d + 1)),
    app: f => a => d => app(f(d))(a(d))
  });

  return Fn.flip(cata(exprF)(alg))(0);
};

// Increment the depth of all the free variables in an expression by some amount.
const deepen = n => {
  const alg = match({
    ref: n_ => d => ref(n_ > d ? n_ + n : n_),
    lam: b => d => lam(b(d + 1)),
    app: f => a => d => app(f(d))(a(d))
  });

  return Fn.flip(cata(exprF)(alg))(-1);
};

// That's all well and good, but beta reducing once, might end up introducing
// new beta redexes (e.g. `(x => x(2))(x => x)` -> `(x => x)(2)`). So the stupid
// thing to do is just keep trying to beta reduce until the expression stops
// changing.

// And that's just what we're going to do...

// Repeatedly eliminate beta redexes throughout an expression until it is in
// beta normal form, or at least until it is idempotent with respect to beta
// reduction (an example of this latter case is the omega combinator, which
// can never be beta reduced to a beta normal form)
const beta_ = expr => {
  let done = false;
  while (!done) {
    const result = cata(exprF)(beta)(expr);
    done = show(expr) === show(result);
    expr = result;
  }
  return expr;
};

module.exports = {
  ref,
  lam,
  app,
  show,
  beta,
  beta_
};
