(function () {
  'use strict';

  // Theme toggle (mirrors the marketing site behaviour)
  (function () {
    const root = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;

    function currentTheme() {
      const t = root.getAttribute('data-theme');
      if (t === 'dark' || t === 'light') return t;
      return (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) ? 'dark' : 'light';
    }

    function setTheme(t) {
      root.setAttribute('data-theme', t);
      try { localStorage.setItem('theme', t); } catch (e) {}
      btn.setAttribute('aria-pressed', String(t === 'dark'));
      btn.innerHTML = t === 'dark'
        ? '<i data-lucide="sun"></i>'
        : '<i data-lucide="moon"></i>';
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }
    }

    setTheme(currentTheme());

    btn.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  })();

  // Lucide init + brand icon polyfills
  (function () {
    function initIcons() {
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }

      // LinkedIn polyfill
      document.querySelectorAll('[data-lucide="linkedin"]').forEach(function (el) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          if (attr.name !== 'data-lucide') svg.setAttribute(attr.name, attr.value);
        }
        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p1.setAttribute('d', 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z');
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', '4');
        rect.setAttribute('height', '12');
        rect.setAttribute('x', '2');
        rect.setAttribute('y', '9');
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', '4');
        circle.setAttribute('cy', '4');
        circle.setAttribute('r', '2');
        svg.appendChild(p1);
        svg.appendChild(rect);
        svg.appendChild(circle);
        if (el.parentNode) el.parentNode.replaceChild(svg, el);
      });

      // GitHub polyfill
      document.querySelectorAll('[data-lucide="github"]').forEach(function (el) {
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '24');
        svg.setAttribute('height', '24');
        svg.setAttribute('viewBox', '0 0 24 24');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('stroke-width', '2');
        svg.setAttribute('stroke-linecap', 'round');
        svg.setAttribute('stroke-linejoin', 'round');
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          if (attr.name !== 'data-lucide') svg.setAttribute(attr.name, attr.value);
        }
        const p1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p1.setAttribute('d', 'M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4');
        const p2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p2.setAttribute('d', 'M9 18c-4.51 2-5-2-7-2');
        svg.appendChild(p1);
        svg.appendChild(p2);
        if (el.parentNode) el.parentNode.replaceChild(svg, el);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initIcons);
    } else {
      initIcons();
    }
  })();

  // Language switcher (derive real version folder from URL)
  (function () {
    const switcher = document.getElementById('waf-lang-switcher');
    if (!switcher) return;

    const path = window.location.pathname;
    const match = path.match(/\/docs\/wafpp\/([^/]+)/);
    // If not on a docs page, try to infer language from the path; default to English.
    const fallbackVersion = path.includes('-de') ? '1.0.2-de' : '1.0.2-en';
    const currentVersion = match ? match[1] : fallbackVersion;
    const isDe = currentVersion.includes('-de');
    const nextVersion = isDe
      ? currentVersion.replace('-de', '-en')
      : currentVersion.replace('-en', '-de');
    const switchedPath = path.replace(
      '/wafpp/' + currentVersion + '/',
      '/wafpp/' + nextVersion + '/'
    );

    ['en', 'de'].forEach(function (lang) {
      const btn = document.getElementById('waf-lang-btn-' + lang);
      if (btn) {
        btn.href = switchedPath;
        btn.classList.toggle('is-active', (isDe && lang === 'de') || (!isDe && lang === 'en'));
      }
    });
  })();

  // Resolve docs-internal links in the header to the current version folder
  (function () {
    const path = window.location.pathname;
    const match = path.match(/(\/docs\/wafpp\/[^/]+)/);
    if (!match) return;
    const docsBase = match[1];

    document.querySelectorAll('[data-docs-link]').forEach(function (el) {
      const rel = el.getAttribute('data-docs-link');
      el.href = docsBase + '/' + rel;
    });
  })();

  // Swap navigation labels to match the current docs language
  (function () {
    const path = window.location.pathname;
    const isDe = /\/wafpp\/[^/]+-de\//.test(path);
    if (!isDe) return;

    const labels = {
      'framework': 'Framework',
      'practice': 'Praxis',
      'project': 'Projekt',
      'overview': 'Übersicht',
      'pillars': 'Die 8 Säulen',
      'architecture': 'Architektur',
      'best_practices': 'Best Practices',
      'controls': 'Controls',
      'governance_community': 'Governance & Community',
      'resources': 'Ressourcen',
      'roadmap': 'Roadmap',
      'about': 'Über uns',
      'vision': 'Vision',
      'faq': 'FAQ',
      'blog': 'Blog',
      'back_home': 'waf2p.dev'
    };

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      const key = el.getAttribute('data-i18n');
      if (labels[key]) el.textContent = labels[key];
    });
  })();

  // Marketing-style mobile navigation for docs header
  (function () {
    const burger = document.getElementById('nav-toggle');
    if (!burger) return;

    const header = document.querySelector('.waf-docs-header');
    const mobileDocs = document.querySelector('.nav-mobile-docs');
    const navGroups = document.querySelectorAll('.waf-docs-header .nav-group');

    function closeAllGroups() {
      navGroups.forEach(function (g) { g.classList.remove('is-open'); });
      navGroups.forEach(function (g) {
        const toggle = g.querySelector('.nav-group-toggle');
        if (toggle) toggle.setAttribute('aria-expanded', 'false');
      });
    }

    // Mobile dropdown toggles
    navGroups.forEach(function (group) {
      const toggle = group.querySelector('.nav-group-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function (e) {
        e.preventDefault();
        const isOpen = group.classList.contains('is-open');
        // close siblings
        navGroups.forEach(function (g) {
          if (g !== group) {
            g.classList.remove('is-open');
            const t = g.querySelector('.nav-group-toggle');
            if (t) t.setAttribute('aria-expanded', 'false');
          }
        });
        group.classList.toggle('is-open', !isOpen);
        toggle.setAttribute('aria-expanded', String(!isOpen));
      });
    });

    // Clone docs sidebar into the mobile menu overlay
    function populateMobileDocs() {
      if (!mobileDocs) return;
      const sidebar = document.querySelector('.nav-container');
      if (!sidebar) return;
      const cloned = sidebar.cloneNode(true);
      cloned.removeAttribute('id');
      cloned.classList.remove('nav-container', 'is-mobile-open');
      cloned.style.display = 'block';
      mobileDocs.innerHTML = '';
      mobileDocs.appendChild(cloned);
    }

    // Burger toggles the mobile overlay
    burger.addEventListener('click', function () {
      const open = !document.body.classList.contains('nav-open');
      if (open) {
        populateMobileDocs();
        document.body.classList.add('nav-open');
      } else {
        document.body.classList.remove('nav-open');
        closeAllGroups();
      }
      burger.setAttribute('aria-expanded', String(open));
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', function (e) {
      if (!document.body.classList.contains('nav-open')) return;
      if (!header) return;
      if (header.contains(e.target)) return;
      document.body.classList.remove('nav-open');
      closeAllGroups();
      burger.setAttribute('aria-expanded', 'false');
    });

    // Close mobile menu on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        closeAllGroups();
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  })();
})();
