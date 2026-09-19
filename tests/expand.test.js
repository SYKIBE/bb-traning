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

test('exempelövningen (Kraftpasset) ger 44 moment och 290 sekunder', () => {
  const exercise = getExercise('kraftpasset');
  const moments = expand(exercise);
  // 8×(12+8) + (30+20) + (12+8) + 12×(3+2)
  assert.equal(moments.length, 16 + 2 + 2 + 24);
  const info = summarize(exercise);
  assert.equal(info.momentCount, 44);
  assert.equal(info.totalSeconds, 160 + 50 + 20 + 60);
  assert.equal(info.longestSeconds, 30);
  assert.equal(info.activeCount, 22);
  assert.equal(info.restCount, 22);
});

test('blockLines beskriver block och repetitioner', () => {
  assert.deepEqual(blockLines(getExercise('kraftpasset')), [
    '8 × (Kraftknip 12 s + Vila 8 s)',
    'Kraftknip 30 s + Vila 20 s',
    'Kraftknip 12 s + Vila 8 s',
    '12 × (Snabbknip 3 s + Vila 2 s)',
  ]);
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
    for (const moment of expand(exercise)) {
      assert.notEqual(getMomentType(moment.type).label, 'Moment', `okänd typ ${moment.type}`);
      assert.ok(moment.seconds > 0);
    }
  }
});
