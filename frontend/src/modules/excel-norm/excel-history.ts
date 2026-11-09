/**
 * Pure undo/redo history for the Excel print-normalization grid.
 *
 * Why a reducer (instead of several useState calls):
 *  - React StrictMode double-invokes state updaters. Any side effect (e.g. pushing to an
 *    undo stack) inside `setGridState(prev => ...)` therefore ran twice and produced
 *    duplicate history entries, so the first Undo appeared to "do nothing".
 *  - A reducer is pure, so double invocation is harmless and every action is idempotent.
 *
 * Mirrors the VBA `HT_KhoiPhuc` contract: Undo restores the sheet exactly as it was before
 * the last normalization (or edit), including the normalization result it belonged to.
 */
import type { ExcelGridData, ExcelNormalizedResult } from '@/types/api';

export const HISTORY_LIMIT = 50;

export interface GridSnapshot {
  grid: ExcelGridData;
  /** Normalization result this grid belongs to (drives A4 preview, inspector, download). */
  result: ExcelNormalizedResult | null;
  /** True when `grid` differs from what `result` was generated from (needs re-normalize). */
  dirty: boolean;
}

export interface HistoryState {
  present: GridSnapshot | null;
  past: GridSnapshot[];
  future: GridSnapshot[];
}

export type HistoryAction =
  | { type: 'LOAD'; result: ExcelNormalizedResult }
  | { type: 'EDIT'; mutator: (draft: ExcelGridData) => ExcelGridData }
  | { type: 'SET_CELL'; key: string; value: string }
  | { type: 'NORMALIZED'; preGrid: ExcelGridData; result: ExcelNormalizedResult }
  | { type: 'UNDO' }
  | { type: 'REDO' };

export const EMPTY_HISTORY: HistoryState = { present: null, past: [], future: [] };

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function sameGrid(a: ExcelGridData, b: ExcelGridData): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function pushCapped(list: GridSnapshot[], item: GridSnapshot): GridSnapshot[] {
  const next = [...list, item];
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next;
}

export function canUndo(state: HistoryState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: HistoryState): boolean {
  return state.future.length > 0;
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'LOAD': {
      const { result } = action;
      return {
        present: { grid: clone(result.grid_data), result, dirty: false },
        // First Undo after loading returns the raw, un-normalized sheet (like HT_KhoiPhuc).
        past: [{ grid: clone(result.original_grid_data), result, dirty: true }],
        future: [],
      };
    }

    case 'EDIT': {
      if (!state.present) return state;
      const next = action.mutator(clone(state.present.grid));
      if (sameGrid(next, state.present.grid)) return state;
      return {
        present: { grid: next, result: state.present.result, dirty: true },
        past: pushCapped(state.past, state.present),
        future: [],
      };
    }

    case 'SET_CELL': {
      if (!state.present) return state;
      const current = state.present.grid.cells[action.key]?.value ?? '';
      // Idempotent: blur + Enter both commit the same value; only the first one records.
      if (current === action.value) return state;
      const grid = clone(state.present.grid);
      grid.cells[action.key] = { ...(grid.cells[action.key] ?? { value: '' }), value: action.value };
      return {
        present: { grid, result: state.present.result, dirty: true },
        past: pushCapped(state.past, state.present),
        future: [],
      };
    }

    case 'NORMALIZED': {
      if (!state.present) return state;
      const { preGrid, result } = action;
      const normalized: GridSnapshot = { grid: clone(result.grid_data), result, dirty: false };
      const unchanged =
        !state.present.dirty &&
        state.present.result?.orientation_mode === result.orientation_mode &&
        sameGrid(preGrid, state.present.grid);
      // Normalizing an already-normalized sheet must not add a no-op step, otherwise Undo
      // would appear to do nothing.
      if (unchanged) {
        return { present: normalized, past: state.past, future: [] };
      }
      return {
        present: normalized,
        past: pushCapped(state.past, {
          grid: clone(preGrid),
          result: state.present.result,
          dirty: true,
        }),
        future: [],
      };
    }

    case 'UNDO': {
      if (!state.present || state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        present: previous,
        past: state.past.slice(0, -1),
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (!state.present || state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return {
        present: next,
        past: pushCapped(state.past, state.present),
        future: rest,
      };
    }

    default:
      return state;
  }
}

