'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Select, Tooltip, message } from 'antd';
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
import { stripFootnotes, textToSfdt } from '../utils/sfdt-utils';

// Khóa bản quyền chính thức Syncfusion (Hỗ trợ cấu hình từ ENV hoặc chạy key dự phòng)
const DEFAULT_SYNCFUSION_LICENSE =
  process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY ||
  process.env.SYNCFUSION_LICENSE_KEY ||
  'Ngo9BigBOggjGy1/VkN+XU9HcVRAXWFPY1J0WGNQb192f1ZFal1RT3RFQFtiSH5ad0NgXH1ddnJQRGtfVA==';

// Đăng ký license NGAY LẬP TỨC ở module scope trước khi bất kỳ component nào mount
try {
  registerLicense(DEFAULT_SYNCFUSION_LICENSE);
} catch {
  // Bỏ qua nếu đã đăng ký
}

// Đăng ký module Toolbar một lần an toàn
try {
  DocumentEditorContainerComponent.Inject(Toolbar);
} catch {
  // Bỏ qua nếu đã inject trước đó
}

const TOOLBAR_ITEMS = [
  'New',
  'Open',
  'Separator',
  'Undo',
  'Redo',
  'Separator',
  'Image',
  'Table',
  'Hyperlink',
  'Bookmark',
  'TableOfContents',
  'Separator',
  'Header',
  'Footer',
  'PageSetup',
  'PageNumber',
  'Break',
  'InsertFootnote',
  'InsertEndnote',
  'Separator',
  'Find',
  'Comments',
  'TrackChanges',
  'LocalClipboard',
  'RestrictEditing',
  'FormFields',
  'UpdateFields',
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
  const initialLoadedRef = useRef<boolean>(false);
  const [ready, setReady] = useState(false);
  const [hasLicense, setHasLicense] = useState<boolean>(true);

  // Nhận license từ endpoint /api/license nếu có cập nhật mới
  useEffect(() => {
    fetch('/api/license')
      .then((res) => res.json())
      .then((data) => {
        if (data?.key) {
          try {
            registerLicense(data.key);
          } catch {
            // đã đăng ký
          }
          setHasLicense(true);
        }
      })
      .catch(() => setHasLicense(true));
  }, []);

  /** Mở tài liệu vào trình soạn thảo:
   * - Nếu có normResult.sfdt (sau khi bấm Chuẩn hóa hoặc chọn mẫu): mở bản chuẩn hóa
   * - Nếu chưa chuẩn hóa: nạp bản nháp ban đầu vào để người dùng soạn thảo
   */
  useEffect(() => {
    const editor = containerRef.current?.documentEditor;
    if (!ready || !editor) return;

    if (normResult?.sfdt) {
      try {
        editor.open(JSON.stringify(normResult.sfdt));
        initialLoadedRef.current = true;
      } catch {
        try {
          editor.open(JSON.stringify(stripFootnotes(normResult.sfdt)));
          initialLoadedRef.current = true;
          message.warning('Không dựng được chú thích cuối trang, đã hiển thị bản không có footnote.');
        } catch {
          message.error('Không mở được tài liệu trong trình soạn thảo.');
        }
      }
    } else if (!initialLoadedRef.current && rawText) {
      try {
        editor.open(JSON.stringify(textToSfdt(rawText)));
        initialLoadedRef.current = true;
      } catch {
        // bỏ qua
      }
    }
  }, [normResult, ready, rawText]);

  const getEditorText = (): string => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return rawText;
    try {
      editor.selection.selectAll();
      const text = (editor.selection.text || '').replace(/\r/g, '\n').trim();
      editor.selection.moveToDocumentStart();
      return text.length > 5 ? text : rawText;
    } catch {
      return rawText;
    }
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
    try {
      editor.save(base, 'Docx');
      message.success(`Đã tải về tệp ${base}.docx`);
    } catch {
      message.error('Không thể lưu file .docx từ trình soạn thảo.');
    }
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

  const handleToolbarClick = (args: any) => {
    const id = (args?.item?.id || '').toLowerCase();
    const text = (args?.item?.text || '').toLowerCase();
    if (id.includes('open') || text === 'open') {
      if (args) args.cancel = true;
      fileInputRef.current?.click();
    } else if (id.includes('new') || text === 'new') {
      if (args) args.cancel = true;
      const editor = containerRef.current?.documentEditor;
      if (editor) {
        editor.openBlank();
        onChangeRawText('');
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

      {!hasLicense && (
        <Alert
          type="info"
          showIcon
          banner
          message="Chưa cấu hình NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY hoặc SYNCFUSION_LICENSE_KEY — đang chạy chế độ Community dùng thử."
        />
      )}

      <div style={{ height: 'calc(100vh - 230px)', minHeight: 620 }}>
        <DocumentEditorContainerComponent
          ref={containerRef}
          id="hub-doc-editor"
          height="100%"
          enableToolbar
          toolbarItems={TOOLBAR_ITEMS as never}
          toolbarClick={handleToolbarClick}
          showPropertiesPane={false}
          enableSpellCheck={false}
          created={() => setReady(true)}
        />
      </div>
    </div>
  );
};
