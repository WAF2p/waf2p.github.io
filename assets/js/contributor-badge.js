/*
 * Contributor badge lookup — /contributors/badge/.
 *
 * Reads the committed public rank data and previews the static SVG from
 * /badges/<login>.svg. No network calls beyond the same-origin JSON and SVG.
 */
(function () {
  'use strict';

  var input = document.querySelector('[data-cb-input]');
  var lookup = document.querySelector('[data-cb-lookup]');
  var status = document.querySelector('[data-cb-status]');
  var preview = document.querySelector('[data-cb-preview]');
  var snippet = document.querySelector('[data-cb-snippet]');
  var code = document.querySelector('[data-cb-code]');
  var copy = document.querySelector('[data-cb-copy]');
  if (!input || !status || !preview) return;

  var byLogin = {};
  var ready = false;
  var debounce = null;

  function setStatus(text) {
    status.textContent = text || '';
  }

  function clearPreview() {
    preview.innerHTML = '';
    var empty = document.createElement('p');
    empty.className = 'cb-preview__empty';
    empty.textContent = 'Your badge will appear here.';
    preview.appendChild(empty);
    if (snippet) snippet.hidden = true;
    if (copy) copy.hidden = true;
  }

  function showSnippet(text) {
    if (!snippet || !code) return;
    code.textContent = text;
    snippet.hidden = false;
    if (copy) copy.hidden = false;
  }

  function render(contributor) {
    preview.innerHTML = '';
    var img = document.createElement('img');
    img.src = contributor.badge;
    img.alt = contributor.badge_label + ' badge for ' + contributor.login;
    img.width = 460;
    img.height = 88;
    img.loading = 'lazy';
    preview.appendChild(img);

    var label = contributor.badge_label;
    showSnippet(
      '[![' + label + '](https://www.wombat-gov.dev' + contributor.badge + ')]' +
      '(https://www.wombat-gov.dev/contributors/)'
    );
  }

  function lookupLogin() {
    var login = input.value.trim().replace(/^@/, '').toLowerCase();
    if (!login) {
      setStatus('');
      clearPreview();
      return;
    }

    if (!ready) {
      setStatus('Loading rank data…');
      return;
    }

    var contributor = byLogin[login];
    if (!contributor) {
      setStatus('No published rank for @' + login + '. Ranks are published only after a contribution is counted.');
      clearPreview();
      return;
    }

    if (!contributor.badge) {
      setStatus('@' + contributor.login + ' · ' + contributor.rank_label + ' — this contributor has opted out of a badge.');
      clearPreview();
      return;
    }

    var next = contributor.points_to_next == null
      ? 'top rank'
      : contributor.points_to_next + ' pts to ' + contributor.next_rank_label;
    setStatus('@' + contributor.login + ' · ' + contributor.rank_label + ' · ' + contributor.points + ' pts · ' + next);
    render(contributor);

    if (window.history && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set('login', contributor.login);
      window.history.replaceState({}, '', url);
    }
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
        document.execCommand('copy') ? resolve() : reject(new Error('copy failed'));
      } catch (err) {
        reject(err);
      }
      document.body.removeChild(area);
    });
  }

  fetch('/assets/data/contributor-ranks.json', { cache: 'no-cache' })
    .then(function (res) {
      if (!res.ok) throw new Error('rank data unavailable');
      return res.json();
    })
    .then(function (data) {
      (data.contributors || []).forEach(function (contributor) {
        if (contributor && contributor.login) {
          byLogin[String(contributor.login).toLowerCase()] = contributor;
        }
      });
      ready = true;

      var logins = Object.keys(byLogin).sort();
      var datalist = document.getElementById('cb-logins');
      if (datalist) {
        datalist.innerHTML = '';
        logins.forEach(function (login) {
          var option = document.createElement('option');
          option.value = login;
          datalist.appendChild(option);
        });
      }

      if (!logins.length) {
        setStatus('No published ranks are available in this build yet.');
        clearPreview();
        return;
      }

      var params = new URLSearchParams(window.location.search);
      var requested = (params.get('login') || '').trim().replace(/^@/, '').toLowerCase();
      var preferred = byLogin.lewandos ? 'lewandos' : logins[0];
      var initial = requested || input.value.trim().replace(/^@/, '').toLowerCase() || preferred;
      input.value = initial;
      lookupLogin();
    })
    .catch(function () {
      ready = true;
      setStatus('Rank data is not available in this build. Run the ranks script and rebuild the site.');
    });

  if (lookup) lookup.addEventListener('click', lookupLogin);
  input.addEventListener('input', function () {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(lookupLogin, 220);
  });
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      lookupLogin();
    }
  });

  if (copy) {
    copy.addEventListener('click', function () {
      if (!code || !code.textContent) return;
      copyText(code.textContent).then(function () {
        var original = copy.textContent;
        copy.textContent = 'Copied';
        window.setTimeout(function () { copy.textContent = original; }, 1400);
      }).catch(function () {});
    });
  }

  clearPreview();
})();
