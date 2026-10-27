(function () {
  const btn = document.getElementById('nav-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    document.body.classList.toggle('nav-open');
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
  });

  // Close on click outside
  document.addEventListener('click', function (e) {
    if (!document.body.classList.contains('nav-open')) return;
    const nav = document.querySelector('.nav');
    if (!nav) return;
    if (nav.contains(e.target) || btn.contains(e.target)) return;
    document.body.classList.remove('nav-open');
    btn.setAttribute('aria-expanded', 'false');
  });
})();


(function () {
  const modal = document.getElementById('person-modal');
  if (!modal) return;

  const img = document.getElementById('person-modal-image');
  const title = document.getElementById('person-modal-title');
  const role = document.getElementById('person-modal-role');
  const desc = document.getElementById('person-modal-desc');

  function openModal(data) {
    if (img) { img.src = data.image || ''; img.alt = data.name || ''; }
    if (title) title.textContent = data.name || '';
    if (role) role.textContent = data.role || '';
    if (desc) desc.textContent = data.desc || '';
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open','');
  }

  function closeModal() {
    if (typeof modal.close === 'function') modal.close();
    else modal.removeAttribute('open');
  }

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.avatar-btn');
    if (btn) {
      openModal({
        name: btn.dataset.personName,
        role: btn.dataset.personRole,
        desc: btn.dataset.personTitle,
        image: btn.dataset.personImage
      });
      return;
    }
    if (e.target.matches('[data-close-modal]') || e.target.closest('[data-close-modal]')) {
      closeModal();
    }
  });

  // close on backdrop click
  modal.addEventListener('click', function (e) {
    const rect = modal.getBoundingClientRect();
    const inDialog = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    );
    // dialog click events are tricky; use target
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
})();


(function () {
  const root = document.querySelector('[data-review-slider]');
  if (!root) return;

  const reviews = Array.from(root.querySelectorAll('[data-review]'));
  const dotsWrap = root.querySelector('[data-review-dots]');
  const prevBtn = root.querySelector('[data-review-prev]');
  const nextBtn = root.querySelector('[data-review-next]');

  if (!reviews.length || !dotsWrap) return;

  let idx = 0;
  let timer = null;

  function setActive(i) {
    idx = (i + reviews.length) % reviews.length;
    reviews.forEach((el, n) => el.classList.toggle('is-active', n === idx));
    Array.from(dotsWrap.children).forEach((dot, n) => dot.classList.toggle('is-active', n === idx));
  }

  function startAuto() {
    stopAuto();
    timer = window.setInterval(() => setActive(idx + 1), 6000);
  }

  function stopAuto() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  // Build dots
  dotsWrap.innerHTML = '';
  reviews.forEach((_, n) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'review-dot';
    b.setAttribute('aria-label', 'Go to review ' + (n + 1));
    b.addEventListener('click', () => {
      setActive(n);
      startAuto();
    });
    dotsWrap.appendChild(b);
  });

  if (prevBtn) prevBtn.addEventListener('click', () => { setActive(idx - 1); startAuto(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { setActive(idx + 1); startAuto(); });

  // Pause on hover/focus
  root.addEventListener('mouseenter', stopAuto);
  root.addEventListener('mouseleave', startAuto);
  root.addEventListener('focusin', stopAuto);
  root.addEventListener('focusout', startAuto);

  // Init
  setActive(0);
  startAuto();
})();


// Mobile nav: reset dropdowns when burger closes the nav
(function () {
  var burgerBtn = document.getElementById('nav-toggle');
  if (!burgerBtn) return;
  burgerBtn.addEventListener('click', function () {
    document.querySelectorAll('.nav-dropdown').forEach(function (d) { d.style.display = 'none'; });
    document.querySelectorAll('.nav-group-toggle').forEach(function (b) { b.setAttribute('aria-expanded', 'false'); });
  });
})();


(function () {
  // Remember when a visitor explicitly picks a language via the switcher,
  // so the auto-redirect does not override their choice on later visits.
  document.addEventListener('click', function (e) {
    var link = e.target.closest('[data-lang-option]');
    if (!link) return;
    try {
      localStorage.setItem('lang-override', '1');
      sessionStorage.setItem('lang-redirect-done', '1');
    } catch (err) {}
  });
})();


// Theme toggle (light/dark) with persistence
(function () {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  function currentTheme() {
    const t = root.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
  }

  function setTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    btn.setAttribute('aria-pressed', String(t === 'dark'));
    // swap icon (lucide)
    btn.innerHTML = t === 'dark'
      ? '<i data-lucide="sun"></i>'
      : '<i data-lucide="moon"></i>';
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  // init button state (early theme is already applied in <head> if stored)
  setTheme(currentTheme());

  btn.addEventListener('click', function () {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
})();


// Language switch dropdown (enhances the CSS checkbox fallback)
(function () {
  const toggles = document.querySelectorAll('[data-lang-toggle]');
  if (!toggles.length) return;

  toggles.forEach(function (root) {
    const check = root.querySelector('.lang-switch__check');
    const trigger = root.querySelector('.lang-switch__trigger');
    const menu = root.querySelector('.lang-switch__menu');
    if (!check || !trigger || !menu) return;

    function syncAria() {
      trigger.setAttribute('aria-expanded', String(check.checked));
    }

    function close() {
      check.checked = false;
      syncAria();
    }

    check.addEventListener('change', syncAria);

    // close when clicking a language option
    menu.querySelectorAll('.lang-option').forEach(function (link) {
      link.addEventListener('click', function () {
        close();
      });
    });

    // close when clicking outside
    document.addEventListener('click', function (e) {
      if (!root.contains(e.target)) close();
    });

    // keyboard: close on Escape
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { close(); trigger.focus(); }
    });
  });
})();


// Cookie consent modal
(function () {
  const STORAGE_KEY = 'wafpp-cookie-consent';
  const modal = document.getElementById('cookie-consent');
  const trigger = document.getElementById('cookie-trigger');
  if (!modal || !trigger) return;

  const closeButtons = modal.querySelectorAll('[data-cookie-close]');
  const acceptBtn = modal.querySelector('[data-cookie-accept]');
  const rejectBtn = modal.querySelector('[data-cookie-reject]');
  const saveBtn = modal.querySelector('[data-cookie-save]');
  const toggles = modal.querySelectorAll('[data-cookie-category]');

  const categories = ['analytics', 'functional', 'marketing'];

  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return null;
  }

  function setConsent(consent) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
    } catch (e) {}
    applyConsent(consent);
  }

  function applyConsent(consent) {
    // Dispatch a small event other scripts can listen to
    try {
      window.dispatchEvent(new CustomEvent('wafpp:consent', { detail: consent }));
    } catch (e) {}

    // Functional cookies are already handled by localStorage itself;
    // here we just expose a global helper for ad-hoc checks.
    window.wafppConsent = consent;
  }

  function buildConsent(values) {
    const out = { necessary: true, version: 1, updated: new Date().toISOString() };
    categories.forEach(function (c) { out[c] = !!values[c]; });
    return out;
  }

  function refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      try { window.lucide.createIcons(); } catch (e) {}
    }
  }

  function openModal() {
    modal.hidden = false;
    // force reflow
    void modal.offsetWidth;
    modal.classList.add('is-open');
    refreshIcons();
    const firstFocus = modal.querySelector('button, input');
    if (firstFocus) firstFocus.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    setTimeout(function () { modal.hidden = true; }, 250);
  }

  function populateToggles(consent) {
    toggles.forEach(function (input) {
      const cat = input.dataset.cookieCategory;
      input.checked = !!(consent && consent[cat]);
    });
  }

  function acceptAll() {
    const values = {};
    categories.forEach(function (c) { values[c] = true; });
    setConsent(buildConsent(values));
    closeModal();
  }

  function rejectNonEssential() {
    const values = {};
    categories.forEach(function (c) { values[c] = false; });
    setConsent(buildConsent(values));
    closeModal();
  }

  function savePreferences() {
    const values = {};
    toggles.forEach(function (input) {
      values[input.dataset.cookieCategory] = input.checked;
    });
    setConsent(buildConsent(values));
    closeModal();
  }

  function updateTriggerState() {
    if (getConsent()) {
      trigger.classList.remove('is-pending');
    } else {
      trigger.classList.add('is-pending');
    }
  }

  // Open modal automatically on first visit
  const existing = getConsent();
  if (existing) {
    applyConsent(existing);
    populateToggles(existing);
  } else {
    openModal();
  }
  updateTriggerState();

  // Trigger button reopens settings
  trigger.addEventListener('click', function () {
    populateToggles(getConsent());
    openModal();
  });

  closeButtons.forEach(function (btn) { btn.addEventListener('click', closeModal); });
  if (acceptBtn) acceptBtn.addEventListener('click', function () { acceptAll(); updateTriggerState(); });
  if (rejectBtn) rejectBtn.addEventListener('click', function () { rejectNonEssential(); updateTriggerState(); });
  if (saveBtn) saveBtn.addEventListener('click', function () { savePreferences(); updateTriggerState(); });

  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();

