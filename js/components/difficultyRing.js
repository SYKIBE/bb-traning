import { h } from '../dom.js';

// Stapelbar med 5 steg (låg → hög). Stegen upp till `difficulty` fylls med sin
// färg (grön → orange → röd, se --diff-1..5 i CSS), resten är gråa.
export function difficultyBar(difficulty, { large = false } = {}) {
  const steps = [1, 2, 3, 4, 5].map((n) =>
    h('span', { class: `difficulty-step${n <= difficulty ? ' is-on' : ''}`, dataset: { step: n } }),
  );
  return h(
    'span',
    {
      class: `difficulty${large ? ' difficulty--lg' : ''}`,
      role: 'img',
      'aria-label': `Svårighetsgrad ${difficulty} av 5`,
    },
    steps,
  );
}
