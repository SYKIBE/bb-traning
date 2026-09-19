// Synkar allt som beror på versionen med `version` i package.json (den enda källan):
//   - js/version.js   VERSION + VERSION_DATE som appen visar i Inställningar
//   - sw.js           cache-namnet (ny version = ny cache, gamla rensas)
//   - CHANGELOG.md    "Ej släppt" flyttas till en rubrik för den nya versionen
//
// Körs automatiskt av `npm version patch|minor|major` (se "version" i package.json)
// och kan köras för hand med `npm run sync-version`. Skriptet är idempotent: datumet
// ändras bara när versionen ändras.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(root, path), 'utf8');
const write = (path, content) => writeFileSync(join(root, path), content);

const { version } = JSON.parse(read('package.json'));
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) {
  throw new Error(`Ogiltigt versionsnummer i package.json: "${version}"`);
}

// Lokalt datum (inte UTC), som ÅÅÅÅ-MM-DD.
function today() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Behåll datumet om versionen redan är synkad, annars används dagens datum.
function versionDate() {
  if (existsSync(join(root, 'js/version.js'))) {
    const current = read('js/version.js');
    const sameVersion = current.includes(`VERSION = '${version}'`);
    const date = current.match(/VERSION_DATE = '(\d{4}-\d{2}-\d{2})'/)?.[1];
    if (sameVersion && date) return date;
  }
  return today();
}

const date = versionDate();

write(
  'js/version.js',
  `// Genereras av tools/sync-version.mjs från "version" i package.json. Redigera inte för hand.
export const VERSION = '${version}';
export const VERSION_DATE = '${date}';
`,
);

const sw = read('sw.js');
if (!/const CACHE = '[^']*';/.test(sw)) throw new Error('Hittar inte "const CACHE" i sw.js');
write('sw.js', sw.replace(/const CACHE = '[^']*';/, `const CACHE = 'bb-shell-v${version}';`));

let changelog = read('CHANGELOG.md');
if (!changelog.includes('## [Ej släppt]')) throw new Error('Hittar inte "## [Ej släppt]" i CHANGELOG.md');
if (!changelog.includes(`## [${version}]`)) {
  changelog = changelog.replace('## [Ej släppt]', `## [Ej släppt]\n\n## [${version}] - ${date}`);
  write('CHANGELOG.md', changelog);
}

console.log(`Version ${version} (${date}) synkad: js/version.js, sw.js, CHANGELOG.md`);
