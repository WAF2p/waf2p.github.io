(function () {
  'use strict';

  // May 12 2026, 20:00 CEST (UTC+2)
  var RELEASE = new Date('2026-05-12T18:00:00Z').getTime();
  var STORAGE_KEY = 'wafpp_v1_modal_seen';

  var isDE = document.documentElement.lang === 'de';

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function getRemaining() {
    var diff = RELEASE - Date.now();
    if (diff <= 0) return null;
    var s = Math.floor(diff / 1000);
    return {
      days:    Math.floor(s / 86400),
      hours:   Math.floor((s % 86400) / 3600),
      minutes: Math.floor((s % 3600) / 60),
      seconds: s % 60
    };
  }

  function updateUnit(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = pad(value);
  }

  function applyTick(prefix, t) {
    updateUnit(prefix + 'days',    t.days);
    updateUnit(prefix + 'hours',   t.hours);
    updateUnit(prefix + 'minutes', t.minutes);
    updateUnit(prefix + 'seconds', t.seconds);
  }

  function showLaunched() {
    var bar = document.getElementById('release-countdown-bar');
    if (bar) {
      var cd = bar.querySelector('.release-bar__countdown');
      if (cd) {
        cd.innerHTML = '<span class="release-bar__launched">' +
          (isDE ? 'WAF++ 1.0 ist live! 🚀' : 'WAF++ 1.0 is live! 🚀') +
          '</span>';
      }
      var sub = bar.querySelector('.release-bar__sub');
      if (sub) sub.style.display = 'none';
    }
    var mc = document.getElementById('modal-countdown');
    if (mc) mc.style.display = 'none';
  }

  /* ---- Countdown ticker ---- */
  function startCountdown() {
    function tick() {
      var t = getRemaining();
      if (!t) { showLaunched(); return; }
      applyTick('bar-', t);
      applyTick('modal-', t);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* ---- Modal ---- */
  function closeModal(dialog) {
    dialog.close();
  }

  function initModal() {
    var dialog = document.getElementById('release-modal');
    if (!dialog) return;

    try {
      if (localStorage.getItem(STORAGE_KEY)) return;
      localStorage.setItem(STORAGE_KEY, '1');
    } catch (e) { /* storage unavailable — still show */ }

    setTimeout(function () {
      dialog.showModal();
      if (window.lucide) window.lucide.createIcons();
    }, 800);

    var backdrop  = document.getElementById('release-modal-backdrop');
    var closeBtn  = document.getElementById('release-modal-close');
    var dismissBtn = document.getElementById('release-modal-dismiss');

    if (backdrop)   backdrop.addEventListener('click',  function () { closeModal(dialog); });
    if (closeBtn)   closeBtn.addEventListener('click',  function () { closeModal(dialog); });
    if (dismissBtn) dismissBtn.addEventListener('click', function () { closeModal(dialog); });

    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal(dialog);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    startCountdown();
    initModal();
  });
})();
