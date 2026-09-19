// Register över momenttyper. Ett nytt momentslag = ett nytt objekt här.
// sounds/visuals är standardvärden; ett enskilt moment kan överstyra dem med
// egna `sounds: [...]`, `visuals: [...]` och `images: [...]`.
export const momentTypes = {
  kraftknip: {
    label: 'Kraftknip',
    description: 'Knip ihop så hårt du kan och håll spänningen hela momentet.',
    sounds: ['cue-squeeze'],
    visuals: ['squeeze'],
    rest: false,
  },
  snabbknip: {
    label: 'Snabbknip',
    description: 'Korta, snabba knip i rask takt. Släpp helt mellan varje knip.',
    sounds: ['cue-fast'],
    visuals: ['pulse'],
    rest: false,
  },
  uthallighetsknip: {
    label: 'Uthållighetsknip',
    description: 'Ett jämnt, måttligt knip som du håller så länge momentet pågår.',
    sounds: ['cue-endurance'],
    visuals: ['hold'],
    rest: false,
  },
  vila: {
    label: 'Vila',
    description: 'Slappna av helt i bäckenbotten och andas lugnt.',
    sounds: ['cue-rest'],
    visuals: ['rest'],
    rest: true,
  },
};

const FALLBACK = { label: 'Moment', description: '', sounds: [], visuals: ['idle'], rest: false };

export function getMomentType(type) {
  return momentTypes[type] ?? FALLBACK;
}

// Ljud/visuellt för ett konkret moment: momentets egna värden vinner över typens.
export function resolveSounds(moment) {
  return moment.sounds ?? getMomentType(moment.type).sounds;
}

export function resolveVisuals(moment) {
  return moment.visuals ?? getMomentType(moment.type).visuals;
}
