const util = require("util");
const { Obj, Arr } = require("@masaeedu/fp");

const { Var, Lam, App, show, beta_ } = require(".");

const log = v => {
  console.log(util.inspect(v, null, null));
};

// Following along with https://glebec.github.io/lambda-talk
const tests = (() => {
  const I = Lam(Var(0));
  const M = Lam(App(Var(0))(Var(0)));
  const K = Lam(Lam(Var(1)));
  const C = Lam(Lam(Lam(App(App(Var(2))(Var(0)))(Var(1)))));
  const B = Lam(Lam(Lam(App(Var(2))(App(Var(1))(Var(0))))));

  const NOT = C;
  const T = K;
  const F = App(NOT)(T);

  const AND = Lam(Lam(App(App(Var(1))(Var(0)))(F)));
  const OR = Lam(Lam(App(App(Var(1))(T))(Var(0))));

  const T1 = App(App(AND)(T))(F);
  const T2 = App(App(AND)(T))(T);
  const T3 = App(App(OR)(F))(F);
  const T4 = App(App(OR)(T))(F);

  const SUCC = Lam(Lam(Lam(App(Var(1))(App(App(Var(2))(Var(1)))(Var(0))))));

  const N0 = Lam(I);
  const N1 = App(SUCC)(N0);
  const N2 = App(SUCC)(N1);
  const N3 = App(SUCC)(N2);
  const N4 = App(SUCC)(N3);

  const ADD = Lam(Lam(App(App(Var(1))(SUCC))(Var(0))));

  const N7 = App(App(ADD)(N3))(N4);

  const MUL = B;

  const N6 = App(App(MUL)(N3))(N2);

  const EXP = Lam(Lam(App(Var(0))(Var(1))));

  const T5 = App(App(EXP)(N4))(N0);
  const T6 = App(App(EXP)(N4))(N2);

  const ISZERO = Lam(App(App(Var(0))(Lam(F)))(T));

  const T7 = App(ISZERO)(N0);

  const PAIR = Lam(Lam(Lam(App(App(Var(0))(Var(2)))(Var(1)))));

  const FST = Lam(App(Var(0))(T));
  const SND = Lam(App(Var(0))(F));

  const SET_FST = Lam(Lam(App(App(PAIR)(Var(1)))(App(SND)(Var(0)))));
  const SET_SND = Lam(Lam(App(App(PAIR)(App(FST)(Var(0))))(Var(1))));

  const PHI = Lam(
    App(App(PAIR)(App(SND)(Var(0))))(App(SUCC)(App(SND)(Var(0))))
  );

  const PRED = Lam(App(FST)(App(App(Var(0))(PHI))(App(App(PAIR)(N0))(N0))));
  const SUB = Lam(Lam(App(App(Var(0))(PRED))(Var(1))));

  const T8 = App(App(SUB)(N4))(N2);

  const LEQ = Lam(Lam(App(ISZERO)(App(App(SUB)(Var(1)))(Var(0)))));
  const EQ = Lam(
    Lam(
      App(App(AND)(App(App(LEQ)(Var(1)))(Var(0))))(
        App(App(LEQ)(Var(0)))(Var(1))
      )
    )
  );

  const T9 = App(App(EQ)(N4))(App(App(ADD)(N2))(N2));

  const FIB_ = Lam(
    Lam(Lam(App(App(Var(2))(Var(0)))(App(App(ADD)(Var(1)))(Var(0)))))
  );
  const FIB = Lam(App(App(App(App(Var(0))(FIB_))(K))(N0))(N1));

  const T10 = App(FIB)(N6);

  return {
    I,
    M,
    K,
    C,
    B,

    NOT,
    T,
    F,
    AND,
    OR,

    T1,
    T2,
    T3,
    T4,

    SUCC,

    N0,
    N1,
    N2,
    N3,
    N4,

    ADD,

    N7,

    MUL,

    N6,

    EXP,

    T5,
    T6,

    ISZERO,

    T7,

    PAIR,
    FST,
    SND,
    SET_FST,
    SET_SND,
    PHI,

    PRED,
    SUB,

    T8,

    LEQ,
    EQ,

    T9,

    FIB_,
    FIB,

    T10
  };
})();

const test = expr => ({ i: show(expr), o: show(beta_(expr)) });
log(Obj.map(test)(tests));
