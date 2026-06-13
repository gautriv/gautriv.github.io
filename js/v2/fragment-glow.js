// fragment-glow.js — when the page loads with a URL fragment that matches an
// element id (or marked .ai-anchor), apply a transient "fragment-glow" class.
(function () {
  'use strict';

  function applyGlow (el) {
    if (!el) return;
    el.classList.add('fragment-glow');
    setTimeout(() => el.classList.remove('fragment-glow'), 4200);
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    if (window.dataLayer) {
      window.dataLayer.push({ event: 'ai_referrer_landing', fragment: el.id || 'text-fragment' });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const hash = location.hash;
    if (!hash || hash.length < 2) return;

    // 1. Try id match.
    let target = document.getElementById(hash.slice(1));
    if (target) { applyGlow(target); return; }

    // 2. Try class .ai-anchor with that id.
    target = document.querySelector('.ai-anchor#' + CSS.escape(hash.slice(1)));
    if (target) { applyGlow(target); return; }

    // 3. Text-fragment URLs (#:~:text=) — handled natively by browser scroll.
    // We can't intercept the matched range from JS, so we leave the glow off.
    // Future: listen for `selectionchange` to detect the browser highlight.
  });
})();
