import { h } from '../dom.js';

// Stapelbar med 5 steg (låg → hög). Stegen upp till `strength` fylls med sin
// färg (grön → orange → röd, se --str-1..5 i CSS), resten är gråa.
export function strengthBar(strength, { large = false } = {}) {
  const steps = [1, 2, 3, 4, 5].map((n) =>
    h('span', { class: `strength-step${n <= strength ? ' is-on' : ''}`, dataset: { step: n } }),
  );
  return h(
    'span',
    {
      class: `strength${large ? ' strength--lg' : ''}`,
      role: 'img',
      'aria-label': `Styrka ${strength} av 5`,
    },
    steps,
  );
}
