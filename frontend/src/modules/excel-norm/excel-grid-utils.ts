/**
 * Pure Spreadsheet Grid Helpers, HyperFormula 100% Excel Formula Engine & Range Mutators
 * for 3DoHub Excel Print Normalizer Module
 */

import { HyperFormula } from 'hyperformula';
import { ExcelCellData, ExcelGridData, ExcelMergeRange } from '@/types/api';

export function colIndexToLetter(col: number): string {
  let temp = col;
  let letter = '';
  while (temp > 0) {
    const mod = (temp - 1) % 26;
    letter = String.fromCharCode(65 + mod) + letter;
    temp = Math.floor((temp - mod) / 26);
  }
  return letter || 'A';
}

export function letterToColIndex(letters: string): number {
  let col = 0;
  const up = letters.toUpperCase().trim();
  for (let i = 0; i < up.length; i++) {
    col = col * 26 + (up.charCodeAt(i) - 64);
  }
  return col;
}

export function cellCoordLabel(r: number, c: number): string {
  return `${colIndexToLetter(c)}${r}`;
}

export function rangeCoordLabel(r1: number, c1: number, r2: number, c2: number): string {
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);
  if (minR === maxR && minC === maxC) {
    return cellCoordLabel(minR, minC);
  }
  return `${cellCoordLabel(minR, minC)}:${cellCoordLabel(maxR, maxC)}`;
}

export interface MergeCellInfo {
  isMaster: boolean;
  rSpan: number;
  cSpan: number;
  masterR: number;
  masterC: number;
  mergeIndex: number;
}

export function buildMergeLookup(merges: ExcelMergeRange[]): Record<string, MergeCellInfo> {
  const map: Record<string, MergeCellInfo> = {};
  merges.forEach((m, idx) => {
    const rSpan = m.r2 - m.r1 + 1;
    const cSpan = m.c2 - m.c1 + 1;
    for (let r = m.r1; r <= m.r2; r++) {
      for (let c = m.c1; c <= m.c2; c++) {
        map[`${r}:${c}`] = {
          isMaster: r === m.r1 && c === m.c1,
          rSpan,
          cSpan,
          masterR: m.r1,
          masterC: m.c1,
          mergeIndex: idx,
        };
      }
    }
  });
  return map;
}

/**
 * Normalize Excel formula syntax so both comma (,) and semicolon (;) argument separators work.
 */
function normalizeFormulaSyntax(formula: string): string {
  let inQuotes = false;
  let out = '';
  for (let i = 0; i < formula.length; i++) {
    const ch = formula[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
      out += ch;
    } else if (ch === ';' && !inQuotes) {
      out += ',';
    } else {
      out += ch;
    }
  }
  return out;
}

function formatEvaluatedValue(val: unknown): string {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') {
    if (!Number.isFinite(val)) return '#NUM!';
    const rounded = Math.round(val * 100) / 100;
    if (Math.abs(rounded) >= 1000) {
      return Number.isInteger(rounded)
        ? rounded.toLocaleString('en-US')
        : rounded.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    return String(rounded);
  }
  if (typeof val === 'boolean') {
    return val ? 'TRUE' : 'FALSE';
  }
  if (typeof val === 'object') {
    const errObj = val as { value?: string; type?: string };
    if (errObj.value && typeof errObj.value === 'string') {
      return errObj.value;
    }
    if (errObj.type) {
      return `#${errObj.type}!`;
    }
  }
  return String(val);
}

/**
 * Evaluate the entire 2D spreadsheet using HyperFormula (400+ native Excel functions:
 * SUM, AVERAGE, COUNT, COUNTA, MIN, MAX, IF, IFS, IFERROR, AND, OR, NOT, VLOOKUP, HLOOKUP,
 * INDEX, MATCH, SUMIF, SUMIFS, COUNTIF, COUNTIFS, ROUND, ROUNDUP, ROUNDDOWN, ABS, INT, MOD,
 * PRODUCT, SUMPRODUCT, SUBTOTAL, LEFT, RIGHT, MID, LEN, TRIM, UPPER, LOWER, CONCATENATE, etc.)
 */
export function computeFormulaDisplayMap(grid: ExcelGridData): Record<string, string> {
  const out: Record<string, string> = {};
  const maxR = Math.max(1, grid.rowCount || 20);
  const maxC = Math.max(1, grid.colCount || 10);
  const cells = grid.cells || {};

  const sheet2D: (string | number | boolean | null)[][] = [];
  let hasAnyFormula = false;

  for (let r = 1; r <= maxR; r++) {
    const rowArr: (string | number | boolean | null)[] = [];
    for (let c = 1; c <= maxC; c++) {
      const cell = cells[`${r}:${c}`];
      const raw = cell?.value;
      if (raw === undefined || raw === null || String(raw).trim() === '') {
        rowArr.push(null);
        continue;
      }
      const str = String(raw).trim();
      if (str.startsWith('=')) {
        hasAnyFormula = true;
        rowArr.push(normalizeFormulaSyntax(str));
      } else {
        const cleanNum = str.replace(/,/g, '');
        if (
          /^-?\d+(\.\d+)?$/.test(cleanNum) &&
          !(cleanNum.length > 1 && cleanNum.startsWith('0') && !cleanNum.startsWith('0.'))
        ) {
          const n = Number(cleanNum);
          rowArr.push(Number.isFinite(n) ? n : str);
        } else {
          rowArr.push(str);
        }
      }
    }
    sheet2D.push(rowArr);
  }

  if (!hasAnyFormula) {
    Object.entries(cells).forEach(([key, cell]) => {
      out[key] = evaluateCellDisplay(cell?.value, cells, cell?.display);
    });
    return out;
  }

  try {
    const hf = HyperFormula.buildFromArray(sheet2D, {
      licenseKey: 'gpl-v3',
      useColumnIndex: false,
    });
    for (let r = 1; r <= maxR; r++) {
      for (let c = 1; c <= maxC; c++) {
        const key = `${r}:${c}`;
        const cell = cells[key];
        if (!cell || cell.value === undefined || cell.value === '') continue;
        const val = hf.getCellValue({ sheet: 0, row: r - 1, col: c - 1 });
        const formatted = formatEvaluatedValue(val);
        // If HyperFormula returns an error for an external sheet reference, fall back to backend cached display
        if (
          formatted.startsWith('#') &&
          cell.display &&
          !cell.display.startsWith('=') &&
          !cell.display.startsWith('#')
        ) {
          out[key] = cell.display;
        } else {
          out[key] = formatted;
        }
      }
    }
    hf.destroy();
  } catch {
    Object.entries(cells).forEach(([key, cell]) => {
      out[key] = evaluateCellDisplay(cell?.value, cells, cell?.display);
    });
  }

  return out;
}

export function evaluateCellDisplay(
  rawVal: string | undefined,
  cells: Record<string, ExcelCellData>,
  cachedDisplay?: string
): string {
  if (rawVal === undefined || rawVal === null || rawVal === '') return '';
  const str = String(rawVal).trim();
  if (!str.startsWith('=')) {
    const cleanNum = str.replace(/,/g, '');
    if (
      /^-?\d+(\.\d+)?$/.test(cleanNum) &&
      !(cleanNum.length > 1 && cleanNum.startsWith('0') && !cleanNum.startsWith('0.'))
    ) {
      const n = Number(cleanNum);
      if (Number.isFinite(n) && Math.abs(n) >= 1000) {
        return n.toLocaleString('en-US');
      }
    }
    return str;
  }
  if (cachedDisplay && !cachedDisplay.startsWith('=')) {
    return cachedDisplay;
  }
  return str;
}

export function cloneGridData(grid: ExcelGridData): ExcelGridData {
  return JSON.parse(JSON.stringify(grid)) as ExcelGridData;
}

export function toggleMergeOnGrid(
  grid: ExcelGridData,
  r1: number,
  c1: number,
  r2: number,
  c2: number
): ExcelGridData {
  const next = cloneGridData(grid);
  const minR = Math.min(r1, r2);
  const maxR = Math.max(r1, r2);
  const minC = Math.min(c1, c2);
  const maxC = Math.max(c1, c2);

  // Check if any existing merge overlaps this selection
  const overlapping = next.merges.filter(
    (m) => !(m.r2 < minR || m.r1 > maxR || m.c2 < minC || m.c1 > maxC)
  );
  if (overlapping.length > 0) {
    next.merges = next.merges.filter(
      (m) => m.r2 < minR || m.r1 > maxR || m.c2 < minC || m.c1 > maxC
    );
    return next;
  }

  if (minR === maxR && minC === maxC) return next;

  next.merges.push({ r1: minR, c1: minC, r2: maxR, c2: maxC });
  const masterKey = `${minR}:${minC}`;
  const existing = next.cells[masterKey] || { value: '' };
  next.cells[masterKey] = {
    ...existing,
    align: 'center',
    valign: 'center',
    wrapText: true,
  };
  return next;
}
