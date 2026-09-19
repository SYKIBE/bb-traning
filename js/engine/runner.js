// Tillståndsmaskin för en övning: nedräkning -> moment för moment -> klar.
//
// Tiden räknas ut från tidsstämplar (inte från antal tick), så den driftar inte
// och klarar att fliken throttlas. Klockan och timern kan injiceras i tester.
//
// Status: 'idle' | 'active' | 'paused' | 'done'
// Fas (i onTick): 'countdown' | 'running'
export function createRunner(moments, options = {}) {
  const {
    countdownSeconds = 3,
    tickMs = 100,
    now = () => performance.now(),
    setTimer = (fn, ms) => setInterval(fn, ms),
    clearTimer = (id) => clearInterval(id),
    onCountdownTick, // (value) – 3, 2, 1
    onCountdownEnd, // () – nedräkningen är slut, spela startljudet
    onMomentStart, // (moment, index, total)
    onMomentCountdownTick, // (value, moment, index) – 3, 2, 1 sista sekunderna av ett långt moment
    momentCountdownSeconds = 3, // så många sekunder i slutet av momentet räknas ned
    momentCountdownMinSeconds = 5, // bara moment längre än så får nedräkning
    onTick, // (info) – ungefär var 100:e ms medan aktiv
    onDone, // ()
    onStatus, // (status)
  } = options;

  const countdownMs = countdownSeconds * 1000;
  const ends = [];
  let cumulative = 0;
  for (const moment of moments) {
    cumulative += moment.seconds * 1000;
    ends.push(cumulative);
  }
  const totalMs = cumulative;

  let status = 'idle';
  let baseElapsed = 0; // ms som räknats innan senaste (åter)start
  let resumedAt = 0;
  let timer = null;
  let lastCountdownValue = null;
  let currentIndex = -1;
  let lastMomentCountdown = null;

  const elapsed = () => (status === 'active' ? baseElapsed + (now() - resumedAt) : baseElapsed);

  function setStatus(next) {
    status = next;
    onStatus?.(next);
  }

  function startTimer() {
    timer = setTimer(tick, tickMs);
  }

  function stopTimer() {
    if (timer !== null) {
      clearTimer(timer);
      timer = null;
    }
  }

  function finish() {
    stopTimer();
    baseElapsed = countdownMs + totalMs;
    setStatus('done');
    onDone?.();
  }

  function tick() {
    if (status !== 'active') return;
    const e = elapsed();

    if (e < countdownMs) {
      const value = countdownSeconds - Math.floor(e / 1000);
      if (value !== lastCountdownValue) {
        lastCountdownValue = value;
        onCountdownTick?.(value);
      }
      onTick?.({ phase: 'countdown', countdown: value, totalMs });
      return;
    }

    const t = e - countdownMs;
    if (t >= totalMs) {
      finish();
      return;
    }

    if (currentIndex === -1) onCountdownEnd?.();

    // Vid throttlad flik kan flera moment ha passerats: vi hoppar direkt till
    // det aktuella i stället för att spela upp alla cue-ljud i följd.
    const index = ends.findIndex((end) => t < end);
    if (index !== currentIndex) {
      currentIndex = index;
      lastMomentCountdown = null;
      onMomentStart?.(moments[index], index, moments.length);
    }

    const moment = moments[index];
    const remainingMs = ends[index] - t;
    const remainingSeconds = Math.ceil(remainingMs / 1000);

    if (
      moment.seconds > momentCountdownMinSeconds &&
      remainingSeconds <= momentCountdownSeconds &&
      remainingSeconds !== lastMomentCountdown
    ) {
      lastMomentCountdown = remainingSeconds;
      onMomentCountdownTick?.(remainingSeconds, moment, index);
    }

    onTick?.({
      phase: 'running',
      index,
      moment,
      remainingMs,
      remainingSeconds,
      elapsedMs: t,
      totalMs,
    });
  }

  return {
    start() {
      if (status === 'active' || status === 'paused') return;
      stopTimer();
      baseElapsed = 0;
      lastCountdownValue = null;
      currentIndex = -1;
      lastMomentCountdown = null;
      resumedAt = now();
      setStatus('active');
      startTimer();
      tick();
    },
    pause() {
      if (status !== 'active') return;
      baseElapsed = elapsed();
      stopTimer();
      setStatus('paused');
    },
    resume() {
      if (status !== 'paused') return;
      resumedAt = now();
      setStatus('active');
      startTimer();
      tick();
    },
    stop() {
      if (status === 'idle') return;
      stopTimer();
      baseElapsed = 0;
      lastCountdownValue = null;
      currentIndex = -1;
      setStatus('idle');
    },
    tick,
    get status() {
      return status;
    },
    totalMs,
    countdownMs,
  };
}
