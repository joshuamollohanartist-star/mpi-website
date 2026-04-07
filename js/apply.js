/* ===========================
   MPI ARTIST SERVICES
   Application Form Logic
   =========================== */

(function () {
  'use strict';

  const form        = document.getElementById('applicationForm');
  const successView = document.getElementById('formSuccess');
  const steps       = document.querySelectorAll('.form-step');
  const progressDots= document.querySelectorAll('.progress-step');

  if (!form) return;

  let currentStep = 1;

  // ── STEP NAVIGATION ──

  function showStep(n) {
    steps.forEach(step => {
      const num = parseInt(step.dataset.step);
      if (num === n) {
        step.hidden = false;
        step.removeAttribute('hidden');
      } else {
        step.hidden = true;
      }
    });

    progressDots.forEach(dot => {
      const num = parseInt(dot.dataset.step);
      dot.classList.remove('active', 'completed');
      if (num === n) dot.classList.add('active');
      if (num < n)  dot.classList.add('completed');
    });

    currentStep = n;

    // Scroll to top of form area
    const formWrap = document.querySelector('.apply-form-wrap');
    if (formWrap) {
      formWrap.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── VALIDATION ──

  function clearErrors(fieldset) {
    fieldset.querySelectorAll('.field-input').forEach(el => el.classList.remove('error'));
    fieldset.querySelectorAll('.field-error').forEach(el => {
      el.textContent = '';
      el.classList.remove('visible');
    });
  }

  function showError(input, message) {
    input.classList.add('error');
    const errEl = input.parentElement.querySelector('.field-error');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
    }
    input.focus();
    return false;
  }

  function validateStep(n) {
    const fieldset = document.querySelector(`.form-step[data-step="${n}"]`);
    if (!fieldset) return true;

    clearErrors(fieldset);
    let valid = true;
    let firstError = null;

    // Collect all required inputs in order
    const required = fieldset.querySelectorAll('[required]');

    for (const field of required) {
      const tag = field.tagName.toLowerCase();

      if (field.type === 'checkbox') {
        if (!field.checked) {
          field.classList.add('error');
          const errEl = document.getElementById('agreeError');
          if (errEl) {
            errEl.textContent = 'You must confirm this before submitting.';
            errEl.classList.add('visible');
          }
          if (!firstError) firstError = field;
          valid = false;
        }
        continue;
      }

      if (field.type === 'radio') continue; // Handled separately

      const val = field.value.trim();
      if (!val) {
        if (!firstError) firstError = field;
        showError(field, `This field is required.`);
        valid = false;
        continue;
      }

      if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        if (!firstError) firstError = field;
        showError(field, 'Please enter a valid email address.');
        valid = false;
        continue;
      }

      if (field.type === 'url' && val) {
        try { new URL(val); } catch {
          if (!firstError) firstError = field;
          showError(field, 'Please enter a valid URL (include https://).');
          valid = false;
          continue;
        }
      }

      if (field.minLength && val.length < field.minLength) {
        if (!firstError) firstError = field;
        showError(field, `Please provide at least ${field.minLength} characters.`);
        valid = false;
        continue;
      }
    }

    // Check radio group (tier) if on step 4
    if (n === 4) {
      const tierSelected = fieldset.querySelector('input[name="tier"]:checked');
      if (!tierSelected) {
        const errEl = fieldset.querySelector('.tier-error');
        if (errEl) {
          errEl.textContent = 'Please select a tier to apply for.';
          errEl.classList.add('visible');
        }
        if (!firstError) firstError = fieldset.querySelector('.tier-selector');
        valid = false;
      }
    }

    if (firstError) {
      try { firstError.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch(e) {}
      try { firstError.focus(); } catch(e) {}
    }

    return valid;
  }

  // ── NEXT / PREV BUTTONS ──

  document.querySelectorAll('.next-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const nextStep = parseInt(btn.dataset.next);
      if (validateStep(currentStep)) {
        showStep(nextStep);
      }
    });
  });

  document.querySelectorAll('.prev-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prevStep = parseInt(btn.dataset.prev);
      showStep(prevStep);
    });
  });

  // ── FORM SUBMIT ──

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateStep(4)) return;

    const submitBtn  = document.getElementById('submitBtn');
    const submitText = submitBtn.querySelector('.submit-text');
    const submitLoad = submitBtn.querySelector('.submit-loading');

    // Show loading state
    submitText.hidden = true;
    submitLoad.hidden = false;
    submitBtn.disabled = true;

    // Collect form data
    const data = Object.fromEntries(new FormData(form).entries());
    data.submittedAt = new Date().toISOString();

    // Submit to MPI backend
    // Update API_BASE to your Railway URL before deploying, e.g.:
    // const API_BASE = 'https://mpi-dashboard-production-xxxx.up.railway.app';
    const API_BASE = window.MPI_API_BASE || 'https://dashboard.mpiartist.com';

    try {
      const res = await fetch(`${API_BASE}/api/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      // Show success
      form.hidden = true;
      successView.hidden = false;
      successView.removeAttribute('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.error('[MPI Apply] Submission failed:', err);

      // Re-enable button and show error
      submitText.hidden = false;
      submitLoad.hidden = true;
      submitBtn.disabled = false;

      // Show inline error
      let errorEl = document.getElementById('submitError');
      if (!errorEl) {
        errorEl = document.createElement('p');
        errorEl.id = 'submitError';
        errorEl.style.cssText = 'color:#dc2626;font-size:14px;margin-top:12px;text-align:center;';
        submitBtn.parentElement.appendChild(errorEl);
      }
      errorEl.textContent = 'Something went wrong submitting your application. Please try again or email us at hello@mpiartist.com';
      return;
    }
  });

  // ── REAL-TIME VALIDATION ON BLUR ──

  document.querySelectorAll('.field-input').forEach(input => {
    input.addEventListener('blur', () => {
      if (input.classList.contains('error')) {
        // Re-validate single field on blur if it had an error
        const val = input.value.trim();
        if (val) {
          input.classList.remove('error');
          const errEl = input.parentElement.querySelector('.field-error');
          if (errEl) {
            errEl.textContent = '';
            errEl.classList.remove('visible');
          }
        }
      }
    });
  });

  // ── CHAR COUNT FOR TEXTAREAS ──

  document.querySelectorAll('.field-textarea[minlength]').forEach(ta => {
    const min = parseInt(ta.minLength);
    const help = ta.parentElement.querySelector('.field-help');
    if (!help) return;

    const originalText = help.textContent;

    ta.addEventListener('input', () => {
      const len = ta.value.length;
      if (len < min) {
        help.textContent = `${len} / ${min} characters minimum`;
        help.style.color = len > min * 0.7 ? 'var(--gold)' : '';
      } else {
        help.textContent = originalText;
        help.style.color = '';
      }
    });
  });

  // ── INIT ──
  showStep(1);

})();
