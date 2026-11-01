/*
 * WOMBATpass score card generator.
 *
 * Reads a wombat-result.json (or a validation envelope), renders a
 * 1200×630 SVG card, a compact README badge and the snippets. All
 * processing stays in the browser.
 */
(function () {
  'use strict';

  var jsonEl = document.querySelector('[data-wsc-json]');
  if (!jsonEl) return;

  var configEl = document.querySelector('script[data-wsc-config]');
  var demoEl = document.querySelector('script[data-wsc-demo]');
  var config = {};
  var demo = {};
  try { config = JSON.parse(configEl.textContent); } catch (e) { config = {}; }
  try { demo = JSON.parse(demoEl.textContent); } catch (e) { demo = {}; }

  var els = {
    file: document.querySelector('[data-wsc-file]'),
    fileButton: document.querySelector('[data-wsc-file-button]'),
    demo: document.querySelector('[data-wsc-load-demo]'),
    generate: document.querySelector('[data-wsc-generate]'),
    status: document.querySelector('[data-wsc-status]'),
    card: document.querySelector('[data-wsc-card]'),
    png: document.querySelector('[data-wsc-png]'),
    svg: document.querySelector('[data-wsc-svg]'),
    open: document.querySelector('[data-wsc-open]'),
    badge: document.querySelector('[data-wsc-badge]'),
    badgeDownload: document.querySelector('[data-wsc-badge-download]'),
    md: document.querySelector('[data-wsc-md]'),
    html: document.querySelector('[data-wsc-html]'),
    lang: document.querySelector('[data-wsc-lang]')
  };

  var pageLang = (document.documentElement.lang || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  var ui = config.ui || {};
  var labels = config.labels || {};
  var state = {
    lang: pageLang,
    data: null,
    svg: '',
    badge: '',
    seq: 0,
    assets: null,
    mascot: {},
    cardUrl: ''
  };

  if (els.lang) els.lang.value = pageLang;

  /* ---------- Pillars ---------- */

  var PILLARS = [
    { slug: 'security', code: 'WAF-SEC', en: 'Security', de: 'Sicherheit',
      shortEn: 'Security', shortDe: 'Sicherheit',
      aliases: ['security', 'sec', 'waf-sec', 'wafsec', 'sicherheit'] },
    { slug: 'cost-optimization', code: 'WAF-COST', en: 'Cost Optimization', de: 'Kostenoptimierung',
      shortEn: 'Cost', shortDe: 'Kosten',
      aliases: ['cost', 'costs', 'cost-optimization', 'costoptimization', 'waf-cost', 'wafcost', 'kosten', 'kostenoptimierung'] },
    { slug: 'performance-efficiency', code: 'WAF-PERF', en: 'Performance Efficiency', de: 'Leistungseffizienz',
      shortEn: 'Performance', shortDe: 'Leistung',
      aliases: ['performance', 'perf', 'performance-efficiency', 'performanceefficiency', 'waf-perf', 'wafperf', 'leistung', 'leistungseffizienz'] },
    { slug: 'reliability', code: 'WAF-REL', en: 'Reliability', de: 'Zuverlässigkeit',
      shortEn: 'Reliability', shortDe: 'Zuverlässigkeit',
      aliases: ['reliability', 'rel', 'waf-rel', 'wafrel', 'zuverlässigkeit', 'zuverlaessigkeit'] },
    { slug: 'operational-excellence', code: 'WAF-OPS', en: 'Operational Excellence', de: 'Operative Exzellenz',
      shortEn: 'Operations', shortDe: 'Betrieb',
      aliases: ['operations', 'ops', 'operational', 'operational-excellence', 'operationalexcellence', 'waf-ops', 'wafops', 'operative-exzellenz', 'operativeexzellenz', 'excellence'] },
    { slug: 'sustainability', code: 'WAF-SUS', en: 'Sustainability', de: 'Nachhaltigkeit',
      shortEn: 'Sustainability', shortDe: 'Nachhaltigkeit',
      aliases: ['sustainability', 'sus', 'waf-sus', 'wafsus', 'nachhaltigkeit'] },
    { slug: 'sovereign', code: 'WAF-SOV', en: 'Sovereign', de: 'Souverän',
      shortEn: 'Sovereign', shortDe: 'Souverän',
      aliases: ['sovereign', 'sov', 'waf-sov', 'wafsov', 'souverän', 'souveraen'] },
    { slug: 'agentic', code: 'WAF-AGN', en: 'Agentic', de: 'Agentisch',
      shortEn: 'Agentic', shortDe: 'Agentisch',
      aliases: ['agentic', 'agn', 'waf-agn', 'wafagn', 'agentisch'] }
  ];

  var ALIASES = {};
  PILLARS.forEach(function (pillar) {
    pillar.aliases.forEach(function (alias) {
      ALIASES[norm(alias)] = pillar;
    });
  });

  function norm(value) {
    return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function num(value) {
    if (value === null || value === undefined || value === '') return null;
    var n = typeof value === 'number' ? value : parseFloat(String(value).replace('%', ''));
    return isFinite(n) ? n : null;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function first() {
    for (var i = 0; i < arguments.length; i++) {
      var value = arguments[i];
      if (value !== null && value !== undefined && value !== '') return value;
    }
    return null;
  }

  function escapeXml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  function fit(value, max) {
    var text = String(value == null ? '' : value);
    if (text.length <= max) return text;
    return text.slice(0, Math.max(0, max - 1)).trim() + '…';
  }

  function formatDate(date, lang) {
    try {
      return new Intl.DateTimeFormat(lang === 'de' ? 'de-DE' : 'en-GB', {
        year: 'numeric', month: 'short', day: 'numeric'
      }).format(date);
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function pillarFor(key) {
    return ALIASES[norm(key)] || ALIASES[norm(String(key).replace(/^waf-?/i, ''))] || null;
  }

  function pillarValue(value) {
    if (value === null || value === undefined) return { score: null };
    if (typeof value === 'number' || typeof value === 'string') {
      var direct = num(value);
      return { score: direct === null ? null : clamp(Math.round(direct), 0, 100) };
    }
    if (typeof value !== 'object') return { score: null };

    var score = num(first(value.score, value.percent, value.percentage, value.rate));
    if (score !== null) return { score: clamp(Math.round(score), 0, 100) };

    var passed = num(first(value.passed, value.pass, value.passed_controls));
    var failed = num(first(value.failed, value.fail, value.failed_controls));
    var total = num(first(value.total, value.controls, value.total_controls));

    if (total === null && passed !== null && failed !== null) total = passed + failed;
    if (passed === null && total !== null && failed !== null) passed = total - failed;
    if (passed === null && total !== null && typeof value.rate === 'number') {
      passed = total * value.rate;
    }
    if (total && total > 0 && passed !== null) {
      return {
        score: clamp(Math.round((passed / total) * 100), 0, 100),
        passed: passed, failed: failed, total: total
      };
    }
    return { score: null };
  }

  function parseResult(raw) {
    var env = raw && typeof raw === 'object' ? raw : null;
    if (!env) throw new Error(ui.invalid || 'Invalid JSON.');

    var base = env.result && typeof env.result === 'object'
      ? env.result
      : (env.data && env.data.result && typeof env.data.result === 'object' ? env.data.result : env);
    var summary = base.summary && typeof base.summary === 'object'
      ? base.summary
      : (env.summary && typeof env.summary === 'object' ? env.summary : {});
    var pillarsRaw = first(
      base.pillar_scores,
      summary.pillars,
      base.pillars,
      env.pillar_scores
    ) || {};

    var pillarScores = {};
    var counts = { passed: 0, failed: 0, total: 0, tracked: false };

    Object.keys(pillarsRaw).forEach(function (key) {
      var pillar = pillarFor(key);
      if (!pillar) return;
      var parsed = pillarValue(pillarsRaw[key]);
      if (parsed.score !== null) {
        pillarScores[pillar.slug] = parsed.score;
      }
      if (parsed.passed != null || parsed.failed != null || parsed.total != null) {
        counts.tracked = true;
        counts.passed += parsed.passed || 0;
        counts.failed += parsed.failed || 0;
        counts.total += parsed.total || 0;
      }
    });

    var score = num(first(base.score, summary.score, env.score));
    if (score === null) {
      var known = PILLARS.map(function (p) { return pillarScores[p.slug]; })
        .filter(function (v) { return typeof v === 'number'; });
      if (known.length) {
        score = known.reduce(function (a, b) { return a + b; }, 0) / known.length;
      }
    }
    if (score === null) {
      throw new Error(ui.noScore || 'No score found.');
    }
    score = clamp(Math.round(score), 0, 100);

    var findings = null;
    if (Array.isArray(base.findings)) {
      findings = base.findings.filter(function (f) {
        return f && /^(fail|error)$/i.test(String(f.status || ''));
      }).length;
    }
    if (findings === null) findings = num(first(summary.failed, base.total_fail, env.total_fail));

    var controls = num(first(
      base.controls_run,
      base.controls_loaded,
      summary.total_controls,
      env.controls_run,
      env.controls_loaded
    ));
    if (controls === null && counts.tracked) controls = counts.total || (counts.passed + counts.failed);

    var project = first(base.project, summary.project, env.project, '');
    var branch = first(base.branch, summary.branch, env.branch, '');
    var sha = first(base.git_sha, base.sha, summary.git_sha, env.git_sha, '');
    var iac = first(base.iac_framework, base.iac, summary.iac_framework, env.iac_framework, '');
    var stage = first(base.stage, summary.stage, env.stage, '');
    var hash = first(env.run_hash, base.run_hash, summary.run_hash, '');
    var status = first(env.status, base.status, '');

    var date = new Date();
    var stamp = first(base.generated_at, base.timestamp, env.generated_at, env.timestamp);
    if (stamp) {
      var parsedDate = new Date(stamp);
      if (!isNaN(parsedDate.getTime())) date = parsedDate;
    }

    return {
      score: score,
      pillars: pillarScores,
      project: String(project || ''),
      branch: String(branch || ''),
      sha: String(sha || ''),
      iac: String(iac || ''),
      stage: String(stage || ''),
      controls: controls,
      findings: findings,
      hash: String(hash || ''),
      status: String(status || ''),
      date: date
    };
  }

  /* ---------- Assets ---------- */

  var ASSET_BASE = {
    mascot: '/images/brand/mascot/full/',
    icons: '/images/brand/pillars/',
    head: '/images/brand/mascot/wombat-idle.svg',
    league: '/assets/fonts/league-spartan-latin-600-normal.woff2',
    body: '/assets/fonts/plus-jakarta-sans-latin-500-normal.woff2'
  };

  function bufferToBase64(buffer) {
    var bytes = new Uint8Array(buffer);
    var binary = '';
    for (var i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  }

  function fetchText(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(url);
      return res.text();
    });
  }

  function fetchDataUrl(url) {
    return fetch(url).then(function (res) {
      if (!res.ok) throw new Error(url);
      return res.blob();
    }).then(function (blob) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () { resolve(reader.result); };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    });
  }

  function innerSvg(text) {
    var start = text.indexOf('>');
    var end = text.lastIndexOf('</svg>');
    if (start < 0 || end < 0) return '';
    return text.slice(start + 1, end).replace(/<title[\s\S]*?<\/title>/g, '');
  }

  function loadAssets() {
    if (state.assets) return state.assets;
    state.assets = Promise.all([
      fetch(ASSET_BASE.league).then(function (r) { return r.arrayBuffer(); }).then(bufferToBase64).catch(function () { return ''; }),
      fetch(ASSET_BASE.body).then(function (r) { return r.arrayBuffer(); }).then(bufferToBase64).catch(function () { return ''; }),
      fetchText(ASSET_BASE.head).then(innerSvg).catch(function () { return ''; }),
      Promise.all(PILLARS.map(function (p) {
        return fetchText(ASSET_BASE.icons + p.slug + '.svg')
          .then(innerSvg)
          .catch(function () { return ''; });
      }))
    ]).then(function (parts) {
      var icons = {};
      PILLARS.forEach(function (p, i) { icons[p.slug] = parts[3][i]; });
      return { league: parts[0], body: parts[1], head: parts[2], icons: icons };
    });
    return state.assets;
  }

  function getMascot(pose) {
    if (state.mascot[pose]) return Promise.resolve(state.mascot[pose]);
    return fetchDataUrl(ASSET_BASE.mascot + 'wombat-' + pose + '-480.png')
      .then(function (url) {
        state.mascot[pose] = url;
        return url;
      })
      .catch(function () { return ''; });
  }

  /* ---------- Score card ---------- */

  function tierFor(score, lang) {
    var t = labels[lang] && labels[lang].tiers ? labels[lang].tiers : {};
    if (score >= 90) return { label: t['90'] || 'BURROW MASTER', color: '#8df5b5', pose: 'celebrate' };
    if (score >= 70) return { label: t['70'] || 'SOLID FOUNDATION', color: '#ffcf63', pose: 'present' };
    if (score >= 50) return { label: t['50'] || 'DIGGING DEEP', color: '#ffb870', pose: 'stand' };
    return { label: t['0'] || 'FOUNDATIONS FIRST', color: '#ffb870', pose: 'think' };
  }

  function pillarColor(score) {
    if (score === null || score === undefined) return '#3d5a49';
    if (score >= 80) return '#8df5b5';
    if (score >= 60) return '#ffcf63';
    return '#ffb870';
  }

  function metaLine(data) {
    var parts = [];
    if (data.branch) parts.push(data.branch);
    if (data.sha) parts.push(data.sha.slice(0, 7));
    if (data.iac) parts.push(data.iac);
    if (data.stage) parts.push(data.stage);
    return parts.join(' · ');
  }

  function shortHash(hash) {
    if (!hash) return '';
    if (hash.length <= 14) return hash;
    return hash.slice(0, 8) + '…' + hash.slice(-4);
  }

  function renderPillar(p, data, lang, x, y, assets) {
    var value = data.pillars[p.slug];
    var has = typeof value === 'number';
    var color = pillarColor(has ? value : null);
    var name = lang === 'de' ? p.shortDe : p.shortEn;
    var barWidth = 112;
    var fill = has ? Math.round(barWidth * value / 100) : 0;
    var inner = assets.icons[p.slug] || '';
    var icon = inner
      ? '<g transform="translate(' + x + ' ' + (y - 9) + ') scale(1)" fill="none" stroke="currentColor" ' +
        'stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" color="' + color + '">' + inner + '</g>'
      : '';
    return icon +
      '<text x="' + (x + 30) + '" y="' + (y + 8) + '" font-family="' + BODY_FONT + '" font-size="14" font-weight="600" fill="#eafff2">' + escapeXml(name) + '</text>' +
      '<text x="' + (x + 30) + '" y="' + (y + 23) + '" font-family="' + MONO_FONT + '" font-size="9" letter-spacing="1" fill="#59a878">' + escapeXml(p.code) + '</text>' +
      '<rect x="' + (x + 152) + '" y="' + (y + 2) + '" width="' + barWidth + '" height="6" rx="3" fill="#14261c"/>' +
      '<rect x="' + (x + 152) + '" y="' + (y + 2) + '" width="' + fill + '" height="6" rx="3" fill="' + color + '"/>' +
      '<text x="' + (x + 330) + '" y="' + (y + 10) + '" text-anchor="end" font-family="' + MONO_FONT + '" font-size="13" fill="' + color + '">' + (has ? value : '—') + '</text>';
  }

  var DISPLAY_FONT = "'League Spartan', 'Helvetica Neue', Arial, sans-serif";
  var BODY_FONT = "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
  var MONO_FONT = "ui-monospace, Menlo, Consolas, monospace";

  function renderCard(data, lang, assets, mascotUrl) {
    var L = labels[lang] || labels.en || {};
    var tier = tierFor(data.score, lang);
    var project = fit(data.project || L.projectFallback || 'WOMBATpass run', 34);
    var meta = fit(metaLine(data), 74);
    var date = formatDate(data.date, lang);
    var validated = '';
    if (data.status && L.validated && L.validated[data.status]) {
      validated = L.validated[data.status];
    }
    var stats = [];
    if (data.controls !== null && data.controls !== undefined) stats.push(data.controls + ' ' + (L.controls || 'controls'));
    if (data.findings !== null && data.findings !== undefined) stats.push(data.findings + ' ' + (L.findings || 'findings'));
    var statsText = stats.join(' · ');
    var hash = shortHash(data.hash);

    var fontCss = '';
    if (assets.league) {
      fontCss += "@font-face{font-family:'League Spartan';font-style:normal;font-weight:600;src:url(data:font/woff2;base64," + assets.league + ") format('woff2');}";
    }
    if (assets.body) {
      fontCss += "@font-face{font-family:'Plus Jakarta Sans';font-style:normal;font-weight:500;src:url(data:font/woff2;base64," + assets.body + ") format('woff2');}";
    }

    var headMark = assets.head
      ? '<g transform="translate(52 28) scale(0.1917)">' + assets.head + '</g>'
      : '';

    var pillarRows = '';
    PILLARS.forEach(function (p, index) {
      var col = index % 2;
      var row = Math.floor(index / 2);
      var x = 52 + col * 360;
      var y = 372 + row * 54;
      pillarRows += renderPillar(p, data, lang, x, y, assets);
    });

    var pillarCount = PILLARS.filter(function (p) {
      return typeof data.pillars[p.slug] === 'number';
    }).length;
    var topLabel = validated;
    if (!topLabel) {
      if (pillarCount === 0) topLabel = L.scoreOnly || 'SCORE ONLY';
      else if (pillarCount < PILLARS.length) topLabel = pillarCount + ' / ' + PILLARS.length + ' ' + (lang === 'de' ? 'SÄULEN' : 'PILLARS');
      else topLabel = L.pillars || '8 pillars';
    }
    var mascot = mascotUrl
      ? '<image href="' + mascotUrl + '" x="800" y="64" width="344" height="430" preserveAspectRatio="xMidYMid slice" clip-path="url(#mascotClip)"/>'
      : '';
    var mascotCaption = statsText
      ? '<text x="800" y="522" font-family="' + MONO_FONT + '" font-size="11" fill="#59a878">' + escapeXml(statsText) + '</text>'
      : '';

    return '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="WOMBATpass score card: ' + escapeXml(project) + ', ' + data.score + ' out of 100">' +
      '<title>WOMBATpass score card — ' + escapeXml(project) + ' — ' + data.score + '/100</title>' +
      '<defs>' +
        '<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000000" opacity="0.22"/></pattern>' +
        '<clipPath id="mascotClip"><rect x="800" y="64" width="344" height="430" rx="24"/></clipPath>' +
        '<style>' + fontCss + '</style>' +
      '</defs>' +
      '<rect width="1200" height="630" fill="#06120c"/>' +
      '<rect width="1200" height="630" fill="url(#scan)"/>' +
      '<rect x="24" y="24" width="1152" height="582" rx="28" fill="none" stroke="#8df5b5" stroke-opacity="0.25"/>' +
      '<rect x="800" y="64" width="344" height="430" rx="24" fill="#0b1f15" stroke="#8df5b5" stroke-opacity="0.28"/>' +
      mascot +
      '<text x="1148" y="50" text-anchor="end" font-family="' + MONO_FONT + '" font-size="11" letter-spacing="2" fill="#59a878">' + escapeXml(topLabel.toUpperCase()) + '</text>' +
      '<text x="1148" y="68" text-anchor="end" font-family="' + MONO_FONT + '" font-size="11" fill="#59a878">' + escapeXml((L.generated || 'generated') + ' ' + date) + '</text>' +
      headMark +
      '<text x="112" y="50" font-family="' + DISPLAY_FONT + '" font-size="21" font-weight="600" letter-spacing="2" fill="#eafff2">WOMBAT PASS</text>' +
      '<text x="112" y="68" font-family="' + MONO_FONT + '" font-size="10" letter-spacing="3" fill="#59a878">' + escapeXml(L.kicker || 'SCORE CARD') + '</text>' +
      '<text x="52" y="200" font-family="' + DISPLAY_FONT + '" font-size="128" font-weight="600" fill="' + tier.color + '">' + data.score +
        '<tspan dx="10" font-size="26" fill="#59a878">/100</tspan></text>' +
      '<text x="56" y="236" font-family="' + MONO_FONT + '" font-size="14" letter-spacing="3" fill="' + tier.color + '">' + escapeXml(tier.label) + '</text>' +
      '<text x="56" y="298" font-family="' + DISPLAY_FONT + '" font-size="38" font-weight="600" fill="#eafff2">' + escapeXml(project) + '</text>' +
      (meta ? '<text x="56" y="326" font-family="' + MONO_FONT + '" font-size="12" fill="#59a878">' + escapeXml(meta) + '</text>' : '') +
      pillarRows +
      mascotCaption +
      '<text x="52" y="598" font-family="' + MONO_FONT + '" font-size="11" fill="#59a878">wombat-gov.dev/wombatpass</text>' +
      (hash ? '<text x="1148" y="598" text-anchor="end" font-family="' + MONO_FONT + '" font-size="11" fill="#59a878">run ' + escapeXml(hash) + '</text>' : '') +
      '</svg>';
  }

  function renderBadge(data, lang, assets) {
    var L = labels[lang] || labels.en || {};
    var tier = tierFor(data.score, lang);
    var head = assets.head
      ? '<g transform="translate(12 12) scale(0.1667)">' + assets.head + '</g>'
      : '';
    return '<svg xmlns="http://www.w3.org/2000/svg" width="360" height="64" viewBox="0 0 360 64" role="img" aria-label="WOMBATpass ' + data.score + ' out of 100">' +
      '<title>WOMBATpass — ' + data.score + '/100</title>' +
      '<rect x="0" y="0" width="360" height="64" rx="12" fill="#06120c" stroke="#8df5b5" stroke-opacity="0.3"/>' +
      head +
      '<text x="64" y="28" font-family="' + DISPLAY_FONT + '" font-size="15" font-weight="600" letter-spacing="1.5" fill="#eafff2">WOMBAT PASS</text>' +
      '<text x="64" y="44" font-family="' + MONO_FONT + '" font-size="9" letter-spacing="2" fill="#59a878">' + escapeXml(L.kicker || 'SCORE CARD') + '</text>' +
      '<rect x="246" y="12" width="102" height="40" rx="20" fill="' + tier.color + '"/>' +
      '<text x="297" y="38" text-anchor="middle" font-family="' + MONO_FONT + '" font-size="15" font-weight="700" fill="#06120c">' + data.score + '/100</text>' +
      '</svg>';
  }

  /* ---------- UI ---------- */

  function setStatus(text, tone) {
    if (!els.status) return;
    els.status.textContent = text || '';
    els.status.className = 'wsc-status' + (tone ? ' wsc-status--' + tone : '');
  }

  function revokeCardUrl() {
    if (state.cardUrl) {
      URL.revokeObjectURL(state.cardUrl);
      state.cardUrl = '';
    }
  }

  function setPreview(svg, badge, data) {
    revokeCardUrl();
    var blob = new Blob([svg], { type: 'image/svg+xml' });
    state.cardUrl = URL.createObjectURL(blob);
    var img = new Image();
    img.alt = 'WOMBATpass score card for ' + (data.project || 'this run') + ', ' + data.score + ' out of 100';
    img.src = state.cardUrl;
    if (els.card) {
      els.card.innerHTML = '';
      els.card.appendChild(img);
    }

    var badgeBlob = new Blob([badge], { type: 'image/svg+xml' });
    var badgeUrl = URL.createObjectURL(badgeBlob);
    var badgeImg = new Image();
    badgeImg.alt = 'WOMBATpass badge, ' + data.score + '/100';
    badgeImg.src = badgeUrl;
    if (els.badge) {
      els.badge.innerHTML = '';
      els.badge.appendChild(badgeImg);
    }
    window.setTimeout(function () { URL.revokeObjectURL(badgeUrl); }, 10000);

    var md = '[![WOMBATpass ' + data.score + '/100](wombat-pass-badge.svg)](https://www.wombat-gov.dev/wombatpass/)';
    var html = '<a href="https://www.wombat-gov.dev/wombatpass/"><img src="wombat-pass-badge.svg" alt="WOMBATpass ' + data.score + '/100"></a>';
    if (els.md) els.md.textContent = md;
    if (els.html) els.html.textContent = html;
    if (els.png) els.png.disabled = false;
    if (els.svg) els.svg.disabled = false;
    if (els.badgeDownload) els.badgeDownload.disabled = false;
    if (els.open) els.open.disabled = false;
  }

  function generate(text, demoMode) {
    if (!text || !String(text).trim()) {
      setStatus(ui.empty || 'Paste a result JSON.', 'error');
      return;
    }
    var raw;
    try {
      raw = JSON.parse(text);
    } catch (e) {
      setStatus(ui.invalid || 'Invalid JSON.', 'error');
      return;
    }
    var data;
    try {
      data = parseResult(raw);
    } catch (e) {
      setStatus(e.message || ui.noScore || 'No score found.', 'error');
      return;
    }

    state.data = data;
    var seq = ++state.seq;
    setStatus('…');

    Promise.all([loadAssets(), getMascot(tierFor(data.score, state.lang).pose)]).then(function (parts) {
      if (seq !== state.seq) return;
      var assets = parts[0];
      var mascot = parts[1];
      state.svg = renderCard(data, state.lang, assets, mascot);
      state.badge = renderBadge(data, state.lang, assets);
      setPreview(state.svg, state.badge, data);
      setStatus(demoMode ? (ui.demo || 'Demo loaded.') : ((ui.ok || 'Score card ready.') + ' ' + data.score + '/100'), 'ok');
    }).catch(function (err) {
      console.error(err);
      setStatus(ui.invalid || 'Could not render the card.', 'error');
    });
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
  }

  function cardFileName(ext) {
    var score = state.data ? state.data.score : 'score';
    return 'wombat-scorecard-' + score + '.' + ext;
  }

  /* ---------- Events ---------- */

  if (els.generate) {
    els.generate.addEventListener('click', function () {
      generate(jsonEl.value, false);
    });
  }

  if (els.demo) {
    els.demo.addEventListener('click', function () {
      jsonEl.value = JSON.stringify(demo, null, 2);
      generate(jsonEl.value, true);
    });
  }

  var debounce = null;
  jsonEl.addEventListener('input', function () {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(function () {
      if (jsonEl.value.trim()) generate(jsonEl.value, false);
    }, 450);
  });

  if (els.fileButton && els.file) {
    els.fileButton.addEventListener('click', function () { els.file.click(); });
  }

  if (els.file) {
    els.file.addEventListener('change', function () {
      var file = els.file.files && els.file.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        jsonEl.value = String(reader.result || '');
        generate(jsonEl.value, false);
      };
      reader.readAsText(file);
    });
  }

  if (els.lang) {
    els.lang.addEventListener('change', function () {
      state.lang = els.lang.value === 'de' ? 'de' : 'en';
      if (state.data) generate(jsonEl.value, false);
    });
  }

  document.addEventListener('dragover', function (event) {
    if (event.target.closest && event.target.closest('[data-wsc-json]')) {
      event.preventDefault();
    }
  });
  jsonEl.addEventListener('drop', function (event) {
    var file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (!file) return;
    event.preventDefault();
    var reader = new FileReader();
    reader.onload = function () {
      jsonEl.value = String(reader.result || '');
      generate(jsonEl.value, false);
    };
    reader.readAsText(file);
  });

  if (els.png) {
    els.png.addEventListener('click', function () {
      if (!state.svg) return;
      var svgUrl = URL.createObjectURL(new Blob([state.svg], { type: 'image/svg+xml' }));
      var image = new Image();
      image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = 1200;
        canvas.height = 630;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, 1200, 630);
        canvas.toBlob(function (blob) {
          if (blob) downloadBlob(blob, cardFileName('png'));
          URL.revokeObjectURL(svgUrl);
        }, 'image/png');
      };
      image.onerror = function () {
        URL.revokeObjectURL(svgUrl);
      };
      image.src = svgUrl;
    });
  }

  if (els.svg) {
    els.svg.addEventListener('click', function () {
      if (!state.svg) return;
      downloadBlob(new Blob([state.svg], { type: 'image/svg+xml;charset=utf-8' }), cardFileName('svg'));
    });
  }

  if (els.open) {
    els.open.addEventListener('click', function () {
      if (state.cardUrl) window.open(state.cardUrl, '_blank', 'noopener');
    });
  }

  if (els.badgeDownload) {
    els.badgeDownload.addEventListener('click', function () {
      if (!state.badge) return;
      downloadBlob(new Blob([state.badge], { type: 'image/svg+xml;charset=utf-8' }), 'wombat-pass-badge.svg');
    });
  }

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
        document.execCommand('copy') ? resolve() : reject();
      } catch (e) {
        reject(e);
      }
      document.body.removeChild(area);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-copy]'), function (button) {
    button.addEventListener('click', function () {
      var target = button.getAttribute('data-copy');
      var text = target === 'md' ? (els.md ? els.md.textContent : '') : (els.html ? els.html.textContent : '');
      if (!text) return;
      copyText(text).then(function () {
        var original = button.textContent;
        button.textContent = ui.copied || 'Copied';
        window.setTimeout(function () { button.textContent = original || ui.copy || 'Copy'; }, 1400);
      }).catch(function () {});
    });
  });

  /* ---------- Init ---------- */

  jsonEl.value = JSON.stringify(demo, null, 2);
  generate(jsonEl.value, true);
})();
