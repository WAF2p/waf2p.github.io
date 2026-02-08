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
