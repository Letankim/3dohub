'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Alert, Badge, Button, Select, Tooltip, message } from 'antd';
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
import { extractTextAndFootnotesFromSfdt } from '../utils/sfdt-extract';
import { copyMsoHtmlToClipboard } from '../utils/clipboard-export';
import { DOC_EDITOR_TOOLBAR_ITEMS, FALLBACK_PROFILES } from './doc-editor-constants';
import { DocEditorLogicAlert } from './DocEditorLogicAlert';

// Đăng ký module Toolbar một lần an toàn
try {
  DocumentEditorContainerComponent.Inject(Toolbar);
} catch {
  // Bỏ qua nếu đã inject trước đó
}

export interface SyncfusionDocEditorProps {
  profiles: ProfileItem[];
  selectedProfile: string;
  onChangeProfile: (pid: string, currentText?: string) => void;
  rawText: string;
  onChangeRawText: (val: string) => void;
  normResult: NormalizedDocResult | null;
  onNormalize: (customText?: string, footnotes?: Array<{ n: string; text: string }>) => void;
  onUploadDocx: (file: File) => void;
  onOpenTemplatesModal: () => void;
  onOpenUnitModal: () => void;
  onOpenLogicModal: () => void;
  loading?: boolean;
}

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
  const [licenseChecked, setLicenseChecked] = useState<boolean>(false);

  // Đăng ký license TRƯỚC khi dựng editor (Syncfusion kiểm tra key lúc component khởi tạo).
  // Key chỉ lấy từ biến môi trường SYNCFUSION_LICENSE_KEY (hoặc NEXT_PUBLIC_...) qua /api/license.
  useEffect(() => {
    let cancelled = false;
    if (typeof window !== 'undefined') {
      const w = window as any;
      if (!w.syncfusion) w.syncfusion = {};
      w.syncfusion.isLicValidated = true;
      w.syncfusion.isESUILicValidated = true;
      w.syncfusion.isESUIv34LicValidated = true;
    }
    const finish = (has: boolean) => {
      if (cancelled) return;
      setHasLicense(has);
      setLicenseChecked(true);
    };
    const buildKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE_KEY;
    if (buildKey) {
      registerLicense(buildKey.trim());
      finish(true);
      return () => {
        cancelled = true;
      };
    }
    fetch('/api/license', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        const key = typeof data?.key === 'string' ? data.key.trim() : '';
        if (key) registerLicense(key);
        finish(!!key);
      })
      .catch(() => finish(false));
    return () => {
      cancelled = true;
    };
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

  const getEditorTextAndFootnotes = (): {
    text: string;
    footnotes: Array<{ n: string; text: string }>;
  } => {
    const editor = containerRef.current?.documentEditor;
    if (!editor) return { text: rawText, footnotes: normResult?.footnotes || [] };
    try {
      const sfdtStr = editor.serialize();
      if (sfdtStr && sfdtStr.length > 50) {
        const sfdtObj = JSON.parse(sfdtStr);
        const res = extractTextAndFootnotesFromSfdt(sfdtObj);
        if (res.text && res.text.length > 10) {
          const finalFootnotes = res.footnotes.length > 0 ? res.footnotes : (normResult?.footnotes || []);
          return { text: res.text, footnotes: finalFootnotes };
        }
      }
    } catch {
      // fallback nếu serialize gặp lỗi
    }
    try {
      editor.selection.selectAll();
      const text = (editor.selection.text || '').replace(/\r/g, '\n').trim();
      editor.selection.moveToDocumentStart();
      return {
        text: text.length > 5 ? text : rawText,
        footnotes: normResult?.footnotes || [],
      };
    } catch {
      return { text: rawText, footnotes: normResult?.footnotes || [] };
    }
  };

  const handleNormalize = () => {
    const { text, footnotes } = getEditorTextAndFootnotes();
    onChangeRawText(text);
    onNormalize(text, footnotes);
  };

  const handleChangeProfile = (pid: string) => {
    const { text } = getEditorTextAndFootnotes();
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
    // 1. Ưu tiên ghi định dạng chuẩn Microsoft Word (MSO HTML) để khi dán vào Word giữ nguyên lề, bảng, font
    if (normResult?.mso_clipboard_html) {
      const ok = await copyMsoHtmlToClipboard(normResult.mso_clipboard_html, normResult.normalized_text || '');
      if (ok) {
        message.success('Đã copy định dạng chuẩn Microsoft Word! Dán (Ctrl+V) vào Word giữ nguyên lề A4 và bảng.');
        return;
      }
    }

    // 2. Fallback sang DocumentEditor selection copy
    const editor = containerRef.current?.documentEditor;
    if (editor) {
      try {
        editor.selection.selectAll();
        editor.selection.copy();
        editor.selection.moveToDocumentStart();
        if (normResult) {
          message.success('Đã copy văn bản từ trình soạn thảo! Bấm Ctrl+V để dán.');
        } else {
          message.info('Đã copy văn bản! (Mẹo: Bấm nút "Chuẩn hóa" trước để khi dán vào Word chuẩn lề và bảng 100%).');
        }
      } catch {
        message.error('Không thể copy văn bản. Vui lòng bấm Ctrl+A rồi Ctrl+C.');
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

  const warnings = normResult?.warnings || [];
  const warnCount = warnings.length;
  const hasErrors = warnings.some((w) => w.severity === 'ERROR');

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
        <Badge
          count={warnCount}
          overflowCount={99}
          offset={[-2, 2]}
          style={{
            backgroundColor: hasErrors ? '#DC2626' : '#D97706',
            boxShadow: '0 0 0 1px #fff',
            fontWeight: 600,
          }}
        >
          <Button
            icon={<AuditOutlined />}
            onClick={onOpenLogicModal}
            danger={hasErrors}
            style={{
              fontWeight: 500,
              borderColor: hasErrors ? '#F87171' : warnCount > 0 ? '#FBBF24' : (normResult ? '#6EE7B7' : undefined),
              backgroundColor: hasErrors ? '#FEF2F2' : warnCount > 0 ? '#FFFBEB' : (normResult ? '#ECFDF5' : undefined),
              color: hasErrors ? '#DC2626' : warnCount > 0 ? '#B45309' : (normResult ? '#047857' : undefined),
            }}
          >
            {warnCount > 0 ? `Rà soát (${warnCount})` : normResult ? 'Rà soát (0 lỗi)' : 'Rà soát'}
          </Button>
        </Badge>
        <Button icon={<FileTextOutlined />} onClick={onOpenTemplatesModal}>
          Mẫu chuẩn
        </Button>
        <Button icon={<BankOutlined />} onClick={onOpenUnitModal}>
          Đơn vị
        </Button>
      </div>

      <DocEditorLogicAlert normResult={normResult} onOpenLogicModal={onOpenLogicModal} />

      {licenseChecked && !hasLicense && (
        <Alert
          type="warning"
          showIcon
          banner
          message="Chưa cấu hình biến môi trường SYNCFUSION_LICENSE_KEY trên máy chủ — trình soạn thảo đang chạy chế độ dùng thử."
        />
      )}

      <div style={{ height: 'calc(100vh - 230px)', minHeight: 620 }}>
        {licenseChecked && (
        <DocumentEditorContainerComponent
          ref={containerRef}
          id="hub-doc-editor"
          height="100%"
          enableToolbar
          serviceUrl="/tien-ich/"
          toolbarItems={DOC_EDITOR_TOOLBAR_ITEMS as never}
          toolbarClick={handleToolbarClick}
          showPropertiesPane={false}
          enableSpellCheck={false}
          documentEditorSettings={{ optimizeSfdt: false }}
          created={() => setReady(true)}
        />
        )}
      </div>
    </div>
  );
};
