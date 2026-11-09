'use client';

import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { message } from 'antd';
import { ExcelCellData, ExcelGridData, ExcelNormalizedResult, ExcelSampleItem } from '@/types/api';
import { HubApiException, hubApi } from '@/services/api-client';
import { SelectionCoords } from './ExcelSpreadsheetGrid';
import { EMPTY_HISTORY, canRedo, canUndo, historyReducer } from './excel-history';

export type OrientationMode = 'AUTO' | 'PORTRAIT' | 'LANDSCAPE';
export type ViewMode = 'SPREADSHEET' | 'A4_PREVIEW';

const DEFAULT_SAMPLE = 'BANG_PHAN_CONG';

function rangeBounds(sel: SelectionCoords) {
  return {
    minR: Math.min(sel.r1, sel.r2),
    maxR: Math.max(sel.r1, sel.r2),
    minC: Math.min(sel.c1, sel.c2),
    maxC: Math.max(sel.c1, sel.c2),
  };
}

function withCellValue(grid: ExcelGridData, key: string, value: string): ExcelGridData {
  const next = JSON.parse(JSON.stringify(grid)) as ExcelGridData;
  next.cells[key] = { ...(next.cells[key] ?? { value: '' }), value };
  return next;
}

/** All state + handlers of the Excel print-normalization workspace. */
export function useExcelWorkspace() {
  const [history, dispatch] = useReducer(historyReducer, EMPTY_HISTORY);
  const [samples, setSamples] = useState<ExcelSampleItem[]>([]);
  const [selectedSampleCode, setSelectedSampleCode] = useState<string>(DEFAULT_SAMPLE);
  const [orientationMode, setOrientationMode] = useState<OrientationMode>('AUTO');
  const [viewMode, setViewMode] = useState<ViewMode>('SPREADSHEET');
  const [showPrintGuides, setShowPrintGuides] = useState<boolean>(true);
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(false);
  const [previewScale, setPreviewScale] = useState<number>(95);
  const [selection, setSelection] = useState<SelectionCoords>({ r1: 4, c1: 1, r2: 4, c2: 1 });
  const [editingCell, setEditingCell] = useState<{ r: number; c: number } | null>(null);
  const [editDraft, setEditDraft] = useState<string>('');
  const [formulaBarText, setFormulaBarText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [apiError, setApiError] = useState<HubApiException | null>(null);

  /**
   * Source of truth for the in-progress cell edit. onBlur/onKeyDown handlers run with stale
   * closures (the textarea unmounts before React re-renders), so reading React state there
   * made Escape commit the cancelled text and Enter commit twice.
   */
  const editRef = useRef<{ r: number; c: number; draft: string } | null>(null);

  const grid = history.present?.grid ?? null;
  const result: ExcelNormalizedResult | null = history.present?.result ?? null;
  const isStale = Boolean(history.present?.dirty);

  const withLoading = useCallback(async <T,>(task: () => Promise<T>): Promise<T | undefined> => {
    setLoading(true);
    setApiError(null);
    try {
      return await task();
    } catch (err) {
      if (err instanceof HubApiException) setApiError(err);
      return undefined;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadResult = useCallback((data: ExcelNormalizedResult) => {
    editRef.current = null;
    setEditingCell(null);
    dispatch({ type: 'LOAD', result: data });
  }, []);

  const loadSample = useCallback(
    async (code: string, orient: OrientationMode) => {
      const res = await withLoading(() => hubApi.generateExcelSample(code, orient));
      if (res?.data) loadResult(res.data);
    },
    [withLoading, loadResult]
  );

  useEffect(() => {
    (async () => {
      try {
        const sRes = await hubApi.getExcelSamples();
        if (sRes.data) setSamples(sRes.data);
      } catch {
        /* sample list is optional */
      }
      await loadSample(DEFAULT_SAMPLE, 'AUTO');
    })();
  }, [loadSample]);

  // Keep the formula bar in sync with the active cell.
  useEffect(() => {
    if (!grid) return;
    setFormulaBarText(grid.cells[`${selection.r1}:${selection.c1}`]?.value ?? '');
  }, [selection.r1, selection.c1, grid]);

  const mutateGrid = useCallback((mutator: (draft: ExcelGridData) => ExcelGridData) => {
    dispatch({ type: 'EDIT', mutator });
  }, []);

  /* ---------- cell editing ---------- */
  const startEdit = (r: number, c: number, initialVal?: string) => {
    if (!grid) return;
    const draft = initialVal !== undefined ? initialVal : grid.cells[`${r}:${c}`]?.value ?? '';
    editRef.current = { r, c, draft };
    setEditingCell({ r, c });
    setEditDraft(draft);
    setFormulaBarText(draft);
  };

  const changeEditDraft = (val: string) => {
    if (editRef.current) editRef.current.draft = val;
    setEditDraft(val);
    setFormulaBarText(val);
  };

  const commitEdit = () => {
    const cur = editRef.current;
    if (!cur) return; // already committed or cancelled
    editRef.current = null;
    dispatch({ type: 'SET_CELL', key: `${cur.r}:${cur.c}`, value: cur.draft });
    setEditingCell(null);
  };

  const cancelEdit = () => {
    editRef.current = null;
    setEditingCell(null);
    if (grid) setFormulaBarText(grid.cells[`${selection.r1}:${selection.c1}`]?.value ?? '');
  };

  const commitFormulaBar = () => {
    if (!grid) return;
    dispatch({
      type: 'SET_CELL',
      key: `${selection.r1}:${selection.c1}`,
      value: formulaBarText,
    });
  };

  const updateSelectedStyle = (patch: Partial<ExcelCellData>) => {
    const { minR, maxR, minC, maxC } = rangeBounds(selection);
    mutateGrid((draft) => {
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const key = `${r}:${c}`;
          draft.cells[key] = { ...(draft.cells[key] ?? { value: '' }), ...patch };
        }
      }
      return draft;
    });
  };

  const clearSelection = () => {
    const { minR, maxR, minC, maxC } = rangeBounds(selection);
    mutateGrid((draft) => {
      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const key = `${r}:${c}`;
          if (draft.cells[key]) draft.cells[key] = { ...draft.cells[key], value: '', display: '' };
        }
      }
      return draft;
    });
    setFormulaBarText('');
  };

  const pasteGridData = (startR: number, startC: number, rawText: string) => {
    const rows = rawText.replace(/\r\n/g, '\n').split('\n').filter((r) => r.length > 0);
    if (rows.length === 0) return;
    mutateGrid((draft) => {
      rows.forEach((rowStr, rOffset) => {
        rowStr.split('\t').forEach((val, cOffset) => {
          const tr = startR + rOffset;
          const tc = startC + cOffset;
          if (tr > draft.rowCount) draft.rowCount = tr + 2;
          if (tc > draft.colCount) draft.colCount = tc + 2;
          const key = `${tr}:${tc}`;
          draft.cells[key] = { ...(draft.cells[key] ?? { value: '', border: true }), value: val.trim() };
        });
      });
      return draft;
    });
    message.success(`Đã dán ${rows.length} dòng dữ liệu vào bảng tính!`);
  };

  /* ---------- normalize / undo / redo ---------- */
  const normalize = async (targetOrient: OrientationMode = orientationMode) => {
    if (!grid || !result) return;

    // Flush an in-progress cell/formula-bar edit so it is part of what gets normalized
    // and is recorded as its own undoable step.
    let preGrid = grid;
    const pending = editRef.current;
    if (pending) {
      const key = `${pending.r}:${pending.c}`;
      preGrid = withCellValue(grid, key, pending.draft);
      editRef.current = null;
      setEditingCell(null);
      dispatch({ type: 'SET_CELL', key, value: pending.draft });
    } else {
      const key = `${selection.r1}:${selection.c1}`;
      if ((grid.cells[key]?.value ?? '') !== formulaBarText) {
        preGrid = withCellValue(grid, key, formulaBarText);
        dispatch({ type: 'SET_CELL', key, value: formulaBarText });
      }
    }

    const res = await withLoading(() =>
      hubApi.normalizeExcelGrid(preGrid, targetOrient, result.active_sheet, result.filename, result.original_xlsx_base64)
    );
    if (res?.data) {
      dispatch({ type: 'NORMALIZED', preGrid, result: res.data });
      message.success(
        `Đã chuẩn hóa trang in A4 (${res.data.active_sheet_meta.orientation_label}, Zoom ${res.data.active_sheet_meta.zoom_percent}%) — bấm Hoàn tác (Ctrl+Z) để quay lại bản trước.`
      );
    }
  };

  const stepHistory = useCallback(
    (direction: 'UNDO' | 'REDO') => {
      const target = direction === 'UNDO' ? history.past[history.past.length - 1] : history.future[0];
      if (!target) {
        message.info(direction === 'UNDO' ? 'Không còn thao tác nào để hoàn tác.' : 'Không còn thao tác nào để làm lại.');
        return;
      }
      editRef.current = null;
      setEditingCell(null);
      dispatch({ type: direction });
      // A stale snapshot has no matching A4 preview, so show the editable sheet instead.
      if (target.dirty) setViewMode('SPREADSHEET');
      message.info(direction === 'UNDO' ? 'Đã hoàn tác về bước trước.' : 'Đã làm lại thao tác.');
    },
    [history.past, history.future]
  );

  const undo = useCallback(() => stepHistory('UNDO'), [stepHistory]);
  const redo = useCallback(() => stepHistory('REDO'), [stepHistory]);

  // Ctrl+Z / Ctrl+Y / Ctrl+Shift+Z (ignored while typing in a text field).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (!(e.ctrlKey || e.metaKey)) return;
      const k = e.key.toLowerCase();
      if (k === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (k === 'y') {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [undo, redo]);

  /* ---------- file / sheet / view actions ---------- */
  const uploadXlsx = async (file: File) => {
    const res = await withLoading(() => hubApi.normalizeExcelFile(file, orientationMode));
    if (res?.data) {
      loadResult(res.data);
      message.success(`Đã tải và chuẩn hóa trang in A4 cho "${file.name}"`);
    }
    return false;
  };

  const switchSheet = async (sheetName: string) => {
    if (!result) return;
    const res = await withLoading(() =>
      hubApi.normalizeExcelBase64(result.original_xlsx_base64, orientationMode, sheetName, result.filename)
    );
    if (res?.data) loadResult(res.data);
  };

  const downloadXlsx = async () => {
    if (!result || !grid) return;
    let target = result;
    if (isStale) {
      // Download what the user sees, normalized — without silently changing the sheet/history.
      const res = await withLoading(() =>
        hubApi.normalizeExcelGrid(grid, orientationMode, result.active_sheet, result.filename, result.original_xlsx_base64)
      );
      if (res?.data) target = res.data;
    }
    const bin = window.atob(target.xlsx_base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    const url = URL.createObjectURL(
      new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = target.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Đã tải tệp ${a.download}`);
  };

  const copyClipboard = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([result.mso_clipboard_html], { type: 'text/html' }),
          'text/plain': new Blob([result.active_sheet], { type: 'text/plain' }),
        }),
      ]);
      message.success('Đã sao chép bảng chuẩn A4 vào bộ nhớ tạm!');
    } catch {
      message.error('Trình duyệt không hỗ trợ copy HTML trực tiếp, vui lòng tải tệp .XLSX.');
    }
  };

  const changeView = async (next: ViewMode) => {
    setViewMode(next);
    if (next === 'A4_PREVIEW' && isStale) await normalize(orientationMode);
  };

  const changeOrientation = (mode: OrientationMode) => {
    setOrientationMode(mode);
    void normalize(mode);
  };

  const changeSample = (code: string) => {
    setSelectedSampleCode(code);
    void loadSample(code, orientationMode);
  };

  return {
    // state
    grid, result, isStale, samples, selectedSampleCode, orientationMode, viewMode, showPrintGuides,
    inspectorOpen, previewScale, selection, editingCell, editDraft, formulaBarText, loading, apiError,
    canUndo: canUndo(history), canRedo: canRedo(history),
    // setters
    setSelection, setFormulaBarText, setShowPrintGuides, setInspectorOpen, setPreviewScale, setViewMode, setApiError,
    // actions
    mutateGrid, startEdit, changeEditDraft, commitEdit, cancelEdit, commitFormulaBar, updateSelectedStyle,
    clearSelection, pasteGridData, normalize, undo, redo, uploadXlsx, switchSheet, downloadXlsx,
    copyClipboard, changeView, changeOrientation, changeSample,
  };
}

