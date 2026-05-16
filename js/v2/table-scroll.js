// Wraps every <table> inside .article-body with a horizontally-scrollable
// container so wide tables never push the post page past the viewport width.
(function () {
  'use strict';
  const tables = document.querySelectorAll('.article-body table');
  tables.forEach((t) => {
    if (t.parentElement && t.parentElement.classList.contains('table-scroll')) return;
    const wrap = document.createElement('div');
    wrap.className = 'table-scroll';
    t.parentNode.insertBefore(wrap, t);
    wrap.appendChild(t);
  });
})();
