// progress.js — top-of-page reading-progress bar for post pages.
(function () {
  'use strict';
  const bar = document.querySelector('.reading-progress');
  if (!bar) return;
  const root = document.documentElement;
  function update () {
    const pct = (root.scrollTop / (root.scrollHeight - root.clientHeight)) * 100;
    bar.style.width = (isFinite(pct) ? pct : 0) + '%';
  }
  document.addEventListener('scroll', update, { passive: true });
  update();
})();
