import { h } from '../dom.js';

// Animationsscenen: en cirkel som drar ihop sig vid knip och vidgas vid vila.
// Varje visuell effekt är en CSS-klass (`v-<namn>`) på scenen, så ett moment kan
// kombinera flera. Animationslängden styrs via CSS-variabeln --dur (momentets
// sekunder). Ett moment kan även ha `images: [url, ...]` som visas i scenen.
export function createStage({ small = false } = {}) {
  const count = h('div', { class: 'stage-count', 'aria-hidden': 'true' });
  const images = h('div', { class: 'stage-images' });
  const orb = h('div', { class: 'orb' });
  const el = h(
    'div',
    { class: `stage v-idle${small ? ' stage--sm' : ''}`, 'aria-hidden': 'true' },
    h('div', { class: 'ring' }),
    orb,
    images,
    count,
  );
  const base = `stage${small ? ' stage--sm' : ''}`;

  return {
    el,

    // visuals: ['squeeze', ...], seconds: momentets längd, imageUrls: valfria bilder
    setVisuals(visuals, seconds = 1, imageUrls = []) {
      // Cirkelns storlek just nu blir startpunkt för nästa animation (--from),
      // så att bytet mellan t.ex. uthållighetsknip och vila blir mjukt.
      el.style.setProperty('--from', new DOMMatrixReadOnly(getComputedStyle(orb).transform).a);
      // Nollställ först så att en identisk animation startar om från början.
      el.className = base;
      void el.offsetWidth;
      el.className = `${base} ${visuals.map((v) => `v-${v}`).join(' ')}`;
      el.style.setProperty('--dur', `${seconds}s`);
      images.replaceChildren(
        ...imageUrls.map((src) => h('img', { class: 'stage-image', src, alt: '' })),
      );
    },

    setCount(text) {
      count.textContent = text;
    },

    setPaused(paused) {
      el.classList.toggle('is-paused', paused);
    },

    idle() {
      this.setVisuals(['idle']);
      this.setCount('');
    },
  };
}
