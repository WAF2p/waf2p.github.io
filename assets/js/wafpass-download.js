/**
 * WAFPass Controls Download
 * Fetches the current controls from the WAF2p/framework repo on GitHub,
 * bundles them into a zip in-browser using JSZip, and triggers a download.
 *
 * Also converts each automated Terraform assertion into a Checkov custom
 * policy YAML and packages those as a second zip download.
 *
 * Strategy:
 *  - One GitHub API call to list files (counts against the 60 req/h limit)
 *  - Individual files fetched via raw.githubusercontent.com (no rate limit)
 *  - YAML parsed with js-yaml and emitted back to YAML with jsyaml.dump
 */

(function () {
  const CONTROLS_API =
    'https://api.github.com/repos/WAF2p/framework/contents/modules/controls/controls?ref=main-en';
  const RAW_BASE =
    'https://raw.githubusercontent.com/WAF2p/framework/main-en/modules/controls/controls/';
  const ZIP_NAME = 'wafpp-controls.zip';
  const CHECKOV_ZIP_NAME = 'wafpp-checkov-policies.zip';
  const CHECKOV_FOLDER = 'wafpp-checkov-policies';
  const JSZIP_CDN =
    'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
  const JSYAML_CDN =
    'https://cdn.jsdelivr.net/npm/js-yaml@4.1.0/dist/js-yaml.min.js';

  // Map WAF++ assertion operators to Checkov attribute operators.
  // `needsValue` controls whether a `value` field is written.
  // `valueField` lets us pull the value from a non-standard key (e.g. pattern).
  const OP_MAP = {
    equals:                { op: 'equals',                needsValue: true },
    not_equals:            { op: 'not_equals',            needsValue: true },
    is_true:               { op: 'is_true',               needsValue: false },
    is_false:              { op: 'is_false',              needsValue: false },
    not_empty:             { op: 'is_not_empty',          needsValue: false },
    is_empty:              { op: 'is_empty',              needsValue: false },
    attribute_exists:      { op: 'exists',                needsValue: false },
    attribute_not_exists:  { op: 'not_exists',            needsValue: false },
    key_exists:            { op: 'exists',                needsValue: false, dottedKey: true },
    key_not_exists:        { op: 'not_exists',            needsValue: false, dottedKey: true },
    greater_than_or_equal: { op: 'greater_than_or_equal_to', needsValue: true },
    less_than_or_equal:    { op: 'less_than_or_equal_to',    needsValue: true },
    greater_than:          { op: 'greater_than',          needsValue: true },
    less_than:             { op: 'less_than',             needsValue: true },
    contains:              { op: 'contains',              needsValue: true },
    not_contains:          { op: 'not_contains',          needsValue: true },
    matches:               { op: 'regex_match',           needsValue: true, valueField: 'pattern' },
    not_matches:           { op: 'not_regex_match',       needsValue: true, valueField: 'pattern' },
    in_list:               { op: 'within',                needsValue: true },
    not_in_list:           { op: 'not_within',            needsValue: true },
    starts_with:           { op: 'starting_with',         needsValue: true },
    ends_with:             { op: 'ending_with',           needsValue: true },
  };

  const PILLAR_CATEGORY = {
    security:     'GENERAL_SECURITY',
    operational:  'MONITORING',
    cost:         'GENERAL_SECURITY',
    performance:  'COMPUTE',
    reliability:  'MONITORING',
    sustainability: 'GENERAL_SECURITY',
    sovereignty:  'GENERAL_SECURITY',
    agentic:      'GENERAL_SECURITY',
  };

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

  function parseScalar(value) {
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (typeof value === 'string' && /^-?\d+$/.test(value)) return parseInt(value, 10);
    if (typeof value === 'string' && /^-?\d+\.\d+$/.test(value)) return parseFloat(value);
    return value;
  }

  function checkovCategory(pillar) {
    return PILLAR_CATEGORY[pillar] || 'GENERAL_SECURITY';
  }

  function getAttribute(assertion) {
    var attr = assertion.attribute;
    if ((assertion.op === 'key_exists' || assertion.op === 'key_not_exists') && assertion.key) {
      attr = attr + '.' + assertion.key;
    }
    return attr;
  }

  function getValue(assertion, opInfo) {
    if (!opInfo.needsValue) return undefined;
    var raw;
    if (opInfo.valueField) {
      raw = assertion[opInfo.valueField];
    } else {
      raw = assertion.expected;
    }
    return raw === undefined ? undefined : parseScalar(raw);
  }

  function makePolicyFilename(id) {
    return id.replace(/[^a-zA-Z0-9_-]/g, '_') + '.yml';
  }

  // Some upstream control files use backslash-escaped quotes inside
  // single-quoted YAML strings (\'rightsizing' instead of the YAML-correct
  // ''rightsizing''). js-yaml rejects those. We attempt a targeted repair
  // before giving up on a file.
  function parseYaml(content, filename) {
    try {
      return jsyaml.load(content);
    } catch (firstErr) {
      var repaired = content.replace(/\\'/g, "''");
      try {
        return jsyaml.load(repaired);
      } catch (repairErr) {
        throw firstErr;
      }
    }
  }

  function convertControl(control, zipFolder, stats) {
    if (!control || !Array.isArray(control.checks)) return;

    control.checks.forEach(function (check) {
      if (!check || check.automated === false) return;
      if (!check.scope || check.scope.block_type !== 'resource') return;
      var resourceTypes = check.scope.resource_types;
      if (!Array.isArray(resourceTypes) || resourceTypes.length === 0) return;
      if (!Array.isArray(check.assertions) || check.assertions.length === 0) return;

      check.assertions.forEach(function (assertion, idx) {
        var opInfo = OP_MAP[assertion.op];
        if (!opInfo) return;

        var value = getValue(assertion, opInfo);
        if (opInfo.needsValue && value === undefined) return;

        var attribute = getAttribute(assertion);
        var policyId = makePolicyFilename(check.id + '_' + idx).replace(/\.yml$/, '');
        var policy = {
          metadata: {
            name: (check.title || control.id || check.id) + ' — ' + attribute,
            id: policyId,
            category: checkovCategory(control.pillar),
            guideline: assertion.message || check.description || control.description || '',
          },
          definition: {
            cond_type: 'attribute',
            resource_types: resourceTypes,
            attribute: attribute,
            operator: opInfo.op,
          },
        };
        if (value !== undefined) {
          policy.definition.value = value;
        }

        var yaml = jsyaml.dump(policy, { lineWidth: -1, noRefs: true });
        zipFolder.file(policyId + '.yml', yaml);
        stats.policies += 1;
      });
    });

    stats.controls += 1;
  }

  async function downloadControls(btn) {
    var originalLabel = btn.textContent;
    setState(btn, 'loading', originalLabel);

    try {
      await loadScript(JSZIP_CDN);

      // One API call to list files; cache-bust so new controls appear immediately
      var res = await fetch(CONTROLS_API + '&_cb=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('GitHub API returned ' + res.status);
      var entries = await res.json();
      var files = entries.filter(function (e) { return e.type === 'file'; });

      if (!files.length) throw new Error('No control files found');

      var zip = new JSZip();
      var folder = zip.folder('wafpp-controls');

      // Fetch all files in parallel via raw (no rate limit), cache-busted by branch
      await Promise.all(
        files.map(function (f) {
          var rawUrl = RAW_BASE + encodeURIComponent(f.name) + '?_cb=' + Date.now();
          return fetch(rawUrl, { cache: 'no-store' })
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

      // Show the user how many controls were packaged
      btn.setAttribute('data-label-done', files.length + ' controls downloaded!');
      setState(btn, 'done', originalLabel);
    } catch (err) {
      console.error('[WAFPass] Controls download failed:', err);
      setState(btn, 'error', originalLabel);
      // Re-enable after a moment so user can retry
      setTimeout(function () { setState(btn, 'idle', originalLabel); }, 3000);
    }
  }

  async function downloadCheckovControls(btn) {
    var originalLabel = btn.textContent;
    setState(btn, 'loading', originalLabel);

    try {
      await Promise.all([loadScript(JSZIP_CDN), loadScript(JSYAML_CDN)]);

      var res = await fetch(CONTROLS_API + '&_cb=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) throw new Error('GitHub API returned ' + res.status);
      var entries = await res.json();
      var files = entries.filter(function (e) { return e.type === 'file'; });

      if (!files.length) throw new Error('No control files found');

      var zip = new JSZip();
      var folder = zip.folder(CHECKOV_FOLDER);
      var stats = { controls: 0, policies: 0, parseErrors: 0 };

      await Promise.all(
        files.map(function (f) {
          var rawUrl = RAW_BASE + encodeURIComponent(f.name) + '?_cb=' + Date.now();
          return fetch(rawUrl, { cache: 'no-store' })
            .then(function (r) {
              if (!r.ok) throw new Error('Failed to fetch ' + f.name);
              return r.text();
            })
            .then(function (content) {
              var control;
              try {
                control = parseYaml(content, f.name);
              } catch (parseErr) {
                console.warn('[WAFPass] Could not parse ' + f.name + ': ' + parseErr.message);
                stats.parseErrors += 1;
                return;
              }
              convertControl(control, folder, stats);
            });
        })
      );

      if (!stats.policies) throw new Error('No Checkov-compatible policies could be generated');

      var blob = await zip.generateAsync({ type: 'blob' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = CHECKOV_ZIP_NAME;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      var doneLabel = stats.policies + ' Checkov policies downloaded!';
      if (stats.parseErrors) {
        doneLabel += ' (' + stats.parseErrors + ' control files skipped due to parse errors)';
      }
      btn.setAttribute('data-label-done', doneLabel);
      setState(btn, 'done', originalLabel);
    } catch (err) {
      console.error('[WAFPass] Checkov download failed:', err);
      setState(btn, 'error', originalLabel);
      setTimeout(function () { setState(btn, 'idle', originalLabel); }, 3000);
    }
  }

  // Wire up all download buttons
  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-action="download-controls"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        downloadControls(btn);
      });
    });

    document.querySelectorAll('[data-action="download-checkov"]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        downloadCheckovControls(btn);
      });
    });
  });
})();
