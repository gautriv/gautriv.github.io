// llm-training-lab.js — the live labs for /how-llm-training-works/.
// One real 44-knob transformer (tiny autograd + Adam) shared by every lab on the page.
// Train it in one lab and every other lab recalculates from the new knobs.
// Vanilla JS, no globals, no dependencies. Mounts into .enx-hero and .enx-lab[data-lab].
(() => {
  'use strict';
  const mounts = document.querySelectorAll('.enx-hero, .enx-lab[data-lab], .enx-probe');
  if (!mounts.length) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ */
  /* The model                                                           */
  /* ------------------------------------------------------------------ */
  const words = ['I', 'drink', 'hot'];
  const ids = [11, 27, 43];
  const options = ['tea', 'coffee', 'pizza'];
  const pos = [[.16, -.10], [-.07, .12], [.12, .20]];
  const original = {
    E: [[-.12, .08], [.30, -.24], [.07, .32]],
    Wq: [[.4, -.2], [-.1, .6]], Wk: [[.3, .12], [.2, -.3]], Wv: [[.5, -.3], [.3, .4]],
    W1: [[.6, -.2], [-.4, .3], [.2, .5]], b1: [.1, .1, -.1],
    W2: [[.3, .2, -.4], [-.3, .6, .2]], b2: [0, 0],
    Wo: [[.28, .20], [-.50, .40], [.20, -.35]], bo: [-.35, .60, -.10]
  };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  let params = clone(original), opt = {}, steps = 0, history = [], before = null, cur;

  class V {
    constructor(v, prev = []) { this.v = v; this.g = 0; this.prev = prev; this.back = () => {}; }
    add(o) { const b = val(o), a = this, r = new V(a.v + b.v, [a, b]); r.back = () => { a.g += r.g; b.g += r.g; }; return r; }
    mul(o) { const b = val(o), a = this, r = new V(a.v * b.v, [a, b]); r.back = () => { a.g += b.v * r.g; b.g += a.v * r.g; }; return r; }
    pow(x) { const a = this, r = new V(Math.pow(a.v, x), [a]); r.back = () => { a.g += x * Math.pow(a.v, x - 1) * r.g; }; return r; }
    div(b) { return this.mul(val(b).pow(-1)); }
    neg() { return this.mul(-1); }
    tanh() { const a = this, t = Math.tanh(a.v), r = new V(t, [a]); r.back = () => { a.g += (1 - t * t) * r.g; }; return r; }
    exp() { const a = this, r = new V(Math.exp(a.v), [a]); r.back = () => { a.g += r.v * r.g; }; return r; }
    log() { const a = this, r = new V(Math.log(a.v), [a]); r.back = () => { a.g += r.g / a.v; }; return r; }
    backward() {
      const topo = [], seen = new Set();
      const walk = (x) => { if (seen.has(x)) return; seen.add(x); x.prev.forEach(walk); topo.push(x); };
      walk(this); this.g = 1;
      for (let i = topo.length - 1; i >= 0; i--) topo[i].back();
    }
  }
  const val = (x) => (x instanceof V ? x : new V(x));
  const nums = (a) => (Array.isArray(a) ? a.map(nums) : a.v);
  const addv = (a, b) => a.map((x, i) => x.add(b[i]));
  const dot = (a, b) => a.reduce((s, x, i) => s.add(x.mul(b[i])), val(0));
  const matvec = (m, v, b) => m.map((r, i) => dot(r, v).add(b ? b[i] : 0));
  function softmax(v) {
    const max = Math.max(...v.map((x) => x.v)), es = v.map((x) => x.add(-max).exp());
    const den = es.reduce((a, b) => a.add(b), val(0));
    return es.map((e) => e.div(den));
  }

  function forward(P) {
    const tracked = [], p = {};
    for (const [key, arr] of Object.entries(P)) {
      p[key] = arr.map((a, i) => Array.isArray(a)
        ? a.map((z, j) => { const v = new V(z); tracked.push({ key: `${key}[${i}][${j}]`, v, owner: key, i, j }); return v; })
        : (() => { const v = new V(a); tracked.push({ key: `${key}[${i}]`, v, owner: key, i }); return v; })());
    }
    const x = p.E.map((r, i) => r.map((v, j) => v.add(pos[i][j])));
    const q = x.map((z) => matvec(p.Wq, z)), k = x.map((z) => matvec(p.Wk, z)), v = x.map((z) => matvec(p.Wv, z));
    const scores = k.map((z) => dot(q[2], z).div(Math.sqrt(2)));
    const aw = softmax(scores);
    const mixed = [0, 1].map((j) => v.reduce((s, r, i) => s.add(r[j].mul(aw[i])), val(0)));
    const res = addv(x[2], mixed);
    const ff1 = matvec(p.W1, res, p.b1), act = ff1.map((a) => a.tanh()), ff2 = matvec(p.W2, act, p.b2);
    const hidden = addv(res, ff2), logits = matvec(p.Wo, hidden, p.bo), prob = softmax(logits);
    const loss = prob[0].log().neg();
    loss.backward();
    const grad = {}; tracked.forEach((o) => { grad[o.key] = o.v.g; });
    return {
      E: nums(p.E), x: nums(x), q: nums(q), k: nums(k), v: nums(v), scores: nums(scores), att: nums(aw),
      mixed: nums(mixed), res: nums(res), ff1: nums(ff1), act: nums(act), ff2: nums(ff2), hidden: nums(hidden),
      logits: nums(logits), prob: nums(prob), loss: loss.v, grad, tracked
    };
  }

  const keyParts = (key) => { const m = key.match(/^([^[]+)\[(\d+)\](?:\[(\d+)\])?$/); return [m[1], +m[2], m[3] === undefined ? null : +m[3]]; };
  const getK = (P, key) => { const [k, i, j] = keyParts(key); return j === null ? P[k][i] : P[k][i][j]; };
  const setK = (P, key, n) => { const [k, i, j] = keyParts(key); if (j === null) P[k][i] = n; else P[k][i][j] = n; };
  const forwardWith = (key, value) => { const P = clone(params); setK(P, key, value); return forward(P); };
  function finiteDiff(key, h = 0.0001) {
    const s = getK(params, key), plus = forwardWith(key, s + h).loss, minus = forwardWith(key, s - h).loss;
    return { plus, minus, slope: (plus - minus) / (2 * h) };
  }

  function trainOnce() {
    const prev = clone(params), tr = forward(params), snap = [];
    steps++;
    const lr = .045, b1 = .9, b2 = .999, eps = 1e-8;
    for (const a of tr.tracked) {
      const g = Math.max(-4, Math.min(4, a.v.g));
      const o = opt[a.key] || (opt[a.key] = { m: 0, v: 0 });
      o.m = b1 * o.m + (1 - b1) * g; o.v = b2 * o.v + (1 - b2) * g * g;
      const mh = o.m / (1 - Math.pow(b1, steps)), vh = o.v / (1 - Math.pow(b2, steps));
      const d = lr * mh / (Math.sqrt(vh) + eps);
      setK(params, a.key, a.v.v - d);
      snap.push({ key: a.key, grad: g, old: a.v.v, now: a.v.v - d, m: o.m, v: o.v, mh, vh, delta: d });
    }
    before = { prev, prevProb: tr.prob[0], prevLoss: tr.loss, snap };
    cur = forward(params);
    history.push({ step: steps, p: cur.prob[0], loss: cur.loss });
  }
  function reset() { params = clone(original); opt = {}; steps = 0; before = null; cur = forward(params); history = [{ step: 0, p: cur.prob[0], loss: cur.loss }]; }
  reset();

  /* ------------------------------------------------------------------ */
  /* Formatting: every number on the page is a button that knows its parent */
  /* ------------------------------------------------------------------ */
  const f = (x, d = 3) => Number(x).toFixed(d).replace('-', '−');
  const pct = (x) => (x >= 0.9995 && x < 1 ? '>99.9%' : x > 0 && x < 0.0005 ? '<0.1%' : (x * 100).toFixed(1) + '%');
  const fmtLoss = (x) => (x < 0.0005 ? '<0.001' : f(x, 3));
  const vv = (a, d = 3) => '[' + a.map((x) => f(x, d)).join(', ') + ']';
  const rm = (a) => '[' + a.map((x) => (Array.isArray(x) ? vv(x) : f(x))).join(' ; ') + ']';
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

  const ORIGIN = {
    sentence: ['chosen', 'The practice sentence', () => 'Chosen by us for this lesson. Input "I drink hot", answer card "tea". No arithmetic and no randomness created it.'],
    ids: ['chosen', 'Token IDs', () => 'A tiny hand-made dictionary: I → 11, drink → 27, hot → 43. An ID is a name tag. It says which row to fetch, nothing about meaning.'],
    E: ['trainable', 'Embedding rows (E)', () => `Set once at setup, then changed by training. Started as ${rm(original.E)}. After ${steps} rounds: ${rm(params.E)}.`],
    pos: ['chosen', 'Position stickers', () => `Fixed for this lesson and never trained: place 0 ${vv(pos[0])}, place 1 ${vv(pos[1])}, place 2 ${vv(pos[2])}.`],
    x: ['calc', 'Position-adjusted input', () => `Embedding row + position sticker. Hot right now: ${vv(params.E[2])} + ${vv(pos[2])} = ${vv(cur.x[2])}.`],
    Wq: ['trainable', 'Q machine knobs (Wq)', () => paramText('Wq')],
    Wk: ['trainable', 'K machine knobs (Wk)', () => paramText('Wk')],
    Wv: ['trainable', 'V machine knobs (Wv)', () => paramText('Wv')],
    q: ['calc', 'Q values', () => `Calculated, never stored. Q = Wq × input. Recomputed on every run. Current Q cards: ${cur.q.map((z) => vv(z)).join(' / ')}.`],
    k: ['calc', 'K values', () => `Calculated. K = Wk × input. Wk holds the knobs; these cards are temporary: ${cur.k.map((z) => vv(z)).join(' / ')}.`],
    v: ['calc', 'V values', () => `Calculated. V = Wv × input. Wv is trainable; V is rebuilt every run: ${cur.v.map((z) => vv(z)).join(' / ')}.`],
    width: ['chosen', 'Head width', () => 'We decided each Q and K has two boxes. That 2, and the √2 that comes with it, is a design choice. Nothing learned it.'],
    score: ['calc', 'Attention match scores', () => `Calculated. (Q of hot · K of word) ÷ √2. Current: ${cur.scores.map((x) => f(x, 4)).join(', ')}. Not percentages yet.`],
    att: ['calc', 'Attention shares', () => `Calculated by softmax, a fixed rule with zero knobs. Current shares: ${cur.att.map(pct).join(', ')}.`],
    mixed: ['calc', 'Mixed V message', () => `Calculated. Each V message times its share, added up. Current mix: ${vv(cur.mixed)}.`],
    res: ['calc', 'First residual', () => `Calculated. Original hot input ${vv(cur.x[2])} + attention mix ${vv(cur.mixed)} = ${vv(cur.res)}. Addition has no knobs.`],
    W1: ['trainable', 'Workshop knobs (W1 + b1)', () => paramText('W1') + ' ' + paramText('b1')],
    ff1: ['calc', 'Workshop output', () => `Calculated. W1 × input + b1 = ${vv(cur.ff1)}.`],
    act: ['calc', 'Bent numbers (tanh)', () => `Calculated. tanh squashes ${vv(cur.ff1)} into ${vv(cur.act)}. tanh has no knobs.`],
    W2: ['trainable', 'Workshop knobs (W2 + b2)', () => paramText('W2') + ' ' + paramText('b2')],
    ff2: ['calc', 'W2 output', () => `Calculated. W2 × bent numbers + b2 = ${vv(cur.ff2)}.`],
    hidden: ['calc', 'Final pair', () => `Calculated. W2 output ${vv(cur.ff2)} + saved residual ${vv(cur.res)} = ${vv(cur.hidden)}. This is all the judges get to see.`],
    Wo: ['trainable', 'Judge knobs (Wo + bo)', () => paramText('Wo') + ' ' + paramText('bo')],
    logit: ['calc', 'Logits (raw scores)', () => `Calculated. One row of judge knobs × final pair + bonus. Current: ${cur.logits.map((x) => f(x, 4)).join(' / ')}. Not stored anywhere.`],
    prob: ['calc', 'Next-word chances', () => `Calculated. Softmax over the three judges: ${cur.prob.map(pct).join(' / ')}. Same recipe as attention, different job.`],
    loss: ['calc', 'Loss (mistake score)', () => `Calculated. −ln(chance of tea) = −ln(${f(cur.prob[0], 6)}) = ${f(cur.loss, 6)}. The formula itself was chosen by the builder.`],
    grad: ['calc', 'Gradients', () => `Calculated by backpropagation from the current loss. Tea bonus: ${f(cur.grad['bo[0]'], 6)}. Q knob [0][0]: ${f(cur.grad['Wq[0][0]'], 6)}. None of them are random.`],
    adam: ['chosen', 'Optimizer settings', () => 'Chosen by us: step size 0.045, memory factors 0.9 and 0.999, safety constant 0.00000001. These are hyperparameters. The model never touches them.'],
    probeP: ['calc', 'Chances for this test sentence', () => 'Calculated by running the same 44 knobs on a sentence the model never trained on. Nothing inside the model changed. Only the input did.'],
    probe: ['chosen', 'The wiggle size', () => 'We picked 0.0001 as a measuring distance. It is a ruler, not a weight and not a learning rate.']
  };
  const PKEY = { b1: 'W1', b2: 'W2', bo: 'Wo' };
  function paramText(k) { return `${k}: set at model setup, changed only by training. Started ${rm(original[k])}. After ${steps} rounds: ${rm(params[k])}.`; }

  const n = (x, o, d = 3) => `<button type="button" class="enx-n is-${ORIGIN[o][0]}" data-o="${o}" data-v="${x}" data-dp="${d}">${f(x, d)}</button>`;
  const nv = (a, o, d = 3) => '<span class="enx-vec">[' + a.map((x) => n(x, o, d)).join(', ') + ']</span>';
  const np = (x, o) => `<button type="button" class="enx-n is-${ORIGIN[o][0]}" data-o="${o}" data-v="${x}" data-pct="1">${pct(x)}</button>`;
  const lab = (s) => `<span class="enx-chip-l">${s}</span>`;
  const chip = (label, body, cls = '') => `<div class="enx-chip ${cls}">${lab(label)}<div class="enx-chip-v">${body}</div></div>`;
  const arrow = (s = '→') => `<span class="enx-arrow" aria-hidden="true">${s}</span>`;
  const row = (...xs) => `<div class="enx-row">${xs.join('')}</div>`;
  const note = (s) => `<p class="enx-note">${s}</p>`;
  const mat = (heads, rows) => `<div class="enx-matwrap"><table class="enx-mat"><thead><tr>${heads.map((h) => `<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const m = (label, formula, result) => `<div class="enx-m"><span>${label}</span><code>${formula}</code><b>= ${result}</b></div>`;
  const dotF = (w, x, b = null) => `(${f(w[0])} × ${f(x[0])}) + (${f(w[1])} × ${f(x[1])})${b === null ? '' : ` + (${f(b)})`}`;
  const bars = (labels, values, o, mark = -1) => `<div class="enx-bars">${labels.map((s, i) => `<div class="enx-barrow"><span class="enx-bar-l">${s}${i === mark ? ' <em>answer</em>' : ''}</span><span class="enx-track"><span class="enx-fill${i === mark ? ' is-hit' : ''}" style="clip-path:inset(0 ${(100 - values[i] * 100).toFixed(2)}% 0 0 round 99px)"></span></span>${np(values[i], o)}</div>`).join('')}</div>`;
  const status = () => `<div class="enx-metrics"><div><span>Training rounds</span><b>${steps}</b></div><div><span>Chance of tea</span><b>${pct(cur.prob[0])}</b></div><div><span>Mistake (loss)</span><b>${fmtLoss(cur.loss)}</b></div></div>`;
  const trainBtns = () => auto
    ? `<div class="enx-train"><button type="button" class="enx-btn is-primary" disabled>Training ${autoDone} of ${autoTotal}…</button><button type="button" class="enx-btn" data-reset>Stop and reset</button></div>`
    : `<div class="enx-train"><button type="button" class="enx-btn is-primary" data-train="1">Train once</button><button type="button" class="enx-btn" data-train="20">Train 20 times</button><button type="button" class="enx-btn" data-reset>Reset knobs</button></div><p class="enx-note enx-train-hint">${steps === 0 ? 'One click = one round: guess, grade the guess, backprop, nudge all 44 knobs.' : 'Every lab on this page just recalculated from these knobs. Scroll up to Lab 01: the embedding dots have moved. The blank at the top of the post has changed too.'}</p>`;

  /* ------------------------------------------------------------------ */
  /* Small SVG figures                                                   */
  /* ------------------------------------------------------------------ */
  function scatter(withPos) {
    const W = 320, H = 220, pts = cur.E.concat(withPos ? cur.x : []);
    const lim = Math.max(0.6, ...pts.flat().map(Math.abs)) * 1.18;
    const X = (v) => W / 2 + (v / lim) * (W / 2 - 18), Y = (v) => H / 2 - (v / lim) * (H / 2 - 18);
    let s = `<svg class="enx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="The three words plotted by their two embedding numbers"><line x1="0" y1="${H / 2}" x2="${W}" y2="${H / 2}" class="ax"/><line x1="${W / 2}" y1="0" x2="${W / 2}" y2="${H}" class="ax"/><text x="${W - 6}" y="${H / 2 - 6}" class="lbl" text-anchor="end">D1</text><text x="${W / 2 + 6}" y="14" class="lbl">D2</text>`;
    words.forEach((w, i) => {
      const e = cur.E[i];
      if (withPos) {
        const p = cur.x[i];
        s += `<line x1="${X(e[0])}" y1="${Y(e[1])}" x2="${X(p[0])}" y2="${Y(p[1])}" class="shift"/><circle cx="${X(p[0])}" cy="${Y(p[1])}" r="6" class="pt-k"/><text x="${X(p[0]) + 9}" y="${Y(p[1]) + 4}" class="lbl-k">${w} @ place ${i}</text>`;
      }
      s += `<circle cx="${X(e[0])}" cy="${Y(e[1])}" r="6" class="pt-t"/>${withPos ? '' : `<text x="${X(e[0]) + 9}" y="${Y(e[1]) + 4}" class="lbl-t">${w}</text>`}`;
    });
    return s + '</svg>';
  }
  function arcs() {
    const W = 360, H = 176, xs = [60, 180, 300], base = 128;
    let s = `<svg class="enx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Hot listening to each word, line thickness shows its attention share">`;
    words.forEach((w, i) => {
      const a = cur.att[i], sw = (1.5 + a * 16).toFixed(2);
      const d = i === 2 ? `M ${xs[2] - 14} ${base - 12} C ${xs[2] - 40} ${base - 90}, ${xs[2] + 40} ${base - 90}, ${xs[2] + 14} ${base - 12}` : `M ${xs[2]} ${base - 14} Q ${(xs[2] + xs[i]) / 2} ${base - 120 + i * 30} ${xs[i]} ${base - 14}`;
      s += `<path d="${d}" class="arc" style="stroke-width:${sw}px"/><path d="${d}" class="arc-flow" style="stroke-width:${Math.max(1, sw / 3)}px"/>`;
      s += `<text x="${xs[i]}" y="${base + 34}" class="lbl-k" text-anchor="middle">${pct(a)}</text>`;
    });
    words.forEach((w, i) => { s += `<rect x="${xs[i] - 34}" y="${base - 12}" width="68" height="28" rx="8" class="node${i === 2 ? ' is-q' : ''}"/><text x="${xs[i]}" y="${base + 7}" class="node-t" text-anchor="middle">${w}</text>`; });
    return s + '</svg>';
  }
  function curve(fn, lo, hi, pts, opts = {}) {
    const W = 320, H = 190, P = 26;
    const ys = []; for (let i = 0; i <= 60; i++) { const x = lo + (hi - lo) * i / 60; ys.push([x, fn(x)]); }
    const ymin = opts.ymin ?? Math.min(...ys.map((p) => p[1])), ymax = opts.ymax ?? Math.max(...ys.map((p) => p[1]));
    const span = (ymax - ymin) || 1;
    const X = (x) => P + (x - lo) / (hi - lo) * (W - P * 2), Y = (y) => H - P - (y - ymin) / span * (H - P * 2);
    let s = `<svg class="enx-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.label || 'curve')}"><line x1="${P}" y1="${H - P}" x2="${W - P}" y2="${H - P}" class="ax"/><line x1="${P}" y1="${P / 2}" x2="${P}" y2="${H - P}" class="ax"/>`;
    s += `<path d="${ys.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join(' ')}" class="curve"/>`;
    if (opts.tangent) {
      const { x0, y0, slope } = opts.tangent, dx = (hi - lo) * 0.22;
      s += `<line x1="${X(x0 - dx)}" y1="${Y(y0 - slope * dx)}" x2="${X(x0 + dx)}" y2="${Y(y0 + slope * dx)}" class="tangent"/>`;
    }
    pts.forEach((p) => { s += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="5.5" class="pt-${p[2] || 'k'}"/>${p[3] ? `<text x="${X(p[0]) + 9}" y="${Y(p[1]) - 8}" class="lbl-${p[2] || 'k'}">${p[3]}</text>` : ''}`; });
    if (opts.xl) s += `<text x="${W - P}" y="${H - 8}" class="lbl" text-anchor="end">${opts.xl}</text>`;
    if (opts.yl) s += `<text x="${P + 6}" y="${P / 2 + 8}" class="lbl">${opts.yl}</text>`;
    return s + '</svg>';
  }
  function chart() {
    const W = 640, H = 170, pts = history.map((h, i) => [44 + (history.length < 2 ? 0 : 580 * i / (history.length - 1)), 146 - 124 * h.p]);
    return `<svg class="enx-svg enx-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chance of tea across your training rounds"><path d="M44 22 H624 M44 84 H624 M44 146 H624" class="grid"/><text x="2" y="26" class="lbl">100%</text><text x="10" y="88" class="lbl">50%</text><text x="18" y="150" class="lbl">0%</text>${pts.length > 1 ? `<path d="${pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ')}" class="curve"/>` : ''}<circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="5.5" class="pt-k"/><text x="624" y="166" class="lbl" text-anchor="end">rounds →</text></svg>`;
  }
  function knobWall() {
    const groups = Object.keys(original);
    return `<div class="enx-wall" aria-label="All 44 trainable knobs">${groups.map((g) => {
      const flat = []; const walk = (a, p) => (Array.isArray(a) ? a.forEach((z, j) => walk(z, `${p}[${j}]`)) : flat.push(p)); walk(params[g], g);
      return `<div class="enx-wall-g"><span class="enx-wall-n">${g}</span><div class="enx-wall-d">${flat.map((k) => {
        const now = getK(params, k), was = getK(original, k), ang = Math.max(-1.6, Math.min(1.6, now)) / 1.6 * 135;
        return `<button type="button" class="enx-dial${Math.abs(now - was) > 0.005 ? ' is-moved' : ''}" data-o="${PKEY[g] || g}" data-knob="${k}" aria-label="${k}: started ${f(was)}, now ${f(now)}"><i style="transform:rotate(${ang.toFixed(1)}deg)"></i></button>`;
      }).join('')}</div></div>`;
    }).join('')}</div><p class="enx-note">Each dial is one trainable number. The needle is its value. A ring lights up once training has moved it. Tap one to see where it started.</p>`;
  }
  let sandbox = { key: 'bo[0]', val: null };
  // The sandbox knob: controls render once; only the readout and curve redraw while you drag.
  let curveCache = { sig: '', pts: null };
  function knobOut() {
    const key = sandbox.key, start = getK(params, key), v0 = sandbox.val ?? start, lo = start - 2, hi = start + 2;
    const at = forwardWith(key, v0), g = cur.grad[key], sig = key + ':' + steps;
    if (curveCache.sig !== sig) { const c = new Map(); curveCache = { sig, fn: (x) => { const r = x.toFixed(4); if (!c.has(r)) c.set(r, forwardWith(key, x).loss); return c.get(r); } }; }
    const fig = curve(curveCache.fn, lo, hi, [[start, cur.loss, 't', 'now'], [v0, at.loss, 'k', sandbox.val === null ? '' : 'you']], { tangent: { x0: start, y0: cur.loss, slope: g }, xl: key + ' →', yl: 'loss', label: 'Loss as you turn one knob' });
    return `<div class="enx-metrics is-small"><div><span>Knob</span><b>${f(v0)}</b></div><div><span>Tea</span><b>${pct(at.prob[0])}</b></div><div><span>Loss</span><b>${f(at.loss, 3)}</b></div></div>${fig}
      <p class="enx-note">Blue dot: where the knob sits now. Green dot: where you put it. The dashed line is the slope backprop computed, ${f(g, 5)}. A steep line means this knob matters right now. This is a sandbox; your real model is untouched.</p>`;
  }
  function knobLab() {
    const key = sandbox.key, start = getK(params, key), v0 = sandbox.val ?? start;
    const choice = [['bo[0]', 'Tea bonus, bo[0]'], ['E[2][0]', 'Hot embedding, E[2][0]'], ['Wq[0][0]', 'Q knob, Wq[0][0]']];
    return `<div class="enx-knoblab"><div class="enx-knoblab-c"><label class="enx-lbl">Pick a knob <select class="enx-sel" data-sandbox-key>${choice.map(([k, l]) => `<option value="${k}"${k === key ? ' selected' : ''}>${l}</option>`).join('')}</select></label>
      <label class="enx-lbl">Turn it <input type="range" class="enx-range" data-sandbox-val min="${(start - 2).toFixed(3)}" max="${(start + 2).toFixed(3)}" step="0.01" value="${v0}"></label></div>
      <div class="enx-knoblab-out">${knobOut()}</div></div>`;
  }

  /* ------------------------------------------------------------------ */
  /* The 23 stages                                                       */
  /* ------------------------------------------------------------------ */
  function stages() {
    const t = cur, h = t.x[2], sumE = (a) => a.map(Math.exp).reduce((x, y) => x + y, 0);
    return [
      /* ---- name-tags ---- */
      { lab: 'name-tags', s: 'The sentence', t: 'Who chooses the sentence and the answer?', lede: 'We need one page of practice text before we can teach anything.',
        carry: 'Nothing. This is where it starts.', src: 'A person preparing training material picks the practice sentence.', out: 'The practice text: "I drink hot tea."',
        kid: 'Picture a book that says "I drink hot tea." Cover the last word with your hand. Later the computer guesses what is under your hand. The printed word is the answer key.',
        qa: [['Who wrote this sentence?', 'For this classroom example, we did. A real lab gathers and prepares enormous collections of text. A training example is not a fact the machine was born knowing.'],
          ['How does the computer know the correct answer?', 'We keep the next piece of the original sentence as an answer key. It is only used after the model produces its scores. The model never sees it in advance.'],
          ['Is "tea" the only correct continuation?', 'No. "Coffee" makes sense too. For this one example, the next piece in the actual text is "tea", so that is what the mistake meter rewards.'],
          ['What happens with a whole book?', 'Real training uses every position at once: each prefix tries to predict the token after it. We follow one position so you can see every single number.']],
        vis: () => `<div class="enx-tokens">${words.map((w, i) => `<span class="enx-tok" style="--i:${i}"><small>shown</small>${w}</span>`).join('')}<span class="enx-tok is-hidden" style="--i:3"><small>covered</small>?</span></div>${note('Answer card kept by the teacher: <b class="is-chosen-t">tea</b>. Picked from the real text, not calculated.')}`,
        work: () => m('Practice example', 'input = "I drink hot"; next word in the text = "tea"', 'teacher-chosen text, no math'),
        real: 'A real pipeline reads huge document collections, filters and formats them, and gets its labels by shifting the token sequence one place. It predicts many tokens in parallel.' },
      { lab: 'name-tags', s: 'Token IDs', t: 'Who gave each word its ID?', lede: 'The text gets name tags. A name tag is not a measure of meaning.',
        carry: '"I drink hot" from the practice page.', src: 'We define a tiny lookup dictionary: I → 11, drink → 27, hot → 43.', out: `The ordered IDs [${ids.map((x) => n(x, 'ids', 0)).join(', ')}].`,
        kid: 'Three children named I, drink, and hot each get a roll number. The number finds the right folder. It says nothing about how tall or clever the child is.',
        qa: [['Who decided that "hot" is 43?', 'We did, for this illustration. In a real tokenizer, vocabulary entries get IDs when the tokenizer is built. 43 has no secret meaning.'],
          ['Why not give hot ID 1?', 'We could. IDs are labels. Change the label and the matching lookup, and the math still works.'],
          ['What keeps the order?', 'The ordered list itself: I is place 0, drink place 1, hot place 2. IDs identify token types. Positions identify each occurrence.'],
          ['Are tokens the same as words?', 'Not necessarily. Real tokenizers often split text into pieces of words. Here one word happens to be one token, to keep it teachable.'],
          ['Why are the IDs bigger than our three rows?', 'Our toy stores only the three active entries. A full embedding table uses the real ID as its row number. The shortcut saves space, not meaning.']],
        vis: () => mat(['Place in sentence', 'Text piece', 'ID from our dictionary'], words.map((w, i) => ['place ' + i, w, n(ids[i], 'ids', 0)])),
        work: () => m('ID lookup', 'our dictionary says "hot" ↦ 43', '43, assigned at setup') + m('Ordered output', 'I (11), drink (27), hot (43)', '[11, 27, 43]'),
        real: 'Real vocabulary IDs come from a trained tokenizer, usually a subword algorithm. Tokenization happens before the embedding lookup, and the sequence order is tracked.' },
      { lab: 'name-tags', s: 'Embeddings', t: 'Who put numbers in the embedding book?', lede: 'Each token ID fetches a starting row of two numbers. These are already adjustable weights.',
        carry: `Name tags ${ids.join(', ')}, in order.`, src: 'For this demo we chose six fixed starter values. No hidden calculation produces them.', out: `I ${nv(t.E[0], 'E')}; drink ${nv(t.E[1], 'E')}; hot ${nv(t.E[2], 'E')}.`,
        kid: 'Each child gets a card with two dials. Before school starts, the teacher sets the dials to starter numbers. The child has learned nothing yet. The dials are there to be turned during practice.',
        qa: [['Why does hot start at [0.070, 0.320]?', 'Because at setup we placed those values in its row. Train the model and this row changes. The plot moves with it.'],
          ['Why two numbers, not 4,096?', 'Width 2 means you can follow every calculation with your eyes. Real models use thousands of dimensions. The width is a design choice made before training.'],
          ['Do D1 and D2 mean something human?', 'No. D1 is "first slot", D2 is "second slot." Nobody writes "hotness = D1." Useful relationships can emerge as the model learns.'],
          ['Are these numbers random?', 'Here they are preset, so the page behaves the same for everyone. In a new real model, most weights start as small pseudorandom values from an initialization rule and a random seed. The seed makes those random-looking values reproducible.'],
          ['Do they become weights later?', 'They are weights from the start. "Weight" or "parameter" just means a number the optimizer may change. Training changes their values, not their kind.']],
        vis: () => `<div class="enx-split">${mat(['Token · ID', 'D1', 'D2'], words.map((w, i) => [`${w} · ${ids[i]}`, n(t.E[i][0], 'E'), n(t.E[i][1], 'E')]))}${scatter(false)}</div>${note('Three rows × two columns = <b>6 trainable numbers</b>. Train the model in Lab 07, come back, and watch these dots drift.')}`,
        work: () => words.map((w, i) => m('Lookup for ' + w, `ID ${ids[i]} fetches its row: started ${vv(original.E[i])}`, vv(t.E[i]))).join(''),
        real: 'A real embedding matrix has one row per vocabulary token, often tens of thousands of rows, at a width the designers pick. It starts from a controlled random distribution and gradient updates reshape it.' },
      { lab: 'name-tags', s: 'Positions', t: 'Who decides the position numbers?', lede: 'A fixed position sticker is added to each token card.',
        carry: `Each token has its own two-number row. Hot = ${nv(t.E[2], 'E')}.`, src: `Fixed stickers we chose: place 0 ${nv(pos[0], 'pos')}, place 1 ${nv(pos[1], 'pos')}, place 2 ${nv(pos[2], 'pos')}.`, out: `The third token becomes ${nv(h, 'x')}.`,
        kid: 'Write each word\'s two numbers on a slip. Stick another slip on top that says "I am at place 0, 1, or 2." Add the boxes. Now the computer can tell the same word at different places apart.',
        qa: [['Where did 0.120 and 0.200 come from?', 'We assigned them to place 2 when building this demo. They are not generated by "hot", Q, K, or V.'],
          ['What exactly do we add?', 'For each position, D1 plus sticker D1, D2 plus sticker D2. All three positions, not just hot.'],
          ['Why is the third word place 2?', 'Programmers count array positions from zero: 0, 1, 2.'],
          ['Are the stickers trainable here?', 'No. These six sticker values are fixed for this lesson. The embedding rows and the transformer knobs are the trainable ones.'],
          ['Do modern LLMs add stickers?', 'Many do not. Many use RoPE, which rotates Q and K by position. Additive stickers keep the full arithmetic on one screen.']],
        vis: () => `<div class="enx-split">${mat(['Word', 'Embedding', 'Sticker', 'Sum'], words.map((w, i) => [w, nv(t.E[i], 'E'), nv(pos[i], 'pos'), nv(t.x[i], 'x')]))}${scatter(true)}</div>${note('Blue dots are the embedding rows. Each line is a sticker pushing a word to where it sits in the sentence.')}`,
        work: () => words.map((w, i) => m(`${w} · D1`, `${f(t.E[i][0])} + (${f(pos[i][0])})`, f(t.x[i][0])) + m(`${w} · D2`, `${f(t.E[i][1])} + (${f(pos[i][1])})`, f(t.x[i][1]))).join(''),
        real: 'This is one classic form of position encoding. Many current LLMs use rotary position embeddings instead, which modify the queries and keys rather than adding a vector to the token embedding.' },

      /* ---- machines ---- */
      { lab: 'machines', s: 'Q, K, V knobs', t: 'Who gave Q, K, and V their knobs?', lede: 'Q, K, and V do not borrow their knobs from an embedding row. Each machine has its own.',
        carry: `The input pair for each word. Hot is ${nv(h, 'x')}.`, src: 'When we build the model we create three separate 2 × 2 weight tables and fill each with starting numbers.', out: 'Three stored sets of trainable weights: Wq, Wk, Wv.',
        kid: 'A toy factory builds three machines and gives each four little screws. Each screw starts where the factory sets it. A word drops its two numbers in. The screws decide what comes out.',
        qa: [['Where did Q\'s 0.4, −0.2, −0.1, 0.6 come from?', 'We put them into the Q machine at setup. K\'s and V\'s knobs were set separately. None come from the sentence or the embeddings.'],
          ['Who picks the starting numbers in real training?', 'The designer picks the shapes and an initialization method. A seeded pseudorandom generator fills in the values. Learning changes them later.'],
          ['What is a matrix?', 'A little table. The Q machine has 2 rows and 2 columns, 4 numbers. Each row is a recipe for one number of the output.'],
          ['Why three machines instead of one?', 'Three roles. A token asks what it needs (Q), offers something to match against (K), and carries a message to share (V). Each learns its own recipe.'],
          ['Are Q and the Q knobs the same thing?', 'No. Wq is a stored table that persists across every sentence. Q is a temporary result calculated by running one token through it.'],
          ['Are there more knobs?', 'Yes. W1/b1 and W2/b2 in the second machine, Wo/bo for scoring answers. All set before training. Lab 07 shows every one as a dial.']],
        vis: () => `<div class="enx-row is-wrap">${[['Q machine · Wq', 'Wq'], ['K machine · Wk', 'Wk'], ['V machine · Wv', 'Wv']].map(([nm, k]) => `<div class="enx-machine"><span class="enx-chip-l">${nm}</span><div class="enx-grid2">${params[k].flat().map((x) => n(x, k)).join('')}</div><small>started ${rm(original[k])}</small></div>`).join('')}</div>${note('Twelve knobs. The same stored tables run on <b>every</b> token. Training changes the tables; the cards they produce are rebuilt each run.')}`,
        work: () => ['Wq', 'Wk', 'Wv'].map((k) => m(`${k}, set at model setup`, `${rm(original[k])} (start) → ${rm(params[k])} (now)`, `${params[k].flat().length} trainable weights`)).join('') + m('All trainable knobs', '6 embedding + 12 Q/K/V + 9 first workshop + 8 second workshop + 9 judges', '44'),
        real: 'A transformer creates weight tensors for the attention projections (Q, K, V and an output projection), feed-forward blocks, normalization, and output scoring, each with a carefully scaled initialization.' },
      { lab: 'machines', s: 'Make Q', t: 'How does the Q machine make its numbers?', lede: 'One input pair plus four Q knobs gives a new pair of Q numbers.',
        carry: `Hot enters as ${nv(h, 'x')}.`, src: `Q's stored rows: ${nv(params.Wq[0], 'Wq')} and ${nv(params.Wq[1], 'Wq')}.`, out: `Hot's Q pair: ${nv(t.q[2], 'q')}.`,
        kid: 'Drop hot\'s two numbers into the Q machine. The first two screws make the first new number. The other two make the second. That is all Q is here: a pair made by multiplying and adding.',
        qa: [['Why does Q change after training?', 'Because Wq and the embeddings may change when the model learns. The rule for making Q stays the same.'],
          ['Why two multiplications per Q number?', 'The input has two boxes. Both contribute. Multiply each by its knob and add.'],
          ['Does only hot get a Q?', 'No. The same machine makes a Q for every word. We focus on hot because it is the last word, the one predicting what comes next.'],
          ['What does Q stand for?', '"Query." As an analogy, a question card held up against every other token\'s key card. The computer stores numbers, not English questions.']],
        vis: () => row(chip('hot input', nv(h, 'x')), arrow(), chip('Q knobs', `${nv(params.Wq[0], 'Wq')}<br>${nv(params.Wq[1], 'Wq')}`), arrow(), chip('Q of hot', nv(t.q[2], 'q'), 'is-out')),
        work: () => words.map((w, i) => m(`Q ${w}, box 1`, dotF(params.Wq[0], t.x[i]), f(t.q[i][0], 5)) + m(`Q ${w}, box 2`, dotF(params.Wq[1], t.x[i]), f(t.q[i][1], 5))).join(''),
        real: 'Real attention heads make Q by multiplying token representations with a learned projection matrix. Many heads, much wider vectors, positional rotations. The multiply-and-add is the same idea.' },
      { lab: 'machines', s: 'Make K', t: 'Where do the K numbers come from?', lede: 'Each word uses its own input pair and the same shared K machine.',
        carry: `Inputs: I ${nv(t.x[0], 'x')}, drink ${nv(t.x[1], 'x')}, hot ${nv(h, 'x')}.`, src: `K knobs from setup: ${nv(params.Wk[0], 'Wk')} and ${nv(params.Wk[1], 'Wk')}.`, out: `K cards: ${t.k.map((z) => nv(z, 'k')).join(' / ')}.`,
        kid: 'Everyone gets a matching card. Each child\'s two numbers go into the same K machine. Same screws, different children, different cards.',
        qa: [['Where did K\'s starting knobs come from?', 'Their own four setup numbers: [0.30, 0.12] and [0.20, −0.30]. Not copied from Wq, not from any embedding.'],
          ['Why are the three K cards different?', 'Same screws, different inputs. Different inputs, different outputs.'],
          ['Why K if we already have Q?', 'Q gets compared against K, like a request checked against an offer. Keeping them separate lets the model learn a good way to compare.'],
          ['What happens to K after training?', 'Any change to Wk or the embeddings changes the K cards. Wk is learned; K cards are recalculated every time text comes in.']],
        vis: () => mat(['Word', 'Input', 'K card'], words.map((w, i) => [w, nv(t.x[i], 'x'), nv(t.k[i], 'k')])),
        work: () => words.map((w, i) => m(`K ${w}, box 1`, dotF(params.Wk[0], t.x[i]), f(t.k[i][0], 5)) + m(`K ${w}, box 2`, dotF(params.Wk[1], t.x[i]), f(t.k[i][1], 5))).join(''),
        real: 'The K projection applies one learned matrix to every token in a head. In causal attention a token compares against keys from earlier positions and itself, never the future.' },
      { lab: 'machines', s: 'Make V', t: 'Where do the V numbers come from?', lede: 'A third, separately set machine makes the information that will actually be shared.',
        carry: `The same three inputs: ${t.x.map((z) => nv(z, 'x')).join(' / ')}.`, src: `V's own knobs: ${nv(params.Wv[0], 'Wv')} and ${nv(params.Wv[1], 'Wv')}.`, out: `V messages: ${t.v.map((z) => nv(z, 'v')).join(' / ')}.`,
        kid: 'K is a child\'s name card. V is the toy the child brought. The cards decide who to listen to. The toys are what get shared.',
        qa: [['Why does V have different knobs from K?', 'A separate V machine, starting at [0.5, −0.3] and [0.3, 0.4], lets the model learn different numbers for matching and for sharing.'],
          ['What does V stand for?', '"Value": the message that gets blended into a new representation. Here, two numbers.'],
          ['Is V the probability of a word?', 'No. V is still intermediate data. No answer scores yet.'],
          ['Where are these screws stored?', 'Inside the model, as the trainable matrices Wq, Wk, Wv. Not in a vector database.']],
        vis: () => mat(['Word', 'Input', 'V message'], words.map((w, i) => [w, nv(t.x[i], 'x'), nv(t.v[i], 'v')])),
        work: () => words.map((w, i) => m(`V ${w}, box 1`, dotF(params.Wv[0], t.x[i]), f(t.v[i][0], 5)) + m(`V ${w}, box 2`, dotF(params.Wv[1], t.x[i]), f(t.v[i][1], 5))).join(''),
        real: 'Value vectors come from learned projection matrices. Their size and the number of heads are architecture choices. Real attention usually adds an output projection after combining values.' },

      /* ---- listen ---- */
      { lab: 'listen', s: 'Match scores', t: 'How does Q decide whom to listen to?', lede: 'Compare hot\'s Q with the K cards of I, drink, and hot.',
        carry: `Q of hot ${nv(t.q[2], 'q')}. K cards ${t.k.map((z) => nv(z, 'k')).join(' / ')}.`, src: `A fixed rule: multiply matching boxes, add, divide by √${n(2, 'width', 0)}.`, out: `Three match scores ${nv(t.scores, 'score', 4)}. Not percentages.`,
        kid: 'Hold your question card next to each friend\'s matching card. Compare the boxes. Give each friend a matching score. Bigger means "matches more", not "is correct."',
        qa: [['Where did the numbers come from?', 'Q: hot\'s input times Wq. K: each word\'s input times Wk. Both sets of knobs came from setup.'],
          ['What is "multiply matching boxes"?', 'First Q box times first K box, plus second times second. That is a dot product. You only need the recipe.'],
          ['Why divide by √2?', 'Our Q and K have two boxes. Attention divides by the square root of that width so scores do not get too extreme when there are many dimensions.'],
          ['Where did the 2 come from?', 'It is the head width we chose. Nothing learned it.'],
          ['Why does hot compare with itself?', 'The last token may use its own position and earlier ones, never future ones, in a causal language model.'],
          ['Does a bigger score mean a higher probability?', 'Not yet. A normalizing step comes next.']],
        vis: () => mat(['Compare with', 'Hot Q', 'Its K', 'Score'], words.map((w, i) => [w, nv(t.q[2], 'q'), nv(t.k[i], 'k'), n(t.scores[i], 'score', 4)])),
        work: () => words.map((w, i) => m(`Match with ${w}`, `((${f(t.q[2][0])} × ${f(t.k[i][0])}) + (${f(t.q[2][1])} × ${f(t.k[i][1])})) ÷ √2`, f(t.scores[i], 5))).join(''),
        real: 'Scaled dot-product attention compares query and key vectors. Real heads have dozens or hundreds of dimensions, causal masking, positional tricks, and heavily optimized kernels.' },
      { lab: 'listen', s: 'Softmax', t: 'How do scores become attention shares?', lede: 'A fixed recipe called softmax turns three scores into three shares that add up to 100%.',
        carry: `Scores ${nv(t.scores, 'score', 4)}.`, src: 'Softmax: e to the power of each score, then divide by the total.', out: `Shares ${t.att.map((x) => np(x, 'att')).join(' / ')}.`,
        kid: 'Three friends want to help. Their points are not pie slices yet. Softmax turns points into slices of one whole pie.',
        qa: [['Who invented these numbers?', 'Nobody writes them down. They are calculated from the scores. Softmax has no adjustable screws.'],
          ['What does e^score mean?', 'An exponential. It turns any number into a positive one: e^0 = 1, e^1 ≈ 2.718, e^−1 ≈ 0.368.'],
          ['Why divide by the total?', 'So the shares sum to exactly 1. Each share is one word\'s portion of the mix.'],
          ['Is this the chance of "tea"?', 'No. This softmax spreads attention across input words. A second softmax, much later, spreads chances across tea, coffee, and pizza.'],
          ['Who learns how big the shares should be?', 'Nobody directly. Training changes the Q and K knobs, and that changes the shares.']],
        vis: () => `<div class="enx-split">${arcs()}${bars(words, t.att, 'att')}</div>${note('Line thickness is how much hot listens to each word. The untrained model listens to everyone about equally. Keep an eye on that.')}`,
        work: () => words.map((w, i) => m(`e^score for ${w}`, `e ^ (${f(t.scores[i], 5)})`, f(Math.exp(t.scores[i]), 4))).join('') + m('Add them', t.scores.map((x) => f(Math.exp(x), 4)).join(' + '), f(sumE(t.scores), 4)) + words.map((w, i) => m(`${w} share`, `${f(Math.exp(t.scores[i]), 4)} ÷ ${f(sumE(t.scores), 4)}`, pct(t.att[i]))).join(''),
        real: 'Each causal head applies softmax across the positions it is allowed to see. Disallowed future positions are masked out before the softmax.' },
      { lab: 'listen', s: 'The mix', t: 'What exactly gets mixed together?', lede: 'The shares say how much of each V message to take.',
        carry: `Shares ${t.att.map((x) => np(x, 'att')).join(' / ')}. V messages ${t.v.map((z) => nv(z, 'v')).join(' / ')}.`, src: 'Multiply each V message by its share, then add across words.', out: `A fresh pair ${nv(t.mixed, 'mixed')}.`,
        kid: 'Three glasses of juice, each with two flavors, each with a different-sized spoon. Take a spoonful from each, mix the matching flavors, and you have a new glass.',
        qa: [['Why mix V and not K or Q?', 'Q and K decided how much to take. V carries what gets taken.'],
          ['Does hot lose its identity?', 'Not yet. The next step adds the original hot input back. That is a deliberate design choice called a residual connection.'],
          ['Do the percentages come from V?', 'No. Percentages came from the Q/K scores. V came separately from Wv.'],
          ['Is this the prediction?', 'Not yet. It is a two-number summary of what the last word gathered from the context.']],
        vis: () => row(...words.map((w, i) => chip(`${w} × ${pct(t.att[i])}`, nv(t.v[i], 'v'))).flatMap((c, i) => (i ? [arrow('+'), c] : [c])), arrow('='), chip('mix', nv(t.mixed, 'mixed'), 'is-out')),
        work: () => [0, 1].map((j) => m(`Mix box ${j + 1}`, t.att.map((a, i) => `(${f(a)} × ${f(t.v[i][j])})`).join(' + '), f(t.mixed[j], 5))).join(''),
        real: 'Attention computes a weighted sum of value vectors. A full transformer combines many heads and applies a learned output matrix afterward. We skip that projection for clarity.' },
      { lab: 'listen', s: 'Add it back', t: 'Why add the original hot pair back?', lede: 'The mix becomes an extra on top of the original, not a replacement.',
        carry: `Mix ${nv(t.mixed, 'mixed')}; original hot input ${nv(h, 'x')}.`, src: 'A fixed addition rule, chosen when designing this transformer.', out: `${nv(t.res, 'res')} = original + mix.`,
        kid: 'You have your drawing and some advice from friends. Instead of throwing away the drawing, you add the advice on top. You keep a path back to where you started.',
        qa: [['Where did the original hot pair come from?', 'Its embedding row plus its position sticker. It has been carried along the whole time.'],
          ['Why add instead of replace?', 'Keeping the original helps information and training signals travel through a deep network. This is the residual, or skip, connection.'],
          ['Is there a knob for this addition?', 'No. The addition itself learns nothing. Both inputs depend on learned knobs.'],
          ['Why only the last position?', 'Because we are predicting the word after "hot." The last position\'s vector is what the scoreboard reads.']],
        vis: () => row(chip('hot input', nv(h, 'x')), arrow('+'), chip('attention mix', nv(t.mixed, 'mixed')), arrow('='), chip('keep both', nv(t.res, 'res'), 'is-out')),
        work: () => [0, 1].map((j) => m(`Box ${j + 1}`, `${f(h[j])} + (${f(t.mixed[j], 5)})`, f(t.res[j], 5))).join(''),
        real: 'Residual connections are fundamental in deep transformers. Real blocks add normalization and a learned attention output projection around them.' },

      /* ---- workshop ---- */
      { lab: 'workshop', s: 'W1 + b1', t: 'Where do the second machine\'s knobs come from?', lede: 'The feed-forward machine has its own independently set knobs.',
        carry: `The combined pair ${nv(t.res, 'res')}.`, src: 'Setup created W1, three rows of two knobs, plus one bonus knob b1 per row.', out: `Three numbers ${nv(t.ff1, 'ff1')}.`,
        kid: 'A new workshop with three little calculators. Each has two screws and one bonus dial. All three get the same two-number input. Each makes one number.',
        qa: [['Where did W1 and b1 come from?', 'We chose W1 = [[0.6, −0.2], [−0.4, 0.3], [0.2, 0.5]] and b1 = [0.1, 0.1, −0.1]. Real training draws them from a seeded random scheme.'],
          ['What is a bias, or bonus dial?', 'One extra adjustable number added after the multiplications. It lets the machine shift an output even when the inputs are zero.'],
          ['Why do two numbers become three?', 'We decided this workshop has three calculators. Layer size is an architecture decision, not something the model discovers.'],
          ['Is this related to the V machine?', 'Different weights. V mixed messages between words. This machine reshapes the result for one word.']],
        vis: () => row(chip('input', nv(t.res, 'res')), arrow(), ...t.ff1.map((x, i) => chip(`row ${i + 1} + b1`, n(x, 'ff1'), 'is-out'))),
        work: () => t.ff1.map((x, i) => m(`Calculator ${i + 1}`, dotF(params.W1[i], t.res, params.b1[i]), f(x, 5))).join('') + m('W1 and b1, as set', rm(original.W1) + ' ; bonuses ' + vv(original.b1), '9 trainable knobs'),
        real: 'A real feed-forward network is usually several times wider than its input. Ours goes 2 → 3 → 2. Real layers expand into thousands of dimensions.' },
      { lab: 'workshop', s: 'The bend', t: 'Why bend the three numbers?', lede: 'A fixed bend rule, tanh, lets the machine do more than multiply.',
        carry: `Three results ${nv(t.ff1, 'ff1')}.`, src: 'The tanh function. No knobs of its own.', out: `Three bent numbers ${nv(t.act, 'act')}.`,
        kid: 'A rubber ruler. Any number that goes through it gets gently squashed between −1 and +1. Nobody turns any screws inside it.',
        qa: [['Where do the bent values come from?', 'The same tanh recipe applied to each number separately.'],
          ['Why not just multiply again?', 'Without a bend, a stack of multiplication-only layers collapses into one bigger multiplication. The bend lets layers build more complicated patterns.'],
          ['Why tanh?', 'It keeps the toy small. Modern models usually use GELU or SwiGLU. The choice is part of the architecture.'],
          ['Does tanh learn?', 'No. Its shape is fixed. Training changes what flows into it.']],
        vis: () => `<div class="enx-split">${mat(['Input', 'Rule', 'Bent'], t.ff1.map((x, i) => [n(x, 'ff1', 4), 'tanh', n(t.act[i], 'act', 4)]))}${curve(Math.tanh, -2.5, 2.5, t.ff1.map((x, i) => [x, t.act[i], 'k', String(i + 1)]), { ymin: -1, ymax: 1, xl: 'input', yl: 'tanh', label: 'The tanh curve with the three numbers on it' })}</div>`,
        work: () => t.ff1.map((x, i) => m(`Bend ${i + 1}`, `(e^${f(x, 4)} − e^${f(-x, 4)}) ÷ (e^${f(x, 4)} + e^${f(-x, 4)})`, f(t.act[i], 5))).join(''),
        real: 'Many modern LLMs use GELU or SwiGLU in their feed-forward blocks. The activation usually has no learnable parameters; the matrices around it do.' },
      { lab: 'workshop', s: 'W2 + b2', t: 'How do three numbers become two again?', lede: 'Another learned matrix, W2, folds the list back to two numbers, then the earlier pair is added back.',
        carry: `Bent ${nv(t.act, 'act')}; saved pair ${nv(t.res, 'res')}.`, src: 'W2: two rows of three knobs, plus two bonus knobs b2. Set at build time.', out: `Final pair ${nv(t.hidden, 'hidden')}.`,
        kid: 'Three helpers hand over their pieces. Two collectors combine them into two boxes. Then we add the saved drawing again. That is the final summary before choosing the next word.',
        qa: [['Where did W2 and b2 come from?', 'Setup, like everything else: rows [0.3, 0.2, −0.4] and [−0.3, 0.6, 0.2]; bonuses [0, 0]. Zero is a chosen start, not a trained value.'],
          ['Why three multiplications per row now?', 'The input has three values now. One knob per incoming number.'],
          ['Why add the earlier pair again?', 'A second residual connection. It preserves information and gives the learning signal a short path back.'],
          ['Is this the answer?', 'No. Still two numbers. The judges come next.']],
        vis: () => row(chip('bent', nv(t.act, 'act')), arrow(), chip('W2 result', nv(t.ff2, 'ff2')), arrow('+'), chip('saved pair', nv(t.res, 'res')), arrow('='), chip('final pair', nv(t.hidden, 'hidden'), 'is-out')),
        work: () => [0, 1].map((i) => m(`W2 box ${i + 1}`, params.W2[i].map((x, j) => `(${f(x)} × ${f(t.act[j])})`).join(' + ') + ` + (${f(params.b2[i])})`, f(t.ff2[i], 5))).join('') + [0, 1].map((i) => m(`Add saved pair, box ${i + 1}`, `${f(t.res[i], 5)} + (${f(t.ff2[i], 5)})`, f(t.hidden[i], 5))).join(''),
        real: 'Real transformers stack this attention-then-feed-forward block dozens of times, with normalization and residual paths around each. Ours has one head and one block.' },

      /* ---- judges ---- */
      { lab: 'judges', s: 'Logits', t: 'Where do the tea, coffee, and pizza scores come from?', lede: 'A final learned scoreboard has its own starter knobs for each possible answer.',
        carry: `Final pair ${nv(t.hidden, 'hidden')}.`, src: 'At setup Wo got two knobs per answer, and bo one bonus per answer.', out: `Logits: tea ${n(t.logits[0], 'logit', 4)}, coffee ${n(t.logits[1], 'logit', 4)}, pizza ${n(t.logits[2], 'logit', 4)}.`,
        kid: 'Three judges: one for tea, one for coffee, one for pizza. Each has two scoring screws and a bonus screw. They read the same summary and give different points.',
        qa: [['Where did the tea judge\'s knobs come from?', 'Setup: Wo row for tea = [0.28, 0.20], bonus −0.35. Coffee and pizza have their own rows. Softmax does not generate them.'],
          ['Why only three answers?', 'A tiny output vocabulary for learning. A real model scores every token in its vocabulary.'],
          ['What is a logit?', 'A raw score. Positive or negative. Not a probability yet.'],
          ['Does the model compare text to the word "tea"?', 'No. The tea row is tied to tea\'s vocabulary slot. The word is just how we display it.'],
          ['Did the embeddings become judge knobs?', 'Not here; Wo is its own table. Some real models deliberately share the input embedding with the output scorer (weight tying).']],
        vis: () => mat(['Judge', 'Knob 1', 'Knob 2', 'Bonus', 'Score'], options.map((o, i) => [o, n(params.Wo[i][0], 'Wo'), n(params.Wo[i][1], 'Wo'), n(params.bo[i], 'Wo'), n(t.logits[i], 'logit', 4)])),
        work: () => options.map((o, i) => m(`${o} score`, dotF(params.Wo[i], t.hidden, params.bo[i]), f(t.logits[i], 5))).join(''),
        real: 'Real output layers produce one logit per vocabulary token, often over a hundred thousand of them. Some tie these weights to the token embeddings.' },
      { lab: 'judges', s: 'The guess', t: 'How do raw scores turn into a guess?', lede: 'Softmax again, this time across possible next words.',
        carry: `Logits ${nv(t.logits, 'logit', 4)}.`, src: 'The same fixed softmax recipe, now across answers instead of input words.', out: `tea ${np(t.prob[0], 'prob')}, coffee ${np(t.prob[1], 'prob')}, pizza ${np(t.prob[2], 'prob')}.`,
        kid: 'The judges awarded points. The same pie machine turns points into chances that add up to 100%. The biggest slice is the guess.',
        qa: [['Why softmax again?', 'The first one spread attention across input words. This one spreads chances across possible next words. Same recipe, different job.'],
          ['Do the chances always add to 100%?', 'Yes, by construction.'],
          ['Is the biggest slice guaranteed correct?', 'No. A probability is a prediction, not a proof. Early in training the right word is often a small slice.'],
          ['What happens with the probabilities?', 'In training we check how much chance went to the real next token. In generation, a decoder picks the top token or samples from an adjusted distribution.'],
          ['Does softmax have knobs?', 'No. It transforms scores; the scores depend on trained weights.']],
        vis: () => bars(options, t.prob, 'prob', 0) + note(steps === 0 ? 'Untrained. It thinks coffee. Nothing is broken. Nobody has told it anything yet.' : `After ${steps} rounds of training. These bars recalculate every time the knobs move.`),
        work: () => options.map((o, i) => m(`e^score for ${o}`, `e ^ (${f(t.logits[i], 5)})`, f(Math.exp(t.logits[i]), 4))).join('') + m('Add them', t.logits.map((x) => f(Math.exp(x), 4)).join(' + '), f(sumE(t.logits), 5)) + options.map((o, i) => m(`Chance of ${o}`, `${f(Math.exp(t.logits[i]), 4)} ÷ ${f(sumE(t.logits), 5)}`, pct(t.prob[i]))).join(''),
        real: 'At generation time, systems apply temperature or sampling rules before picking a token, then feed that token back in and run everything again for the next one.' },

      /* ---- mistake ---- */
      { lab: 'mistake', s: 'The loss', t: 'How does it know a guess was bad?', lede: 'The hidden answer card finally comes out, and a fixed formula turns the guess into a mistake score.',
        carry: `Tea got ${np(t.prob[0], 'prob')}.`, src: 'The real next word, "tea", and a fixed formula: the negative natural log of tea\'s chance.', out: `Loss = ${n(t.loss, 'loss', 5)}.`,
        kid: 'The book says "tea." The computer gave tea some chance. The mistake meter is low if that chance was big and high if it was tiny.',
        qa: [['Who tells the model the true word?', 'The sentence itself. We kept the next token as the answer. Nobody labels grammar by hand.'],
          ['Where did the −ln formula come from?', 'It is cross-entropy loss, chosen by model builders for next-token prediction. The model does not invent it. It only tries to shrink it.'],
          ['What is ln?', 'The natural log, the reverse of e^x. ln(1) = 0, ln(0.5) ≈ −0.693, ln(0.1) ≈ −2.303. The minus sign makes small chances into big mistakes.'],
          ['Why one single number?', 'Math needs one score to push down. Once you have it, you can ask how every knob affects it.'],
          ['Does a high loss mean the sentence is false?', 'No. Only that the model gave the real next token a small chance.']],
        vis: () => `<div class="enx-split">${row(chip('real next word', '<b class="is-chosen-t">tea</b>'), chip('model gave tea', np(t.prob[0], 'prob')), chip('mistake', n(t.loss, 'loss', 4), 'is-out'))}${curve((p) => -Math.log(p), 0.02, 1, [[t.prob[0], t.loss, 'k', 'you are here']], { ymin: 0, ymax: 4, xl: 'chance of tea', yl: 'loss', label: 'Loss falls as the chance of tea rises' })}</div>`,
        work: () => m('Chance as a fraction', `${pct(t.prob[0])} ÷ 100`, f(t.prob[0], 6)) + m('Natural log', `ln(${f(t.prob[0], 6)})`, f(Math.log(t.prob[0]), 6)) + m('Loss', `−ln(${f(t.prob[0], 6)})`, f(t.loss, 6)),
        real: 'Real models compute cross-entropy over every token position in a batch of many sequences, average it, and backpropagate once for the whole batch.' },
      { lab: 'mistake', s: 'Backprop', t: 'Who tells each knob which way to move?', lede: 'Backpropagation measures how every trainable number affects the mistake score.',
        carry: `Loss ${n(t.loss, 'loss', 5)}, which depends on every calculation before it.`, src: 'A fixed bookkeeping rule, the chain rule, run backward from the loss through every step.', out: 'All 44 knobs get a gradient: a direction and a sensitivity.',
        kid: 'Forty-four little screws. For each one we ask: if I turn this a tiny bit, does the mistake get bigger or smaller? The computer walks the steps backward to find out.',
        qa: [['What exactly is a gradient?', 'A slope. If this knob goes up a little, how does the loss change? Positive means up makes it worse. Negative means up makes it better.'],
          ['Where do gradients come from?', 'From the current loss and every multiplication, addition, and bend that made it, combined with the chain rule. Not random.'],
          ['Can I check one by hand?', 'Yes. For the tea bonus bo[0], the gradient is simply (chance of tea − 1). That shortcut comes from pairing softmax with cross-entropy.'],
          ['Do Q and the embeddings get gradients too?', 'Yes. Changing them changes Q, K, V, attention, the final pair, the scores, and the loss. The gradient flows all the way back.'],
          ['Do all knobs move the same way?', 'No. Some positive, some negative, some almost zero, depending on how each was used.'],
          ['Why not just set the tea bonus to a huge number?', 'That memorizes this one example and wrecks everything else. Real training averages over enormous, varied data with careful step sizes.']],
        vis: () => `<div class="enx-chain">${['Loss', 'Softmax', 'Judges', 'Workshop', 'Attention', 'Embeddings'].map((x, i) => `<span class="enx-link" style="--i:${i}"><small>back ${i + 1}</small>${x}</span>`).join('<span class="enx-arrow" aria-hidden="true">←</span>')}</div>${note(`One gradient you can check yourself: tea bonus = chance of tea − 1 = ${f(t.prob[0], 5)} − 1 = ${n(t.grad['bo[0]'], 'grad', 5)}.`)}`,
        work: () => m('Tea bonus gradient', `${f(t.prob[0], 6)} − 1`, f(t.grad['bo[0]'], 6)) + m('Coffee bonus gradient', `chance of coffee = ${f(t.prob[1], 6)}`, f(t.grad['bo[1]'], 6)) + m('Pizza bonus gradient', `chance of pizza = ${f(t.prob[2], 6)}`, f(t.grad['bo[2]'], 6)) + m('Tea knob 1 gradient', `(${f(t.prob[0], 6)} − 1) × final box 1 (${f(t.hidden[0], 6)})`, f(t.grad['Wo[0][0]'], 6)) + m('W2 row 1, knob 1', '(gradient at final box 1) × bent value 1', f(t.grad['W2[0][0]'], 6)) + m('Q knob Wq[0][0]', 'chain rule all the way back, checked in the next stage', f(t.grad['Wq[0][0]'], 7)),
        real: 'Automatic differentiation runs this backward pass efficiently through computation graphs with billions of operations. Real training aggregates gradients over large batches and often clips them.' },
      { lab: 'mistake', s: 'Prove it', t: 'Can we prove a Q gradient is real?', lede: 'Wiggle one stored Q knob, rerun the whole network, and measure the change ourselves.',
        carry: `Backprop says Wq[0][0] has gradient ${n(t.grad['Wq[0][0]'], 'grad', 7)}.`, src: `Two trial runs: the knob + ${n(0.0001, 'probe', 4)} and − ${n(0.0001, 'probe', 4)}, each a full forward pass.`, out: `Measured slope ${n(finiteDiff('Wq[0][0]').slope, 'grad', 7)}. Backprop: ${n(t.grad['Wq[0][0]'], 'grad', 7)}.`,
        kid: 'Move one screw a hair to the right and look at the mistake meter. Then a hair to the left. Backprop gets the same answer without trying every screw one by one.',
        qa: [['Who chose 0.0001?', 'We did. It is a measuring distance, not a trained weight and not a learning rate.'],
          ['Where do the two trial losses come from?', 'We change only that one Q knob, rerun embeddings → Q/K/V → attention → judges → loss, record it, and put the knob back. Real network calculations.'],
          ['Why divide by 0.0002?', 'The two trial settings are 0.0002 apart. Change in loss over change in knob is the slope.'],
          ['Why not do this for every knob?', 'With billions of weights, two extra full runs per weight would take forever. Backprop gets every gradient in one backward sweep.'],
          ['Why are they only almost equal?', 'The wiggle uses a finite step and rounding. Backprop computes the exact slope directly, within floating-point precision.']],
        vis: () => { const d = finiteDiff('Wq[0][0]'); return row(chip('knob − 0.0001', `${n(d.minus, 'loss', 7)} loss`), chip('Wq[0][0] now', n(params.Wq[0][0], 'Wq', 5)), chip('knob + 0.0001', `${n(d.plus, 'loss', 7)} loss`)) + note('That Q knob is nearly flat. Turning it barely moves the mistake. Now turn one yourself:') + knobLab(); },
        work: () => { const d = finiteDiff('Wq[0][0]'); return m('Trial A: turn it right', `${f(params.Wq[0][0], 7)} + 0.0001 → rerun everything`, f(d.plus, 7) + ' loss') + m('Trial B: turn it left', `${f(params.Wq[0][0], 7)} − 0.0001 → rerun everything`, f(d.minus, 7) + ' loss') + m('Measured slope', `(${f(d.plus, 7)} − ${f(d.minus, 7)}) ÷ 0.0002`, f(d.slope, 7)) + m('Backprop slope', 'chain rule through the same operations', f(t.grad['Wq[0][0]'], 7)); },
        real: 'Finite differences are a standard way to check gradients on small models. Real training uses automatic differentiation because rerunning a giant network twice per parameter is impossible.' },

      /* ---- coach ---- */
      { lab: 'coach', s: 'Adam', t: 'What physically changes a number?', lede: 'An optimizer turns gradients into small changes to the stored weights.',
        carry: `Every knob has a value and a gradient. Tea bonus = ${n(params.bo[0], 'Wo', 5)}, gradient ${n(t.grad['bo[0]'], 'grad', 5)}.`, src: `An update recipe called Adam, with settings we chose: step size ${n(0.045, 'adam', 3)}, memory ${n(0.9, 'adam', 1)} and ${n(0.999, 'adam', 3)}.`, out: 'Press Train once and the stored knobs change.',
        kid: 'Backprop says which way each screw should turn. The coach, the optimizer, turns them a tiny bit. The coach remembers earlier advice so it does not yank the screws around.',
        qa: [['Where does 0.045 come from?', 'We chose it as the learning rate for this toy. It sets the size of each step. Real engineers tune it, usually with a schedule.'],
          ['And 0.9, 0.999, 0.00000001?', 'Chosen Adam settings, called hyperparameters. The first two control how much gradient history it remembers. The last prevents division by zero.'],
          ['What does Adam do beyond following the gradient?', 'It keeps two running memories per knob: the average gradient and the average squared gradient. It divides one by the square root of the other. So a knob with a tiny but consistent gradient takes almost as big a step as a knob with a huge one.'],
          ['Why are Q and the logits not stored?', 'Weights are the knobs saved in the model. Q, K, V, logits, and probabilities are recalculated on the next run from the updated weights.'],
          ['Am I training a real LLM?', 'No. You are training a very small neural network that genuinely differentiates and updates its 44 parameters. Same mechanics, about ten orders of magnitude smaller.']],
        vis: () => status() + trainBtns() + (before ? mat(['Sample knob', 'Before', 'After'], [['Tea bonus bo[0]', f(getK(before.prev, 'bo[0]'), 5), n(params.bo[0], 'Wo', 5)], ['Q knob Wq[0][0]', f(getK(before.prev, 'Wq[0][0]'), 5), n(params.Wq[0][0], 'Wq', 5)], ['Hot embedding D1', f(getK(before.prev, 'E[2][0]'), 5), n(params.E[2][0], 'E', 5)]]) : note('No update yet. Every knob is still at its starting value. Press Train once.')),
        work: () => { if (!before) return m('One Adam step', 'new = old − 0.045 × m̂ ÷ (√v̂ + 0.00000001)', 'press Train once to see real values'); const z = before.snap.find((s) => s.key === 'bo[0]'); return m('Gradient (before the step)', `g = ${f(z.grad, 6)}`, f(z.grad, 6)) + m('Memory 1', 'm = 0.9 × old m + 0.1 × g', f(z.m, 7)) + m('Memory 2', 'v = 0.999 × old v + 0.001 × g²', f(z.v, 7)) + m('Early-step correction', `m̂ = ${f(z.mh, 6)}; v̂ = ${f(z.vh, 7)}`, 'corrected') + m('Step size', '0.045 × m̂ ÷ (√v̂ + 0.00000001)', f(z.delta, 7)) + m('Saved knob', `${f(z.old, 7)} − (${f(z.delta, 7)})`, f(z.now, 7)); },
        real: 'Real models usually use AdamW, a learning-rate schedule with warmup, mixed precision, weight decay, and gradients averaged across thousands of GPUs.' },
      { lab: 'coach', s: 'Train it', t: 'What happens after one full round?', lede: 'The computer reruns the entire forward pass with the new knobs.',
        carry: `Rounds completed: ${steps}.`, src: 'Same sentence → new lookup → new Q/K/V → new scores → new loss.', out: `Tea ${np(t.prob[0], 'prob')}; loss ${n(t.loss, 'loss', 5)}.`,
        kid: 'Do the same fill-in-the-blank again with the adjusted machine. The arrows and formulas stay the same. Only the screws changed.',
        qa: [['Does it store yesterday\'s Q?', 'No. It stores updated Wq, Wk, Wv and the rest. Each run recalculates Q/K/V from the input and the current weights.'],
          ['Does every round guarantee improvement?', 'Not in general. Gradients are local and steps interact. On this single repeated example, tea should usually rise.'],
          ['Can I see every updated knob?', 'Yes. The dial wall below shows all 44. Every earlier lab on the page has also recalculated with the new values. Scroll up and look.'],
          ['Why recalculate everything?', 'A model is a chain of arithmetic. Change an upstream weight and everything downstream changes.'],
          ['What if we repeat only this sentence forever?', 'It memorizes it. Being perfect at "I drink hot tea" proves nothing about any other sentence.']],
        vis: () => status() + trainBtns() + chart() + bars(options, t.prob, 'prob', 0),
        work: () => m('Current chance of tea', 'softmax(logits)[tea]', pct(t.prob[0])) + m('Current loss', `−ln(${f(t.prob[0], 6)})`, f(t.loss, 6)) + m('Rounds', 'step counter', String(steps)) + (before ? m('Last step', `${f(before.prevLoss, 5)} → ${f(t.loss, 5)}`, f(before.prevLoss - t.loss, 5) + ' less mistake') : ''),
        real: 'Real training repeats forward pass, backprop, and update over many batches drawn from enormous datasets, and checks itself against text it has never trained on.' },

      /* ---- answer book ---- */
      { lab: 'answer-book', s: 'Training ends', t: 'When does training end, and what comes next?', lede: 'Training changes weights. Ordinary text generation does not.',
        carry: 'Every number has a known parent, and all 44 knobs can move.', src: 'A decision by the builder ends training and saves the learned values.', out: 'Inference: the saved weights make predictions with no answer card.',
        kid: 'After enough practice we close the answer book. The computer gets a new sentence, uses its learned screws, guesses the next piece, adds it, and guesses again.',
        qa: [['Where is its knowledge kept?', 'Mostly in the pattern of learned values spread across embeddings and layers. Not a database with one row per fact.'],
          ['Does it use a vector database now?', 'Not necessarily. A vector database is an optional outside search tool used for retrieval-augmented generation. It is not part of learning or of next-token prediction.'],
          ['Does inference still need token IDs and embeddings?', 'Yes. New text is tokenized, looked up, and run through the learned layers and the scorer.'],
          ['Does it still compute logits and softmax?', 'It computes logits. A decoder then picks tokens, sometimes after temperature or sampling rules.'],
          ['Why does a real LLM seem smart if it only predicts the next token?', 'Predicting the next token across vast, varied text forces the parameters to capture a great many regularities of language and the world. Useful reasoning can emerge. Mistakes remain.'],
          ['What did this toy leave out?', 'Deliberately: many heads and layers, normalization, rotary positions, batching, parallel hardware, huge vocabularies, and much more. The arithmetic is complete for this network, not a claim that production models are this small.']],
        vis: () => `<div class="enx-chain is-loop">${['Text', 'Token IDs', 'Embed + position', 'Q K V', 'Attention', 'Workshop', 'Logits', 'Chances', 'Mistake', 'Gradients', 'Update'].map((x, i) => `<span class="enx-link${i > 7 ? ' is-train' : ''}" style="--i:${i}"><small>${String(i + 1).padStart(2, '0')}</small>${x}</span>`).join('<span class="enx-arrow" aria-hidden="true">→</span>')}</div>${note('<b class="is-calc-t">Inference</b> runs steps 1 to 8 and picks a word. <b class="is-train-t">Training</b> adds 9 to 11: the answer card, the gradients, the knob updates. Part 2 of this series lives entirely in steps 1 to 8.')}`,
        work: () => m('Parameter count', 'E 6 + Wq 4 + Wk 4 + Wv 4 + W1 6 + b1 3 + W2 6 + b2 2 + Wo 6 + bo 3', '44 trainable knobs') + m('Also present, never trained', '3 position stickers × 2 numbers', '6 fixed constants') + m('Vocabulary', '3 input words, 3 candidate answers', 'not a real tokenizer'),
        real: 'Production models hold billions of trainable parameters plus many architectural and serving optimizations. This toy is mathematically complete and genuinely trainable, and simplified on purpose so every origin is visible.' }
    ];
  }

  /* ------------------------------------------------------------------ */
  /* Rendering                                                           */
  /* ------------------------------------------------------------------ */
  const LABS = {}; // lab id -> { el, idx: [stage indices], at, seen }
  let ALL = stages();
  ALL.forEach((s, i) => { (LABS[s.lab] || (LABS[s.lab] = { idx: [], at: 0, seen: new Set([0]) })).idx.push(i); });
  const lastVals = new Map();
  let auto = null, autoTotal = 0, autoDone = 0;

  const kindName = { chosen: 'Chosen', trainable: 'Trainable', calc: 'Calculated' };
  const kindLine = { chosen: 'A person set this. Training never touches it.', trainable: 'A person set where it starts. Training turns it.', calc: 'Rebuilt on every run by a fixed rule from earlier numbers.' };
  const rounds = (n) => `${n} ${n === 1 ? 'round' : 'rounds'}`;
  const live = () => `<span class="enx-live" title="The model's state right now. It changes when you train in Lab 07.">Model now · ${rounds(steps)} · tea <b>${pct(cur.prob[0])}</b> · mistake <b>${fmtLoss(cur.loss)}</b></span>`;
  const key = () => `<div class="enx-key"><span class="is-chosen-t">Chosen</span><span class="is-train-t">Trainable</span><span class="is-calc-t">Calculated</span><span class="enx-key-tip">Tap any colored number to see who made it</span></div>`;
  const icon = (d) => `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
  const guide = () => `<div class="enx-guide" aria-label="How the labs work"><div class="enx-guide-h">How the labs below work</div><ol>
      <li>${icon('<rect x="3" y="6" width="5" height="4" rx="2"/><rect x="10" y="6" width="5" height="4" rx="2"/><rect x="17" y="6" width="4" height="4" rx="2"/><path d="M4 15h16M16 12l4 3-4 3"/>')}<b>Step through</b><span>Each lab has numbered stage tabs. Click a tab, or the Next button at the bottom.</span></li>
      <li>${icon('<path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V11m0-1.5a1.5 1.5 0 0 1 3 0V11m0-.5a1.5 1.5 0 0 1 3 0V15a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L4 15.5a1.5 1.5 0 0 1 2.5-1.6L9 16"/>')}<b>Tap a number</b><span>Every colored number is a button. Tap one and it tells you who made it.</span></li>
      <li>${icon('<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M12 9v6M9 12h6"/>')}<b>Open the drawers</b><span>"Worked out" shows the arithmetic. "But why?" answers the obvious questions.</span></li>
      <li>${icon('<circle cx="12" cy="12" r="9"/><path d="M10 8.5v7l6-3.5z"/>')}<b>Train it</b><span>Lab 07 has the Train button. Every lab on the page recalculates.</span></li>
    </ol><button type="button" class="enx-btn" data-jump="coach">Skip ahead to the Train button ↓</button></div>`;

  function shell(el) {
    if (el._body) return;
    el.innerHTML = `${el.classList.contains('enx-hero') ? '<div class="enx-hero-top"></div>' : ''}<div class="enx-body"></div><div class="enx-pop" role="dialog" aria-label="Where this number came from" hidden><button type="button" class="enx-pop-x" aria-label="Close">×</button><div class="enx-pop-c"></div></div>`;
    el._body = el.querySelector('.enx-body'); el._pop = el.querySelector('.enx-pop');
  }

  function renderLab(id, enter, kb) {
    const L = LABS[id]; if (!L || !L.el) return;
    const el = L.el, gi = L.idx[L.at], s = ALL[gi], n = L.idx.length, last = L.at === n - 1;
    shell(el); closePop(el, true);
    const openSet = new Set([...el.querySelectorAll('details[open]')].map((d) => d.dataset.d));
    const a = document.activeElement, focusKey = el.contains(a) && a.dataset ? (a.dataset.sandboxVal !== undefined ? 'range' : a.dataset.sandboxKey !== undefined ? 'sel' : a.dataset.train ? `[data-train="${a.dataset.train}"]` : null) : null;
    const tabs = L.idx.map((g, k) => `<button type="button" class="enx-tab${k === L.at ? ' is-on' : ''}${L.seen.has(k) ? ' is-seen' : ''}" data-go="${k}" aria-current="${k === L.at ? 'step' : 'false'}"><span>${String(g + 1).padStart(2, '0')}</span>${ALL[g].s}</button>`).join('');
    const qa = s.qa.map(([q, ans], k) => `<details class="enx-q" data-d="q${gi}-${k}"><summary>${q}</summary><p>${ans}</p></details>`).join('');
    el._body.innerHTML = `
      <div class="enx-head"><span class="enx-tagline">Lab ${el.dataset.num} · ${el.dataset.title}</span>${live()}</div>
      <div class="enx-tabs" role="group" aria-label="Stages in this lab">${tabs}</div>
      ${key()}
      <div class="enx-stage${enter && !kb ? ' is-enter' : ''}">
        <div class="enx-eyebrow">Stage ${String(gi + 1).padStart(2, '0')} of ${ALL.length} in the whole model</div>
        <div class="enx-title" role="heading" aria-level="3">${s.t}</div>
        <p class="enx-lede">${s.lede}</p>
        <div class="enx-flow"><div><span>Carried in</span><p>${s.carry}</p></div><div><span>Where new numbers come from</span><p>${s.src}</p></div><div class="is-out"><span>What we just made</span><p>${s.out}</p></div></div>
        <div class="enx-scene">${s.vis()}</div>
        <p class="enx-plain"><span>In plain words</span>${s.kid}</p>
        <details class="enx-d" data-d="w${gi}"><summary>Every number, worked out</summary><div class="enx-work">${s.work()}</div></details>
        <details class="enx-d" data-d="qa${gi}"><summary>Every "but why?" <em>${s.qa.length} questions</em></summary>${qa}</details>
        <p class="enx-real"><span>What a real LLM does instead</span>${s.real}</p>
      </div>
      ${id === 'coach' ? `<div class="enx-wallwrap"><div class="enx-eyebrow">All 44 knobs</div>${knobWall()}</div>` : ''}
      <div class="enx-nav"><button type="button" class="enx-btn" data-step="-1"${L.at === 0 ? ' disabled' : ''}>← Back</button><span class="enx-pos">Stage ${L.at + 1} of ${n} in this lab</span>${last ? '<button type="button" class="enx-btn is-done" data-done>Lab done, keep reading ↓</button>' : `<button type="button" class="enx-btn is-primary" data-step="1">Next: ${ALL[L.idx[L.at + 1]].s} →</button>`}</div>`;
    el.querySelectorAll('details').forEach((d) => { if (openSet.has(d.dataset.d)) d.open = true; });
    if (focusKey === 'range') el.querySelector('[data-sandbox-val]')?.focus();
    else if (focusKey === 'sel') el.querySelector('[data-sandbox-key]')?.focus();
    else if (focusKey) el.querySelector(focusKey)?.focus({ preventScroll: true });
    tween(el, id + ':' + gi);
  }

  // The hero: the blank re-rolls on a loop while it is on screen and lands on the model's real guess.
  const verdictHTML = (top) => top === 0
    ? `<span class="enx-verdict-tag is-right">Right</span> The book says <b>tea</b>, and so does the model. Nobody typed it. ${rounds(steps)} of training turned the knobs until it fell out.`
    : `<span class="enx-verdict-tag is-wrong">Wrong</span> Wrong for this training example: the text the model is learning from says <b>tea</b>. ${steps === 0 ? 'This guess comes from 44 knobs set by hand that nobody has trained yet.' : `Still wrong after ${rounds(steps)}. Keep training.`}`;
  function heroTop(el) {
    const top = cur.prob.indexOf(Math.max(...cur.prob)), t = el.querySelector('.enx-hero-top');
    if (!t.firstChild) t.innerHTML = `<div class="enx-head"><span class="enx-tagline">The model in this post</span><span class="enx-live-slot"></span></div><div class="enx-sentence"><span>I</span><span>drink</span><span>hot</span><span class="enx-blank"></span></div><p class="enx-verdict" aria-live="polite"></p>`;
    t.querySelector('.enx-live-slot').innerHTML = live();
    if (el._rolling) return;
    land(el, top, false);
  }
  function land(el, top, animate) {
    const b = el.querySelector('.enx-blank'), v = el.querySelector('.enx-verdict');
    b.textContent = options[top];
    b.classList.remove('is-rolling', 'is-wrong', 'is-right', 'is-landed');
    if (animate) void b.offsetWidth;
    b.classList.add(top === 0 ? 'is-right' : 'is-wrong');
    if (animate) b.classList.add('is-landed');
    v.innerHTML = verdictHTML(top);
    v.classList.toggle('is-shown', true);
  }
  function roll(el) {
    if (el._rolling || reduced) return;
    const b = el.querySelector('.enx-blank'), v = el.querySelector('.enx-verdict');
    const top = cur.prob.indexOf(Math.max(...cur.prob));
    el._rolling = true;
    b.classList.remove('is-wrong', 'is-right', 'is-landed'); b.classList.add('is-rolling');
    v.classList.remove('is-shown');
    let i = 0; const ticks = 11;
    const step = () => {
      if (!el._rolling) return;
      if (i >= ticks) { el._rolling = false; land(el, top, true); return; }
      b.textContent = options[(top + 1 + i) % 3]; i++;
      setTimeout(step, 60 + i * i * 1.6); // decelerates like a reel settling
    };
    step();
  }
  function renderHero(el) {
    shell(el); closePop(el, true);
    heroTop(el);
    const top = cur.prob.indexOf(Math.max(...cur.prob));
    el._body.innerHTML = `
      ${bars(options, cur.prob, 'prob', 0)}
      <p class="enx-note">${steps === 0
        ? 'Untrained: 44 knobs set by hand, zero rounds of training. <span class="enx-try">Try it: tap any percentage above to see who made it.</span>'
        : top === 0 ? `After ${rounds(steps)} of your training. Same sentence, same rules, different knobs.` : `After ${rounds(steps)} of training, tea is climbing but coffee still leads. Lab 07 has the Train button.`}</p>
      ${guide()}`;
    tween(el, 'hero');
  }

  // The memorization test: same knobs, sentences the model never trained on.
  const PROBES = [['I drink hot', [0, 1, 2]], ['hot drink I', [2, 1, 0]], ['I I I', [0, 0, 0]], ['hot hot hot', [2, 2, 2]]];
  let probeAt = 1;
  function forwardOrder(order) { const P = clone(params); P.E = order.map((i) => params.E[i]); return forward(P); }
  function renderProbe(el) {
    shell(el); closePop(el, true);
    const [label, order] = PROBES[probeAt], r = forwardOrder(order), top = r.prob.indexOf(Math.max(...r.prob));
    const note = steps === 0
      ? `Untrained, it says coffee to every one of these, at about the same confidence. It isn't reading the words yet. Train it in Lab 07, then come back and try again.`
      : probeAt === 0
        ? `This is the one sentence it practiced: ${options[top]} at ${pct(r.prob[top])}. Now press the other buttons.`
        : `It never saw "${label}" during training, and it still says ${options[top]}, at ${pct(r.prob[top])}. A model that read the words would hesitate. This one learned what to say, not how to read.`;
    el._body.innerHTML = `
      <div class="enx-head"><span class="enx-tagline">Test · Did it learn, or memorize?</span>${live()}</div>
      <p class="enx-lede">Feed the model sentences it never trained on. Same 44 knobs, different words. Pick one:</p>
      <div class="enx-tabs" role="group" aria-label="Test sentences">${PROBES.map(([l], k) => `<button type="button" class="enx-tab${k === probeAt ? ' is-on' : ''}" data-probe="${k}" aria-pressed="${k === probeAt}"><span>${k === 0 ? 'trained on' : 'new'}</span>${l}</button>`).join('')}</div>
      <div class="enx-sentence is-small">${label.split(' ').map((w) => `<span>${w}</span>`).join('')}<span class="enx-blank">${options[top]}</span></div>
      ${bars(options, r.prob, 'probeP', probeAt === 0 ? 0 : -1)}
      <p class="enx-note">${note}</p>`;
    tween(el, 'probe:' + probeAt);
  }

  function renderAll(enterId) {
    ALL = stages();
    for (const id in LABS) renderLab(id, id === enterId);
    document.querySelectorAll('.enx-hero').forEach(renderHero);
    document.querySelectorAll('.enx-probe').forEach(renderProbe);
  }

  // Count-up from the last value each number showed, so changes are visible, not just correct.
  // Bars and dials get the same treatment: start from the old value, let a CSS transition carry them.
  // While auto-training, values change faster than any tween could finish, so they just update.
  function carry(el, sel, scope, read, write) {
    el.querySelectorAll(sel).forEach((x, i) => {
      const k = scope + sel + i, to = read(x), from = lastVals.get(k);
      lastVals.set(k, to);
      if (reduced || from === undefined || from === to) return;
      write(x, from); void x.offsetWidth; write(x, to);
    });
  }
  function tween(el, scope) {
    carry(el, '.enx-fill', scope, (x) => x.style.clipPath, (x, v) => { x.style.clipPath = v; });
    carry(el, '.enx-dial i', scope, (x) => x.style.transform, (x, v) => { x.style.transform = v; });
    el.querySelectorAll('.enx-n').forEach((b, i) => {
      const k = scope + ':' + i, to = +b.dataset.v, from = lastVals.get(k);
      lastVals.set(k, to);
      if (reduced || auto || from === undefined || Math.abs(from - to) < 1e-9) return;
      const isPct = b.dataset.pct, dp = +b.dataset.dp, t0 = performance.now(), dur = 320;
      b.classList.add('is-changed');
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3), x = from + (to - from) * e;
        b.textContent = isPct ? pct(x) : f(x, dp);
        if (p < 1 && b.isConnected) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  /* ------------------------------------------------------------------ */
  /* The number popover: anchored to the number you tapped              */
  /* ------------------------------------------------------------------ */
  function openPop(btn) {
    const box = btn.closest('.enx'), pop = box._pop;
    if (pop._for === btn && !pop.hidden) { closePop(box); return; }
    closeAll();
    const o = btn.dataset.o, [kind, label, text] = ORIGIN[o], knob = btn.dataset.knob;
    const extra = knob ? `<p><b>${knob}</b> started at ${f(getK(original, knob), 5)} and is now ${f(getK(params, knob), 5)}.</p>` : '';
    pop.querySelector('.enx-pop-c').innerHTML = `<div class="enx-pop-h"><span class="enx-badge is-${kind}">${kindName[kind]}</span><b>${label}</b></div><p class="enx-pop-k">${kindLine[kind]}</p><p>${text().replace(/^Calculated\. /, '')}</p>${extra}`;
    pop.hidden = false; pop.classList.remove('is-open', 'is-above');
    const br = box.getBoundingClientRect(), r = btn.getBoundingClientRect(), w = pop.offsetWidth, h = pop.offsetHeight;
    const cx = r.left - br.left + r.width / 2;
    const left = Math.max(10, Math.min(br.width - w - 10, cx - w / 2));
    const above = r.bottom + h + 16 > window.innerHeight && r.top - h - 16 > 0;
    pop.style.left = left + 'px';
    pop.style.top = (above ? r.top - br.top - h - 8 : r.bottom - br.top + 8) + 'px';
    pop.style.transformOrigin = `${cx - left}px ${above ? '100%' : '0'}`;
    pop.classList.toggle('is-above', above);
    void pop.offsetWidth; pop.classList.add('is-open');
    pop._for = btn; btn.setAttribute('aria-expanded', 'true');
    box.querySelectorAll(`[data-o="${o}"]`).forEach((x) => x.classList.add('is-lit'));
    document.querySelectorAll('.enx-try').forEach((x) => x.remove());
    document.querySelectorAll('.enx-n.is-hint').forEach((x) => x.classList.remove('is-hint'));
    hinted = true;
  }
  function closePop(box, instant) {
    const pop = box._pop; if (!pop || pop.hidden) return;
    pop.classList.remove('is-open');
    pop._for?.setAttribute('aria-expanded', 'false');
    box.querySelectorAll('.is-lit').forEach((x) => x.classList.remove('is-lit'));
    const was = pop._for; pop._for = null;
    if (instant || reduced) pop.hidden = true; else setTimeout(() => { if (!pop._for) pop.hidden = true; }, 120);
    return was;
  }
  const closeAll = () => document.querySelectorAll('.enx').forEach((b) => closePop(b));
  let hinted = false;

  /* ------------------------------------------------------------------ */
  /* Events                                                              */
  /* ------------------------------------------------------------------ */
  const goTo = (target, kb) => window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 96, behavior: kb || reduced ? 'auto' : 'smooth' });
  function stopAuto() { clearInterval(auto); auto = null; document.querySelectorAll('.enx').forEach((x) => x.classList.remove('is-auto')); }
  document.addEventListener('click', (e) => {
    const box = e.target.closest('.enx');
    if (!e.target.closest('.enx-pop')) { const num = box && e.target.closest('.enx-n, .enx-dial'); if (num) { openPop(num); return; } closeAll(); }
    if (!box) return;
    const kb = e.detail === 0; // keyboard-initiated: no animation, keep focus where it was
    if (e.target.closest('.enx-pop-x')) { const was = closePop(box); was?.focus({ preventScroll: true }); return; }
    const jump = e.target.closest('[data-jump]');
    if (jump) { const L = LABS[jump.dataset.jump]; L.at = L.idx.length - 1; L.seen.add(L.at); renderLab(jump.dataset.jump, true, kb); goTo(L.el, kb); return; }
    const pb = e.target.closest('[data-probe]');
    if (pb) { probeAt = +pb.dataset.probe; renderProbe(box); if (kb) box.querySelector(`[data-probe="${probeAt}"]`)?.focus({ preventScroll: true }); return; }
    const go = e.target.closest('[data-go]'), stepB = e.target.closest('[data-step]'), id = box.dataset.lab;
    if ((go || stepB) && id) {
      const L = LABS[id];
      L.at = go ? +go.dataset.go : Math.max(0, Math.min(L.idx.length - 1, L.at + +stepB.dataset.step));
      L.seen.add(L.at);
      renderLab(id, true, kb);
      if (kb || stepB) box.querySelector(stepB && !kb ? '.enx-tab.is-on' : `[data-go="${L.at}"]`)?.focus({ preventScroll: true });
      if (box.getBoundingClientRect().top < 80) goTo(box, kb);
      return;
    }
    if (e.target.closest('[data-done]')) { const next = box.nextElementSibling; if (next) goTo(next, kb); return; }
    if (e.target.closest('[data-reset]')) { stopAuto(); reset(); sandbox.val = null; renderAll(); return; }
    const tr = e.target.closest('[data-train]');
    if (tr && !auto) {
      autoTotal = +tr.dataset.train; autoDone = 1;
      trainOnce(); sandbox.val = null;
      if (autoTotal > 1) {
        auto = setInterval(() => {
          trainOnce(); autoDone++;
          if (autoDone >= autoTotal) { stopAuto(); renderAll(); box.querySelector(`[data-train="${tr.dataset.train}"]`)?.focus({ preventScroll: true }); return; }
          renderAll();
        }, reduced ? 30 : 110);
        document.querySelectorAll('.enx').forEach((x) => x.classList.add('is-auto'));
      }
      renderAll();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.enx').forEach((b) => { const was = closePop(b, true); if (was) was.focus({ preventScroll: true }); });
  });
  // Phones fire resize when the address bar slides in and out; only a real width change moves the anchor.
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => { if (window.innerWidth !== lastW) { lastW = window.innerWidth; closeAll(); } });
  document.addEventListener('input', (e) => {
    const r = e.target.closest('[data-sandbox-val]'); if (!r) return;
    sandbox.val = +r.value;
    const out = r.closest('.enx-knoblab').querySelector('.enx-knoblab-out');
    if (out) out.innerHTML = knobOut();
  });
  document.addEventListener('change', (e) => {
    const s = e.target.closest('[data-sandbox-key]'); if (!s) return;
    sandbox = { key: s.value, val: null }; renderLab('mistake');
  });

  /* ------------------------------------------------------------------ */
  /* Mount                                                               */
  /* ------------------------------------------------------------------ */
  mounts.forEach((el) => {
    el.classList.add('enx', 'is-ready');
    if (el.dataset.lab && LABS[el.dataset.lab]) { LABS[el.dataset.lab].el = el; el.id = 'lab-' + el.dataset.lab; }
  });
  renderAll();

  // First-time cue: the coffee percentage pulses until the reader taps any number.
  const heroEl = document.querySelector('.enx-hero');
  heroEl?.querySelectorAll('.enx-barrow .enx-n')[1]?.classList.add('is-hint');

  // The blank re-rolls every few seconds while the hero is on screen and the tab is visible.
  if (heroEl && !reduced && 'IntersectionObserver' in window) {
    let visible = false, timer = null;
    const loop = () => { clearTimeout(timer); if (!visible || document.hidden) return; roll(heroEl); timer = setTimeout(loop, 6500); };
    new IntersectionObserver((ents) => { visible = ents.some((x) => x.isIntersecting); if (visible) loop(); else clearTimeout(timer); }, { threshold: 0.5 }).observe(heroEl);
    document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) loop(); });
  }
})();
