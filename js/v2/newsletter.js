// newsletter.js — handle "Get the dispatch" form submission.
// Posts to the unified Lambda endpoint with source: 'dispatch'.
// Two success branches: pending DOI vs already-confirmed (no email re-sent).
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dispatch-form');
    const emailInput = document.getElementById('dispatch-email');
    const submitBtn = document.getElementById('dispatch-submit');
    const successMsg = document.getElementById('dispatch-success');
    const errorMsg = document.getElementById('dispatch-error');

    if (!form) return;

    const ENDPOINT = 'https://sbzzbnh7me.execute-api.us-east-1.amazonaws.com/';

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = emailInput.value.trim();
      if (!email) return;

      if (errorMsg) errorMsg.style.display = 'none';
      submitBtn.disabled = true;
      submitBtn.innerText = 'Sending…';

      try {
        const response = await fetch(ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, source: 'dispatch' })
        });

        let data = null;
        try { data = await response.json(); } catch (_) { /* non-JSON error body */ }

        if (!response.ok || !data || !data.success) {
          const msg = (data && data.error) || ('Server returned ' + response.status);
          throw new Error(msg);
        }

        if (data.alreadyConfirmed) {
          successMsg.innerText = '✓ You are already on the list.';
        } else {
          successMsg.innerText = '✓ Check your inbox to confirm your subscription.';
        }
        form.style.display = 'none';
        successMsg.style.display = 'block';

      } catch (error) {
        console.error('Dispatch signup failed:', error);
        submitBtn.disabled = false;
        submitBtn.innerText = 'Subscribe';
        if (errorMsg) {
          errorMsg.innerText = error.message || 'Couldn\'t reach the server. Try again in a moment.';
          errorMsg.style.display = 'block';
        }
      }
    });
  });
})();
