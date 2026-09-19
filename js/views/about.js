import { h } from '../dom.js';
import { momentTypes } from '../data/momentTypes.js';
import { difficultyBar } from '../components/difficultyBar.js';

export function aboutView() {
  return h(
    'section',
    { class: 'view prose' },
    h('h1', { class: 'title' }, 'Om appen'),
    h(
      'p',
      null,
      'Appen guidar dig genom övningar för bäckenbotten. Varje övning består av flera moment ' +
        'med knip och vila, och tidtagning, ljud och animation talar om vad du ska göra.',
    ),

    h('h2', null, 'Så fungerar en övning'),
    h('ol', null,
      h('li', null, 'Välj en övning och tryck på Start.'),
      h('li', null, 'En nedräkning på 3 sekunder med ett pip varje sekund startar.'),
      h('li', null, 'Ett tydligt “bing” markerar att övningen börjar.'),
      h('li', null, 'Följ momenten. Vid varje byte hörs en signal.'),
      h('li', null, 'I moment som är längre än 5 sekunder piper det de 3 sista sekunderna, så att du vet när det är dags att byta.'),
      h('li', null, 'När sista momentet är klart spelas en liten fanfar.'),
    ),

    h('h2', null, 'Momenttyper'),
    h(
      'dl',
      { class: 'defs' },
      Object.entries(momentTypes).flatMap(([key, type]) => [
        h('dt', null, h('span', { class: `type-dot type-dot--${key}`, 'aria-hidden': 'true' }), type.label),
        h('dd', null, type.description),
      ]),
    ),
    h(
      'p',
      null,
      'Ju mindre cirkeln blir och ju varmare färgen är, desto hårdare ska du knipa: snabbknip (gul) minst, ' +
        'uthållighetsknip (orange) mer och kraftknip (röd) mest. Vila (blågrön) är startläget.',
    ),

    h('h2', null, 'Svårighetsgrader'),
    h(
      'p',
      null,
      'Varje övning har en svårighetsgrad från 1 (enklast, grön) till 5 (svårast, röd). Börja enkelt och öka när det känns lätt.',
    ),
    h('div', { class: 'difficulty-legend' }, [1, 2, 3, 4, 5].map((n) => difficultyBar(n))),

    h('h2', null, 'Viktigt'),
    h(
      'p',
      { class: 'notice' },
      'Appen ersätter inte råd från vården. Ta kontakt med läkare eller sjukgymnast om du har ' +
        'smärta, besvär eller är osäker på hur du ska träna. Avbryt om det gör ont.',
    ),
  );
}
