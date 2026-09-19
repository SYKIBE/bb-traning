import { h } from '../dom.js';
import { getCategory, getExercisesByCategory } from '../data/exercises.js';
import { backLink, exerciseCard } from './common.js';

export function categoryView(id) {
  const category = getCategory(id);
  if (!category) return null;

  return h(
    'section',
    { class: 'view' },
    backLink('#/', 'Hem'),
    h('h1', { class: 'title' }, category.title),
    h('p', { class: 'lead' }, category.subtitle),
    h('div', { class: 'card-list' }, getExercisesByCategory(id).map(exerciseCard)),
  );
}
