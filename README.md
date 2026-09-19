# Bäckenbotten

Guidade bäckenbottenövningar som en PWA i vanilla JS (ES-moduler, inga beroenden, ingen build).

## Köra lokalt

```sh
npm start        # python -m http.server 8080 → http://localhost:8080
npm test         # node --test tests/
npm run icons    # generera om PNG-ikonerna i icons/
```

Service workern kräver `localhost` eller HTTPS. Testa ljud, vibration och wake lock på en riktig mobil.

## Versionshantering

Projektet följer [semantisk versionering](https://semver.org/lang/sv/) (`MAJOR.MINOR.PATCH`) och för en [ändringslogg](CHANGELOG.md). `version` i [package.json](package.json) är den enda källan. Versionen och versionsdatumet visas i appen under Inställningar → Om appen.

**Under arbetet:** skriv en rad under `## [Ej släppt]` i [CHANGELOG.md](CHANGELOG.md) för varje ändring som en användare märker.

**Vid en release** (arbetsträdet måste vara rent):

```sh
npm version patch   # 0.1.0 → 0.1.1  (buggfix)
npm version minor   # 0.1.0 → 0.2.0  (ny funktion)
npm version major   # 0.1.0 → 1.0.0  (större/inkompatibel ändring)
git push --follow-tags
```

`npm version` bumpar `package.json`, kör [tools/sync-version.mjs](tools/sync-version.mjs), committar med meddelandet `chore(release): vX.Y.Z` och skapar taggen `vX.Y.Z`. Skriptet uppdaterar samtidigt:

- `js/version.js` – versionen och dagens datum som appen visar (genereras, redigera inte för hand),
- `sw.js` – cache-namnet, så att varje release får en ny cache,
- `CHANGELOG.md` – flyttar "Ej släppt" till en rubrik för den nya versionen.

Tester ([tests/version.test.js](tests/version.test.js)) varnar om något av detta hamnar ur synk.

**Meddelande om ny version:** Användare som har appen öppen får en banner när en ny version släppts: varje release ändrar `sw.js` (cache-namnet), och webbläsaren upptäcker den nya servicearbetaren i bakgrunden ([js/updates.js](js/updates.js)). Bannern visas alltså bara vid riktiga releaser och göms medan en övning pågår.

## Lägga till en övning

Alla övningar ligger i [js/data/exercises.js](js/data/exercises.js):

```js
{
  id: 'min-ovning',
  category: 'basovningar',          // kom-igang | basovningar | avancerade
  title: 'Min övning',
  description: 'Kort text som visas i startvyn.',
  difficulty: 3,                    // 1–5
  blocks: [
    { repeat: 8, moments: [{ type: 'kraftknip', seconds: 12 }, { type: 'vila', seconds: 8 }] },
    { moments: [{ type: 'kraftknip', seconds: 30 }, { type: 'vila', seconds: 20 }] },
  ],
}
```

- `repeat` upprepar hela blockets moment i ordning (standard 1).
- Momenttyper (`kraftknip`, `snabbknip`, `uthallighetsknip`, `vila`) definieras i [js/data/momentTypes.js](js/data/momentTypes.js) med etikett, standardljud och standardanimation.
- Ett moment kan överstyra typens ljud och visuella uttryck: `sounds: ['bing', ...]`, `visuals: ['pulse', ...]`, `images: ['assets/x.svg']`.
- Nya filer måste läggas till i `SHELL` i [sw.js](sw.js) för att fungera offline.

## Ljud

Alla ljud syntetiseras i [js/audio.js](js/audio.js):

- `countdown` – pip: 3-2-1 före start och de 3 sista sekunderna av moment längre än 5 s.
- `bing` – startljud efter nedräkningen (första momentet får bara bingen).
- `cue-squeeze`, `cue-fast`, `cue-endurance`, `cue-rest` – signal när ett moment börjar, olika per momenttyp.
- `fanfare` – när övningen är klar.

Regeln för pip i slutet av långa moment ligger i [js/engine/runner.js](js/engine/runner.js) (`onMomentCountdownTick`) och är enhetstestad.

## Struktur

- `js/engine/` – ren logik utan DOM: `expand` (block → momentlista), `runner` (nedräkning/moment/paus/klar), `summary`.
- `js/audio.js` – syntetiserade ljud (Web Audio). Byt ut en synt mot en ljudfil i `play()` om du vill.
- `js/views/`, `js/components/` – skärmar och små UI-delar. `js/router.js` är en hash-router.

Övningsinnehållet är platshållare och bör granskas av en sjukgymnast innan appen publiceras.
