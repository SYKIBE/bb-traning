import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const sw = readFileSync(new URL('sw.js', root), 'utf8');

// Filerna i SHELL-listan i sw.js, som relativa sökvägar ('./' = index.html).
const shellBlock = sw.slice(sw.indexOf('const SHELL'), sw.indexOf('];', sw.indexOf('const SHELL')));
const shell = [...shellBlock.matchAll(/'\.\/([^']*)'/g)].map((m) => m[1] || 'index.html');

test('varje fil i SHELL finns på disk', () => {
  for (const file of shell) {
    assert.ok(existsSync(new URL(file, root)), `${file} finns i SHELL men inte på disk`);
  }
});

test('varje JS-modul i js/ finns i SHELL (annars fungerar inte appen offline)', () => {
  const modules = readdirSync(new URL('js/', root), { recursive: true })
    .map((file) => String(file).replaceAll('\\', '/'))
    .filter((file) => file.endsWith('.js'))
    .map((file) => `js/${file}`);
  for (const file of modules) {
    assert.ok(shell.includes(file), `${file} saknas i SHELL i sw.js`);
  }
});
