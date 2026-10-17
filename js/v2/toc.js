// toc.js — populate the left-rail TOC from h2/h3 headings in .article-body.
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const tocList = document.getElementById('post-toc');
    const article = document.querySelector('.article-body');
    if (!tocList || !article) return;

    const headings = article.querySelectorAll('h2, h3');
    if (!headings.length) {
      const rail = tocList.closest('.left-rail');
      if (rail) rail.style.display = 'none';
      return;
    }

    const items = [];
    headings.forEach((h) => {
      if (!h.id) {
        h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      const li = document.createElement('li');
      li.classList.add('toc-' + h.tagName.toLowerCase());
      li.dataset.target = h.id;
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      li.appendChild(a);
      tocList.appendChild(li);
      items.push({ id: h.id, el: h, li });
    });

    // One indicator that slides between entries on a spring, instead of borders
    // blinking on and off. Fast scrolling just re-targets it mid-flight.
    const rail = tocList.closest('.left-rail');
    const marker = document.createElement('span');
    marker.className = 'toc-marker';
    marker.setAttribute('aria-hidden', 'true');
    if (rail) rail.appendChild(marker);
    let my = 0, mh = 0;
    const paintMarker = () => { marker.style.transform = 'translate3d(0,' + my + 'px,0) scaleY(' + mh + ')'; };
    const F = window.Fluid;
    const sy = F && F.spring({ damping: 1, response: 0.35, onUpdate: (v) => { my = v; paintMarker(); } });
    const sh = F && F.spring({ damping: 1, response: 0.35, onUpdate: (v) => { mh = v; paintMarker(); } });
    function moveMarker (li, instant) {
      if (!rail || !li.offsetHeight) return;
      const y = li.offsetTop, h = li.offsetHeight; // .left-rail is the offsetParent (sticky)
      if (!sy || instant) { my = y; mh = h; paintMarker(); if (sy) { sy.set(y); sh.set(h); } return; }
      sy.to(y); sh.to(h);
    }

    // Active-section highlight via IntersectionObserver.
    let activeId = items[0].id;
    function setActive (id) {
      if (id === activeId) return;
      activeId = id;
      items.forEach(({ id: thisId, li }) => {
        li.classList.toggle('active', thisId === id);
        if (thisId === id) moveMarker(li);
      });
    }
    items.forEach(({ li }, i) => { if (i === 0) { li.classList.add('active'); moveMarker(li, true); } });
    window.addEventListener('resize', () => {
      const cur = items.find((it) => it.id === activeId);
      if (cur) moveMarker(cur.li, true);
    });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    items.forEach(({ el }) => observer.observe(el));
  });
})();
