import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { VERSION, VERSION_DATE } from '../js/version.js';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const pkg = JSON.parse(read('package.json'));

// Dessa tester fångar om någon ändrat version i package.json utan att köra
// `npm run sync-version` (eller `npm version`, som gör det automatiskt).
const hint = 'Kör `npm run sync-version`.';

test('js/version.js har samma version som package.json', () => {
  assert.equal(VERSION, pkg.version, hint);
});

test('versionen är ett giltigt SemVer-nummer', () => {
  assert.match(VERSION, /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
});

test('versionsdatumet är ett riktigt datum på formen ÅÅÅÅ-MM-DD', () => {
  assert.match(VERSION_DATE, /^\d{4}-\d{2}-\d{2}$/);
  const parsed = new Date(`${VERSION_DATE}T00:00:00Z`);
  assert.equal(parsed.toISOString().slice(0, 10), VERSION_DATE);
});

test('sw.js använder versionen i cache-namnet', () => {
  assert.match(read('sw.js'), new RegExp(`const CACHE = 'bb-shell-v${VERSION.replaceAll('.', '\\.')}';`), hint);
});

test('CHANGELOG.md har en rubrik för versionen och en för "Ej släppt"', () => {
  const changelog = read('CHANGELOG.md');
  assert.ok(changelog.includes('## [Ej släppt]'));
  assert.ok(changelog.includes(`## [${VERSION}] - ${VERSION_DATE}`), hint);
});
