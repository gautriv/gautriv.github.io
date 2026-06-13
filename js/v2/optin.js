document.addEventListener('DOMContentLoaded', () => {
    const popup = document.getElementById('survival-stack-popup');
    const closeBtn = document.getElementById('close-survival-popup');
    const form = document.getElementById('survival-stack-form');
    const emailInput = document.getElementById('survival-email');
    const submitBtn = document.getElementById('survival-submit-btn');
    const successMsg = document.getElementById('survival-success-msg');
    const errorMsg = document.getElementById('survival-error-msg');

    if (!popup) return;

    // Check if user has already seen or closed it
    if (localStorage.getItem('survival_popup_closed') === 'true') {
        return;
    }

    // Trigger logic: 15 seconds OR 5% scroll depth
    let triggered = false;
    
    let engaged = false;
    let nudgeTimer = null;
    const markEngaged = () => {
        if (engaged) return;
        engaged = true;
        if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
        if (form) form.classList.add('is-engaged');
    };

    const showPopup = () => {
        if (triggered) return;
        triggered = true;
        popup.classList.add('active');
        popup.setAttribute('aria-hidden', 'false');

        // Idle re-attract: if user hasn't engaged after 14s, do one soft nudge.
        // Single fire only — repeated nudges read as desperate / spammy.
        nudgeTimer = setTimeout(() => {
            if (engaged) return;
            popup.classList.add('nudge');
            setTimeout(() => popup.classList.remove('nudge'), 1100);
        }, 14000);
    };

    // 15 second timer
    setTimeout(showPopup, 15000);

    // 5% scroll trigger
    const scrollHandler = () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        if (scrollPercent >= 5) {
            showPopup();
            window.removeEventListener('scroll', scrollHandler);
        }
    };
    window.addEventListener('scroll', scrollHandler);

    // Close logic
    closeBtn.addEventListener('click', () => {
        popup.classList.remove('active');
        popup.setAttribute('aria-hidden', 'true');
        if (nudgeTimer) { clearTimeout(nudgeTimer); nudgeTimer = null; }
        localStorage.setItem('survival_popup_closed', 'true');
    });

    // Engagement signals — any of these "wakes up" the CTA + cancels the nudge.
    // Typing in the field = commitment trigger; hovering the popup = curiosity.
    if (emailInput) {
        ['input', 'focus'].forEach(ev => emailInput.addEventListener(ev, markEngaged, { once: false }));
    }
    popup.addEventListener('mouseenter', markEngaged, { once: true });

    // Form submission — double opt-in via our own Lambda + SES.
    // Lambda returns one of two success branches:
    //   { success: true, pending: true }         → new opt-in, DOI email queued
    //   { success: true, alreadyConfirmed: true } → returning subscriber, kit link sent directly
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) return;

        if (errorMsg) errorMsg.className = 'survival-error-hidden';
        submitBtn.disabled = true;
        submitBtn.innerText = 'Sending confirmation…';

        try {
            const ENDPOINT = 'https://sbzzbnh7me.execute-api.us-east-1.amazonaws.com/';

            const response = await fetch(ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email, source: 'kit_optin' })
            });

            let data = null;
            try { data = await response.json(); } catch (_) { /* non-JSON error body */ }

            if (!response.ok || !data || !data.success) {
                const msg = (data && data.error) || ('Server returned ' + response.status);
                throw new Error(msg);
            }

            // Returning subscriber → bounce them straight to the kit page (no email).
            // First-time → show "check your inbox" until they click the DOI link.
            if (data.alreadyConfirmed && data.redirectUrl) {
                window.location.href = data.redirectUrl;
                return;
            }
            successMsg.innerHTML = '<strong>Check your inbox.</strong> The kit lands the moment you click the confirmation link.';
            form.style.display = 'none';
            successMsg.className = 'survival-success-visible';
            localStorage.setItem('survival_popup_closed', 'true');

        } catch (error) {
            console.error('Survival kit opt-in failed:', error);
            submitBtn.disabled = false;
            submitBtn.innerText = 'Access the operational briefing';
            if (errorMsg) {
                errorMsg.textContent = error.message || 'Couldn\'t reach the server. Try again in a moment.';
                errorMsg.className = 'survival-error-visible';
            }
        }
    });
});
