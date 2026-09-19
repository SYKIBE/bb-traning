// Meddelar när en ny version av appen finns.
//
// Varje release ändrar sw.js (cache-namnet innehåller versionen, se
// tools/sync-version.mjs). Webbläsaren ser att servicearbetaren ändrats, installerar
// den nya i bakgrunden och skickar `updatefound`. Då visar vi en banner med
// "Uppdatera" (laddar om sidan) och "Senare".
import { h } from './dom.js';
import { createUpdateState } from './updateState.js';

// Hur ofta vi frågar efter en ny version när appen ligger i bakgrunden och
// kommer tillbaka (webbläsaren kollar annars bara vid sidladdning).
const CHECK_INTERVAL_MS = 15 * 60 * 1000;

let region = null;

// Regionen ligger alltid i DOM:en (för skärmläsare), själva bannern sätts in och tas bort.
const banner = h(
  'div',
  { class: 'update-banner' },
  h('p', { class: 'update-text' }, 'En ny version av appen finns.'),
  h(
    'div',
    { class: 'update-actions' },
    h('button', { type: 'button', class: 'update-later', onClick: () => state.dismiss() }, 'Senare'),
    h('button', { type: 'button', class: 'update-action', onClick: () => location.reload() }, 'Uppdatera'),
  ),
);

const state = createUpdateState((visible) => {
  if (region) region.replaceChildren(...(visible ? [banner] : []));
});

// Anropas av övningsvyn: dölj bannern medan en övning körs så att den inte stör
// och så att ingen uppdaterar (laddar om) mitt i ett pass.
export function suppressUpdateBanner(suppressed) {
  state.setSuppressed(suppressed);
}

export function initUpdates() {
  region = h('div', { class: 'update-region', role: 'status', 'aria-live': 'polite' });
  document.body.append(region);

  if (!('serviceWorker' in navigator)) return;

  // Fanns det redan en servicearbetare som styr sidan när vi laddades? Annars är det
  // första besöket, och den som installeras då är inte en "uppdatering".
  const hadController = Boolean(navigator.serviceWorker.controller);

  navigator.serviceWorker
    .register('./sw.js')
    .then((registration) => {
      if (!hadController) return;

      const track = (worker) => {
        worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' || worker.state === 'activated') state.setAvailable();
        });
      };
      if (registration.installing) track(registration.installing);
      registration.addEventListener('updatefound', () => track(registration.installing));

      let lastCheck = Date.now();
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible' || Date.now() - lastCheck < CHECK_INTERVAL_MS) return;
        lastCheck = Date.now();
        registration.update().catch(() => {}); // offline: försök igen senare
      });
    })
    .catch(() => {
      // Offline-stöd är en bonus; appen fungerar utan.
    });
}
