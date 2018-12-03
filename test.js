// (Lam (Lam (App (App (Lam (Lam (Var 1))) (Var 0)) (Var 1))))

const f = x => y => (x => y => x)(y)(x);
console.log(f(1)(2));
