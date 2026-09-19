import { expand } from './expand.js';
import { getMomentType } from '../data/momentTypes.js';

export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds} s`;
  return seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`;
}

// Nyckeltal för startvyn: antal moment, total tid, längsta knip och svårighetsgrad.
export function summarize(exercise) {
  const moments = expand(exercise);
  const active = moments.filter((m) => !getMomentType(m.type).rest);
  return {
    momentCount: moments.length,
    activeCount: active.length,
    restCount: moments.length - active.length,
    totalSeconds: moments.reduce((sum, m) => sum + m.seconds, 0),
    longestSeconds: active.reduce((max, m) => Math.max(max, m.seconds), 0),
    difficulty: exercise.difficulty,
  };
}

// Läsbar beskrivning av varje block, t.ex. "8 × (Kraftknip 12 s + Vila 8 s)".
export function blockLines(exercise) {
  return exercise.blocks.map((block) => {
    const parts = block.moments
      .map((m) => `${getMomentType(m.type).label} ${m.seconds} s`)
      .join(' + ');
    const repeat = block.repeat ?? 1;
    return repeat > 1 ? `${repeat} × (${parts})` : parts;
  });
}
