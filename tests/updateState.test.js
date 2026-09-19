import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createUpdateState } from '../js/updateState.js';

function setup() {
  const changes = [];
  const state = createUpdateState((visible) => changes.push(visible));
  return { state, changes };
}

test('bannern är osynlig tills en ny version finns', () => {
  const { state, changes } = setup();
  assert.equal(state.visible, false);
  state.setSuppressed(false);
  assert.deepEqual(changes, []);
  state.setAvailable();
  assert.equal(state.visible, true);
  assert.deepEqual(changes, [true]);
});

test('bannern göms medan en övning pågår och kommer tillbaka efteråt', () => {
  const { state, changes } = setup();
  state.setAvailable();
  state.setSuppressed(true); // övningen startar
  assert.equal(state.visible, false);
  state.setSuppressed(true); // paus/fortsätt ändrar inget
  state.setSuppressed(false); // övningen klar eller avbruten
  assert.equal(state.visible, true);
  assert.deepEqual(changes, [true, false, true]);
});

test('en ny version som hittas under en övning visas först när övningen är slut', () => {
  const { state, changes } = setup();
  state.setSuppressed(true);
  state.setAvailable();
  assert.equal(state.visible, false);
  assert.deepEqual(changes, []);
  state.setSuppressed(false);
  assert.equal(state.visible, true);
  assert.deepEqual(changes, [true]);
});

test('"Senare" döljer bannern för resten av sessionen', () => {
  const { state, changes } = setup();
  state.setAvailable();
  state.dismiss();
  assert.equal(state.visible, false);
  state.setSuppressed(true);
  state.setSuppressed(false);
  state.setAvailable(); // ännu en uppdatering upptäcks
  assert.equal(state.visible, false);
  assert.deepEqual(changes, [true, false]);
});

test('onChange anropas bara när synligheten ändras', () => {
  const { state, changes } = setup();
  state.setAvailable();
  state.setAvailable();
  state.dismiss();
  state.dismiss();
  assert.deepEqual(changes, [true, false]);
});
