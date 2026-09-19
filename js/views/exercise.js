import { h, s } from '../dom.js';
import { getExercise, getCategory } from '../data/exercises.js';
import { getMomentType, resolveSounds, resolveVisuals } from '../data/momentTypes.js';
import { expand } from '../engine/expand.js';
import { summarize, blockLines, formatDuration } from '../engine/summary.js';
import { createRunner } from '../engine/runner.js';
import { createStage } from '../components/pelvicAnimation.js';
import { difficultyBar } from '../components/difficultyBar.js';
import { unlock, play, vibrate } from '../audio.js';
import { acquireWakeLock, releaseWakeLock } from '../wakeLock.js';
import { getSettings, setLastExerciseId } from '../store.js';
import { suppressUpdateBanner } from '../updates.js';
import { backLink } from './common.js';

const BUTTON_LABELS = { idle: 'Start', active: 'Paus', paused: 'Fortsätt', done: 'Kör igen' };

// Chevron-ikon för hopp mellan moment
const chevron = (direction) =>
  s(
    'svg',
    {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      'aria-hidden': 'true',
      focusable: 'false',
    },
    s('polyline', { points: direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6' }),
  );

const skipButton = (direction, label, onClick) =>
  h('button', { type: 'button', class: 'btn-icon', 'aria-label': label, title: label, disabled: true, onClick }, chevron(direction));

const stat = (value, label) =>
  h('div', { class: 'stat' }, h('span', { class: 'stat-value' }, value), h('span', { class: 'stat-label' }, label));

export function exerciseView(id, autostart) {
  const exercise = getExercise(id);
  if (!exercise) return null;
  const category = getCategory(exercise.category);
  const moments = expand(exercise);
  const info = summarize(exercise);

  // ── Scen och körpanel ──────────────────────────────────────
  const stage = createStage();
  stage.idle();

  const phaseLabel = h('p', { class: 'run-phase' });
  const round = h('p', { class: 'run-round' });
  const hint = h('p', { class: 'run-hint' });
  const progress = h('progress', { class: 'run-progress', max: '1', value: '0', 'aria-label': 'Framsteg i övningen' });
  const next = h('p', { class: 'run-next' });
  const runPanel = h('div', { class: 'run-panel', hidden: true }, phaseLabel, round, hint, progress, next);
  const live = h('p', { class: 'sr-only', role: 'status', 'aria-live': 'polite' });

  // ── Knappar ────────────────────────────────────────────────
  const primary = h('button', { type: 'button', class: 'btn btn-primary btn-lg', onClick: onPrimary }, BUTTON_LABELS.idle);
  const endButton = h(
    'button',
    { type: 'button', class: 'btn btn-secondary btn-lg', hidden: true, onClick: () => runner.stop() },
    'Avsluta',
  );
  // Hopp mellan moment: aktiva bara medan övningen körs eller är pausad (inte under nedräkningen).
  const prevButton = skipButton('left', 'Föregående moment', () => runner.previousMoment());
  const nextButton = skipButton('right', 'Nästa moment', () => runner.nextMoment());
  let momentIndex = -1; // pågående moment, -1 = inget (före start, nedräkning, klar)

  // ── Motor ──────────────────────────────────────────────────
  const runner = createRunner(moments, {
    tickMs: 50, // tätare tick ger jämnare pip
    onStatus: renderStatus,

    onCountdownTick(value) {
      play('countdown');
      stage.setCount(value);
      runPanel.dataset.type = 'countdown';
      phaseLabel.textContent = 'Gör dig redo';
      round.textContent = '';
      hint.textContent = 'Övningen startar strax.';
      next.textContent = '';
      progress.value = 0;
      live.textContent = value === 3 ? 'Nedräkning startar' : '';
    },

    // Nedräkningen är slut: det tydliga startljudet.
    onCountdownEnd() {
      play('bing');
      vibrate(200);
    },

    onMomentStart(moment, index) {
      const type = getMomentType(moment.type);
      const upcoming = moments[index + 1];
      stage.setVisuals(resolveVisuals(moment), moment.seconds, moment.images);
      runPanel.dataset.type = moment.type;
      phaseLabel.textContent = type.label;
      round.textContent = moment.repeat > 1 ? `Omgång ${moment.iteration + 1} av ${moment.repeat}` : '';
      hint.textContent = type.description;
      next.textContent = upcoming
        ? `Nästa: ${getMomentType(upcoming.type).label} ${upcoming.seconds} s`
        : 'Sista momentet';
      live.textContent = `${type.label}, ${moment.seconds} sekunder`;
      // Första momentet får bara "bingen"; senare moment får sin egen cue.
      if (index > 0) {
        for (const name of resolveSounds(moment)) play(name);
        vibrate(type.rest ? 60 : [60, 40, 60]);
      }
      momentIndex = index;
      updateSkipButtons();
      // setVisuals nollställer klasserna; behåll pausläget om man hoppade medan pausad.
      stage.setPaused(runner.status === 'paused');
    },

    // De 3 sista sekunderna av moment längre än 5 s: samma pip som i startnedräkningen.
    onMomentCountdownTick() {
      play('countdown');
    },

    onTick(tick) {
      if (tick.phase !== 'running') return;
      stage.setCount(tick.remainingSeconds);
      progress.value = tick.elapsedMs / tick.totalMs;
    },

    onDone() {
      setLastExerciseId(id);
      play('fanfare');
      vibrate([200, 100, 200, 100, 400]);
      stage.setVisuals(['done']);
      stage.setCount('✓');
      runPanel.dataset.type = 'done';
      phaseLabel.textContent = 'Bra jobbat!';
      round.textContent = '';
      hint.textContent = 'Övningen är klar.';
      next.textContent = '';
      progress.value = 1;
      live.textContent = 'Övningen är klar';
      releaseWakeLock();
    },
  });

  function renderStatus(status) {
    // Ingen "ny version"-banner mitt i en övning (och man ska inte kunna ladda om den av misstag).
    suppressUpdateBanner(status === 'active' || status === 'paused');
    runPanel.hidden = status === 'idle';
    endButton.hidden = status !== 'paused';
    primary.textContent = BUTTON_LABELS[status];
    if (status === 'idle' || status === 'done') momentIndex = -1;
    updateSkipButtons();
    if (status === 'idle') {
      stage.idle();
      progress.value = 0;
      releaseWakeLock();
    }
    stage.setPaused(status === 'paused');
  }

  function updateSkipButtons() {
    const running = (runner.status === 'active' || runner.status === 'paused') && momentIndex >= 0;
    prevButton.disabled = !running;
    nextButton.disabled = !running || momentIndex >= moments.length - 1;
  }

  function begin() {
    momentIndex = -1;
    unlock(); // ljudmotorn måste startas från en användarhändelse
    stage.setVisuals(['countdown']);
    if (getSettings().wakeLock) acquireWakeLock();
    runner.start();
  }

  function onPrimary() {
    switch (runner.status) {
      case 'active':
        runner.pause();
        break;
      case 'paused':
        runner.resume();
        break;
      default:
        begin();
    }
  }

  // När fliken visas igen räknar vi om direkt i stället för att vänta på nästa tick.
  const onVisible = () => {
    if (!document.hidden) runner.tick();
  };
  document.addEventListener('visibilitychange', onVisible);

  // ── Startvy: text, nyckeltal och övningens upplägg ─────────
  const view = h(
    'section',
    { class: 'view view-exercise' },
    backLink(`#/kategori/${exercise.category}`, category.title),
    h('h1', { class: 'title' }, exercise.title),
    stage.el,
    runPanel,
    live,
    h('div', { class: 'controls' }, prevButton, primary, endButton, nextButton),
    h(
      'div',
      { class: 'stats' },
      stat(String(info.momentCount), 'moment'),
      stat(formatDuration(info.totalSeconds), 'total tid'),
      h('div', { class: 'stat' }, difficultyBar(info.difficulty, { large: true }), h('span', { class: 'stat-label' }, `Svårighet ${info.difficulty} av 5`)),
    ),
    h('p', { class: 'lead' }, exercise.description),
    h(
      'p',
      { class: 'facts' },
      `${info.activeCount} knip och ${info.restCount} ${info.restCount === 1 ? 'vila' : 'vilor'}. Längsta knip: ${info.longestSeconds} s.`,
    ),
    h('h2', { class: 'group-title' }, 'Övningens upplägg'),
    h('ul', { class: 'block-lines' }, blockLines(exercise).map((line) => h('li', null, line))),
  );

  view.destroy = () => {
    document.removeEventListener('visibilitychange', onVisible);
    runner.stop();
    releaseWakeLock();
    suppressUpdateBanner(false);
  };

  if (autostart) {
    // Ta bort /start ur adressen (utan att navigera) så att en omladdning inte
    // startar övningen igen utan ny användarhandling.
    history.replaceState(null, '', `#/ovning/${id}`);
    begin();
  }
  return view;
}
