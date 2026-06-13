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

    // Active-section highlight via IntersectionObserver.
    let activeId = items[0].id;
    function setActive (id) {
      if (id === activeId) return;
      activeId = id;
      items.forEach(({ id: thisId, li }) => li.classList.toggle('active', thisId === id));
    }
    items.forEach(({ li, id }, i) => { if (i === 0) li.classList.add('active'); });

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible.length) {
        setActive(visible[0].target.id);
      }
    }, { rootMargin: '-20% 0px -70% 0px', threshold: 0 });

    items.forEach(({ el }) => observer.observe(el));
  });
})();
