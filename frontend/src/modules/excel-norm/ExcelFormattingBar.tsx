'use client';

import React from 'react';
import { Button, Divider, Input, Select, Space, Tooltip, Typography } from 'antd';
import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BgColorsOutlined,
  BoldOutlined,
  BorderInnerOutlined,
  ColumnHeightOutlined,
  DeleteColumnOutlined,
  DeleteRowOutlined,
  InsertRowAboveOutlined,
  InsertRowLeftOutlined,
  ItalicOutlined,
  MergeCellsOutlined,
  UnderlineOutlined,
} from '@ant-design/icons';
import { ExcelCellData } from '@/types/api';

const { Text } = Typography;

interface ExcelFormattingBarProps {
  coordLabel: string;
  activeCell: ExcelCellData | undefined;
  formulaBarValue: string;
  onChangeFormulaBar: (val: string) => void;
  onCommitFormulaBar: () => void;
  onUpdateStyle: (patch: Partial<ExcelCellData>) => void;
  onToggleMerge: () => void;
  onInsertRow: () => void;
  onDeleteRow: () => void;
  onInsertCol: () => void;
  onDeleteCol: () => void;
}

const CELL_BG_PALETTE = [
  { label: 'Màu nền: Trắng', value: '' },
  { label: 'Màu nền: Xám nhạt', value: '#F1F5F9' },
  { label: 'Màu nền: Vàng nhạt', value: '#FEF08A' },
  { label: 'Màu nền: Xanh lá', value: '#DCFCE7' },
  { label: 'Màu nền: Xanh dương', value: '#DBEAFE' },
];

export const ExcelFormattingBar: React.FC<ExcelFormattingBarProps> = ({
  coordLabel,
  activeCell,
  formulaBarValue,
  onChangeFormulaBar,
  onCommitFormulaBar,
  onUpdateStyle,
  onToggleMerge,
  onInsertRow,
  onDeleteRow,
  onInsertCol,
  onDeleteCol,
}) => {
  const curFont = activeCell?.fontName || 'Times New Roman';
  const curSize = activeCell?.fontSize || 11;
  const isBold = Boolean(activeCell?.bold);
  const isItalic = Boolean(activeCell?.italic);
  const isUnderline = Boolean(activeCell?.underline);
  const curAlign = activeCell?.align || 'left';
  const isWrap = activeCell?.wrapText !== false;
  const hasBorder = Boolean(activeCell?.border);

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: 6,
        overflow: 'hidden',
      }}
    >
      {/* Row 1: Excel Formatting Tools */}
      <div
        style={{
          padding: '6px 10px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 6,
          background: '#F8FAFC',
        }}
      >
        <Select
          size="small"
          value={curFont}
          onChange={(val) => onUpdateStyle({ fontName: val })}
          style={{ width: 145 }}
          options={[
            { value: 'Times New Roman', label: 'Times New Roman' },
            { value: 'Calibri', label: 'Calibri' },
            { value: 'Arial', label: 'Arial' },
          ]}
        />

        <Select
          size="small"
          value={curSize}
          onChange={(val) => onUpdateStyle({ fontSize: Number(val) })}
          style={{ width: 68 }}
          options={[8, 9, 10, 11, 12, 13, 14, 16, 18].map((sz) => ({
            value: sz,
            label: `${sz}pt`,
          }))}
        />

        <Divider type="vertical" style={{ margin: '0 2px' }} />

        <Space size={3}>
          <Tooltip title="In đậm">
            <Button
              size="small"
              type={isBold ? 'primary' : 'default'}
              icon={<BoldOutlined />}
              onClick={() => onUpdateStyle({ bold: !isBold })}
            />
          </Tooltip>
          <Tooltip title="In nghiêng">
            <Button
              size="small"
              type={isItalic ? 'primary' : 'default'}
              icon={<ItalicOutlined />}
              onClick={() => onUpdateStyle({ italic: !isItalic })}
            />
          </Tooltip>
          <Tooltip title="Gạch chân">
            <Button
              size="small"
              type={isUnderline ? 'primary' : 'default'}
              icon={<UnderlineOutlined />}
              onClick={() => onUpdateStyle({ underline: !isUnderline })}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ margin: '0 2px' }} />

        <Space size={3}>
          <Tooltip title="Căn trái">
            <Button
              size="small"
              type={curAlign === 'left' ? 'primary' : 'default'}
              icon={<AlignLeftOutlined />}
              onClick={() => onUpdateStyle({ align: 'left' })}
            />
          </Tooltip>
          <Tooltip title="Căn giữa">
            <Button
              size="small"
              type={curAlign === 'center' ? 'primary' : 'default'}
              icon={<AlignCenterOutlined />}
              onClick={() => onUpdateStyle({ align: 'center' })}
            />
          </Tooltip>
          <Tooltip title="Căn phải">
            <Button
              size="small"
              type={curAlign === 'right' ? 'primary' : 'default'}
              icon={<AlignRightOutlined />}
              onClick={() => onUpdateStyle({ align: 'right' })}
            />
          </Tooltip>
        </Space>

        <Divider type="vertical" style={{ margin: '0 2px' }} />

        <Space size={4} wrap>
          <Tooltip title="Tự động xuống dòng trong ô (Wrap Text)">
            <Button
              size="small"
              type={isWrap ? 'primary' : 'default'}
              icon={<ColumnHeightOutlined />}
              onClick={() => onUpdateStyle({ wrapText: !isWrap })}
            >
              Ngắt dòng
            </Button>
          </Tooltip>

          <Tooltip title="Gộp hoặc tách vùng ô đang chọn">
            <Button size="small" icon={<MergeCellsOutlined />} onClick={onToggleMerge}>
              Gộp ô
            </Button>
          </Tooltip>

          <Tooltip title="Bật/tắt kẻ khung cho vùng ô đang chọn">
            <Button
              size="small"
              type={hasBorder ? 'primary' : 'default'}
              icon={<BorderInnerOutlined />}
              onClick={() => onUpdateStyle({ border: !hasBorder })}
            >
              Kẻ khung
            </Button>
          </Tooltip>

          <Select
            size="small"
            value={activeCell?.bg || ''}
            onChange={(val) => onUpdateStyle({ bg: val })}
            style={{ width: 138 }}
            suffixIcon={<BgColorsOutlined />}
            options={CELL_BG_PALETTE}
          />
        </Space>

        <Divider type="vertical" style={{ margin: '0 2px' }} />

        <Space size={4} wrap>
          <Tooltip title="Thêm dòng mới">
            <Button size="small" icon={<InsertRowAboveOutlined />} onClick={onInsertRow}>
              + Dòng
            </Button>
          </Tooltip>
          <Tooltip title="Xóa nội dung dòng đang chọn">
            <Button size="small" danger icon={<DeleteRowOutlined />} onClick={onDeleteRow}>
              - Dòng
            </Button>
          </Tooltip>
          <Tooltip title="Thêm cột mới">
            <Button size="small" icon={<InsertRowLeftOutlined />} onClick={onInsertCol}>
              + Cột
            </Button>
          </Tooltip>
          <Tooltip title="Xóa nội dung cột đang chọn">
            <Button size="small" danger icon={<DeleteColumnOutlined />} onClick={onDeleteCol}>
              - Cột
            </Button>
          </Tooltip>
        </Space>
      </div>

      {/* Row 2: Excel Name Box (A1) & Formula / Content Bar (fx) */}
      <div
        style={{
          padding: '5px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: '#FFFFFF',
        }}
      >
        <div
          style={{
            minWidth: 74,
            height: 26,
            background: '#F1F5F9',
            border: '1px solid #CBD5E1',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 12,
            color: '#0F172A',
            padding: '0 8px',
            flexShrink: 0,
          }}
          title="Tọa độ ô đang chọn"
        >
          {coordLabel}
        </div>

        <Text
          italic
          strong
          style={{
            fontFamily: "'Times New Roman', serif",
            fontSize: 15,
            color: '#64748B',
            padding: '0 4px',
            userSelect: 'none',
            flexShrink: 0,
          }}
        >
          fx
        </Text>

        <Input
          size="small"
          value={formulaBarValue}
          onChange={(e) => onChangeFormulaBar(e.target.value)}
          onPressEnter={onCommitFormulaBar}
          onBlur={onCommitFormulaBar}
          placeholder="Nhập nội dung ô hoặc công thức (VD: =SUM(G7:G10), =E7*F7)..."
          style={{
            flex: 1,
            height: 26,
            fontFamily: "'Times New Roman', Times, serif",
            fontSize: 13.5,
          }}
        />
      </div>
    </div>
  );
};
