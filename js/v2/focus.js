// focus.js — focus mode entry, exit (pill click + Esc), toggle.
// The layout change is morphed with a View Transition where supported, and the
// paragraph you were reading stays where your eyes were: the page re-anchors to it.
(function () {
  'use strict';
  const enterBtn = document.querySelector('[data-action="enter-focus"]');
  const exitBtn = document.querySelector('[data-action="exit-focus"]');
  const body = document.body;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // The block nearest a third of the way down the viewport: roughly where reading happens.
  function anchor () {
    const blocks = document.querySelectorAll('.article-body > *');
    const line = window.innerHeight / 3;
    let best = null, bestTop = 0;
    for (const el of blocks) {
      const top = el.getBoundingClientRect().top;
      if (top <= line) { best = el; bestTop = top; } else break;
    }
    return best ? { el: best, top: bestTop } : null;
  }

  function apply (on) {
    if (body.classList.contains('focus') === on) return;
    const a = anchor();
    const run = () => {
      body.classList.toggle('focus', on);
      if (a) window.scrollBy(0, a.el.getBoundingClientRect().top - a.top);
    };
    if (document.startViewTransition && !reduce.matches) document.startViewTransition(run);
    else run();
  }

  function enter () { apply(true); }
  function exit  () { apply(false); }
  function toggle () { apply(!body.classList.contains('focus')); }

  if (enterBtn) enterBtn.addEventListener('click', toggle);
  if (exitBtn)  exitBtn.addEventListener('click', exit);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('focus')) exit();
  });

  // Expose for debugging.
  window.__focus = { enter, exit, toggle };
})();
