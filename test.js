const util = require("util");
const { Obj, Arr } = require("@masaeedu/fp");

const { ref, lam, app, show, beta_ } = require(".");

const log = v => {
  console.log(util.inspect(v, null, null));
};

// Following along with https://glebec.github.io/lambda-talk
const tests = (() => {
  const I = lam(ref(0));
  const M = lam(app(ref(0))(ref(0)));
  const K = lam(lam(ref(1)));
  const C = lam(lam(lam(app(app(ref(2))(ref(0)))(ref(1)))));
  const B = lam(lam(lam(app(ref(2))(app(ref(1))(ref(0))))));

  const NOT = C;
  const T = K;
  const F = app(NOT)(T);

  const AND = lam(lam(app(app(ref(1))(ref(0)))(F)));
  const OR = lam(lam(app(app(ref(1))(T))(ref(0))));

  const T1 = app(app(AND)(T))(F);
  const T2 = app(app(AND)(T))(T);
  const T3 = app(app(OR)(F))(F);
  const T4 = app(app(OR)(T))(F);

  const SUCC = lam(lam(lam(app(ref(1))(app(app(ref(2))(ref(1)))(ref(0))))));

  const N0 = lam(I);
  const N1 = app(SUCC)(N0);
  const N2 = app(SUCC)(N1);
  const N3 = app(SUCC)(N2);
  const N4 = app(SUCC)(N3);

  const ADD = lam(lam(app(app(ref(1))(SUCC))(ref(0))));

  const N7 = app(app(ADD)(N3))(N4);

  const MUL = B;

  const N6 = app(app(MUL)(N3))(N2);

  const EXP = lam(lam(app(ref(0))(ref(1))));

  const T5 = app(app(EXP)(N4))(N0);
  const T6 = app(app(EXP)(N4))(N2);

  const ISZERO = lam(app(app(ref(0))(lam(F)))(T));

  const T7 = app(ISZERO)(N0);

  const PAIR = lam(lam(lam(app(app(ref(0))(ref(2)))(ref(1)))));

  const FST = lam(app(ref(0))(T));
  const SND = lam(app(ref(0))(F));

  const SET_FST = lam(lam(app(app(PAIR)(ref(1)))(app(SND)(ref(0)))));
  const SET_SND = lam(lam(app(app(PAIR)(app(FST)(ref(0))))(ref(1))));

  const PHI = lam(
    app(app(PAIR)(app(SND)(ref(0))))(app(SUCC)(app(SND)(ref(0))))
  );

  const PRED = lam(app(FST)(app(app(ref(0))(PHI))(app(app(PAIR)(N0))(N0))));
  const SUB = lam(lam(app(app(ref(0))(PRED))(ref(1))));

  const T8 = app(app(SUB)(N4))(N2);

  const LEQ = lam(lam(app(ISZERO)(app(app(SUB)(ref(1)))(ref(0)))));
  const EQ = lam(
    lam(
      app(app(AND)(app(app(LEQ)(ref(1)))(ref(0))))(
        app(app(LEQ)(ref(0)))(ref(1))
      )
    )
  );

  const T9 = app(app(EQ)(N4))(app(app(ADD)(N2))(N2));

  const FIB_ = lam(
    lam(lam(app(app(ref(2))(ref(0)))(app(app(ADD)(ref(1)))(ref(0)))))
  );
  const FIB = lam(app(app(app(app(ref(0))(FIB_))(K))(N0))(N1));

  const T10 = app(FIB)(N6);

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
