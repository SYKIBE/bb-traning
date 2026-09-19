// Håller skärmen tänd medan en övning körs (där webbläsaren stöder det).
// Systemet släpper låset när fliken döljs, så vi begär det igen när den visas.
let sentinel = null;
let wanted = false;

async function request() {
  if (!('wakeLock' in navigator)) return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => {
      sentinel = null;
    });
  } catch {
    // Nekad (t.ex. låg batterinivå) – övningen fungerar ändå.
  }
}

document.addEventListener('visibilitychange', () => {
  if (wanted && !sentinel && document.visibilityState === 'visible') request();
});

export function acquireWakeLock() {
  wanted = true;
  return request();
}

export async function releaseWakeLock() {
  wanted = false;
  try {
    await sentinel?.release();
  } catch {
    // redan släppt
  }
  sentinel = null;
}
