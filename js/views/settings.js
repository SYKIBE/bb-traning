import { h } from '../dom.js';
import { getSettings, setSetting } from '../store.js';
import { unlock, play, vibrate } from '../audio.js';
import { VERSION, VERSION_DATE } from '../version.js';

function toggle(key, label, hint) {
  const input = h('input', {
    type: 'checkbox',
    class: 'switch-input',
    onChange: (event) => setSetting(key, event.target.checked),
  });
  input.checked = getSettings()[key];
  return h(
    'label',
    { class: 'setting' },
    h('span', { class: 'setting-text' }, h('span', { class: 'setting-label' }, label), h('span', { class: 'setting-hint' }, hint)),
    input,
    h('span', { class: 'switch', 'aria-hidden': 'true' }),
  );
}

export function settingsView() {
  const volume = h('input', {
    type: 'range',
    min: '0',
    max: '1',
    step: '0.05',
    class: 'range',
    'aria-label': 'Volym',
    onInput: (event) => setSetting('volume', Number(event.target.value)),
  });
  volume.value = getSettings().volume;

  const test = h(
    'button',
    {
      type: 'button',
      class: 'btn btn-secondary',
      onClick: () => {
        unlock();
        play('bing');
        vibrate(80);
      },
    },
    'Testa ljud',
  );

  return h(
    'section',
    { class: 'view' },
    h('h1', { class: 'title' }, 'Inställningar'),
    h(
      'div',
      { class: 'settings' },
      toggle('sound', 'Ljud', 'Pip, bing och signaler vid momentbyte'),
      h('div', { class: 'setting setting-volume' }, h('span', { class: 'setting-label' }, 'Volym'), volume, test),
      toggle('vibration', 'Vibration', 'Kort vibration vid start och momentbyte (om enheten stöder det)'),
      toggle('wakeLock', 'Håll skärmen tänd', 'Skärmen släcks inte under en pågående övning'),
    ),
    h(
      'section',
      { class: 'app-info', 'aria-labelledby': 'app-info-title' },
      h('h2', { class: 'app-info-title', id: 'app-info-title' }, 'Om appen'),
      h('p', { class: 'app-info-text' }, `Version ${VERSION}, versionsdatum: ${VERSION_DATE}`),
    ),
  );
}
