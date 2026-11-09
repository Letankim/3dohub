// Run: node --experimental-strip-types --test frontend/tests/excel-history.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  historyReducer,
  EMPTY_HISTORY,
  HISTORY_LIMIT,
  canUndo,
  canRedo,
} from '../src/modules/excel-norm/excel-history.ts';

function grid(cells) {
  return {
    rowCount: 5,
    colCount: 3,
    colWidthsPx: {},
    rowHeightsPx: {},
    merges: [],
    cells: Object.fromEntries(Object.entries(cells).map(([k, v]) => [k, { value: v }])),
    printGuides: {},
  };
}

function result({ raw, normalized, orientation = 'PORTRAIT', tag = 'r' }) {
  return {
    id: tag,
    orientation_mode: orientation,
    grid_data: grid(normalized),
    original_grid_data: grid(raw),
    a4_preview_html: `<p>${tag}</p>`,
  };
}

const R1 = result({ raw: { '1:1': 'raw' }, normalized: { '1:1': 'norm' }, tag: 'R1' });
const apply = (s, ...actions) => actions.reduce(historyReducer, s);
const cell = (s, k = '1:1') => s.present.grid.cells[k]?.value;

test('LOAD: first Undo returns the raw sheet, Redo returns normalized', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  assert.equal(cell(s), 'norm');
  assert.ok(canUndo(s) && !canRedo(s));
  s = historyReducer(s, { type: 'UNDO' });
  assert.equal(cell(s), 'raw');
  s = historyReducer(s, { type: 'REDO' });
  assert.equal(cell(s), 'norm');
});

test('edit -> Normalize -> Undo restores the USER-EDITED grid and the previous result', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  s = historyReducer(s, { type: 'SET_CELL', key: '1:1', value: 'user edit' });
  const preGrid = s.present.grid;
  const R2 = result({ raw: { '1:1': 'user edit' }, normalized: { '1:1': 'NORM2' }, tag: 'R2' });
  s = historyReducer(s, { type: 'NORMALIZED', preGrid, result: R2 });
  assert.equal(cell(s), 'NORM2');
  assert.equal(s.present.result.id, 'R2');
  assert.equal(s.present.dirty, false);

  s = historyReducer(s, { type: 'UNDO' });
  assert.equal(cell(s), 'user edit', 'Undo must bring back the edited sheet, not the old one');
  assert.equal(s.present.result.id, 'R1', 'Undo must also restore the result it belonged to');
  assert.equal(s.present.dirty, true, 'edited grid is stale vs its result -> needs re-normalize');

  s = historyReducer(s, { type: 'REDO' });
  assert.equal(cell(s), 'NORM2');
  assert.equal(s.present.result.id, 'R2');
});

test('blur + Enter commit the same value twice -> only ONE history entry', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  const before = s.past.length;
  s = apply(
    s,
    { type: 'SET_CELL', key: '1:1', value: 'x' },
    { type: 'SET_CELL', key: '1:1', value: 'x' }
  );
  assert.equal(s.past.length, before + 1);
});

test('committing an unchanged cell value records nothing', () => {
  const s0 = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  const s1 = historyReducer(s0, { type: 'SET_CELL', key: '1:1', value: 'norm' });
  assert.equal(s1, s0);
});

test('normalizing twice without changes adds no no-op undo step', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  const depth = s.past.length;
  const same = result({ raw: { '1:1': 'raw' }, normalized: { '1:1': 'norm' }, tag: 'R1b' });
  s = historyReducer(s, { type: 'NORMALIZED', preGrid: s.present.grid, result: same });
  s = historyReducer(s, { type: 'NORMALIZED', preGrid: s.present.grid, result: same });
  assert.equal(s.past.length, depth);
  s = historyReducer(s, { type: 'UNDO' });
  assert.equal(cell(s), 'raw');
});

test('changing orientation IS an undoable step (result restored)', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  const land = result({
    raw: { '1:1': 'raw' },
    normalized: { '1:1': 'norm' },
    orientation: 'LANDSCAPE',
    tag: 'LAND',
  });
  s = historyReducer(s, { type: 'NORMALIZED', preGrid: s.present.grid, result: land });
  assert.equal(s.present.result.orientation_mode, 'LANDSCAPE');
  s = historyReducer(s, { type: 'UNDO' });
  assert.equal(s.present.result.orientation_mode, 'PORTRAIT');
});

test('reducer is pure: calling it twice (StrictMode) yields equal output and does not mutate input', () => {
  const s0 = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  const snapshot = JSON.stringify(s0);
  const action = { type: 'SET_CELL', key: '2:2', value: 'v' };
  const a = historyReducer(s0, action);
  const b = historyReducer(s0, action);
  assert.deepEqual(a, b);
  assert.equal(JSON.stringify(s0), snapshot);
  assert.equal(a.past.length, b.past.length);
});

test('EDIT via mutator is undoable; new edit after Undo clears Redo', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  s = historyReducer(s, {
    type: 'EDIT',
    mutator: (d) => {
      d.colWidthsPx['1'] = 200;
      return d;
    },
  });
  assert.equal(s.present.grid.colWidthsPx['1'], 200);
  s = historyReducer(s, { type: 'UNDO' });
  assert.equal(s.present.grid.colWidthsPx['1'], undefined);
  assert.ok(canRedo(s));
  s = historyReducer(s, { type: 'SET_CELL', key: '3:3', value: 'n' });
  assert.ok(!canRedo(s));
});

test('history is capped at HISTORY_LIMIT', () => {
  let s = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  for (let i = 0; i < HISTORY_LIMIT + 25; i++) {
    s = historyReducer(s, { type: 'SET_CELL', key: '1:2', value: `v${i}` });
  }
  assert.equal(s.past.length, HISTORY_LIMIT);
});

test('UNDO/REDO on empty stacks are no-ops', () => {
  const s0 = apply(EMPTY_HISTORY, { type: 'LOAD', result: R1 });
  const afterRedo = historyReducer(s0, { type: 'REDO' });
  assert.equal(afterRedo, s0);
  const emptyUndo = historyReducer(EMPTY_HISTORY, { type: 'UNDO' });
  assert.equal(emptyUndo, EMPTY_HISTORY);
});

