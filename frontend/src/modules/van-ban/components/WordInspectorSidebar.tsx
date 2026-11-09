'use client';

import React, { useState } from 'react';
import {
  Button,
  Divider,
  Input,
  Select,
  Space,
  Tabs,
  Tooltip,
  Typography,
} from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  StrikethroughOutlined,
  AlignLeftOutlined,
  AlignCenterOutlined,
  AlignRightOutlined,
  MenuOutlined,
  BgColorsOutlined,
  FontColorsOutlined,
  BorderInnerOutlined,
  BorderOuterOutlined,
  TableOutlined,
  ThunderboltFilled,
  ClearOutlined,
} from '@ant-design/icons';

const { Text } = Typography;
const { TextArea } = Input;

export interface WordInspectorSidebarProps {
  rawText: string;
  onChangeRawText: (val: string) => void;
  onNormalize: () => void;
  onExecCommand: (cmd: string, value?: string) => void;
  onApplyTableBorderStyle: (bordered: boolean) => void;
  onInsertHeaderTable: () => void;
  onInsertFooterTable: () => void;
  onApplyParagraphIndent: (indentCm: string) => void;
  loading?: boolean;
}

const HIGHLIGHT_COLORS = [
  { label: 'Không tô nền', color: 'transparent' },
  { label: 'Vàng đánh dấu [...]', color: '#FEF08A' },
  { label: 'Xanh lá nhạt', color: '#BBF7D0' },
  { label: 'Xanh dương nhạt', color: '#BFDBFE' },
  { label: 'Hồng nhạt', color: '#FECDD3' },
];

export const WordInspectorSidebar: React.FC<WordInspectorSidebarProps> = ({
  rawText,
  onChangeRawText,
  onNormalize,
  onExecCommand,
  onApplyTableBorderStyle,
  onInsertHeaderTable,
  onInsertFooterTable,
  onApplyParagraphIndent,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<string>('TEXT');
  const [fillColor, setFillColor] = useState<string>('#FEF08A');
  const [customIndent, setCustomIndent] = useState<string>('1.27');

  return (
    <div
      style={{
        width: 280,
        flexShrink: 0,
        background: '#FFFFFF',
        borderLeft: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        size="small"
        tabBarStyle={{
          padding: '0 12px',
          marginBottom: 0,
          borderBottom: '1px solid #E2E8F0',
          fontWeight: 600,
        }}
        items={[
          {
            key: 'TEXT',
            label: 'TEXT',
            children: (
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Font Family & Size */}
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}
                  >
                    PHÔNG CHỮ & CỠ CHỮ CHUẨN
                  </Text>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <Select
                      defaultValue="Times New Roman"
                      style={{ flex: 1 }}
                      size="small"
                      onChange={(val) => onExecCommand('fontName', val)}
                      options={[
                        { value: 'Times New Roman', label: 'Times New Roman' },
                        { value: 'Arial', label: 'Arial' },
                        { value: 'Calibri', label: 'Calibri' },
                      ]}
                    />
                    <Select
                      defaultValue="4"
                      style={{ width: 78 }}
                      size="small"
                      onChange={(val) => onExecCommand('fontSize', val)}
                      options={[
                        { value: '2', label: '11 pt' },
                        { value: '3', label: '12 pt' },
                        { value: '4', label: '14 pt' },
                        { value: '5', label: '16 pt' },
                      ]}
                    />
                  </div>
                </div>

                {/* Bold / Italic / Underline / Strike */}
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}
                  >
                    KIỂU CHỮ & CĂN LỀ ĐOẠN VĂN
                  </Text>
                  <Space size={4} wrap>
                    <Tooltip title="In đậm (Ctrl+B)">
                      <Button
                        size="small"
                        icon={<BoldOutlined />}
                        onClick={() => onExecCommand('bold')}
                      />
                    </Tooltip>
                    <Tooltip title="In nghiêng (Ctrl+I)">
                      <Button
                        size="small"
                        icon={<ItalicOutlined />}
                        onClick={() => onExecCommand('italic')}
                      />
                    </Tooltip>
                    <Tooltip title="Gạch chân (Ctrl+U)">
                      <Button
                        size="small"
                        icon={<UnderlineOutlined />}
                        onClick={() => onExecCommand('underline')}
                      />
                    </Tooltip>
                    <Tooltip title="Gạch ngang">
                      <Button
                        size="small"
                        icon={<StrikethroughOutlined />}
                        onClick={() => onExecCommand('strikeThrough')}
                      />
                    </Tooltip>

                    <Divider type="vertical" style={{ margin: '0 2px' }} />

                    <Tooltip title="Căn trái">
                      <Button
                        size="small"
                        icon={<AlignLeftOutlined />}
                        onClick={() => onExecCommand('justifyLeft')}
                      />
                    </Tooltip>
                    <Tooltip title="Căn giữa">
                      <Button
                        size="small"
                        icon={<AlignCenterOutlined />}
                        onClick={() => onExecCommand('justifyCenter')}
                      />
                    </Tooltip>
                    <Tooltip title="Căn phải">
                      <Button
                        size="small"
                        icon={<AlignRightOutlined />}
                        onClick={() => onExecCommand('justifyRight')}
                      />
                    </Tooltip>
                    <Tooltip title="Căn đều 2 bên (Justify chuẩn hành chính)">
                      <Button
                        size="small"
                        icon={<MenuOutlined />}
                        onClick={() => onExecCommand('justifyFull')}
                      />
                    </Tooltip>
                  </Space>
                </div>

                {/* Fill / Highlight & Font Color (Matching Screenshot 3) */}
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}
                  >
                    FILL / HIGHLIGHT & MÀU CHỮ
                  </Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: '#475569', marginRight: 4 }}>Fill:</span>
                    {HIGHLIGHT_COLORS.map((item) => (
                      <Tooltip key={item.color} title={item.label}>
                        <button
                          type="button"
                          onClick={() => {
                            setFillColor(item.color);
                            onExecCommand('hiliteColor', item.color);
                          }}
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 4,
                            border:
                              fillColor === item.color
                                ? '2px solid #1D4ED8'
                                : '1px solid #CBD5E1',
                            background:
                              item.color === 'transparent' ? '#FFFFFF' : item.color,
                            cursor: 'pointer',
                          }}
                        />
                      </Tooltip>
                    ))}
                    <Tooltip title="Chữ đen chuẩn">
                      <Button
                        size="small"
                        icon={<FontColorsOutlined />}
                        onClick={() => onExecCommand('foreColor', '#000000')}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa định dạng vùng chọn">
                      <Button
                        size="small"
                        icon={<BgColorsOutlined />}
                        onClick={() => onExecCommand('removeFormat')}
                      />
                    </Tooltip>
                  </div>
                </div>

                <Divider style={{ margin: '2px 0' }} />

                {/* Standard & Custom Administrative Indentation */}
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 6 }}
                  >
                    THỤT LỀ ĐẦU DÒNG (CHUẨN & TÙY CHỈNH)
                  </Text>
                  <Space size={6} wrap style={{ marginBottom: 8 }}>
                    <Button
                      size="small"
                      onClick={() => {
                        setCustomIndent('1.27');
                        onApplyParagraphIndent('1.27cm');
                      }}
                    >
                      Chuẩn 1.27cm
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setCustomIndent('1.0');
                        onApplyParagraphIndent('1.0cm');
                      }}
                    >
                      1.0cm
                    </Button>
                    <Button
                      size="small"
                      onClick={() => {
                        setCustomIndent('0');
                        onApplyParagraphIndent('0cm');
                      }}
                    >
                      Sát lề 0cm
                    </Button>
                  </Space>
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Input
                      size="small"
                      value={customIndent}
                      onChange={(e) => setCustomIndent(e.target.value)}
                      onPressEnter={() => {
                        const val = parseFloat(customIndent.replace(',', '.'));
                        if (!Number.isNaN(val) && val >= 0) {
                          onApplyParagraphIndent(`${val}cm`);
                        }
                      }}
                      placeholder="VD: 1.5"
                      suffix="cm"
                      style={{ flex: 1 }}
                    />
                    <Button
                      size="small"
                      type="primary"
                      ghost
                      onClick={() => {
                        const val = parseFloat(customIndent.replace(',', '.'));
                        if (!Number.isNaN(val) && val >= 0) {
                          onApplyParagraphIndent(`${val}cm`);
                        }
                      }}
                    >
                      Áp dụng
                    </Button>
                  </div>
                </div>
              </div>
            ),
          },
          {
            key: 'TABLE',
            label: 'TABLE',
            children: (
              <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Border Style matching Screenshot 3 */}
                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}
                  >
                    BORDER STYLE (KIỂU ĐƯỜNG VIỀN BẢNG)
                  </Text>
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 4,
                      padding: 10,
                      display: 'flex',
                      gap: 8,
                    }}
                  >
                    <Tooltip title="Ẩn viền bảng (Chuẩn bảng Quốc hiệu & Chữ ký)">
                      <Button
                        icon={<BorderOuterOutlined style={{ color: '#94A3B8' }} />}
                        onClick={() => onApplyTableBorderStyle(false)}
                        style={{ flex: 1 }}
                      >
                        Ẩn viền
                      </Button>
                    </Tooltip>
                    <Tooltip title="Hiện viền bảng dữ liệu (1pt solid black)">
                      <Button
                        icon={<BorderInnerOutlined style={{ color: '#0F172A' }} />}
                        onClick={() => onApplyTableBorderStyle(true)}
                        style={{ flex: 1 }}
                      >
                        Hiện viền
                      </Button>
                    </Tooltip>
                  </div>
                </div>

                <Divider style={{ margin: '2px 0' }} />

                <div>
                  <Text
                    type="secondary"
                    style={{ fontSize: 11, fontWeight: 600, display: 'block', marginBottom: 8 }}
                  >
                    CHÈN BẢNG THỂ THỨC NHANH
                  </Text>
                  <Space direction="vertical" style={{ width: '100%' }} size={8}>
                    <Button
                      block
                      size="small"
                      icon={<TableOutlined />}
                      onClick={onInsertHeaderTable}
                    >
                      Chèn bảng Quốc hiệu
                    </Button>
                    <Button
                      block
                      size="small"
                      icon={<TableOutlined />}
                      onClick={onInsertFooterTable}
                    >
                      Chèn bảng Nơi nhận & Chữ ký
                    </Button>
                  </Space>
                </div>
              </div>
            ),
          },
          {
            key: 'RAW_INPUT',
            label: 'DÁN THÔ',
            children: (
              <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Dán văn bản thô để chuẩn hóa tự động:
                  </Text>
                  <Button
                    type="text"
                    danger
                    size="small"
                    icon={<ClearOutlined />}
                    onClick={() => onChangeRawText('')}
                  >
                    Xóa
                  </Button>
                </div>
                <TextArea
                  value={rawText}
                  onChange={(e) => onChangeRawText(e.target.value)}
                  placeholder="Dán nội dung văn bản thô vào đây rồi bấm Chuẩn hóa..."
                  style={{
                    minHeight: 380,
                    fontFamily: "'Times New Roman', Times, serif",
                    fontSize: 13.5,
                    lineHeight: 1.45,
                  }}
                />
                <Button
                  type="primary"
                  block
                  icon={<ThunderboltFilled />}
                  loading={loading}
                  onClick={onNormalize}
                  style={{ background: '#1D4ED8', fontWeight: 600 }}
                >
                  Chuẩn hóa văn bản
                </Button>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

