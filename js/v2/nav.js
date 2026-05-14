// nav.js — top nav interactions: mobile menu, search trigger, kbd shortcut.
(function () {
  'use strict';

  const burger = document.querySelector('.nav-burger');
  const siteNav = document.querySelector('.site-nav');
  const searchTriggers = document.querySelectorAll('[data-action="open-search"]');
  const overlay = document.querySelector('.search-overlay');

  if (burger && siteNav) {
    burger.addEventListener('click', () => {
      const open = siteNav.classList.toggle('site-nav--open');
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    });
  }

  function openSearch () {
    if (!overlay) return;
    overlay.setAttribute('data-open', 'true');
    const input = overlay.querySelector('.search-panel-input');
    if (input) setTimeout(() => input.focus(), 30);
  }
  function closeSearch () {
    if (!overlay) return;
    overlay.setAttribute('data-open', 'false');
  }

  searchTriggers.forEach((el) => el.addEventListener('click', openSearch));

  document.addEventListener('keydown', (e) => {
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    if (isCmdK) { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape' && overlay && overlay.getAttribute('data-open') === 'true') {
      closeSearch();
    }
  });

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });
  }
})();
