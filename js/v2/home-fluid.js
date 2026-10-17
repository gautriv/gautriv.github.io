// home-fluid.js — homepage motion: cursor lens over the blueprint grid, lead-card tilt
// with layered parallax, row spotlights, stat count-up. Pointer-fine devices only for
// anything that follows the cursor. Everything degrades to the static page.
(function () {
  'use strict';
  const F = window.Fluid;
  if (!F) return;

  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduced = F.reducedMotion;

  /* ---------- Cursor lens: lights up the grid where you look ---------- */
  // X and Y are separate springs so a diagonal flick doesn't desync (they have
  // different velocities). The lens trails with a little mass, never overshoots.
  const lens = document.querySelector('.cursor-lens');
  if (lens && finePointer && !reduced) {
    const R = lens.offsetWidth / 2 || 260;
    let x = innerWidth * 0.7, y = innerHeight * 0.25;
    const draw = () => {
      lens.style.transform = 'translate3d(' + (x - R) + 'px,' + (y - R) + 'px,0)';
      // Counter-shift the lens's own grid so its lines stay registered to the page grid.
      const g = (R - x) + 'px ' + (R - y) + 'px';
      lens.style.backgroundPosition = g + ', ' + g + ', 0 0';
    };
    const sx = F.spring({ value: x, damping: 1, response: 0.55, onUpdate: (v) => { x = v; draw(); } });
    const sy = F.spring({ value: y, damping: 1, response: 0.55, onUpdate: (v) => { y = v; draw(); } });
    const fade = F.spring({ value: 0, damping: 1, response: 0.4, precision: 0.001, onUpdate: (o) => { lens.style.opacity = String(o); } });
    draw();
    document.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      sx.to(e.clientX); sy.to(e.clientY); fade.to(1);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => fade.to(0));
    // Fade out over the feed so the lens stays a hero effect, not a distraction while reading.
    const hero = document.querySelector('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(([en]) => { lens.dataset.hidden = en.isIntersecting ? 'false' : 'true'; },
        { threshold: 0.15 }).observe(hero);
    }
  }

  /* ---------- Lead card: tilt toward the pointer, layers at different depths ---------- */
  const card = document.querySelector('[data-tilt]');
  if (card && finePointer && !reduced) {
    const art = card.querySelector('.pinned-art');
    const layers = Array.from(card.querySelectorAll('[data-depth]'));
    const glare = card.querySelector('.pinned-art-glare');
    const MAX = 3.2; // deg. Enough to feel physical, not enough to blur text.
    let rx = 0, ry = 0;
    const paint = () => {
      const resting = Math.abs(rx) < 0.01 && Math.abs(ry) < 0.01;
      card.style.transform = resting ? '' : 'perspective(1400px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
      layers.forEach((el) => {
        const d = +el.dataset.depth;
        el.style.transform = resting ? '' : 'translate3d(' + (ry / MAX) * d + 'px,' + (-rx / MAX) * d + 'px,0)';
      });
    };
    // Apple ships damping 0.8 for rotation: a hint of follow-through.
    const srx = F.spring({ damping: 0.8, response: 0.4, onUpdate: (v) => { rx = v; paint(); } });
    const sry = F.spring({ damping: 0.8, response: 0.4, onUpdate: (v) => { ry = v; paint(); } });
    card.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      sry.to(px * MAX * 2);
      srx.to(-py * MAX * 2);
      if (glare && art) {
        const a = art.getBoundingClientRect();
        glare.style.setProperty('--gx', (e.clientX - a.left) + 'px');
        glare.style.setProperty('--gy', (e.clientY - a.top) + 'px');
      }
    });
    card.addEventListener('pointerleave', () => { srx.to(0); sry.to(0); });
  }

  /* ---------- Row spotlight: a soft light that follows the pointer across a row ---------- */
  if (finePointer) {
    const feed = document.querySelector('.feed-main');
    if (feed) {
      feed.addEventListener('pointermove', (e) => {
        const row = e.target.closest('.row');
        if (!row) return;
        const r = row.getBoundingClientRect();
        row.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        row.style.setProperty('--my', (e.clientY - r.top) + 'px');
      }, { passive: true });
    }
  }

  /* ---------- Whole rows are the target, not just the title text ---------- */
  document.querySelectorAll('.feed-main .row').forEach((row) => {
    const link = row.querySelector('h3 a');
    if (!link) return;
    row.addEventListener('click', (e) => {
      if (e.target.closest('a') || window.getSelection().toString()) return;
      if (e.metaKey || e.ctrlKey) window.open(link.href, '_blank');
      else link.click();
    });
  });

  /* ---------- Stats count up once, on a spring, when they come into view ---------- */
  const counters = Array.from(document.querySelectorAll('[data-count]'));
  if (counters.length && !reduced && 'IntersectionObserver' in window) {
    // Hold each final width so changing digits never shift the layout.
    counters.forEach((el) => { el.style.minWidth = el.offsetWidth + 'px'; el.textContent = '0'; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target;
        const end = parseInt(el.dataset.count, 10) || 0;
        const s = F.spring({ value: 0, damping: 1, response: 0.9, precision: 0.4,
          onUpdate: (v) => { el.textContent = String(Math.round(v)); },
          onRest: () => { el.textContent = String(end); } });
        s.to(end);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }
})();
