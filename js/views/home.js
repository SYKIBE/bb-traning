import { h } from '../dom.js';
import { categories, getExercise } from '../data/exercises.js';
import { createStage } from '../components/pelvicAnimation.js';
import { getLastExerciseId } from '../store.js';
import { unlock } from '../audio.js';

// Knapp överst om användaren har genomfört en övning. Länken går till övningen
// med /start, som startar den direkt. Ljudmotorn låses upp här, i själva
// klicket, eftersom iOS/Chrome kräver en användarhändelse för det.
function resumeButton() {
  const last = getExercise(getLastExerciseId());
  if (!last) return null;
  return h(
    'a',
    { class: 'resume-button', href: `#/ovning/${last.id}/start`, onClick: unlock },
    h('span', { class: 'resume-title' }, 'Kör senaste övningen igen'),
    h('span', { class: 'resume-sub' }, last.title),
  );
}

export function homeView() {
  const stage = createStage({ small: true });
  stage.idle();

  return h(
    'section',
    { class: 'view view-home' },
    resumeButton(),
    stage.el,
    h('h1', { class: 'title title-center' }, 'Välkommen'),
    h(
      'p',
      { class: 'lead' },
      'Träna bäckenbotten steg för steg. Välj en nivå för att komma igång.',
    ),
    h(
      'div',
      { class: 'big-buttons' },
      categories.map((category) =>
        h(
          'a',
          { class: `big-button level-${category.level}`, href: `#/kategori/${category.id}` },
          h('span', { class: 'big-button-title' }, category.title),
          h('span', { class: 'big-button-sub' }, category.subtitle),
        ),
      ),
    ),
  );
}
