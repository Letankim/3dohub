'use client';

import React, { useState, useEffect } from 'react';
import { Badge, Button, Divider, Select, Space, Tag, Tooltip } from 'antd';
import {
  PlusOutlined,
  FolderOpenOutlined,
  UndoOutlined,
  RedoOutlined,
  PictureOutlined,
  TableOutlined,
  LinkOutlined,
  VerticalAlignTopOutlined,
  VerticalAlignBottomOutlined,
  FileTextOutlined,
  NumberOutlined,
  ColumnHeightOutlined,
  SearchOutlined,
  AppstoreOutlined,
  BankOutlined,
  ThunderboltFilled,
  CopyOutlined,
  DownloadOutlined,
  AuditOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { ProfileItem } from '@/types/api';

interface RibbonItemProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  tooltip?: string;
}

const RibbonToolButton: React.FC<RibbonItemProps> = ({
  icon,
  label,
  onClick,
  disabled,
  active,
  tooltip,
}) => {
  const btn = (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        padding: '4px 7px',
        minWidth: 46,
        height: 48,
        border: active ? '1px solid #93C5FD' : '1px solid transparent',
        borderRadius: 4,
        background: active ? '#EFF6FF' : 'transparent',
        color: disabled ? '#CBD5E1' : active ? '#1D4ED8' : '#334155',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.15s ease',
        fontSize: 11,
        lineHeight: 1.15,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = '#F1F5F9';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.background = 'transparent';
        }
      }}
    >
      <span style={{ fontSize: 15, lineHeight: 1 }}>{icon}</span>
      <span>{label}</span>
    </button>
  );

  return tooltip ? <Tooltip title={tooltip}>{btn}</Tooltip> : btn;
};

export interface WordRibbonToolbarProps {
  profiles: ProfileItem[];
  selectedProfile: string;
  appliedProfileName?: string;
  mismatchWarning?: string;
  onChangeProfile: (pid: string) => void;
  onNewDoc: () => void;
  onOpenDocx: () => void;
  onExecCommand: (cmd: string, value?: string) => void;
  onInsertTable: () => void;
  onInsertHeaderTable: () => void;
  onInsertFooterTable: () => void;
  onInsertPageNumber: () => void;
  onInsertPageBreak: () => void;
  onTogglePageSetup: () => void;
  onToggleFindBar: () => void;
  findBarOpen: boolean;
  pageSetupOpen: boolean;
  onOpenTemplatesModal: () => void;
  onOpenUnitModal: () => void;
  onOpenLogicModal: () => void;
  onNormalize: () => void;
  onCopyWordFormat: () => void;
  onDownloadDocx: () => void;
  loading?: boolean;
  warningsCount?: number;
}

export const WordRibbonToolbar: React.FC<WordRibbonToolbarProps> = ({
  profiles,
  selectedProfile,
  appliedProfileName,
  mismatchWarning,
  onChangeProfile,
  onNewDoc,
  onOpenDocx,
  onExecCommand,
  onInsertTable,
  onInsertHeaderTable,
  onInsertFooterTable,
  onInsertPageNumber,
  onInsertPageBreak,
  onTogglePageSetup,
  onToggleFindBar,
  findBarOpen,
  pageSetupOpen,
  onOpenTemplatesModal,
  onOpenUnitModal,
  onOpenLogicModal,
  onNormalize,
  onCopyWordFormat,
  onDownloadDocx,
  loading,
  warningsCount = 0,
}) => {
  const [viewportWidth, setViewportWidth] = useState<number>(1280);
  const [mobileToolsOpen, setMobileToolsOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const isMobile = viewportWidth < 768;
  const isCompact = viewportWidth < 1180;

  const handleInsertLink = () => {
    const url = window.prompt('Nhập đường dẫn liên kết (URL):', 'https://');
    if (url) onExecCommand('createLink', url);
  };

  const handleInsertImage = () => {
    const url = window.prompt('Nhập URL hình ảnh hoặc con dấu để chèn vào văn bản:');
    if (url) onExecCommand('insertImage', url);
  };

  const showRibbonIcons = !isMobile || mobileToolsOpen;

  return (
    <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <div
        style={{
          padding: isMobile ? '6px 8px' : '4px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
        }}
      >
        {/* Left Word-Style Ribbon Tool Strip (horizontally scrollable, collapsible on mobile) */}
        {showRibbonIcons && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              gap: 2,
              maxWidth: '100%',
              order: isCompact ? 2 : 1,
              width: isCompact ? '100%' : 'auto',
              borderTop: isCompact ? '1px solid #F1F5F9' : 'none',
              paddingTop: isCompact ? 4 : 0,
            }}
          >
            <RibbonToolButton
              icon={<PlusOutlined />}
              label="New"
              tooltip="Tạo văn bản trống mới"
              onClick={onNewDoc}
            />
            <RibbonToolButton
              icon={<FolderOpenOutlined />}
              label="Open"
              tooltip="Mở tệp .docx từ máy tính"
              onClick={onOpenDocx}
            />

            <Divider type="vertical" style={{ height: 28, margin: '0 2px' }} />

            <RibbonToolButton
              icon={<UndoOutlined />}
              label="Undo"
              tooltip="Hoàn tác (Ctrl+Z)"
              onClick={() => onExecCommand('undo')}
            />
            <RibbonToolButton
              icon={<RedoOutlined />}
              label="Redo"
              tooltip="Làm lại (Ctrl+Y)"
              onClick={() => onExecCommand('redo')}
            />

            <Divider type="vertical" style={{ height: 28, margin: '0 2px' }} />

            <RibbonToolButton
              icon={<PictureOutlined />}
              label="Image"
              tooltip="Chèn hình ảnh"
              onClick={handleInsertImage}
            />
            <RibbonToolButton
              icon={<TableOutlined />}
              label="Table"
              tooltip="Chèn bảng biểu vào vị trí con trỏ"
              onClick={onInsertTable}
            />
            <RibbonToolButton
              icon={<LinkOutlined />}
              label="Link"
              tooltip="Chèn liên kết"
              onClick={handleInsertLink}
            />

            <Divider type="vertical" style={{ height: 28, margin: '0 2px' }} />

            <RibbonToolButton
              icon={<VerticalAlignTopOutlined />}
              label="Header"
              tooltip="Chèn khung Quốc hiệu & Tên cơ quan (2 cột chuẩn)"
              onClick={onInsertHeaderTable}
            />
            <RibbonToolButton
              icon={<VerticalAlignBottomOutlined />}
              label="Footer"
              tooltip="Chèn khung Nơi nhận & Chữ ký (2 cột chuẩn)"
              onClick={onInsertFooterTable}
            />
            <RibbonToolButton
              icon={<FileTextOutlined />}
              label="Page Setup"
              tooltip="Thiết lập khổ giấy A4 & căn lề chuẩn (20-20-30-15mm)"
              active={pageSetupOpen}
              onClick={onTogglePageSetup}
            />
            <RibbonToolButton
              icon={<NumberOutlined />}
              label="Page Number"
              tooltip="Bật/tắt đánh số trang"
              onClick={onInsertPageNumber}
            />
            <RibbonToolButton
              icon={<ColumnHeightOutlined />}
              label="Break"
              tooltip="Chèn ngắt trang (Page Break)"
              onClick={onInsertPageBreak}
            />

            <Divider type="vertical" style={{ height: 28, margin: '0 2px' }} />

            <RibbonToolButton
              icon={<SearchOutlined />}
              label="Find"
              tooltip="Tìm kiếm & thay thế trong văn bản"
              active={findBarOpen}
              onClick={onToggleFindBar}
            />
            <RibbonToolButton
              icon={<AppstoreOutlined style={{ color: '#1D4ED8' }} />}
              label="Mẫu chuẩn"
              tooltip="Chọn từ kho 17 mẫu văn bản Đảng & Nhà nước"
              onClick={onOpenTemplatesModal}
            />
            <RibbonToolButton
              icon={<BankOutlined style={{ color: '#1D4ED8' }} />}
              label="Đơn vị"
              tooltip="Cấu hình thông tin đơn vị điền tự động"
              onClick={onOpenUnitModal}
            />
          </div>
        )}

        {/* Primary Action Group (Always accessible, adaptive sizes on mobile/tablet) */}
        <Space
          wrap
          size={isMobile ? 4 : 6}
          style={{
            order: isCompact ? 1 : 2,
            width: isCompact ? '100%' : 'auto',
            justifyContent: isCompact ? 'space-between' : 'flex-end',
          }}
        >
          <Space wrap size={isMobile ? 4 : 6}>
            {isMobile && (
              <Tooltip title="Ẩn/hiện thanh công cụ Word">
                <Button
                  size="small"
                  type={mobileToolsOpen ? 'primary' : 'default'}
                  ghost={mobileToolsOpen}
                  icon={<ToolOutlined />}
                  onClick={() => setMobileToolsOpen((prev) => !prev)}
                />
              </Tooltip>
            )}

            <Select
              size={isMobile ? 'small' : 'middle'}
              value={selectedProfile}
              onChange={onChangeProfile}
              style={{ width: isMobile ? 132 : 168 }}
              options={
                profiles.length > 0
                  ? profiles.map((p) => ({
                      value: p.code,
                      label: p.name,
                    }))
                  : [
                      { value: 'AUTO', label: 'Tự động nhận diện' },
                      { value: 'DANG', label: 'Khối Đảng' },
                      { value: 'CHINH_QUYEN', label: 'Khối Chính quyền' },
                      { value: 'CONG_AN', label: 'Khối Công an' },
                      { value: 'QUAN_DOI', label: 'Khối Quân đội' },
                      { value: 'MTTQ', label: 'MTTQ & Đoàn thể' },
                    ]
              }
            />

            {selectedProfile === 'AUTO' && appliedProfileName && (
              <Tooltip title={`Đang áp dụng: ${appliedProfileName} (Tự động nhận diện theo Tiêu ngữ/Quốc hiệu và đơn vị ban hành)`}>
                <Tag
                  color="processing"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    margin: 0,
                    height: isMobile ? 24 : 32,
                    lineHeight: isMobile ? '22px' : '30px',
                    borderRadius: 4,
                    fontSize: isMobile ? 10 : 12,
                    fontWeight: 500,
                    borderColor: '#93C5FD',
                    background: '#EFF6FF',
                    color: '#1D4ED8',
                  }}
                >
                  <ThunderboltFilled style={{ fontSize: 11, color: '#1D4ED8' }} />
                  <span>{appliedProfileName}</span>
                </Tag>
              </Tooltip>
            )}

            {mismatchWarning && (
              <Tooltip title={mismatchWarning}>
                <Tag
                  color="warning"
                  style={{
                    margin: 0,
                    height: isMobile ? 24 : 32,
                    lineHeight: isMobile ? '22px' : '30px',
                    borderRadius: 4,
                    fontSize: isMobile ? 10 : 11,
                  }}
                >
                  Lệch khối
                </Tag>
              </Tooltip>
            )}

            {isMobile && (
              <>
                <Button
                  size="small"
                  icon={<AppstoreOutlined />}
                  onClick={onOpenTemplatesModal}
                >
                  Mẫu
                </Button>
                <Button
                  size="small"
                  icon={<BankOutlined />}
                  onClick={onOpenUnitModal}
                >
                  Đơn vị
                </Button>
              </>
            )}
          </Space>

          <Space wrap size={isMobile ? 4 : 6}>
            <Button
              size={isMobile ? 'small' : 'middle'}
              type="primary"
              icon={<ThunderboltFilled />}
              loading={loading}
              onClick={onNormalize}
              style={{ background: '#1D4ED8', fontWeight: 600 }}
            >
              Chuẩn hóa
            </Button>

            <Tooltip title="Copy giữ nguyên bảng 2 cột không viền, phông Times New Roman, lề 1.27cm để Ctrl+V dán thẳng vào MS Word">
              <Button
                size={isMobile ? 'small' : 'middle'}
                icon={<CopyOutlined />}
                onClick={onCopyWordFormat}
                style={{
                  borderColor: '#1D4ED8',
                  color: '#1D4ED8',
                  fontWeight: 600,
                }}
              >
                {isMobile ? 'Copy' : 'Copy Word'}
              </Button>
            </Tooltip>

            <Button
              size={isMobile ? 'small' : 'middle'}
              icon={<DownloadOutlined />}
              onClick={onDownloadDocx}
              style={{ fontWeight: 500 }}
            >
              {isMobile ? '.docx' : 'Tải .docx'}
            </Button>

            <Badge count={warningsCount} size="small" offset={[-4, 4]}>
              <Button
                size={isMobile ? 'small' : 'middle'}
                icon={<AuditOutlined />}
                onClick={onOpenLogicModal}
                danger={warningsCount > 0}
                style={{ fontWeight: 500 }}
              >
                {isMobile ? 'Rà lỗi' : 'Rà soát lỗi'}
              </Button>
            </Badge>
          </Space>
        </Space>
      </div>
    </div>
  );
};
