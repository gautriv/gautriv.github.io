// nav.js — top nav interactions: mobile menu, search trigger, kbd shortcut.
(function () {
  'use strict';

  const burger = document.querySelector('.nav-burger');
  const siteNav = document.querySelector('.site-nav');
  const searchTriggers = document.querySelectorAll('[data-action="open-search"]');
  const overlay = document.querySelector('.search-overlay');

  function setNavOpen (open) {
    if (!burger || !siteNav) return;
    siteNav.classList.toggle('site-nav--open', open);
    document.body.classList.toggle('nav-open', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  if (burger && siteNav) {
    burger.setAttribute('aria-expanded', 'false');
    burger.addEventListener('click', () => {
      setNavOpen(!siteNav.classList.contains('site-nav--open'));
    });
    siteNav.addEventListener('click', (e) => {
      if (e.target.closest('a')) setNavOpen(false);
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

  searchTriggers.forEach((el) => el.addEventListener('click', () => {
    setNavOpen(false);
    openSearch();
  }));

  document.addEventListener('keydown', (e) => {
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    if (isCmdK) { e.preventDefault(); openSearch(); }
    if (e.key === 'Escape') {
      if (overlay && overlay.getAttribute('data-open') === 'true') closeSearch();
      if (document.body.classList.contains('nav-open')) setNavOpen(false);
    }
  });

  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeSearch();
    });
  }
})();
