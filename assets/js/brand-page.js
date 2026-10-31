/*
 * Brand page — copy a color token to the clipboard.
 * No dependencies; degrades silently when the clipboard API is
 * unavailable (the hex value is still visible on the swatch).
 */
(function () {
  var buttons = document.querySelectorAll('[data-copy]');
  if (!buttons.length) return;

  var lang = (document.documentElement.lang || 'en').toLowerCase();
  var copiedLabel = lang === 'de' ? 'Kopiert' : 'Copied';

  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    var ok = false;
    try {
      ok = document.execCommand('copy');
    } catch (e) {
      ok = false;
    }
    document.body.removeChild(field);
    return ok;
  }

  Array.prototype.forEach.call(buttons, function (button) {
    var hint = button.querySelector('.brand-swatch__hint');
    var original = hint ? hint.textContent : '';
    var value = button.getAttribute('data-copy');

    if (hint) {
      hint.setAttribute('aria-live', 'polite');
    }

    function markCopied() {
      if (!hint) return;
      hint.textContent = copiedLabel;
      window.setTimeout(function () {
        hint.textContent = original;
      }, 1400);
    }

    button.addEventListener('click', function () {
      if (!value) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(markCopied, function () {
          if (fallbackCopy(value)) markCopied();
        });
      } else if (fallbackCopy(value)) {
        markCopied();
      }
    });
  });
})();
