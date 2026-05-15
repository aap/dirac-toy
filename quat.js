// simple library for handling quaternions in js
π = Math.PI; τ = 2*π;
//["sqrt", "exp", "log", "sin", "cos", "atan2"].forEach((f,i) => { window[f] = Math[f]; });
quat = (w=1,x=0,y=0,z=0) => ({w:w, x:x, y:y, z:z});
qvec = (q) => quat(0, q.x, q.y, q.z);
qneg = (q) => quat(-q.w, -q.x, -q.y, -q.z);
qadd = (p,q) => quat(p.w+q.w, p.x+q.x, p.y+q.y, p.z+q.z);
qsub = (p,q) => quat(p.w-q.w, p.x-q.x, p.y-q.y, p.z-q.z);
qscale = (s,q) => quat(s*q.w, s*q.x, s*q.y, s*q.z);
qconj = (q) => quat(q.w, -q.x, -q.y, -q.z);
qmul = (p,q) => quat(
  p.w*q.w - p.x*q.x - p.y*q.y - p.z*q.z,
  p.w*q.x + p.x*q.w + p.y*q.z - p.z*q.y,
  p.w*q.y + p.y*q.w + p.z*q.x - p.x*q.z,
  p.w*q.z + p.z*q.w + p.x*q.y - p.y*q.x
);
qinner = (p,q) => p.w*q.w + p.x*q.x + p.y*q.y + p.z*q.z;
qscalar = (p,q) => p.w*q.w - p.x*q.x - p.y*q.y - p.z*q.z;
qnormsq = (q) => q.w*q.w + q.x*q.x + q.y*q.y + q.z*q.z;
qnorm = (q) => sqrt(qnormsq(q));
qinv = (q) => qscale(1/qnormsq(q), qconj(q));
qnormalized = (q) => qscale(1/qnorm(q), q);
qsqrtnorm = (q) => qnormalized(qadd(q, quat(1)));	// q normalized before and after
qfromto = (u, v) => qsqrtnorm(qmul(quat(0,v.x,v.y,v.z), quat(0,-u.x,-u.y,-u.z)));
qsandwich = (q, v) => qmul(q, qmul(v, qconj(q)));
qrefl = (q, v) => qmul(q, qmul(v, q));
qrsandwich = (q, v) => qmul(qconj(q), qmul(v, q));
qrotate = (q, v) => qmul(q, qmul(qvec(v), qinv(q)));
qrrotate = (q, v) => qmul(qinv(q), qmul(qvec(v), q));
qexp = (q) => {
  let qv = qvec(q);
  let l = qnorm(qv);
  if(l == 0)
    return quat(exp(q.w));
  return qscale(exp(q.w), qadd(quat(cos(l)), qscale(sin(l)/l, qv)));
}
qlog = (q) => {
  let l = qnorm(q);
  q = qscale(1/l, q);
  let c = q.w; q.w = 0;
  let s = qnorm(q);
  if(s == 0)
    return quat(log(l));
  return qadd(quat(log(l)), qscale(atan2(s,c)/s, q));
}
qpow = (q, a) => qexp(qscale(a, qlog(q)));
qcross = (p,q) => qscale(0.5, qsub(qmul(p,q), qmul(q,p)));

qlerp = (from, to, t) => qadd(from, qscale(t, qsub(to, from)))
qcomm = (p,q) => qsub(qmul(p,q), qmul(q,p));
qanticomm = (p,q) => qadd(qmul(p,q), qmul(q,p));
