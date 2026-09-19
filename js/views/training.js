import { h } from '../dom.js';
import { categories, getExercisesByCategory } from '../data/exercises.js';
import { exerciseCard } from './common.js';

// Översikt över alla övningar, grupperade per nivå.
export function trainingView() {
  return h(
    'section',
    { class: 'view' },
    h('h1', { class: 'title' }, 'Träning'),
    categories.map((category) =>
      h(
        'section',
        { class: 'group' },
        h(
          'h2',
          { class: 'group-title' },
          h('a', { href: `#/kategori/${category.id}` }, category.title),
        ),
        h('div', { class: 'card-list' }, getExercisesByCategory(category.id).map(exerciseCard)),
      ),
    ),
  );
}
