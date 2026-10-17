// spring.js — a tiny interruptible spring, in Apple's terms (damping ratio + response).
//
// Why not CSS transitions: anything a pointer can grab must be redirectable mid-flight,
// start from the value on screen, and inherit the finger's velocity. A spring does all
// three by construction. `to()` re-targets without resetting velocity, so a reversal
// blends instead of hitting a wall.
//
// Exposes window.Fluid = { spring, project, rubberband, reducedMotion }.
(function () {
  'use strict';

  const STEP = 1 / 240; // fixed integration step, s
  const reduceQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  // damping: 1 = critically damped (no overshoot), < 1 bounces.
  // response: seconds to (roughly) reach the target. Not a duration.
  // precision: rest threshold in the value's own units (use ~0.001 for 0..1 values).
  function spring ({ value = 0, damping = 1, response = 0.4, precision = 0.01, onUpdate, onRest } = {}) {
    let x = value, v = 0, target = value, raf = 0, last = 0;
    let k, c;
    function tune (d, r) {
      const w = (2 * Math.PI) / r;
      k = w * w;
      c = 4 * Math.PI * d / r;
    }
    tune(damping, response);

    function frame (now) {
      let dt = Math.min(0.064, (now - last) / 1000); // clamp after tab switch
      last = now;
      while (dt > 0) {
        const h = Math.min(STEP, dt);
        v += (-k * (x - target) - c * v) * h;
        x += v * h;
        dt -= h;
      }
      const done = Math.abs(v) < precision && Math.abs(x - target) < precision;
      if (done) { x = target; v = 0; raf = 0; }
      if (onUpdate) onUpdate(x, v);
      if (done) { if (onRest) onRest(x); return; }
      raf = requestAnimationFrame(frame);
    }

    const api = {
      get value () { return x; },
      get velocity () { return v; },
      get target () { return target; },
      get moving () { return raf !== 0; },
      // Animate toward t. Keeps current value and velocity unless `velocity` is given
      // (units per second, e.g. px/s from a gesture release).
      to (t, opts = {}) {
        target = t;
        tune(opts.damping || damping, opts.response || response); // per-call override, else defaults
        if (typeof opts.velocity === 'number') v = opts.velocity;
        if (reduceQuery.matches) { api.set(t); if (onRest) onRest(t); return api; }
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
        return api;
      },
      // Jump with no animation. Used for 1:1 tracking during a drag.
      set (val) {
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        x = target = val; v = 0;
        if (onUpdate) onUpdate(x, v);
        return api;
      },
      stop () { if (raf) { cancelAnimationFrame(raf); raf = 0; } v = 0; return api; },
    };
    return api;
  }

  // Where a flick would come to rest, using the scroll-view deceleration model
  // from Apple's Designing Fluid Interfaces sample code. velocity in px/s.
  function project (velocity, decelerationRate = 0.998) {
    return (velocity / 1000) * decelerationRate / (1 - decelerationRate);
  }

  // Progressive resistance past a boundary. Real things slow before they stop.
  function rubberband (overshoot, dimension, constant = 0.55) {
    const sign = overshoot < 0 ? -1 : 1;
    const o = Math.abs(overshoot);
    return sign * (o * dimension * constant) / (dimension + constant * o);
  }

  // Release velocity from a short pointer history: [{ y, t }, ...]
  function velocityFrom (history) {
    if (history.length < 2) return 0;
    const now = history[history.length - 1];
    let i = history.length - 2;
    while (i > 0 && now.t - history[i].t < 60) i--; // look back ~60ms
    const then = history[i];
    const dt = (now.t - then.t) / 1000;
    return dt > 0 ? (now.y - then.y) / dt : 0;
  }

  // iOS only fires :active when a touchstart listener exists somewhere.
  document.addEventListener('touchstart', function () {}, { passive: true });

  window.Fluid = {
    spring, project, rubberband, velocityFrom,
    get reducedMotion () { return reduceQuery.matches; },
  };
})();
