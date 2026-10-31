/*
 * Copy buttons for provider quickstart code blocks.
 * Works on static GitHub Pages; no external dependencies.
 */
(function () {
  'use strict';

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(area);
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-copy-code]');
    if (!button) return;
    var box = button.closest('.hub-code');
    var code = box ? box.querySelector('code') : null;
    if (!code) return;

    copyText(code.textContent).then(function () {
      var original = button.textContent;
      button.textContent = (document.documentElement.lang || 'en').toLowerCase().indexOf('de') === 0 ? 'Kopiert' : 'Copied';
      window.setTimeout(function () {
        button.textContent = original;
      }, 1400);
    }).catch(function () {});
  });
})();
