// progress.js — top-of-page reading-progress bar for post pages.
// Browsers with scroll-driven animations run it entirely in CSS (fluid.css).
// Elsewhere: scaleX on the compositor, never width (which re-lays out every frame).
(function () {
  'use strict';
  const bar = document.querySelector('.reading-progress');
  if (!bar) return;
  if (window.CSS && CSS.supports('animation-timeline: scroll()')) return;
  const root = document.documentElement;
  let ticking = false;
  function update () {
    const p = root.scrollTop / (root.scrollHeight - root.clientHeight);
    bar.style.transform = 'scaleX(' + (isFinite(p) ? Math.max(0, Math.min(1, p)) : 0) + ')';
    ticking = false;
  }
  document.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
})();
