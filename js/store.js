// Inställningar i localStorage. Allt är i try/catch: lagringen kan vara
// blockerad (privat läge) och appen ska fungera ändå.
const KEY = 'bb-settings-v1';

const defaults = {
  sound: true,
  volume: 0.7,
  vibration: true,
  wakeLock: true,
};

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? '{}');
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

let state = load();

export const getSettings = () => ({ ...state });

// Senast genomförda övning (id). Sparas när en övning körts klart.
const LAST_KEY = 'bb-last-exercise-v1';

export function getLastExerciseId() {
  try {
    return localStorage.getItem(LAST_KEY);
  } catch {
    return null;
  }
}

export function setLastExerciseId(id) {
  try {
    localStorage.setItem(LAST_KEY, id);
  } catch {
    // ignoreras
  }
}

export function setSetting(key, value) {
  if (!(key in defaults)) return;
  state = { ...state, [key]: value };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // ignoreras – inställningen gäller då bara för den här sessionen
  }
}
