// Tillståndsmaskin för en övning: nedräkning -> moment för moment -> klar.
//
// Tiden räknas ut från tidsstämplar (inte från antal tick), så den driftar inte
// och klarar att fliken throttlas. Klockan och timern kan injiceras i tester.
//
// Status: 'idle' | 'active' | 'paused' | 'done'
// Fas (i onTick): 'countdown' | 'running'
//
// Man kan hoppa mellan moment medan övningen körs eller är pausad
// (seekToMoment / previousMoment / nextMoment), men inte under nedräkningen.
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
  let countdownEnded = false;
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

  // Räknar ut var i övningen vi är och rapporterar det. Körs av tick() (aktiv)
  // och av seekToMoment (även pausad, så att skärmen uppdateras vid hopp).
  function evaluate() {
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
      if (status === 'active') finish();
      return;
    }

    if (!countdownEnded) {
      countdownEnded = true;
      onCountdownEnd?.();
    }

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

  function tick() {
    if (status === 'active') evaluate();
  }

  // Momentet vi är i och hur långt in i det vi är, eller null utanför momenten
  // (före start, under nedräkningen och efter slut).
  function position() {
    const t = elapsed() - countdownMs;
    if (t < 0 || t >= totalMs) return null;
    const index = ends.findIndex((end) => t < end);
    return { index, intoMomentMs: t - (index === 0 ? 0 : ends[index - 1]) };
  }

  // Hoppar till början av moment `index`. Returnerar false om det inte går.
  function seekToMoment(index) {
    if (status !== 'active' && status !== 'paused') return false;
    if (!position() || !Number.isInteger(index) || index < 0 || index >= moments.length) return false;
    baseElapsed = countdownMs + (index === 0 ? 0 : ends[index - 1]);
    resumedAt = now();
    currentIndex = -1; // tvingar onMomentStart, även när samma moment startas om
    lastMomentCountdown = null;
    evaluate();
    return true;
  }

  return {
    start() {
      if (status === 'active' || status === 'paused') return;
      stopTimer();
      baseElapsed = 0;
      lastCountdownValue = null;
      currentIndex = -1;
      countdownEnded = false;
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
      countdownEnded = false;
      setStatus('idle');
    },
    seekToMoment,
    // Som i en musikspelare: har momentet pågått längre än `restartAfterMs` börjar
    // det om, annars går man till föregående (på första momentet börjar det om).
    previousMoment(restartAfterMs = 2000) {
      const pos = position();
      if (!pos) return false;
      return seekToMoment(pos.intoMomentMs > restartAfterMs ? pos.index : Math.max(0, pos.index - 1));
    },
    nextMoment() {
      const pos = position();
      if (!pos || pos.index >= moments.length - 1) return false;
      return seekToMoment(pos.index + 1);
    },
    tick,
    get status() {
      return status;
    },
    totalMs,
    countdownMs,
  };
}
