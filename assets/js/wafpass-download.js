/**
 * WAFPass Controls Download
 * Fetches the current controls from the WAF2p/framework repo on GitHub,
 * bundles them into a zip in-browser using JSZip, and triggers a download.
 *
 * Strategy:
 *  - One GitHub API call to list files (counts against the 60 req/h limit)
 *  - Individual files fetched via raw.githubusercontent.com (no rate limit)
 */

(function () {
  const CONTROLS_API =
    'https://api.github.com/repos/WAF2p/framework/contents/modules/controls/controls';
  const ZIP_NAME = 'wafpp-controls.zip';
  const JSZIP_CDN =
    'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) {
        resolve();
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  function setState(btn, state, originalLabel) {
    var labels = {
      loading: btn.dataset.labelLoading || 'Preparing…',
      done:    btn.dataset.labelDone    || 'Downloaded!',
      error:   btn.dataset.labelError   || 'Error – try again',
      idle:    originalLabel,
    };
    btn.disabled = state === 'loading' || state === 'done';
    btn.textContent = labels[state];
    if (state === 'done') {
      setTimeout(function () { setState(btn, 'idle', originalLabel); }, 3000);
    }
  }

  async function downloadControls(btn) {
    var originalLabel = btn.textContent;
    setState(btn, 'loading', originalLabel);

    try {
      await loadScript(JSZIP_CDN);

      // One API call to list files
      var res = await fetch(CONTROLS_API);
      if (!res.ok) throw new Error('GitHub API returned ' + res.status);
      var entries = await res.json();
      var files = entries.filter(function (e) { return e.type === 'file'; });

      if (!files.length) throw new Error('No control files found');

      var zip = new JSZip();
      var folder = zip.folder('wafpp-controls');

      // Fetch all files in parallel via raw (no rate limit)
      await Promise.all(
        files.map(function (f) {
          return fetch(f.download_url)
            .then(function (r) {
              if (!r.ok) throw new Error('Failed to fetch ' + f.name);
              return r.text();
            })
            .then(function (content) {
              folder.file(f.name, content);
            });
        })
      );

      var blob = await zip.generateAsync({ type: 'blob' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = ZIP_NAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setState(btn, 'done', originalLabel);
    } catch (err) {
      console.error('[WAFPass] Controls download failed:', err);
      setState(btn, 'error', originalLabel);
      // Re-enable after a moment so user can retry
      setTimeout(function () { setState(btn, 'idle', originalLabel); }, 3000);
    }
  }

  // Wire up all buttons with data-action="download-controls"
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-action="download-controls"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        downloadControls(btn);
      });
    });
  });
})();
