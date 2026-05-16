const xaxis = quat(0,1,0,0);
const yaxis = quat(0,0,1,0);
const zaxis = quat(0,0,0,1);
const ρ1 = quat(0,1,0,0);
const ρ2 = quat(0,0,1,0);
const ρ3 = quat(0,0,0,1);
const nρ1 = quat(0,-1,0,0);
const nρ2 = quat(0,0,-1,0);
const nρ3 = quat(0,0,0,-1);
const dxaxis = dquat(quat(0), quat(0,1,0,0));
const dyaxis = dquat(quat(0), quat(0,0,1,0));
const dzaxis = dquat(quat(0), quat(0,0,0,1));
["cosh", "sinh"].forEach(f => { window[f] = Math[f]; });

pnt = (x, y, z) => dquat(quat(1,0,0,0), quat(0, x, y, z));
xlate = (x, y, z) => dquat(quat(1,0,0,0), quat(0, x/2, y/2, z/2));

// make a vector space for spinors
sneg = (ψ) => [qneg(ψ), qneg(ψ[1])];
sadd = (ψ,χ) => [qadd(ψ[0],χ[0]), qadd(ψ[1], χ[1])];
ssub = (ψ,χ) => [qsub(ψ[0],χ[0]), qsub(ψ[1], χ[1])];
sscale = (s,ψ) => [qscale(s,ψ[0]), qscale(s,ψ[1])];
snormalized = (ψ) => {
  const n = sqrt(qnormsq(ψ[0]) + qnormsq(ψ[1]));
  return n > 1e-8 ? sscale(1/n, ψ) : ψ;
}

function applyDQuat(R) {
  let x = dsandwich(R, dxaxis);
  let y = dsandwich(R, dyaxis);
  let z = dsandwich(R, dzaxis);
  let p = dsandwich(R, d1);
  applyMatrix(x.d.x, x.d.y, x.d.z, 0,
              y.d.x, y.d.y, y.d.z, 0,
              z.d.x, z.d.y, z.d.z, 0,
              p.d.x, p.d.y, p.d.z, 1);
}

function dline(p1,p2) { line(p1.d.x,p1.d.y,p1.d.z, p2.d.x,p2.d.y,p2.d.z); }

let hand;
function nop() {}
const CTRL_H  = 300;
const PANEL_W = 280;

function setup() {
  window._globalP5 = this;
  pixelDensity(1);
  W = window.innerWidth - PANEL_W;
  H = window.innerHeight;
  createCanvas(W, H - CTRL_H, WEBGL);
  noFill();
  let d = 0.35;
  camera(600*d, -200*d, 180*d, 0, 0, 0, 0, 0, -1);
  smooth();
  ψ = mkid(snormalized([quat(1), quat(1)]));
  hand = loadModel('hand.obj', false, () => { draw(); noLoop(); }, nop);
}

let W, H;

function windowResized() {
  W = window.innerWidth - PANEL_W;
  H = window.innerHeight;
  resizeCanvas(W, H - CTRL_H);
}

function drawHand(lr) {
  push();
  scale(-lr,lr,lr);
  scale(20);
  rotateY(π);
  rotateX(π/2);
  translate(0,0,-1);
  model(hand);
  pop();
}
function drawLHand() { drawHand(1); }
function drawRHand() { drawHand(-1); }

function drawSpinorBelt(from, to, n=20) {
  function beltLine() { line(5,0,0, -5,0,0); }
  noFill();
  for(let i = 0; i < n; i++) {
    let R = dlerp(from, to, i/n);
    push();
    applyDQuat(R);
    beltLine();
    pop();
  }
}

function drawSpinor(from, to, hand=drawLHand, n=20) {
  push();
  applyDQuat(to);
  hand();
  pop();
  drawSpinorBelt(from, to, n);
}

function drawWeylSpinor(from, d, ψ, hand, n=20) {
  d *= qinner(ψ, ψ);
  if(d*d < 0.00000001) return;
  let to = dmul(dquat(qnormalized(ψ)), xlate(0,0,d));
  drawSpinor(from, to, hand, n);
  return to;
}

qinterp = (t, a, b) => {
  let la = qlog(a), lb = qlog(b);
  let lx = qadd(qscale(1-t, la), qscale(t, lb));
  return qexp(lx);
}

dinterp = (t, a, b) => {
  let la = dlogR(a), lb = dlogR(b);
  let lx = dadd(dscale(1-t, la), dscale(t, lb));
  return dexpB(lx);
}

mkid = (x) => { return (t) => x; }
mkanim = (init, fun, len=0.7) => {
  let animstart = millis()/1000;
  let animend = animstart + len;
  let val = init;
  window._animating = true;
  return (t) => {
    let θ = map(t, animstart, animend, 0, 1);
    if (θ >= 1) window._animating = false;
    return fun(θ >= 0 && θ < 1 ? θ : 1, val);
  }
}
let ψ;
spinctrl = 0;

qhinner = (p,q) => p.w*q.w + p.z*q.z + p.x*q.x + p.y*q.y;

flipR = (ψ) => [ψ[0], qneg(ψ[1])];

mirrorSpace13 = (ψ,q) => [qmul(q, qmul(ψ[1], nρ3)), qmul(q, qmul(ψ[0], ρ3))];
mirrorSpace31 = (ψ,q) => [qmul(q, ψ[1]), qneg(qmul(q, ψ[0]))];
mirrorP13 = (ψ) => [ψ[1], ψ[0]];
mirrorP31 = (ψ) => [qmul(ψ[1], ρ3), qmul(ψ[0], ρ3)];
mirrorCT = (ψ) => mirrorSpace13(mirrorSpace13(mirrorSpace13(ψ,ρ3),ρ2),ρ1);
cqconj = (q) => quat(q.w, -q.x, q.y, -q.z);
Cconj = (ψ) => [qmul(nρ2, cqconj(ψ[1])), qmul(ρ2, cqconj(ψ[0]))]

// spacetime connection - Spin(1,3)
spin3 = (θ,q,ψ) => {
  let R = qexp(qscale(θ, q));
  return [qmul(R, ψ[0]), qmul(R, ψ[1])];
}
boost = (θ,q,ψ) => {
  let [c, s] = [cosh(θ), sinh(θ)];
  return [qadd(qscale(c, ψ[0]), qscale(s, qmul(q, qmul(ψ[0], nρ3)))),
          qadd(qscale(c, ψ[1]), qscale(s, qmul(q, qmul(ψ[1], ρ3))))];
}

// not really used
spin3X = (θ,q,ψ) => {
  let R = qexp(qscale(θ, q));
  return [qmul(R, ψ[0]), qmul(qconj(R), ψ[1])];
}
spinAxis = (θ,ψ) => [qspinPhase(θ,ψ[0]), qspinPhase(-θ,ψ[1])];

// gauge connections
spinPhase = (θ,ψ) => [qspinPhase(θ,ψ[0]), qspinPhase(θ,ψ[1])];
boostX = (θ,q,ψ) => {
  let [c, s] = [cosh(θ), sinh(θ)];
  return [qadd(qscale(c, ψ[0]), qscale(s, qmul(q, qmul(ψ[0], nρ3)))),
          qadd(qscale(c, ψ[1]), qscale(s, qmul(q, qmul(ψ[1], nρ3))))];
}

// chiral: act on one chirality only by composing at half angle
spin3LX = (θ,q,ψ) => spin3X( θ/2,q, spin3(θ/2,q,ψ));
spin3RX = (θ,q,ψ) => spin3X(-θ/2,q, spin3(θ/2,q,ψ));
boostLX = (θ,q,ψ) => boostX( θ/2,q, boost(θ/2,q,ψ));
boostRX = (θ,q,ψ) => boostX(-θ/2,q, boost(θ/2,q,ψ));

// also nice to have
spin3R = (θ,ψ,q) => {
  let R = qexp(qscale(θ, q));
  return [qmul(ψ[0], R), qmul(ψ[1], R)];
}

// single spinors
qspin3 = (θ,q,ψ) => qmul(qexp(qscale(θ, q)), ψ);
qspin3R = (θ,ψ,q) => qmul(ψ, qexp(qscale(θ, q)));
qspinPhase = (θ,ψ) => qspin3R(θ,ψ,ρ3);
qspinPhaseUp = (q,θ) => {
  let R = qexp(qscale(θ/2, ρ3));
  return qmul(R, qmul(q, R));
}
qspinPhaseDown = (q,θ) => {
  let R = qexp(qscale(θ/2, ρ3));
  return qmul(qconj(R), qmul(q, R));
}
qspinLocalY = (q,θ) => qmul(q, qexp(qscale(-θ, ρ2)));

function makeEigen(ψ, op, sgn) {
  let χ = op(ψ);
  return snormalized(sadd(ψ, sscale(sgn, χ)));
}
makeDirac    = (ψ, sgn) => makeEigen(ψ, mirrorP13, sgn);
makeWeyl     = (ψ, sgn) => makeEigen(ψ, flipR, sgn);
makeMajorana = (ψ, sgn) => makeEigen(ψ, Cconj, sgn);

function lerpAnim(target) { ψ = mkanim(ψ(-1), (t,ψ) =>
  [qlerp(ψ[0], target[0], t), qlerp(ψ[1], target[1], t)]);
}
function spin3Anim(θ,q)   { ψ = mkanim(ψ(-1), (t,ψ) => spin3(θ*t,q,ψ)); }
function spinPhaseAnim(θ) { ψ = mkanim(ψ(-1), (t,ψ) => spinPhase(θ*t,ψ)); }
function spinAxisAnim(θ)  { ψ = mkanim(ψ(-1), (t,ψ) => spinAxis(θ*t,ψ)); }
function boostAnim(θ,q)   { ψ = mkanim(ψ(-1), (t,ψ) => boost(θ*t,q,ψ)); }

function drawCoordSystem() {
  let sz = 20;
  stroke(255,0,0);   line(0,0,0, sz,0,0);
  stroke(0,255,0);   line(0,0,0, 0,sz,0);
  stroke(0,0,255);   line(0,0,0, 0,0,sz);
}

let _prevMousePressed = false;
function mouseDragged() { if (window.wake) wake(); }
function touchMoved()   { if (window.wake) wake(); }
function keyPressed()   { if (window.wake) wake(); }

function draw() {
  if (window._animating && window.wake) wake();
  background(0);
  if (window._uiActive || !_prevMousePressed) {
    window._globalP5._setProperty('movedX', 0);
    window._globalP5._setProperty('movedY', 0);
    if (_renderer) _renderer.prevTouches = touches.slice();
  }
  orbitControl();
  _prevMousePressed = mouseIsPressed || touches.length > 0;
  scale(1,-1,1);

  stroke(255);
  strokeWeight(1);
  drawCoordSystem();

  let t = millis()/1000;
  let st = xlate(0,0,0);
  let ψψ = ψ(t);

  stroke('#FF5722'); fill('#FF9800');
  let ψL = drawWeylSpinor(st, -50, ψψ[0], drawLHand);
  stroke('#0077AD'); fill('#03A9F4');
  let ψR = drawWeylSpinor(st,  50, ψψ[1], drawRHand);
  if (ψL && ψR) { stroke('#BBBBBB'); drawSpinorBelt(ψL, ψR); }

  const ac = window._axisColors || [[255,50,80],[50,220,80],[60,160,255]];
  noFill(); strokeWeight(1);
  stroke(ac[2][0],ac[2][1],ac[2][2],180); circle(0,0,100);
  rotate(π/2,[1,0,0]);
  stroke(ac[1][0],ac[1][1],ac[1][2],180); circle(0,0,100);
  rotate(π/2,[0,1,0]);
  stroke(ac[0][0],ac[0][1],ac[0][2],180); circle(0,0,100);

  updateHTML(t);
  if (window._sleepNow) { window._sleepNow = false; noLoop(); }
}

function fmt(n, first=false) {
  if (first) return (n < 0 ? '' : ' ') + n.toFixed(2);
  else       return (n < 0 ? ' - ' : ' + ') + abs(n).toFixed(2);
}
fmtCpx  = (c) => `${fmt(c.r,true)}${fmt(c.i)}i`
fmtQuat = (q) => `${fmt(q.w,true)}${fmt(q.x)}ρ₁${fmt(q.y)}ρ₂${fmt(q.z)}ρ₃`

up   = (q) => cpx(q.w, -q.z);
down = (q) => cpx(q.y, -q.x);

function fmtCpxVal(c) {
  const r = c.r.toFixed(3), i = abs(c.i).toFixed(3);
  return `${r}${c.i >= 0 ? '+' : '-'}${i}i`;
}

function spinVec(q) {
  let d = qinner(q, q);
  if(d*d < 0.00000001) return quat(0);
  let tip = dsandwich(dmul(dquat(qnormalized(q)), xlate(0,0,d)), d1);
  return tip.d;
}

function fmtVec3(v) {
  const f = (x) => (x >= 0 ? ' ' : '') + x.toFixed(3);
  const n = sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
  return `${f(v.x)} ${f(v.y)} ${f(v.z)}  |${n.toFixed(3)}|`;
}

function updateHTML(t) {
  if (document.activeElement && document.activeElement.closest('#psi-readout')) return;
  let ψψ = ψ(t);
  let L = ψψ[0], R = ψψ[1];
  const n = qnormsq(L) + qnormsq(R);
  const vals = { cpx_Lu: fmtCpxVal(up(L)), cpx_Ld: fmtCpxVal(down(L)),
                 cpx_Ru: fmtCpxVal(up(R)), cpx_Rd: fmtCpxVal(down(R)) };
  for (const [id, v] of Object.entries(vals)) {
    const el = document.getElementById(id);
    if (el) el.value = v;
  }
  const norm = document.getElementById('psi_norm');
  if (norm) norm.textContent = '|ψ_L| = ' + sqrt(qnormsq(L)).toFixed(4) + '   |ψ_R| = ' + sqrt(qnormsq(R)).toFixed(4)
  const svL = document.getElementById('spin_vec_L');
  if (svL) svL.textContent = 'SL ' + fmtVec3(spinVec(L));
  const svR = document.getElementById('spin_vec_R');
  if (svR) svR.textContent = 'SR ' + fmtVec3(spinVec(R));
}
