dquat = (r = quat(1), d = quat(0)) => ({r:r, d:d});
drquat = (r = 1) => dquat(quat(r));
dneg = (d) => dquat(qneg(d.r), qneg(d.d));
dadd = (p,q) => dquat(qadd(p.r,q.r), qadd(p.d,q.d));
dsub = (p,q) => dquat(qsub(p.r,q.r), qsub(p.d,q.d));
dscale = (s,d) => dquat(qscale(s,d.r), qscale(s,d.d));
drev = (d) => dquat(qconj(d.r), qconj(d.d));
dconj = (d) => dquat(qconj(d.r), qneg(qconj(d.d)));
dmul = (p,q) => dquat(qmul(p.r,q.r), qadd(qmul(p.r,q.d), qmul(p.d,q.r))); 
dsandwich = (d, v) => dmul(d, dmul(v, dconj(d)));
dnormsq = (d) => qnormsq(d.r);  // is this right?
dnorm = (d) => sqrt(dnormsq(d));
dnormalized = (d) => {
  let r = dnormsq(d);
  let n = 1/sqrt(r);
  let s = qinner(d.r,d.d)/r;
  return dscale(n, dquat(d.r, qsub(d.d, qscale(s, d.r))));
};
dsqrtnorm = (d) => dnormalized(dadd(d, d1));

dcomm = (a,b) => dsub(dmul(a,b), dmul(b,a));
danticomm = (a,b) => dadd(dmul(a,b), dmul(b,a));

const d0 = dquat(quat(0), quat(0));
const d1 = dquat(quat(1), quat(0));

function decomposeBivec(B) {
  // got given bivectors: B = p + εq
  let [p, q] = [B.r, B.d];
  // want: b₁ + b₂ = B
  //       b₁B = (B^B)/2 = xε
  // b₁ = (a + εb)
  // b₁(p + εq) = ap + ε(aq + bp) = xε  x = p·q
  // => a = 0. V(bp) = 0. S(bp) = x
  // b = λp. λp^2 = x. λ = x/p^2
  let l = qmul(p,p).w;
  if(l == 0) return [B, d0];
  let λ = qscalar(p,q)/l;
  let b1 = dquat(quat(0), qscale(λ, p));
  let b2 = dsub(B, b1);
  return [b1, b2];
}

function decomposeRotor(R) {
  let [p, q] = [R.r, R.d];
  let pv = qvec(p);
  let l = qscalar(pv,pv);
  if(l == 0) return [R, d1];
  let R1 = dquat(quat(1), qscale(q.w/l, pv));
  let R2 = dmul(R, drev(R1));
  return [R1, R2];
}

function simpleLog(R) {
  let B = dquat(qvec(R.r), qvec(R.d));
  let B2 = dmul(B, B);
  if(abs(B2.r.w) < 0.00000001) {
    return B;
  } else if(B2.r.w < 0) {
    let [c, s] = [R.r.w, sqrt(-B2.r.w)];
    if(s == 0) return d0;  // only when normalized
    return dscale(atan2(s,c)/s, B);
  }
  // not possible
  console.log("positive bivector???", B2);
}

function simpleExp(B) {
  let B2 = dmul(B, B);
  if(abs(B2.r.w) < 0.00000001) {
    return dadd(d1, B);
  } else if(B2.r.w < 0) {
    let θ = sqrt(-B2.r.w);
    return dadd(drquat(cos(θ)), dscale(sin(θ)/θ, B));
  }
  // not possible
  console.log("positive bivector???", B, B2);
}

let ε = 1e-13;
feq = (a,b) => abs(a-b) < ε;
istranslation = (R) => feq(qnormsq(qvec(R.r)), 0) && !feq(qnormsq(qvec(R.d)), 0);

function dlogR(R) {
  let [R1, R2] = decomposeRotor(R);
  if(istranslation(R) && R.r.w < 0) {
    // we have a -1 that links the two
    if(istranslation(R2)) [R1, R2] = [R2, R1];
    let L2 = dquat(qscale(τ, qnormalized(R1.d)));
    return dadd(simpleLog(dneg(R1)), L2);
  }
  return dadd(simpleLog(R1), simpleLog(R2));
}

function dexpB(B) {
  let [b1, b2] = decomposeBivec(B);
  return dmul(simpleExp(b1), simpleExp(b2));
}

dlerp = (from, to, t) => dadd(from, dscale(t, dsub(to, from)))
