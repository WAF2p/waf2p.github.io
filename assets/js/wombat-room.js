/*
 * Wombat Control Room — easter egg interactions.
 *
 * The page ships all copy in the DOM (per language), so this file
 * stays language-agnostic. Config strings and console responses
 * come from the inline <script type="application/json"
 * data-wr-config> block in each localized page.
 *
 * Mechanics: press DIG (or Space / D) to unearth one of the eight
 * pillars. Found pillars persist in localStorage. The console
 * accepts a handful of playful commands. On 8/8 the room runs a
 * short boot sequence, lights the pillar rack, rains WAF codes and
 * unlocks a downloadable "Burrow Engineer" badge.
 */
(function () {
  var grid = document.querySelector('[data-wr-grid]');
  if (!grid) return;

  var layout = document.querySelector('.wr-layout');
  var stage = document.querySelector('.wr-stage');
  var digBtn = document.querySelector('[data-wr-dig]');
  var resetBtn = document.querySelector('[data-wr-reset]');
  var countEl = document.querySelector('[data-wr-count]');
  var bubble = document.querySelector('[data-wr-bubble]');
  var consoleEl = document.querySelector('.wr-console');
  var logEl = document.querySelector('[data-wr-log]');
  var form = document.querySelector('[data-wr-form]');
  var input = document.querySelector('[data-wr-input]');
  var secret = document.querySelector('[data-wr-secret]');
  var achievementEl = document.querySelector('[data-wr-achievement]');
  var configEl = document.querySelector('[data-wr-config]');

  var config = {};
  if (configEl) {
    try {
      config = JSON.parse(configEl.textContent);
    } catch (e) {
      config = {};
    }
  }

  var STORAGE_KEY = 'wombat-room-found-v1';
  var CELEBRATED_KEY = 'wombat-room-celebrated-v1';
  var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-wr-card]'));
  var ids = cards.map(function (card) {
    return card.getAttribute('data-wr-card');
  });
  var reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
  var found = loadFound();
  var history = [];
  var historyIndex = 0;
  var celebrating = false;
  var rainCanvas = null;

  function cardById(id) {
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].getAttribute('data-wr-card') === id) return cards[i];
    }
    return null;
  }

  function loadFound() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      var seen = {};
      return parsed.filter(function (id) {
        if (ids.indexOf(id) === -1 || seen[id]) return false;
        seen[id] = true;
        return true;
      });
    } catch (e) {
      return [];
    }
  }

  function saveFound() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      /* storage can be unavailable in private windows — the room still works */
    }
  }

  function isCelebrated() {
    try {
      return window.localStorage.getItem(CELEBRATED_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function markCelebrated() {
    try {
      window.localStorage.setItem(CELEBRATED_KEY, '1');
    } catch (e) {
      /* ignore */
    }
  }

  function clearCelebrated() {
    try {
      window.localStorage.removeItem(CELEBRATED_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function remaining() {
    return ids.filter(function (id) {
      return found.indexOf(id) === -1;
    });
  }

  function setCard(id, isFound) {
    var card = cardById(id);
    if (!card) return;
    card.classList.toggle('is-found', isFound);
    var locked = card.querySelector('.wr-card__locked');
    var reveal = card.querySelector('.wr-card__found');
    if (locked) locked.hidden = isFound;
    if (reveal) reveal.hidden = !isFound;
  }

  function updateCount() {
    if (countEl) countEl.textContent = String(found.length);
  }

  function say(text) {
    if (bubble && text) bubble.textContent = text;
  }

  function log(text, kind) {
    if (!logEl || !text) return null;
    var line = document.createElement('p');
    line.className = 'wr-console__line' + (kind ? ' wr-console__line--' + kind : '');
    line.textContent = text;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
    return line;
  }

  /* Dust puffs, positioned relative to the stage. Skipped entirely
     when the visitor prefers reduced motion. */
  function spark(count) {
    if (reduceMotion || !stage) return;
    var stageRect = stage.getBoundingClientRect();
    var originRect = digBtn ? digBtn.getBoundingClientRect() : stageRect;
    for (var i = 0; i < count; i++) {
      var particle = document.createElement('span');
      particle.className = 'wr-spark';
      particle.setAttribute('aria-hidden', 'true');
      particle.style.left =
        (originRect.left - stageRect.left + Math.random() * originRect.width) + 'px';
      particle.style.top =
        (originRect.top - stageRect.top + Math.random() * Math.min(originRect.height, 36)) + 'px';
      particle.style.setProperty('--wr-dx', (Math.random() * 160 - 80).toFixed(0) + 'px');
      particle.style.setProperty('--wr-dy', (-50 - Math.random() * 100).toFixed(0) + 'px');
      particle.style.animationDelay = (Math.random() * 80).toFixed(0) + 'ms';
      stage.appendChild(particle);
      (function (el) {
        window.setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
        }, 1200);
      })(particle);
    }
  }

  /* ---------- 8/8 celebration: boot sequence ---------- */

  function bar(n) {
    var out = '';
    for (var i = 0; i < 8; i++) out += i < n ? '█' : '░';
    return out;
  }

  function lightCard(index) {
    var card = cards[index];
    if (!card) return;
    card.classList.add('is-lit');
    window.setTimeout(function () {
      card.classList.remove('is-lit');
    }, 700);
  }

  function setBusy(on) {
    if (digBtn) digBtn.disabled = on;
    if (resetBtn) resetBtn.disabled = on;
    if (input) input.disabled = on;
    if (consoleEl) consoleEl.classList.toggle('is-booting', on);
  }

  function revealSecret() {
    if (secret && secret.hidden) {
      secret.hidden = false;
      if (!reduceMotion) secret.classList.add('is-fresh');
    }
  }

  function runBoot() {
    if (celebrating) return;
    celebrating = true;
    setBusy(true);
    /* The boot log updates a progress line every frame or two;
       keep screen readers out of that and let the achievement
       toast announce the result instead. */
    if (logEl) logEl.setAttribute('aria-live', 'off');

    var boot = config.boot || {};
    var lockText = boot.lock || '> burrow lock acquired';
    var verifyText = boot.verify || '> verifying pillars';
    var integrityText = boot.integrity || '> burrow integrity 100%';
    var onlineText = boot.online || 'ALL PILLARS ONLINE';

    if (reduceMotion) {
      log(lockText, 'out');
      log(verifyText + ' ' + bar(8) + ' 8/8', 'out');
      log(integrityText, 'out');
      log(onlineText, 'ok');
      finishBoot();
      return;
    }

    if (stage) {
      stage.classList.add('is-scanning');
      window.setTimeout(function () {
        stage.classList.remove('is-scanning');
      }, 1300);
    }

    log(lockText, 'out');

    window.setTimeout(function () {
      var line = log(verifyText + ' ' + bar(0) + ' 0/8', 'out');
      var step = 0;
      var timer = window.setInterval(function () {
        step += 1;
        lightCard(step - 1);
        if (line) line.textContent = verifyText + ' ' + bar(step) + ' ' + step + '/8';
        if (step >= 8) {
          window.clearInterval(timer);
          window.setTimeout(function () {
            log(integrityText, 'out');
            window.setTimeout(function () {
              log(onlineText, 'ok');
              startRain();
              window.setTimeout(finishBoot, 450);
            }, 320);
          }, 260);
        }
      }, 130);
    }, 380);
  }

  function finishBoot() {
    if (logEl) logEl.setAttribute('aria-live', 'polite');
    revealSecret();
    say(config.completeBubble || '');
    log(config.completeLine || '', 'ok');
    markCelebrated();
    celebrating = false;
    setBusy(false);
    showAchievement();
    spark(24);
  }

  /* ---------- Falling WAF codes behind/over the control room ---------- */

  function startRain() {
    if (reduceMotion || !layout || rainCanvas) return;

    var canvas = document.createElement('canvas');
    canvas.className = 'wr-rain';
    canvas.setAttribute('aria-hidden', 'true');
    layout.appendChild(canvas);
    rainCanvas = canvas;

    var height = Math.max(
      stage ? stage.offsetHeight : 0,
      grid ? grid.offsetHeight : 0
    );
    var width = layout.clientWidth;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    var ctx = canvas.getContext('2d');
    if (!ctx) {
      canvas.remove();
      rainCanvas = null;
      return;
    }
    ctx.scale(dpr, dpr);
    ctx.shadowColor = 'rgba(46, 213, 115, 0.45)';
    ctx.shadowBlur = 8;

    var codes = badgeCodes();
    if (!codes.length) codes = ['WAF'];

    var columns = Math.max(10, Math.floor(width / 62));
    var drops = [];
    for (var i = 0; i < columns; i++) {
      drops.push({
        x: i * (width / columns) + Math.random() * 24,
        y: Math.random() * height * 1.4 - height * 0.4,
        speed: 1.4 + Math.random() * 2.6,
        code: codes[i % codes.length],
        alpha: 0.18 + Math.random() * 0.32,
        size: 11 + Math.random() * 5
      });
    }

    var start = window.performance && performance.now ? performance.now() : Date.now();
    var duration = 3200;

    function frame(now) {
      var elapsed = now - start;
      ctx.clearRect(0, 0, width, height);
      for (var d = 0; d < drops.length; d++) {
        var drop = drops[d];
        ctx.font = drop.size + 'px ui-monospace, Menlo, Consolas, monospace';
        ctx.fillStyle = 'rgba(46, 213, 115, ' + drop.alpha.toFixed(3) + ')';
        ctx.fillText(drop.code, drop.x, drop.y);
        drop.y += drop.speed;
        if (drop.y > height + 24) {
          drop.y = -24;
          drop.x = Math.random() * width;
        }
      }
      if (elapsed < duration) {
        window.requestAnimationFrame(frame);
      } else {
        canvas.style.transition = 'opacity 0.5s ease';
        canvas.style.opacity = '0';
        window.setTimeout(function () {
          if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
          if (rainCanvas === canvas) rainCanvas = null;
        }, 600);
      }
    }

    window.requestAnimationFrame(frame);
  }

  /* ---------- Achievement toast + downloadable SVG badge ---------- */

  function badgeCodes() {
    return cards.map(function (card) {
      var code = card.querySelector('.wr-card__code');
      return code ? code.textContent.replace(/\s+/g, ' ').trim() : '';
    }).filter(function (code) {
      return !!code;
    });
  }

  function showAchievement() {
    if (!achievementEl) return;
    var codesEl = achievementEl.querySelector('[data-wr-achievement-codes]');
    if (codesEl) {
      codesEl.textContent = '';
      codesEl.setAttribute('role', 'list');
      badgeCodes().forEach(function (code) {
        var chip = document.createElement('span');
        chip.setAttribute('role', 'listitem');
        chip.textContent = code;
        codesEl.appendChild(chip);
      });
    }
    achievementEl.hidden = false;
    window.requestAnimationFrame(function () {
      achievementEl.classList.add('is-open');
    });
  }

  function hideAchievement() {
    if (!achievementEl) return;
    achievementEl.classList.remove('is-open');
    window.setTimeout(function () {
      achievementEl.hidden = true;
    }, 320);
  }

  function escapeXml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function badgeDate() {
    var lang = (document.documentElement.lang || 'en').toLowerCase();
    try {
      return new Date().toLocaleDateString(lang, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }

  function buildBadgeSVG() {
    var meta = config.achievement || {};
    var kicker = escapeXml(meta.badgeKicker || 'WOMBAT // CONTROL ROOM');
    var title = escapeXml(meta.badgeTitle || 'BURROW ENGINEER');
    var subtitle = escapeXml(meta.badgeSubtitle || 'All 8 pillars uncovered');
    var codes = badgeCodes();

    /* Pixel hard hat, 24 × 6 cells at 4px each */
    var hatRows = [
      '000000111111000000000000',
      '000001111111110000000000',
      '000011111111111000000000',
      '000111111111111100000000',
      '111111111111111111111100',
      '111111111111111111111110'
    ];
    var hat = '';
    for (var ry = 0; ry < hatRows.length; ry++) {
      for (var rx = 0; rx < hatRows[ry].length; rx++) {
        if (hatRows[ry].charAt(rx) === '1') {
          hat += '<rect x="' + (40 + rx * 4) + '" y="' + (44 + ry * 4) +
            '" width="4" height="4" fill="' + (ry >= 4 ? '#f5b93f' : '#ffcf63') + '"/>';
        }
      }
    }

    var chips = '';
    var chipW = 130;
    var chipGap = 8;
    for (var i = 0; i < codes.length; i++) {
      var col = i % 4;
      var row = Math.floor(i / 4);
      var x = 40 + col * (chipW + chipGap);
      var y = 216 + row * 40;
      chips += '<rect x="' + x + '" y="' + y + '" width="' + chipW + '" height="30" ' +
        'rx="6" fill="#0b1f15" stroke="#8df5b5" stroke-opacity="0.28"/>' +
        '<text x="' + (x + chipW / 2) + '" y="' + (y + 20) + '" text-anchor="middle" ' +
        'font-family="ui-monospace, Menlo, Consolas, monospace" font-size="13" ' +
        'letter-spacing="1" fill="#8df5b5">' + escapeXml(codes[i]) + '</text>';
    }

    return '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360" role="img" aria-label="' + title + '">' +
      '<defs><pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse">' +
      '<rect width="4" height="1" fill="#000000" opacity="0.3"/></pattern></defs>' +
      '<rect width="640" height="360" fill="#06120c"/>' +
      '<rect width="640" height="360" fill="url(#scan)" opacity="0.6"/>' +
      '<rect x="16" y="16" width="608" height="328" rx="18" fill="none" stroke="#8df5b5" stroke-opacity="0.35"/>' +
      hat +
      '<text x="152" y="62" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" letter-spacing="3" fill="#59a878">' + kicker + '</text>' +
      '<circle cx="584" cy="58" r="6" fill="#28c840"/>' +
      '<text x="570" y="62" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="11" letter-spacing="1" fill="#59a878">8/8</text>' +
      '<text x="40" y="156" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="44" font-weight="700" letter-spacing="1" fill="#eafff2">' + title + '</text>' +
      '<text x="40" y="188" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="16" fill="#8df5b5">' + subtitle + '</text>' +
      chips +
      '<text x="40" y="320" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12" fill="#59a878">' + escapeXml(badgeDate()) + '</text>' +
      '<text x="600" y="320" text-anchor="end" font-family="ui-monospace, Menlo, Consolas, monospace" font-size="12" fill="#59a878">wombat-gov.dev/wombat</text>' +
      '</svg>';
  }

  function downloadBadge() {
    try {
      var blob = new Blob([buildBadgeSVG()], { type: 'image/svg+xml;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var link = document.createElement('a');
      link.href = url;
      link.download = 'wombat-burrow-engineer.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.setTimeout(function () {
        URL.revokeObjectURL(url);
      }, 2000);
    } catch (e) {
      /* download is a bonus; never break the room over it */
    }
  }

  /* ---------- Digging ---------- */

  function complete() {
    if (isCelebrated()) {
      revealSecret();
      say(config.completeBubble || '');
      log(config.completeLine || '', 'ok');
      spark(18);
      return;
    }
    window.setTimeout(runBoot, 300);
  }

  function dig() {
    if (celebrating) return;
    var left = remaining();
    if (!left.length) {
      say(config.emptyLine || '');
      log(config.emptyLine || '');
      spark(4);
      return;
    }

    var id = left[Math.floor(Math.random() * left.length)];
    var card = cardById(id);
    found.push(id);
    saveFound();
    setCard(id, true);
    updateCount();

    var line = card ? card.getAttribute('data-wr-line') : '';
    if (line) {
      say(line);
      log(line);
    }

    if (stage) {
      stage.classList.add('is-digging');
      window.setTimeout(function () {
        stage.classList.remove('is-digging');
      }, 480);
    }

    spark(14);

    if (remaining().length === 0) complete();
  }

  function reset() {
    if (celebrating) return;
    found = [];
    saveFound();
    clearCelebrated();
    cards.forEach(function (card) {
      setCard(card.getAttribute('data-wr-card'), false);
    });
    updateCount();
    if (secret) {
      secret.hidden = true;
      secret.classList.remove('is-fresh');
    }
    hideAchievement();
    if (rainCanvas) {
      if (rainCanvas.parentNode) rainCanvas.parentNode.removeChild(rainCanvas);
      rainCanvas = null;
    }
    say(config.resetBubble || '');
    log(config.resetLine || '');
    if (digBtn) digBtn.focus();
  }

  function logPillars() {
    if (!found.length) {
      log(config.noPillars || '');
      return;
    }
    var names = found.map(function (id) {
      var card = cardById(id);
      return card ? card.getAttribute('data-wr-name') : id;
    });
    var text =
      (config.foundPrefix || 'Found') + ': ' + names.join(', ') +
      ' (' + found.length + '/8).';
    var missing = remaining().map(function (id) {
      var card = cardById(id);
      return card ? card.getAttribute('data-wr-name') : id;
    });
    if (missing.length) {
      text += ' ' + (config.missingPrefix || 'Missing') + ': ' + missing.join(', ') + '.';
    }
    log(text);
  }

  function konami() {
    if (celebrating) return;
    say(config.konamiBubble || '');
    log(config.konamiLine || '');
    spark(20);
  }

  function runCommand(raw) {
    var text = raw.replace(/^\s+|\s+$/g, '');
    if (!text) return;
    log('> ' + text, 'cmd');

    var name = text.split(/\s+/)[0].toLowerCase();

    if (name === 'clear') {
      if (logEl) logEl.innerHTML = '';
      return;
    }
    if (name === 'dig') {
      dig();
      return;
    }
    if (name === 'reset') {
      reset();
      return;
    }
    if (name === 'pillars') {
      logPillars();
      return;
    }
    if (name === 'konami') {
      konami();
      return;
    }
    if (config.commands && Object.prototype.hasOwnProperty.call(config.commands, name)) {
      log(config.commands[name], 'out');
      return;
    }
    log((config.unknown || 'unknown command: {cmd}').replace('{cmd}', text.split(/\s+/)[0]), 'err');
  }

  /* Wire up */
  if (digBtn) digBtn.addEventListener('click', dig);
  if (resetBtn) resetBtn.addEventListener('click', reset);

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var value = input ? input.value : '';
      if (input) {
        history.push(value);
        historyIndex = history.length;
        input.value = '';
      }
      runCommand(value);
      if (input) input.focus();
    });
  }

  if (input) {
    input.addEventListener('keydown', function (event) {
      if (!history.length) return;
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = history[historyIndex] || '';
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.value = historyIndex === history.length ? '' : history[historyIndex];
      }
    });
  }

  /* Space digs anywhere on the page, except while typing and except
     when the DIG button itself has focus (native click handles it). */
  document.addEventListener('keydown', function (event) {
    var target = event.target;
    var typing = target && (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    );
    if (typing || event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === ' ' || event.key === 'Spacebar' || event.code === 'Space') {
      if (target && target.closest && target.closest('button, a, input, textarea, select')) return;
      event.preventDefault();
      dig();
    } else if (event.key === 'd' || event.key === 'D') {
      dig();
    }
  });

  document.addEventListener('wombat:konami', konami);

  if (achievementEl) {
    var closeBtn = achievementEl.querySelector('[data-wr-achievement-close]');
    if (closeBtn) closeBtn.addEventListener('click', hideAchievement);
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && achievementEl && !achievementEl.hidden) {
      hideAchievement();
    }
  });

  Array.prototype.forEach.call(
    document.querySelectorAll('[data-wr-badge]'),
    function (button) {
      button.addEventListener('click', downloadBadge);
    }
  );

  /* Restore a previous visit */
  found.forEach(function (id) {
    setCard(id, true);
  });
  updateCount();

  if (found.length) {
    log((config.welcomeBack || '{n} / 8').replace('{n}', found.length));
  }
  if (found.length === ids.length) {
    if (isCelebrated()) {
      revealSecret();
      say(config.completeBubble || '');
    } else {
      window.setTimeout(runBoot, 450);
    }
  }

  /* Arriving through the sitewide Konami code */
  if (/[?&]konami=1\b/.test(window.location.search)) {
    window.setTimeout(konami, 600);
  }
})();
