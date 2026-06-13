// focus.js — focus mode entry, exit (pill click + Esc), toggle.
(function () {
  'use strict';
  const enterBtn = document.querySelector('[data-action="enter-focus"]');
  const exitBtn = document.querySelector('[data-action="exit-focus"]');
  const body = document.body;

  function enter () { body.classList.add('focus'); }
  function exit  () { body.classList.remove('focus'); }
  function toggle () { body.classList.toggle('focus'); }

  if (enterBtn) enterBtn.addEventListener('click', toggle);
  if (exitBtn)  exitBtn.addEventListener('click', exit);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && body.classList.contains('focus')) exit();
  });

  // Expose for debugging.
  window.__focus = { enter, exit, toggle };
})();
