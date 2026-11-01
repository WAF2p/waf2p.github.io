const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function copy(src, dst) {
  const srcPath = path.resolve(root, src);
  const dstPath = path.resolve(root, dst);
  if (!fs.existsSync(srcPath)) {
    console.error('Missing source:', srcPath);
    process.exit(1);
  }
  fs.copyFileSync(srcPath, dstPath);
  console.log('copied', src, '->', dst);
}

ensureDir('assets/fonts');
ensureDir('assets/js');

const leagueWeights = [300, 400, 500, 600, 700];
for (const w of leagueWeights) {
  copy(`node_modules/@fontsource/league-spartan/files/league-spartan-latin-${w}-normal.woff2`, `assets/fonts/league-spartan-latin-${w}-normal.woff2`);
  copy(`node_modules/@fontsource/league-spartan/files/league-spartan-latin-ext-${w}-normal.woff2`, `assets/fonts/league-spartan-latin-ext-${w}-normal.woff2`);
}

const jakartaWeights = [400, 500, 600, 700, 800];
for (const w of jakartaWeights) {
  copy(`node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-${w}-normal.woff2`, `assets/fonts/plus-jakarta-sans-latin-${w}-normal.woff2`);
  copy(`node_modules/@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-ext-${w}-normal.woff2`, `assets/fonts/plus-jakarta-sans-latin-ext-${w}-normal.woff2`);
}

copy('node_modules/lucide/dist/umd/lucide.min.js', 'assets/js/lucide.min.js');
ensureDir('supplemental-ui/js');
copy('node_modules/lucide/dist/umd/lucide.min.js', 'supplemental-ui/js/lucide.min.js');

ensureDir('assets/js/vendor');
copy('node_modules/@highlightjs/cdn-assets/highlight.min.js', 'assets/js/vendor/highlight.min.js');
copy('node_modules/@highlightjs/cdn-assets/languages/yaml.min.js', 'assets/js/vendor/highlight-yaml.min.js');
copy('node_modules/jszip/dist/jszip.min.js', 'assets/js/vendor/jszip.min.js');
copy('node_modules/js-yaml/dist/browser/js-yaml.umd.min.js', 'assets/js/vendor/js-yaml.min.js');

console.log('Local assets copied.');
