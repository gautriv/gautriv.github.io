// newsletter.js — handle "Get the dispatch" form submission.
//
// TinyLetter (the previous backend) was sunset by Mailchimp in 2024. Until a
// new provider is wired up, we intercept the form and open the user's mail
// client with a pre-filled subscription request to the site owner.
//
// To swap to a real provider later: replace the body of `handleSubmit` with a
// fetch() POST to your endpoint and update the success copy.
(function () {
  'use strict';

  const NEWSLETTER_TO = 'trivedi.gaurav30@gmail.com';

  function handleSubmit (e) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.querySelector('input[type="email"]');
    const status = form.querySelector('[data-newsletter-status]');
    if (!input || !input.value) return;

    const email = input.value.trim();
    const subject = encodeURIComponent('Subscribe me to the dispatch');
    const body = encodeURIComponent(
      'Hi Gaurav,\n\nPlease subscribe me to the dispatch.\n\nEmail: ' + email + '\n\nThanks.'
    );
    const mailto = 'mailto:' + NEWSLETTER_TO + '?subject=' + subject + '&body=' + body;

    window.location.href = mailto;
    if (status) {
      status.textContent = 'Opening your email — hit send to complete.';
    }
  }

  document.querySelectorAll('[data-newsletter]').forEach((form) => {
    form.addEventListener('submit', handleSubmit);
  });
})();
