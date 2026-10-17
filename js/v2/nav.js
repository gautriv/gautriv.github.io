// nav.js — top nav interactions: scroll-edge material, mobile drawer, search palette, kbd shortcut.
// Motion runs on js/v2/spring.js (window.Fluid). Without it, everything still opens and closes.
(function () {
  'use strict';

  const F = window.Fluid;
  const top = document.querySelector('.site-top');
  const burger = document.querySelector('.nav-burger');
  const siteNav = document.querySelector('.site-nav');
  const searchTriggers = document.querySelectorAll('[data-action="open-search"]');
  const overlay = document.querySelector('.search-overlay');
  const mobileQuery = window.matchMedia('(max-width: 900px)');

  document.documentElement.classList.add('fluid');

  /* ---------- Scroll edge: the bar only separates when content is under it ---------- */
  if (top) {
    let ticking = false;
    const sync = () => { top.classList.toggle('is-scrolled', window.scrollY > 4); ticking = false; };
    document.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  }

  /* ---------- Mobile drawer: drops from the top, and can be thrown back up ---------- */
  let navOpen = false;
  let drawer = null;

  if (burger && siteNav) {
    burger.setAttribute('aria-expanded', 'false');
    const links = Array.from(siteNav.querySelectorAll('a'));
    const height = () => window.innerHeight;

    function paint (y) {
      if (!mobileQuery.matches) return;
      siteNav.style.transform = 'translate3d(0,' + y + 'px,0)';
      // Links trail the sheet a little, deeper ones more: the motion points where it's going.
      const p = Math.max(0, Math.min(1, 1 + y / height()));
      links.forEach((a, i) => {
        a.style.transform = 'translate3d(0,' + ((1 - p) * -14 * (i + 1)) + 'px,0)';
        a.style.opacity = String(Math.min(1, p * 1.4));
      });
    }

    drawer = F ? F.spring({
      value: -height(), damping: 1, response: 0.38,
      onUpdate: paint,
      onRest: (y) => { if (y <= -height() + 1) document.body.classList.remove('nav-open'); },
    }) : null;

    function setNavOpen (open, velocity) {
      navOpen = open;
      siteNav.classList.toggle('site-nav--open', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) document.body.classList.add('nav-open');
      if (!drawer || !mobileQuery.matches) {
        if (!open) document.body.classList.remove('nav-open');
        return;
      }
      // A thrown sheet keeps a little bounce; a tapped one settles flat.
      const opts = typeof velocity === 'number'
        ? { velocity, damping: 0.8, response: 0.3 }
        : { damping: 1, response: 0.38 };
      drawer.to(open ? 0 : -height(), opts);
    }

    burger.addEventListener('click', () => setNavOpen(!navOpen));

    let suppressClick = false;
    siteNav.addEventListener('click', (e) => {
      if (suppressClick) { e.preventDefault(); e.stopPropagation(); suppressClick = false; return; }
      if (e.target.closest('a')) setNavOpen(false);
    }, true);

    // Drag: 10px of hysteresis before committing, then 1:1 from where it was grabbed.
    if (drawer) {
      let drag = null;
      siteNav.addEventListener('pointerdown', (e) => {
        if (!navOpen || !mobileQuery.matches || e.button > 0) return;
        if (siteNav.scrollHeight > siteNav.clientHeight + 1) return; // let it scroll instead
        drag = { id: e.pointerId, startY: e.clientY, from: drawer.value, live: false, history: [{ y: e.clientY, t: e.timeStamp }] };
      });
      siteNav.addEventListener('pointermove', (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const dy = e.clientY - drag.startY;
        if (!drag.live) {
          if (Math.abs(dy) < 10) return;
          drag.live = true;
          drag.startY = e.clientY; // no jump when tracking begins
          siteNav.setPointerCapture(e.pointerId);
        }
        drag.history.push({ y: e.clientY, t: e.timeStamp });
        if (drag.history.length > 12) drag.history.shift();
        const raw = drag.from + (e.clientY - drag.startY);
        drawer.set(raw > 0 ? F.rubberband(raw, height()) : raw); // nothing above, so resist
      });
      const end = (e) => {
        if (!drag || e.pointerId !== drag.id) return;
        const wasLive = drag.live;
        const v = F.velocityFrom(drag.history);
        drag = null;
        if (!wasLive) return;
        suppressClick = true;
        setTimeout(() => { suppressClick = false; }, 0);
        // Decide from where the throw is going, not where the finger let go.
        const landing = drawer.value + F.project(v);
        setNavOpen(landing > -height() * 0.35, v);
      };
      siteNav.addEventListener('pointerup', end);
      siteNav.addEventListener('pointercancel', end);
    }

    // Crossing into desktop: hand the nav back to CSS.
    mobileQuery.addEventListener('change', () => {
      siteNav.style.transform = '';
      links.forEach((a) => { a.style.transform = ''; a.style.opacity = ''; });
      if (drawer) drawer.set(navOpen && mobileQuery.matches ? 0 : -height());
      if (!mobileQuery.matches) setNavOpen(false);
    });
    if (drawer && mobileQuery.matches) paint(-height());
  }

  /* ---------- Search palette: materializes out of the button that summoned it ---------- */
  let searchOpen = false;
  let returnFocus = null;
  const panel = overlay && overlay.querySelector('.search-panel');
  const input = overlay && overlay.querySelector('.search-panel-input');

  const palette = (F && panel) ? F.spring({
    value: 0, damping: 1, response: 0.32, precision: 0.001,
    onUpdate: (p) => {
      overlay.style.opacity = String(p);
      const s = 0.92 + 0.08 * p;
      panel.style.transform = 'translate3d(0,' + ((1 - p) * -10) + 'px,0) scale(' + s + ')';
      panel.style.filter = p > 0.995 ? '' : 'blur(' + ((1 - p) * 10).toFixed(2) + 'px)';
    },
    onRest: (p) => { if (p === 0) { overlay.setAttribute('data-open', 'false'); } },
  }) : null;

  function openSearch (trigger) {
    if (!overlay) return;
    searchOpen = true;
    returnFocus = trigger || document.activeElement;
    overlay.setAttribute('data-open', 'true');
    overlay.setAttribute('aria-hidden', 'false');
    if (palette) {
      // Anchor the scale to the trigger so the panel visibly comes from it.
      const src = trigger && trigger.getBoundingClientRect ? trigger.getBoundingClientRect() : null;
      const r = panel.getBoundingClientRect();
      if (src && src.width) {
        panel.style.transformOrigin = (src.left + src.width / 2 - r.left) + 'px ' + (src.top + src.height / 2 - r.top) + 'px';
      } else {
        panel.style.transformOrigin = '50% 0';
      }
      if (palette.value === 0) palette.set(0); // paint the start frame before display flips
      palette.to(1, { response: 0.32 });
    }
    if (input) input.focus({ preventScroll: true });
  }

  function closeSearch () {
    if (!overlay || !searchOpen) return;
    searchOpen = false;
    overlay.setAttribute('aria-hidden', 'true');
    if (palette) palette.to(0, { response: 0.24 });
    else overlay.setAttribute('data-open', 'false');
    if (returnFocus && returnFocus.focus) returnFocus.focus({ preventScroll: true });
  }

  searchTriggers.forEach((el) => el.addEventListener('click', () => {
    if (navOpen && burger) burger.click();
    openSearch(el);
  }));

  // The hint promises arrow keys; keep the promise.
  if (overlay) {
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const stops = [input].concat(Array.from(overlay.querySelectorAll('.search-results a')));
      if (stops.length < 2) return;
      e.preventDefault();
      const i = stops.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown' ? Math.min(stops.length - 1, i + 1) : Math.max(0, i - 1);
      stops[next].focus();
      if (stops[next].scrollIntoView) stops[next].scrollIntoView({ block: 'nearest' });
    });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeSearch(); });
  }

  document.addEventListener('keydown', (e) => {
    const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
    if (isCmdK) {
      e.preventDefault();
      if (searchOpen) closeSearch();
      else openSearch(document.querySelector('.search-trigger'));
    }
    if (e.key === 'Escape') {
      if (searchOpen) closeSearch();
      if (navOpen && burger) burger.click();
    }
  });

  /* ---------- Briefing dropdown ---------- */
  const alertTrigger = document.getElementById('navAlertTrigger');
  const alertDropdown = document.getElementById('navAlertDropdown');

  if (alertTrigger && alertDropdown) {
    alertTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isExpanded = alertTrigger.getAttribute('aria-expanded') === 'true';
      alertTrigger.setAttribute('aria-expanded', !isExpanded);
      alertDropdown.setAttribute('aria-hidden', isExpanded);
    });

    document.addEventListener('click', (e) => {
      if (!alertDropdown.contains(e.target) && e.target !== alertTrigger) {
        alertTrigger.setAttribute('aria-expanded', 'false');
        alertDropdown.setAttribute('aria-hidden', 'true');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        alertTrigger.setAttribute('aria-expanded', 'false');
        alertDropdown.setAttribute('aria-hidden', 'true');
      }
    });
  }
})();
