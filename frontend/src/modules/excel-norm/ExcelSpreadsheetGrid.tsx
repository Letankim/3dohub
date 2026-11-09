'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ExcelGridData } from '@/types/api';
import {
  buildMergeLookup,
  cellCoordLabel,
  colIndexToLetter,
  computeFormulaDisplayMap,
  evaluateCellDisplay,
} from './excel-grid-utils';

export interface SelectionCoords {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

interface ExcelSpreadsheetGridProps {
  grid: ExcelGridData;
  selection: SelectionCoords;
  editingCell: { r: number; c: number } | null;
  editDraft: string;
  showPrintGuides: boolean;
  onSelectRange: (sel: SelectionCoords) => void;
  onStartEdit: (r: number, c: number, initialVal?: string) => void;
  onChangeEditDraft: (val: string) => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onClearSelection: () => void;
  onPasteGridData: (startR: number, startC: number, rawText: string) => void;
  onResizeColumn: (col: number, widthPx: number) => void;
  onResizeRow: (row: number, heightPx: number) => void;
}

export const ExcelSpreadsheetGrid: React.FC<ExcelSpreadsheetGridProps> = ({
  grid,
  selection,
  editingCell,
  editDraft,
  showPrintGuides,
  onSelectRange,
  onStartEdit,
  onChangeEditDraft,
  onCommitEdit,
  onCancelEdit,
  onClearSelection,
  onPasteGridData,
  onResizeColumn,
  onResizeRow,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inlineInputRef = useRef<HTMLTextAreaElement | null>(null);
  const [isDraggingSelect, setIsDraggingSelect] = useState(false);

  const mergeLookup = useMemo(() => buildMergeLookup(grid.merges || []), [grid.merges]);
  const formulaDisplayMap = useMemo(() => computeFormulaDisplayMap(grid), [grid]);

  const minSelR = Math.min(selection.r1, selection.r2);
  const maxSelR = Math.max(selection.r1, selection.r2);
  const minSelC = Math.min(selection.c1, selection.c2);
  const maxSelC = Math.max(selection.c1, selection.c2);

  useEffect(() => {
    if (editingCell && inlineInputRef.current) {
      inlineInputRef.current.focus({ preventScroll: true });
      const len = inlineInputRef.current.value.length;
      inlineInputRef.current.setSelectionRange(len, len);
    }
  }, [editingCell]);

  useEffect(() => {
    const handleMouseUp = () => setIsDraggingSelect(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const resolveMasterCoords = useCallback(
    (r: number, c: number) => {
      const m = mergeLookup[`${r}:${c}`];
      if (m) return { r: m.masterR, c: m.masterC, rEnd: m.masterR + m.rSpan - 1, cEnd: m.masterC + m.cSpan - 1 };
      return { r, c, rEnd: r, cEnd: c };
    },
    [mergeLookup]
  );

  const handleCellMouseDown = (r: number, c: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (e.detail > 1) {
      // Prevent native browser double-click text selection that causes scroll snapping/jumping
      e.preventDefault();
    }
    const master = resolveMasterCoords(r, c);
    if (editingCell && (editingCell.r !== master.r || editingCell.c !== master.c)) {
      const trimmedDraft = editDraft.trim();
      if (
        trimmedDraft.startsWith('=') &&
        /[=+\-*/^&,;(<>:]$/.test(trimmedDraft)
      ) {
        e.preventDefault();
        const refLabel = cellCoordLabel(master.r, master.c);
        onChangeEditDraft(`${editDraft}${refLabel}`);
        inlineInputRef.current?.focus({ preventScroll: true });
        return;
      }
      onCommitEdit();
    }
    if (e.shiftKey) {
      onSelectRange({
        r1: selection.r1,
        c1: selection.c1,
        r2: master.rEnd,
        c2: master.cEnd,
      });
    } else {
      setIsDraggingSelect(true);
      onSelectRange({
        r1: master.r,
        c1: master.c,
        r2: master.rEnd,
        c2: master.cEnd,
      });
    }
    containerRef.current?.focus({ preventScroll: true });
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    if (!isDraggingSelect) return;
    const master = resolveMasterCoords(r, c);
    onSelectRange({
      r1: selection.r1,
      c1: selection.c1,
      r2: master.rEnd,
      c2: master.cEnd,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (editingCell) return;

    const { r1, c1 } = selection;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const m = mergeLookup[`${r1}:${c1}`];
      const step = m ? m.rSpan : 1;
      const nextR = Math.min(grid.rowCount, r1 + step);
      const target = resolveMasterCoords(nextR, c1);
      onSelectRange({ r1: target.r, c1: target.c, r2: target.rEnd, c2: target.cEnd });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const nextR = Math.max(1, r1 - 1);
      const target = resolveMasterCoords(nextR, c1);
      onSelectRange({ r1: target.r, c1: target.c, r2: target.rEnd, c2: target.cEnd });
    } else if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
      e.preventDefault();
      const m = mergeLookup[`${r1}:${c1}`];
      const step = m ? m.cSpan : 1;
      const nextC = Math.min(grid.colCount, c1 + step);
      const target = resolveMasterCoords(r1, nextC);
      onSelectRange({ r1: target.r, c1: target.c, r2: target.rEnd, c2: target.cEnd });
    } else if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
      e.preventDefault();
      const nextC = Math.max(1, c1 - 1);
      const target = resolveMasterCoords(r1, nextC);
      onSelectRange({ r1: target.r, c1: target.c, r2: target.rEnd, c2: target.cEnd });
    } else if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      onStartEdit(r1, c1);
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      e.preventDefault();
      onClearSelection();
    } else if (
      e.key.length === 1 &&
      !e.ctrlKey &&
      !e.metaKey &&
      !e.altKey
    ) {
      e.preventDefault();
      onStartEdit(r1, c1, e.key);
    }
  };

  const handleColResizeMouseDown = (col: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const startW = grid.colWidthsPx[String(col)] || 95;
    const onMove = (mv: MouseEvent) => {
      const nextW = Math.max(42, Math.min(520, startW + (mv.clientX - startX)));
      onResizeColumn(col, nextW);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleRowResizeMouseDown = (row: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const startY = e.clientY;
    const startH = grid.rowHeightsPx[String(row)] || 28;
    const onMove = (mv: MouseEvent) => {
      const nextH = Math.max(22, Math.min(420, startH + (mv.clientY - startY)));
      onResizeRow(row, nextH);
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const pg = grid.printGuides;
  const rowsArr = Array.from({ length: grid.rowCount }, (_, i) => i + 1);
  const colsArr = Array.from({ length: grid.colCount }, (_, i) => i + 1);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPaste={(e) => {
        if (editingCell) return;
        const txt = e.clipboardData.getData('text/plain');
        if (txt) {
          e.preventDefault();
          onPasteGridData(selection.r1, selection.c1, txt);
        }
      }}
      style={{
        width: '100%',
        height: 610,
        overflow: 'auto',
        background: '#F8FAFC',
        border: '1px solid #CBD5E1',
        outline: 'none',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <table
        style={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          tableLayout: 'fixed',
          background: '#FFFFFF',
        }}
      >
        <thead>
          <tr>
            {/* Top-left Select All Corner */}
            <th
              onClick={() =>
                onSelectRange({ r1: 1, c1: 1, r2: grid.rowCount, c2: grid.colCount })
              }
              style={{
                width: 44,
                minWidth: 44,
                height: 26,
                position: 'sticky',
                top: 0,
                left: 0,
                zIndex: 15,
                background: '#E2E8F0',
                borderRight: '1px solid #94A3B8',
                borderBottom: '1px solid #94A3B8',
                cursor: 'pointer',
              }}
              title="Chọn toàn bộ trang tính"
            />
            {colsArr.map((c) => {
              const colW = grid.colWidthsPx[String(c)] || 95;
              const isColSelected = c >= minSelC && c <= maxSelC;
              return (
                <th
                  key={c}
                  onClick={() =>
                    onSelectRange({ r1: 1, c1: c, r2: grid.rowCount, c2: c })
                  }
                  style={{
                    width: colW,
                    minWidth: colW,
                    maxWidth: colW,
                    height: 26,
                    position: 'sticky',
                    top: 0,
                    zIndex: 10,
                    background: isColSelected ? '#DBEAFE' : '#F1F5F9',
                    color: isColSelected ? '#1D4ED8' : '#334155',
                    fontWeight: isColSelected ? 700 : 600,
                    fontSize: 12,
                    borderRight: '1px solid #CBD5E1',
                    borderBottom: isColSelected ? '2px solid #1D4ED8' : '1px solid #94A3B8',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {colIndexToLetter(c)}
                  <div
                    onMouseDown={(e) => handleColResizeMouseDown(c, e)}
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 0,
                      bottom: 0,
                      width: 6,
                      cursor: 'col-resize',
                    }}
                    title="Kéo để chỉnh độ rộng cột"
                  />
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rowsArr.map((r) => {
            const rowH = grid.rowHeightsPx[String(r)] || 28;
            const isRowSelected = r >= minSelR && r <= maxSelR;
            const isHeaderRepeatRow =
              pg && pg.headerDetected && r >= pg.headerStartRow && r <= pg.headerEndRow;
            const isPageBreakAfter = pg && pg.pageBreakRows?.includes(r);

            return (
              <tr key={r} style={{ height: rowH }}>
                {/* Sticky Row Number Header */}
                <td
                  onClick={() =>
                    onSelectRange({ r1: r, c1: 1, r2: r, c2: grid.colCount })
                  }
                  style={{
                    width: 44,
                    minWidth: 44,
                    height: rowH,
                    position: 'sticky',
                    left: 0,
                    zIndex: 8,
                    background: isRowSelected
                      ? '#DBEAFE'
                      : isHeaderRepeatRow
                      ? '#DCFCE7'
                      : '#F1F5F9',
                    color: isRowSelected ? '#1D4ED8' : '#475569',
                    fontWeight: isRowSelected || isHeaderRepeatRow ? 700 : 500,
                    fontSize: 11.5,
                    textAlign: 'center',
                    borderRight: isRowSelected ? '2px solid #1D4ED8' : '1px solid #94A3B8',
                    borderBottom: '1px solid #CBD5E1',
                    cursor: 'pointer',
                  }}
                  title={
                    isHeaderRepeatRow
                      ? `Dòng ${r}: Tiêu đề bảng tự động lặp khi qua trang in`
                      : `Dòng ${r}`
                  }
                >
                  {r}
                  <div
                    onMouseDown={(e) => handleRowResizeMouseDown(r, e)}
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      bottom: 0,
                      height: 5,
                      cursor: 'row-resize',
                    }}
                    title="Kéo để chỉnh chiều cao dòng"
                  />
                </td>

                {/* Spreadsheet Cells */}
                {colsArr.map((c) => {
                  const mInfo = mergeLookup[`${r}:${c}`];
                  if (mInfo && !mInfo.isMaster) {
                    return null;
                  }

                  const rSpan = mInfo ? mInfo.rSpan : 1;
                  const cSpan = mInfo ? mInfo.cSpan : 1;
                  const endR = r + rSpan - 1;
                  const endC = c + cSpan - 1;

                  const cellKey = `${r}:${c}`;
                  const cellData = grid.cells[cellKey];
                  const isEditingThis =
                    editingCell && editingCell.r === r && editingCell.c === c;
                  const isActivePrimary = selection.r1 === r && selection.c1 === c;
                  const isInSelection =
                    r <= maxSelR &&
                    endR >= minSelR &&
                    c <= maxSelC &&
                    endC >= minSelC;

                  const dispText =
                    formulaDisplayMap[cellKey] !== undefined
                      ? formulaDisplayMap[cellKey]
                      : evaluateCellDisplay(cellData?.value, grid.cells, cellData?.display);
                  const fontName = cellData?.fontName || 'Times New Roman';
                  const fontSize = cellData?.fontSize || 11;
                  const hasGridBorder = Boolean(cellData?.border);

                  // PrintArea dashed blue guide borders
                  const isPrintTop =
                    showPrintGuides && pg && r === pg.firstRow && c >= pg.firstCol && c <= pg.lastCol;
                  const isPrintBot =
                    showPrintGuides &&
                    pg &&
                    (endR === pg.lastRow || isPageBreakAfter) &&
                    c >= pg.firstCol &&
                    c <= pg.lastCol;
                  const isPrintLeft =
                    showPrintGuides && pg && c === pg.firstCol && r >= pg.firstRow && r <= pg.lastRow;
                  const isPrintRight =
                    showPrintGuides && pg && endC === pg.lastCol && r >= pg.firstRow && r <= pg.lastRow;

                  return (
                    <td
                      key={c}
                      rowSpan={rSpan > 1 ? rSpan : undefined}
                      colSpan={cSpan > 1 ? cSpan : undefined}
                      onMouseDown={(e) => handleCellMouseDown(r, c, e)}
                      onMouseEnter={() => handleCellMouseEnter(r, c)}
                      onDoubleClick={() => onStartEdit(r, c)}
                      style={{
                        position: 'relative',
                        padding: '3px 6px',
                        fontFamily: `'${fontName}', 'Times New Roman', serif`,
                        fontSize: `${fontSize}pt`,
                        fontWeight: cellData?.bold ? 700 : 400,
                        fontStyle: cellData?.italic ? 'italic' : 'normal',
                        textDecoration: cellData?.underline ? 'underline' : 'none',
                        textAlign: cellData?.align || 'left',
                        verticalAlign: cellData?.valign || 'middle',
                        whiteSpace: cellData?.wrapText === false ? 'nowrap' : 'pre-wrap',
                        wordBreak: 'break-word',
                        lineHeight: 1.3,
                        color: cellData?.color || '#0F172A',
                        background:
                          isInSelection && !isActivePrimary
                            ? '#EFF6FF'
                            : cellData?.bg || '#FFFFFF',
                        borderTop: isPrintTop
                          ? '2px dashed #2563EB'
                          : hasGridBorder
                          ? '1px solid #334155'
                          : '1px solid #E2E8F0',
                        borderBottom: isPrintBot
                          ? '2px dashed #2563EB'
                          : hasGridBorder
                          ? '1px solid #334155'
                          : '1px solid #E2E8F0',
                        borderLeft: isPrintLeft
                          ? '2px dashed #2563EB'
                          : hasGridBorder
                          ? '1px solid #334155'
                          : '1px solid #E2E8F0',
                        borderRight: isPrintRight
                          ? '2px dashed #2563EB'
                          : hasGridBorder
                          ? '1px solid #334155'
                          : '1px solid #E2E8F0',
                        boxShadow: isActivePrimary
                          ? 'inset 0 0 0 2px #16A34A'
                          : isInSelection
                          ? 'inset 0 0 0 1px #3B82F6'
                          : 'none',
                        cursor: 'cell',
                      }}
                    >
                      {/* Cell display content */}
                      <span style={{ visibility: isEditingThis ? 'hidden' : 'visible' }}>
                        {dispText !== '' && dispText !== undefined && dispText !== null ? dispText : '\u00A0'}
                      </span>

                      {/* Floating Absolute Cell Editor: Never expands row height or jumps scroll */}
                      {isEditingThis && (
                        <textarea
                          ref={inlineInputRef}
                          value={editDraft}
                          onChange={(e) => onChangeEditDraft(e.target.value)}
                          onBlur={onCommitEdit}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.altKey && !e.shiftKey) {
                              e.preventDefault();
                              onCommitEdit();
                            } else if (e.key === 'Escape') {
                              e.preventDefault();
                              onCancelEdit();
                            }
                          }}
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 20,
                            border: '2px solid #16A34A',
                            padding: '3px 6px',
                            margin: 0,
                            resize: 'none',
                            outline: 'none',
                            fontFamily: `'${fontName}', 'Times New Roman', serif`,
                            fontSize: `${fontSize}pt`,
                            fontWeight: cellData?.bold ? 700 : 400,
                            background: '#FFFFFF',
                            boxSizing: 'border-box',
                          }}
                        />
                      )}

                      {/* Excel Fill Handle Corner on Primary Selected Cell */}
                      {isActivePrimary && !isEditingThis && (
                        <div
                          style={{
                            position: 'absolute',
                            right: -3,
                            bottom: -3,
                            width: 6,
                            height: 6,
                            background: '#16A34A',
                            border: '1px solid #FFFFFF',
                            zIndex: 5,
                            pointerEvents: 'none',
                          }}
                        />
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

