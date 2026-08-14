(function () {
  function setupCodeWindows () {
    document.querySelectorAll('.code-window').forEach(function (windowEl) {
      if (windowEl.dataset.copyReady) return;
      windowEl.dataset.copyReady = 'true';

      const pre = windowEl.querySelector('pre.code-window__body');
      if (!pre) return;

      const code = pre.querySelector('code');
      const text = code ? code.textContent : pre.textContent;

      const btn = document.createElement('button');
      btn.className = 'code-window__copy';
      btn.type = 'button';
      btn.setAttribute('aria-label', 'Copy to clipboard');
      btn.innerHTML =
        '<i data-lucide="copy" aria-hidden="true"></i>' +
        '<span class="copy-label">Copy</span>' +
        '<span class="copied-label">Copied!</span>';

      btn.addEventListener('click', function () {
        navigator.clipboard.writeText(text).then(function () {
          btn.classList.add('is-copied');
          if (window.lucide) {
            const icon = btn.querySelector('i');
            if (icon) {
              icon.setAttribute('data-lucide', 'check');
              window.lucide.createIcons({ nodes: [icon], attrs: {} });
            }
          }
          setTimeout(function () {
            btn.classList.remove('is-copied');
            if (window.lucide) {
              const icon = btn.querySelector('i');
              if (icon) {
                icon.setAttribute('data-lucide', 'copy');
                window.lucide.createIcons({ nodes: [icon], attrs: {} });
              }
            }
          }, 1800);
        }).catch(function (err) {
          console.error('Copy failed', err);
        });
      });

      const bar = windowEl.querySelector('.code-window__bar');
      if (bar) bar.appendChild(btn);
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupCodeWindows);
  } else {
    setupCodeWindows();
  }
})();
