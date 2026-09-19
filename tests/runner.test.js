import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRunner } from '../js/engine/runner.js';

// Fake-klocka + manuell tick: testet styr tiden själv.
function setup(moments) {
  let t = 0;
  const log = [];
  const runner = createRunner(moments, {
    now: () => t,
    setTimer: () => 1,
    clearTimer: () => {},
    onCountdownTick: (v) => log.push(`cd:${v}`),
    onCountdownEnd: () => log.push('bing'),
    onMomentStart: (m, i) => log.push(`start:${i}:${m.type}`),
    onDone: () => log.push('done'),
    onStatus: (s) => log.push(`status:${s}`),
  });
  const advance = (ms) => {
    t += ms;
    runner.tick();
  };
  return { runner, log, advance };
}

const moments = [
  { type: 'kraftknip', seconds: 2 },
  { type: 'vila', seconds: 1 },
];

test('nedräkning 3-2-1, bing, moment, klart', () => {
  const { runner, log, advance } = setup(moments);
  runner.start(); // t = 0 -> 3
  advance(1000); // 2
  advance(1000); // 1
  advance(1000); // bing + moment 0
  advance(2000); // moment 1
  advance(1000); // klart
  assert.deepEqual(log, [
    'status:active',
    'cd:3',
    'cd:2',
    'cd:1',
    'bing',
    'start:0:kraftknip',
    'start:1:vila',
    'status:done',
    'done',
  ]);
  assert.equal(runner.status, 'done');
});

test('samma nedräkningsvärde rapporteras bara en gång', () => {
  const { runner, log, advance } = setup(moments);
  runner.start();
  advance(300);
  advance(300);
  assert.deepEqual(log.filter((l) => l.startsWith('cd:')), ['cd:3']);
});

test('paus fryser tiden och fortsätt återupptar där den var', () => {
  const { runner, log, advance } = setup(moments);
  runner.start();
  advance(3500); // 0,5 s in i moment 0
  runner.pause();
  assert.equal(runner.status, 'paused');
  advance(60_000); // lång paus
  assert.ok(!log.includes('done'));
  const before = log.length;
  runner.resume();
  advance(1400); // 1,9 s in i moment 0 – fortfarande moment 0
  assert.deepEqual(log.slice(before), ['status:active']);
  advance(200); // 2,1 s -> moment 1
  assert.ok(log.includes('start:1:vila'));
});

test('onTick ger återstående sekunder (uppåtrundat)', () => {
  let t = 0;
  let last;
  const runner = createRunner(moments, {
    now: () => t,
    setTimer: () => 1,
    clearTimer: () => {},
    onTick: (info) => (last = info),
  });
  runner.start();
  t = 3000;
  runner.tick();
  assert.equal(last.phase, 'running');
  assert.equal(last.remainingSeconds, 2);
  t = 4100; // 1,1 s in -> 0,9 s kvar -> visas som 1
  runner.tick();
  assert.equal(last.remainingSeconds, 1);
});

test('stop återställer till idle och kan startas om', () => {
  const { runner, log, advance } = setup(moments);
  runner.start();
  advance(4000);
  runner.stop();
  assert.equal(runner.status, 'idle');
  log.length = 0;
  runner.start();
  assert.deepEqual(log, ['status:active', 'cd:3']);
});

test('efter done kan övningen köras igen', () => {
  const { runner, log, advance } = setup(moments);
  runner.start();
  advance(3000);
  advance(3000);
  assert.equal(runner.status, 'done');
  log.length = 0;
  runner.start();
  assert.equal(runner.status, 'active');
  assert.deepEqual(log, ['status:active', 'cd:3']);
});

test('försenad tick hoppar direkt till aktuellt moment utan att spela alla cue', () => {
  const { runner, log, advance } = setup([
    { type: 'kraftknip', seconds: 1 },
    { type: 'vila', seconds: 1 },
    { type: 'snabbknip', seconds: 5 },
  ]);
  runner.start();
  advance(6500); // fliken var throttlad: 3,5 s in i körningen -> moment 2
  const starts = log.filter((l) => l.startsWith('start:'));
  assert.deepEqual(starts, ['start:2:snabbknip']);
});

// Kör en övning klart i steg om 100 ms och samlar in det callbacken rapporterar.
function runToEnd(exerciseMoments, callbacks) {
  let t = 0;
  const runner = createRunner(exerciseMoments, {
    now: () => t,
    setTimer: () => 1,
    clearTimer: () => {},
    ...callbacks(() => t),
  });
  runner.start();
  while (runner.status === 'active') {
    t += 100;
    runner.tick();
  }
}

test('moment längre än 5 s får pip de 3 sista sekunderna, kortare moment inga', () => {
  const pips = [];
  runToEnd(
    [
      { type: 'kraftknip', seconds: 8 }, // 3000–11000
      { type: 'vila', seconds: 5 }, // 11000–16000: exakt 5 s räcker inte
      { type: 'snabbknip', seconds: 6 }, // 16000–22000
    ],
    (time) => ({
      onMomentCountdownTick: (value, moment, index) => pips.push([index, value, time()]),
    }),
  );
  assert.deepEqual(pips, [
    [0, 3, 8000],
    [0, 2, 9000],
    [0, 1, 10000],
    [2, 3, 19000],
    [2, 2, 20000],
    [2, 1, 21000],
  ]);
});

test('pip i slutet av momentet återställs när övningen körs igen', () => {
  let t = 0;
  const pips = [];
  const runner = createRunner([{ type: 'kraftknip', seconds: 6 }], {
    now: () => t,
    setTimer: () => 1,
    clearTimer: () => {},
    onMomentCountdownTick: (value) => pips.push(value),
  });
  const runOnce = () => {
    runner.start();
    while (runner.status === 'active') {
      t += 100;
      runner.tick();
    }
  };
  runOnce();
  runOnce();
  assert.deepEqual(pips, [3, 2, 1, 3, 2, 1]);
});

// ── Hopp mellan moment ───────────────────────────────────────
function seekSetup() {
  let t = 0;
  const log = [];
  let lastTick;
  const runner = createRunner(
    [
      { type: 'snabbknip', seconds: 4 }, // 3000–7000
      { type: 'uthallighetsknip', seconds: 4 }, // 7000–11000
      { type: 'kraftknip', seconds: 4 }, // 11000–15000
    ],
    {
      now: () => t,
      setTimer: () => 1,
      clearTimer: () => {},
      onCountdownEnd: () => log.push('bing'),
      onMomentStart: (m, i) => log.push(`start:${i}`),
      onTick: (info) => (lastTick = info),
    },
  );
  const advance = (ms) => {
    t += ms;
    runner.tick();
  };
  return { runner, log, advance, tick: () => lastTick };
}

test('nextMoment hoppar till nästa moments början och tiden fortsätter därifrån', () => {
  const { runner, log, advance, tick } = seekSetup();
  runner.start();
  advance(3000 + 1000); // 1 s in i moment 0
  assert.equal(runner.nextMoment(), true);
  assert.equal(log.at(-1), 'start:1');
  assert.equal(tick().remainingSeconds, 4);
  advance(1000);
  assert.equal(tick().index, 1);
  assert.equal(tick().remainingSeconds, 3);
});

test('previousMoment: inom 2 s går man till föregående, senare börjar momentet om', () => {
  const { runner, log, advance } = seekSetup();
  runner.start();
  advance(3000 + 4000 + 1000); // 1 s in i moment 1
  assert.equal(runner.previousMoment(), true);
  assert.equal(log.at(-1), 'start:0');

  advance(2500); // 2,5 s in i moment 0
  assert.equal(runner.previousMoment(), true);
  assert.equal(log.at(-1), 'start:0'); // började om
  // start:0 loggades två gånger: efter "föregående" och efter omstarten
  // (advance hoppar direkt till moment 1, så första start:0 kommer först vid hoppet).
  assert.equal(log.filter((l) => l === 'start:0').length, 2);
});

test('previousMoment på första momentet börjar om det, och bing spelas inte igen', () => {
  const { runner, log, advance } = seekSetup();
  runner.start();
  advance(3000 + 500);
  assert.equal(runner.previousMoment(), true);
  assert.equal(log.filter((l) => l === 'start:0').length, 2);
  assert.equal(log.filter((l) => l === 'bing').length, 1);
});

test('hopp går inte under nedräkningen, före start, efter slut eller förbi sista momentet', () => {
  const { runner, advance } = seekSetup();
  assert.equal(runner.nextMoment(), false); // före start
  runner.start();
  advance(1000); // nedräkning
  assert.equal(runner.nextMoment(), false);
  assert.equal(runner.previousMoment(), false);
  advance(2000 + 8000 + 500); // 0,5 s in i sista momentet
  assert.equal(runner.nextMoment(), false); // ingen nästa
  assert.equal(runner.seekToMoment(7), false);
  advance(5000); // klart
  assert.equal(runner.status, 'done');
  assert.equal(runner.previousMoment(), false);
});

test('hopp vid paus uppdaterar visningen, tiden står still och fortsätt utgår från nya momentet', () => {
  const { runner, log, advance, tick } = seekSetup();
  runner.start();
  advance(3000 + 4000 + 4000 + 500); // 0,5 s in i moment 2
  runner.pause();
  assert.equal(runner.previousMoment(), true); // pausad: moment 1
  assert.equal(runner.status, 'paused');
  assert.equal(log.at(-1), 'start:1');
  assert.equal(tick().index, 1);
  advance(60_000); // lång paus – inget händer
  assert.equal(tick().remainingSeconds, 4);
  runner.resume();
  advance(1000);
  assert.equal(tick().index, 1);
  assert.equal(tick().remainingSeconds, 3);
});
