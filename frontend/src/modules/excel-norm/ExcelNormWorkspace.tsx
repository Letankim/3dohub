'use client';

import React from 'react';
import {
  Badge,
  Button,
  Segmented,
  Select,
  Slider,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import {
  CopyOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileExcelOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  RedoOutlined,
  TableOutlined,
  ThunderboltOutlined,
  UndoOutlined,
  UploadOutlined,
  ZoomInOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { ApiErrorAlert } from '@/components/common/ApiErrorAlert';
import { ExcelFormattingBar } from './ExcelFormattingBar';
import { ExcelSpreadsheetGrid } from './ExcelSpreadsheetGrid';
import { ExcelInspectorModal } from './ExcelInspectorPanel';
import { rangeCoordLabel, toggleMergeOnGrid } from './excel-grid-utils';
import { OrientationMode, ViewMode, useExcelWorkspace } from './useExcelWorkspace';

const { Text } = Typography;

export const ExcelNormWorkspace: React.FC = () => {
  const ws = useExcelWorkspace();

  const activeMeta = ws.result?.active_sheet_meta;
  const isLandscape = activeMeta?.orientation === 'LANDSCAPE';
  const coordLabel = rangeCoordLabel(ws.selection.r1, ws.selection.c1, ws.selection.r2, ws.selection.c2);
  const activeCell = ws.grid?.cells[`${ws.selection.r1}:${ws.selection.c1}`];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <ApiErrorAlert error={ws.apiError} onClose={() => ws.setApiError(null)} />

      {/* Top Ribbon Bar matching ChuanHoa_Excel.xlam */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Space wrap size={6}>
          <Button
            type="primary"
            icon={<ThunderboltOutlined />}
            loading={ws.loading}
            onClick={() => ws.normalize(ws.orientationMode)}
            style={{ background: '#16A34A', borderColor: '#16A34A', fontWeight: 600 }}
          >
            Chuẩn hóa trang in
          </Button>

          <Tooltip title="Hoàn tác bước trước đó (Ctrl+Z)">
            <Button icon={<UndoOutlined />} disabled={!ws.canUndo} onClick={ws.undo}>
              Hoàn tác
            </Button>
          </Tooltip>

          <Tooltip title="Làm lại bước vừa hoàn tác (Ctrl+Y hoặc Ctrl+Shift+Z)">
            <Button icon={<RedoOutlined />} disabled={!ws.canRedo} onClick={ws.redo}>
              Làm lại
            </Button>
          </Tooltip>

          <Segmented
            value={ws.viewMode}
            onChange={(val) => ws.changeView(val as ViewMode)}
            options={[
              {
                label: (
                  <Space size={4}>
                    <TableOutlined />
                    <span>Bảng tính</span>
                  </Space>
                ),
                value: 'SPREADSHEET',
              },
              {
                label: (
                  <Space size={4}>
                    <PrinterOutlined />
                    <span>Trang in A4</span>
                  </Space>
                ),
                value: 'A4_PREVIEW',
              },
            ]}
          />

          <Segmented
            value={ws.orientationMode}
            onChange={(val) => ws.changeOrientation(val as OrientationMode)}
            options={[
              { label: 'Tự động', value: 'AUTO' },
              { label: 'A4 dọc', value: 'PORTRAIT' },
              { label: 'A4 ngang', value: 'LANDSCAPE' },
            ]}
          />

          <Select
            size="middle"
            value={ws.selectedSampleCode}
            onChange={ws.changeSample}
            style={{ width: 220 }}
            options={ws.samples.map((s) => ({
              value: s.code,
              label: s.name,
            }))}
          />
        </Space>

        <Space wrap size={6}>
          <Upload accept=".xlsx" showUploadList={false} beforeUpload={ws.uploadXlsx}>
            <Button icon={<UploadOutlined />}>Tải lên</Button>
          </Upload>

          <Button icon={<InfoCircleOutlined />} onClick={() => ws.setInspectorOpen(true)}>
            Thông số in
          </Button>

          <Button icon={<CopyOutlined />} disabled={!ws.result} onClick={ws.copyClipboard}>
            Copy bảng
          </Button>

          <Button
            type="primary"
            icon={<DownloadOutlined />}
            disabled={!ws.result}
            onClick={ws.downloadXlsx}
            style={{ fontWeight: 600 }}
          >
            Tải .xlsx
          </Button>
        </Space>
      </div>

      {/* Excel Formatting & Formula Bar (fx) */}
      {ws.viewMode === 'SPREADSHEET' && ws.grid && (
        <ExcelFormattingBar
          coordLabel={coordLabel}
          activeCell={activeCell}
          formulaBarValue={ws.editingCell ? ws.editDraft : ws.formulaBarText}
          onChangeFormulaBar={(val) => {
            ws.setFormulaBarText(val);
            if (ws.editingCell) ws.changeEditDraft(val);
          }}
          onCommitFormulaBar={ws.commitFormulaBar}
          onUpdateStyle={ws.updateSelectedStyle}
          onToggleMerge={() => {
            ws.mutateGrid((draft) =>
              toggleMergeOnGrid(draft, ws.selection.r1, ws.selection.c1, ws.selection.r2, ws.selection.c2)
            );
          }}
          onInsertRow={() => {
            ws.mutateGrid((draft) => {
              draft.rowCount += 1;
              return draft;
            });
          }}
          onDeleteRow={ws.clearSelection}
          onInsertCol={() => {
            ws.mutateGrid((draft) => {
              draft.colCount += 1;
              return draft;
            });
          }}
          onDeleteCol={ws.clearSelection}
        />
      )}

      {/* Main Workspace */}
      <Spin spinning={ws.loading} tip="Đang chuẩn hóa bảng tính & căn chỉnh trang in A4...">
        {ws.viewMode === 'SPREADSHEET' && ws.grid ? (
          <ExcelSpreadsheetGrid
            grid={ws.grid}
            selection={ws.selection}
            editingCell={ws.editingCell}
            editDraft={ws.editDraft}
            showPrintGuides={ws.showPrintGuides}
            onSelectRange={ws.setSelection}
            onStartEdit={ws.startEdit}
            onChangeEditDraft={ws.changeEditDraft}
            onCommitEdit={ws.commitEdit}
            onCancelEdit={ws.cancelEdit}
            onClearSelection={ws.clearSelection}
            onPasteGridData={ws.pasteGridData}
            onResizeColumn={(col, widthPx) => {
              ws.mutateGrid((draft) => {
                draft.colWidthsPx[String(col)] = widthPx;
                return draft;
              });
            }}
            onResizeRow={(row, heightPx) => {
              ws.mutateGrid((draft) => {
                draft.rowHeightsPx[String(row)] = heightPx;
                return draft;
              });
            }}
          />
        ) : (
          <div
            style={{
              background: '#CBD5E1',
              border: '1px solid #94A3B8',
              borderRadius: 6,
              padding: '20px 16px',
              overflowX: 'auto',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              minHeight: 610,
            }}
          >
            <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
              <Tag color={isLandscape ? 'purple' : 'blue'} style={{ margin: 0, fontWeight: 600 }}>
                {isLandscape ? 'A4 ngang (297×210mm)' : 'A4 dọc (210×297mm)'}
              </Tag>
              <Space size={6}>
                <ZoomInOutlined />
                <div style={{ width: 100 }}>
                  <Slider
                    min={55}
                    max={115}
                    step={5}
                    value={ws.previewScale}
                    onChange={ws.setPreviewScale}
                  />
                </div>
                <Text strong style={{ fontSize: 12 }}>
                  {ws.previewScale}%
                </Text>
              </Space>
              <Button size="small" type="primary" icon={<EditOutlined />} onClick={() => ws.setViewMode('SPREADSHEET')}>
                Sửa bảng tính
              </Button>
            </div>

            <div
              className="a4-preview-sheet"
              onClick={() => ws.setViewMode('SPREADSHEET')}
              style={{
                width: isLandscape ? '297mm' : '210mm',
                minHeight: isLandscape ? '210mm' : '297mm',
                background: '#FFFFFF',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.22)',
                padding: '12mm 10mm',
                boxSizing: 'border-box',
                transform: `scale(${ws.previewScale / 100})`,
                transformOrigin: 'top center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: ws.isStale
                    ? ws.result?.original_preview_html || ''
                    : ws.result?.a4_preview_html || '',
                }}
              />
              {activeMeta && !ws.isStale && (
                <div
                  style={{
                    marginTop: 24,
                    paddingTop: 8,
                    borderTop: '1px dashed #E2E8F0',
                    textAlign: 'center',
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: '10.5pt',
                    color: '#475569',
                  }}
                >
                  Trang 1/{activeMeta.estimated_pages}
                </div>
              )}
            </div>
          </div>
        )}
      </Spin>

      {/* Bottom Excel Status & Sheet Tab Bar */}
      <div
        style={{
          background: '#F1F5F9',
          border: '1px solid #CBD5E1',
          borderRadius: 6,
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Space size={6} wrap>
          {ws.result?.sheets_meta.map((s) => {
            const isActive = s.sheet_name === ws.result?.active_sheet;
            return (
              <Button
                key={s.sheet_name}
                size="small"
                type={isActive ? 'primary' : 'default'}
                icon={<FileExcelOutlined />}
                onClick={() => ws.switchSheet(s.sheet_name)}
                style={{ fontWeight: isActive ? 600 : 400 }}
              >
                {s.sheet_name}
              </Button>
            );
          })}
          <Button
            size="small"
            type={ws.showPrintGuides ? 'dashed' : 'text'}
            icon={<EyeOutlined />}
            onClick={() => ws.setShowPrintGuides(!ws.showPrintGuides)}
          >
            {ws.showPrintGuides ? 'Ẩn khung vùng in' : 'Hiện khung vùng in'}
          </Button>
        </Space>

        <Space size={12} wrap>
          {activeMeta && (
            <>
              <Badge
                status="success"
                text={
                  <span style={{ fontSize: 12 }}>
                    Vùng in: <b>{activeMeta.print_area}</b> ({activeMeta.zoom_percent}%)
                  </span>
                }
              />
              {activeMeta.header_rows && (
                <Tag color="green" style={{ margin: 0 }}>
                  Tiêu đề lặp: {activeMeta.header_rows}
                </Tag>
              )}
              <Text type="secondary" style={{ fontSize: 12 }}>
                Nhấp đúp hoặc gõ trực tiếp để sửa ô • Dán nhanh bằng <b>Ctrl+V</b>
              </Text>
            </>
          )}
        </Space>
      </div>

      {/* Popup Modal: Thông Số Thiết Lập Trang In A4 */}
      <ExcelInspectorModal
        open={ws.inspectorOpen}
        onClose={() => ws.setInspectorOpen(false)}
        result={ws.result}
        isUndoState={ws.isStale}
      />
    </div>
  );
};
