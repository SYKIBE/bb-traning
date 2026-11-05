import { expand } from './expand.js';
import { getMomentType } from '../data/momentTypes.js';

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} s`;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
}

// Nyckeltal för startvyn: antal moment, total tid, längsta knip och svårighetsgrad.
// Ett "moment" i texten är ett knip – vilor räknas inte.
export function summarize(exercise) {
  const moments = expand(exercise);
  const active = moments.filter((m) => !getMomentType(m.type).rest);
  return {
    momentCount: active.length,
    activeCount: active.length,
    restCount: moments.length - active.length,
    totalSeconds: moments.reduce((sum, m) => sum + m.seconds, 0),
    longestSeconds: active.reduce((max, m) => Math.max(max, m.seconds), 0),
    difficulty: exercise.difficulty,
  };
}

const restText = (seconds) => `${seconds} ${seconds === 1 ? 'sekunds' : 'sekunders'} vila`;

// Läsbar beskrivning av varje block, t.ex. "8 × Kraftknip 12 s med 8 sekunders vila mellan knipen".
// Block som inte är "ett knip + vila" (eller bara ett knip) beskrivs moment för moment.
export function blockLines(exercise) {
  return exercise.blocks.map((block, blockIndex) => {
    const repeat = block.repeat ?? 1;
    const [squeeze, rest] = block.moments;
    const isSqueeze = (m) => m && !getMomentType(m.type).rest;
    const isRest = (m) => m && getMomentType(m.type).rest;

    if (block.moments.length <= 2 && isSqueeze(squeeze) && (!rest || isRest(rest))) {
      const base = `${repeat} × ${getMomentType(squeeze.type).label} ${squeeze.seconds} s`;
      // Vilan sist i övningen körs inte (se expand), så ett ensamt sista knip får ingen vila.
      const isLast = blockIndex === exercise.blocks.length - 1;
      if (!rest || (repeat === 1 && isLast)) return base;
      return repeat > 1
        ? `${base} med ${restText(rest.seconds)} mellan knipen`
        : `${base} med ${restText(rest.seconds)} efter knipet`;
    }

    const parts = block.moments
      .map((m) => `${getMomentType(m.type).label} ${m.seconds} s`)
      .join(' + ');
    return repeat > 1 ? `${repeat} × (${parts})` : parts;
  });
}
