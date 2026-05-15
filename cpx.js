// simple library for handling complex numbers in js
π = Math.PI; τ = 2*π;
//["sqrt", "exp", "log", "sin", "cos", "atan2"].forEach((f,i) => { window[f] = Math[f]; });
cpx = (r=1,i=0) => ({ r:r, i:i });
cneg = (a) => cpx(-a.r, -a.i);
cadd = (a,b) => cpx(a.r+b.r, a.i+b.i);
csub = (a,b) => cpx(a.r-b.r, a.i-b.i);
cscale = (s,a) => cpx(s*a.r, s*a.i);
cconj = (a) => cpx(a.r, -a.i);
cmul = (a,b) => cpx(a.r*b.r - a.i*b.i, a.r*b.i+a.i*b.r);
cnormsq = (a) => a.r*a.r + a.i*a.i;
cnorm = (a) => sqrt(cnormsq(a));
cinv = (a) => cscale(1/cnormsq(a), cconj(a));
cangle = (a) => (atan2(a.i, a.r)+τ)%τ;
iexp = (x) => cpx(cos(x), sin(x));
cexp = (a) => cscale(exp(a.r), iexp(a.i));
clog = (a) => cpx(log(cnorm(a)), atan2(a.i, a.r));
