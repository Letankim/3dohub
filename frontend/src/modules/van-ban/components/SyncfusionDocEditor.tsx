'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Select, Space, Tooltip, message } from 'antd';
import {
  ThunderboltFilled,
  CopyOutlined,
  DownloadOutlined,
  AuditOutlined,
  FileTextOutlined,
  BankOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { registerLicense } from '@syncfusion/ej2-base';
import {
  DocumentEditorContainerComponent,
  Toolbar,
} from '@syncfusion/ej2-react-documenteditor';
import '@syncfusion/ej2-material3-theme/styles/material3.css';
import { NormalizedDocResult, ProfileItem } from '@/types/api';
import { stripFootnotes } from '../utils/sfdt-utils';

const SF_LICENSE = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY || '';
if (SF_LICENSE) registerLicense(SF_LICENSE);
DocumentEditorContainerComponent.Inject(Toolbar);

const TOOLBAR_ITEMS = [
  'Undo',
  'Redo',
  'Separator',
  'Image',
  'Table',
  'Hyperlink',
  'Separator',
  'Header',
  'Footer',
  'PageSetup',
  'PageNumber',
  'Break',
  'Separator',
  'InsertFootnote',
  'InsertEndnote',
  'Separator',
  'Find',
];

export interface SyncfusionDocEditorProps {
  profiles: ProfileItem[];
  selectedProfile: string;
  onChangeProfile: (pid: string, currentText?: string) => void;
  rawText: string;
  onChangeRawText: (val: string) => void;
  normResult: NormalizedDocResult | null;
  onNormalize: (customText?: string) => void;
  onUploadDocx: (file: File) => void;
  onOpenTemplatesModal: () => void;
  onOpenUnitModal: () => void;
  onOpenLogicModal: () => void;
  loading?: boolean;
}

const FALLBACK_PROFILES = [
  { value: 'AUTO', label: 'Tự động nhận diện' },
  { value: 'DANG', label: 'Khối Đảng' },
  { value: 'CHINH_QUYEN', label: 'Khối Chính quyền' },
  { value: 'CONG_AN', label: 'Khối Công an' },
  { value: 'QUAN_DOI', label: 'Khối Quân đội' },
  { value: 'MTTQ', label: 'MTTQ & Đoàn thể' },
];

export const SyncfusionDocEditor: React.FC<SyncfusionDocEditorProps> = ({
  profiles,
  selectedProfile,
  onChangeProfile,
  rawText,
  onChangeRawText,
  normResult,
  onNormalize,
  onUploadDocx,
  onOpenTemplatesModal,
  onOpenUnitModal,
  onOpenLogicModal,
  loading,
}) => {
  const containerRef = useRef<DocumentEditorContainerComponent | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [ready, setReady] = useState(false);

  /** Mở tài liệu SFDT đã chuẩn hóa (có footnote thật, số trang) vào trình soạn thảo. */
  useEffect(() => {
    const editor = containerRef.current?.documentEditor;
    if (!ready || !editor || !normResult?.sfdt) return;
    try {
      editor.open(JSON.stringify(normResult.sfdt));
    } catch {
      try {
        editor.open(JSON.stringify(stripFootnotes(normResult.sfdt)));
        message.warning('Không dựng được chú thích cuối trang, đã hiển thị bản không có footnote.');
      } catch {
        message.error('Không mở được tài liệu trong trình soạn thảo.');
      }
    }
  }, [normResult, ready]);

  const getEditorText = (): string => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return rawText;
    editor.selection.selectAll();
    const text = (editor.selection.text || '').replace(/\r/g, '\n').trim();
    editor.selection.moveToDocumentStart();
    return text.length > 10 ? text : rawText;
  };

  const handleNormalize = () => {
    const text = getEditorText();
    onChangeRawText(text);
    onNormalize(text);
  };

  const handleChangeProfile = (pid: string) => {
    const text = getEditorText();
    onChangeRawText(text);
    onChangeProfile(pid, text);
  };

  /** Tải .docx trực tiếp từ nội dung đang soạn (giữ nguyên footnote, số trang). */
  const handleDownload = () => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return;
    const base = (normResult?.docx_filename || 'VanBan_ChuanHoa_3DoHub.docx').replace(/\.docx$/i, '');
    editor.save(base, 'Docx');
    message.success(`Đã tải về tệp ${base}.docx`);
  };

  const handleCopyWord = async () => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return;
    try {
      editor.selection.selectAll();
      editor.selection.copy();
      editor.selection.moveToDocumentStart();
      message.success('Đã copy toàn bộ văn bản! Bấm Ctrl+V để dán vào Word / Google Docs.');
    } catch {
      if (normResult?.mso_clipboard_html && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([normResult.mso_clipboard_html], { type: 'text/html' }),
            'text/plain': new Blob([normResult.normalized_text], { type: 'text/plain' }),
          }),
        ]);
        message.success('Đã copy chuẩn định dạng Microsoft Word!');
      }
    }
  };

  return (
    <div
      style={{
        border: '1px solid #E2E8F0',
        borderRadius: 6,
        background: '#FFFFFF',
        overflow: 'hidden',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".docx"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            onUploadDocx(file);
            e.target.value = '';
          }
        }}
      />

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          padding: '8px 12px',
          borderBottom: '1px solid #E2E8F0',
          background: '#F8FAFC',
          alignItems: 'center',
        }}
      >
        <Select
          value={selectedProfile}
          onChange={handleChangeProfile}
          style={{ minWidth: 168 }}
          options={
            profiles.length > 0
              ? profiles.map((p) => ({ value: p.code, label: p.name }))
              : FALLBACK_PROFILES
          }
        />
        <Button type="primary" icon={<ThunderboltFilled />} loading={loading} onClick={handleNormalize}>
          Chuẩn hóa
        </Button>
        <Tooltip title="Copy toàn bộ văn bản để dán vào Word / Google Docs">
          <Button icon={<CopyOutlined />} onClick={handleCopyWord}>
            Copy Word
          </Button>
        </Tooltip>
        <Button icon={<DownloadOutlined />} onClick={handleDownload}>
          Tải .docx
        </Button>
        <Button icon={<UploadOutlined />} onClick={() => fileInputRef.current?.click()}>
          Mở .docx
        </Button>
        <Button icon={<AuditOutlined />} onClick={onOpenLogicModal}>
          Rà soát
        </Button>
        <Button icon={<FileTextOutlined />} onClick={onOpenTemplatesModal}>
          Mẫu chuẩn
        </Button>
        <Button icon={<BankOutlined />} onClick={onOpenUnitModal}>
          Đơn vị
        </Button>
      </div>

      {!SF_LICENSE && (
        <Alert
          type="warning"
          showIcon
          banner
          message="Chưa cấu hình license Syncfusion (NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY) — đang chạy bản dùng thử."
        />
      )}

      <DocumentEditorContainerComponent
        ref={containerRef}
        id="3dohub-sf-doc-editor"
        height="calc(100vh - 230px)"
        style={{ minHeight: 620 }}
        enableToolbar
        toolbarItems={TOOLBAR_ITEMS as never}
        showPropertiesPane={false}
        enableSpellCheck={false}
        created={() => setReady(true)}
      />
    </div>
  );
};

