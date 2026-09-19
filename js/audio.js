// Syntetiserade ljud med Web Audio – inga ljudfiler behövs.
// Gränssnittet är `play(name)`, så en enskild synt kan bytas mot en ljudfil
// senare utan att resten av appen påverkas.
import { getSettings } from './store.js';

let ctx = null;
let master = null;

// Måste anropas från en användarhändelse (t.ex. Start-klicket) – iOS/Chrome
// startar annars inte ljudmotorn.
export function unlock() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContextClass) return;
    ctx = new AudioContextClass();
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
}

// En ton med snabb attack och exponentiell utklingning.
function tone({ freq, at = 0, dur = 0.15, type = 'sine', gain = 0.6, endFreq }) {
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const amp = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + dur);
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(master);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

const C5 = 523.25;
const E5 = 659.25;
const G5 = 783.99;
const C6 = 1046.5;

const sounds = {
  // Kort pip: en gång per sekund i startnedräkningen och de 3 sista sekunderna av långa moment.
  countdown: () => tone({ freq: 880, dur: 0.14, gain: 0.5 }),

  // Tydligt "bing" när nedräkningen är slut: grundton + övertoner med lång utklingning.
  bing: () => {
    tone({ freq: 1318.5, dur: 1.1, gain: 0.55 });
    tone({ freq: 2637, dur: 0.7, gain: 0.2 });
    tone({ freq: 3951, dur: 0.35, gain: 0.08 });
  },

  // Cue vid momentbyte – olika karaktär per typ.
  'cue-squeeze': () => tone({ freq: 520, endFreq: 780, dur: 0.22, type: 'triangle', gain: 0.6 }),
  'cue-fast': () => {
    tone({ freq: 990, dur: 0.07, type: 'square', gain: 0.25 });
    tone({ freq: 990, at: 0.11, dur: 0.07, type: 'square', gain: 0.25 });
  },
  'cue-endurance': () => tone({ freq: 440, endFreq: 560, dur: 0.4, type: 'sine', gain: 0.6 }),
  'cue-rest': () => tone({ freq: 523, endFreq: 392, dur: 0.35, type: 'sine', gain: 0.45 }),

  // Slutfanfar: stigande arpeggio och ett hållet slutackord.
  fanfare: () => {
    tone({ freq: C5, at: 0, dur: 0.16, type: 'triangle', gain: 0.5 });
    tone({ freq: E5, at: 0.15, dur: 0.16, type: 'triangle', gain: 0.5 });
    tone({ freq: G5, at: 0.3, dur: 0.16, type: 'triangle', gain: 0.5 });
    for (const freq of [C6, G5, E5]) {
      tone({ freq, at: 0.5, dur: 1.2, type: 'triangle', gain: 0.35 });
    }
  },
};

export function play(name) {
  const settings = getSettings();
  if (!settings.sound || !ctx || !sounds[name]) return;
  master.gain.value = settings.volume;
  sounds[name]();
}

export function vibrate(pattern) {
  if (getSettings().vibration) navigator.vibrate?.(pattern);
}
