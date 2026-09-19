import { h } from '../dom.js';
import { strengthBar } from '../components/strengthBar.js';
import { summarize, formatDuration } from '../engine/summary.js';

export function backLink(href, label) {
  return h('a', { class: 'back-link', href }, `‹ ${label}`);
}

// Kort för en övning i en lista: titel, kort text, styrka och längd.
export function exerciseCard(exercise) {
  const info = summarize(exercise);
  return h(
    'a',
    { class: 'card card-link', href: `#/ovning/${exercise.id}` },
    h('h2', { class: 'card-title' }, exercise.title),
    h('p', { class: 'card-text' }, exercise.description),
    h(
      'div',
      { class: 'card-meta' },
      strengthBar(exercise.strength),
      h('span', null, `${formatDuration(info.totalSeconds)} · ${info.momentCount} moment`),
    ),
  );
}
