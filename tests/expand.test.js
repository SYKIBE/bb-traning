import { test } from 'node:test';
import assert from 'node:assert/strict';
import { expand } from '../js/engine/expand.js';
import { summarize, blockLines, formatDuration } from '../js/engine/summary.js';
import { exercises, categories, getExercise, getExercisesByCategory } from '../js/data/exercises.js';
import { getMomentType } from '../js/data/momentTypes.js';

test('expand upprepar ett block i ordning', () => {
  const moments = expand({
    blocks: [
      {
        repeat: 2,
        moments: [
          { type: 'kraftknip', seconds: 3 },
          { type: 'vila', seconds: 2 },
        ],
      },
      { moments: [{ type: 'snabbknip', seconds: 1 }] },
    ],
  });
  assert.deepEqual(
    moments.map((m) => m.type),
    ['kraftknip', 'vila', 'kraftknip', 'vila', 'snabbknip'],
  );
  assert.deepEqual(
    moments.map((m) => m.index),
    [0, 1, 2, 3, 4],
  );
  assert.deepEqual(
    moments.map((m) => m.iteration),
    [0, 0, 1, 1, 0],
  );
});

test('expand tar bort vila i slutet så att övningen slutar med ett knip', () => {
  const moments = expand({
    blocks: [
      { repeat: 2, moments: [{ type: 'kraftknip', seconds: 3 }, { type: 'vila', seconds: 2 }] },
      { moments: [{ type: 'vila', seconds: 5 }] },
    ],
  });
  assert.deepEqual(
    moments.map((m) => m.type),
    ['kraftknip', 'vila', 'kraftknip'],
  );
});

test('exempelövningen (Kraftpasset) ger 22 moment (knip) och 288 sekunder', () => {
  const exercise = getExercise('kraftpasset');
  const moments = expand(exercise);
  // 8×(12+8) + (30+20) + (12+8) + 12×(3+2), utan den sista vilan
  assert.equal(moments.length, 16 + 2 + 2 + 24 - 1);
  const info = summarize(exercise);
  assert.equal(info.momentCount, 22);
  assert.equal(info.totalSeconds, 160 + 50 + 20 + 60 - 2);
  assert.equal(info.longestSeconds, 30);
  assert.equal(info.activeCount, 22);
  assert.equal(info.restCount, 21);
});

test('Första knipet: 6 moment, 5 vilor, 1 min 14 s', () => {
  const info = summarize(getExercise('forsta-knipet'));
  assert.equal(info.momentCount, 6);
  assert.equal(info.restCount, 5);
  assert.equal(formatDuration(info.totalSeconds), '1 min 14 s');
});

test('blockLines beskriver block och repetitioner', () => {
  assert.deepEqual(blockLines(getExercise('kraftpasset')), [
    '8 × Kraftknip 12 s med 8 sekunders vila mellan knipen',
    '1 × Kraftknip 30 s med 20 sekunders vila efter knipet',
    '1 × Kraftknip 12 s med 8 sekunders vila efter knipet',
    '12 × Snabbknip 3 s med 2 sekunders vila mellan knipen',
  ]);
  assert.deepEqual(blockLines(getExercise('forsta-knipet')), [
    '6 × Uthållighetsknip 4 s med 10 sekunders vila mellan knipen',
  ]);
  assert.deepEqual(blockLines(getExercise('snabb-och-stark'))[0], '20 × Snabbknip 2 s med 1 sekunds vila mellan knipen');
});

test('blockLines: ensamt sista knip får ingen vila, ovanliga block beskrivs moment för moment', () => {
  assert.deepEqual(
    blockLines({
      blocks: [
        { moments: [{ type: 'vila', seconds: 5 }, { type: 'kraftknip', seconds: 3 }] },
        { moments: [{ type: 'kraftknip', seconds: 30 }, { type: 'vila', seconds: 20 }] },
      ],
    }),
    ['Vila 5 s + Kraftknip 3 s', '1 × Kraftknip 30 s'],
  );
});

test('formatDuration', () => {
  assert.equal(formatDuration(45), '45 s');
  assert.equal(formatDuration(120), '2 min');
  assert.equal(formatDuration(290), '4 min 50 s');
});

test('datan är konsekvent: 3 kategorier × 3 övningar, känd typ och svårighetsgrad 1–5', () => {
  assert.equal(categories.length, 3);
  for (const category of categories) {
    assert.equal(getExercisesByCategory(category.id).length, 3, category.id);
  }
  const ids = new Set();
  for (const exercise of exercises) {
    assert.ok(!ids.has(exercise.id), `dubblett-id ${exercise.id}`);
    ids.add(exercise.id);
    assert.ok(categories.some((c) => c.id === exercise.category), exercise.id);
    assert.ok(Number.isInteger(exercise.difficulty) && exercise.difficulty >= 1 && exercise.difficulty <= 5);
    const moments = expand(exercise);
    assert.ok(!getMomentType(moments.at(-1).type).rest, `${exercise.id} slutar med vila`);
    for (const moment of moments) {
      assert.notEqual(getMomentType(moment.type).label, 'Moment', `okänd typ ${moment.type}`);
      assert.ok(moment.seconds > 0);
    }
  }
});
