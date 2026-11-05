import { s } from '../dom.js';

// Svårighetsring: en ring i 7 lika stora segment som börjar vid kl 6 och går medurs.
// Segment 1 och 7 är dolda (glappet nertill), så de 5 synliga motsvarar svårighetsgrad 1–5.
// Segmenten upp till `difficulty` färgas (grön → orange → röd, se --diff-1..5 i CSS),
// resten är dämpade. Siffran står i mitten.
const SEGMENTS = 7;
const STEP = 360 / SEGMENTS;
const RADIUS = 41; // i viewBox 0 0 100 100; linjebredden sätts i CSS
const GAP = 4; // luft mellan segmenten, i grader

// Vinkel i grader medurs från kl 12 → punkt på ringen.
function point(deg) {
  const rad = (deg * Math.PI) / 180;
  return `${(50 + RADIUS * Math.sin(rad)).toFixed(2)} ${(50 - RADIUS * Math.cos(rad)).toFixed(2)}`;
}

// Segment n (1..7) räknat medurs från kl 6 (180°).
function arc(n) {
  const start = 180 + (n - 1) * STEP + GAP / 2;
  const end = 180 + n * STEP - GAP / 2;
  return `M ${point(start)} A ${RADIUS} ${RADIUS} 0 0 1 ${point(end)}`;
}

// Svårighetsgrad 1..5 ritas i segment 2..6.
const PATHS = [1, 2, 3, 4, 5].map((level) => arc(level + 1));

export function difficultyRing(difficulty, { large = false } = {}) {
  return s(
    'svg',
    {
      class: `difficulty${large ? ' difficulty--lg' : ''}`,
      viewBox: '0 0 100 100',
      role: 'img',
      'aria-label': `Svårighetsgrad ${difficulty} av 5`,
    },
    PATHS.map((d, i) =>
      s('path', { class: `difficulty-seg${i + 1 <= difficulty ? ' is-on' : ''}`, dataset: { level: i + 1 }, d }),
    ),
    s('text', { class: 'difficulty-num', x: '50', y: '51' }, difficulty),
  );
}
