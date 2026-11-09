'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Button,
  Drawer,
  Input,
  Slider,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import {
  ZoomInOutlined,
  ZoomOutOutlined,
  SearchOutlined,
  CloseOutlined,
  LayoutOutlined,
} from '@ant-design/icons';
import { NormalizedDocResult, ProfileItem } from '@/types/api';
import { extractDocumentTextFromA4Sheet } from '../utils/dom-text-extractor';
import { WordRibbonToolbar } from './WordRibbonToolbar';
import { WordInspectorSidebar } from './WordInspectorSidebar';

const { Text } = Typography;

export interface VirtualDocEditorProps {
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

export const VirtualDocEditor: React.FC<VirtualDocEditorProps> = ({
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const a4SheetRef = useRef<HTMLDivElement | null>(null);
  const canvasViewportRef = useRef<HTMLDivElement | null>(null);

  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [findBarOpen, setFindBarOpen] = useState<boolean>(false);
  const [pageSetupOpen, setPageSetupOpen] = useState<boolean>(false);
  const [findQuery, setFindQuery] = useState<string>('');
  const [replaceQuery, setReplaceQuery] = useState<string>('');
  const [showInspector, setShowInspector] = useState<boolean>(true);
  const [showPageNumber, setShowPageNumber] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [viewportWidth, setViewportWidth] = useState<number>(1280);
  const inputDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isMobile = viewportWidth < 768;
  const isCompactInspector = viewportWidth < 1120;

  const recalculatePages = () => {
    if (!a4SheetRef.current) return;
    // 297mm at 96 DPI is ~1122.5px
    const singlePagePx = 1122;
    const rawHeight = a4SheetRef.current.scrollHeight || singlePagePx;
    const computedPages = Math.max(1, Math.ceil((rawHeight - 40) / singlePagePx));
    setTotalPages(computedPages);
  };

  /**
   * Extract live administrative document text from current A4 canvas DOM.
   * Preserves user modifications to text, titles, numbers, and yellow placeholders.
   */
  const getCurrentDocText = (): string => {
    if (!a4SheetRef.current) return rawText;
    const extracted = extractDocumentTextFromA4Sheet(a4SheetRef.current);
    if (extracted && extracted.trim().length > 10) {
      return extracted;
    }
    return rawText;
  };

  const handleTriggerNormalize = (textOverride?: string) => {
    const textToUse = textOverride !== undefined ? textOverride : getCurrentDocText();
    onChangeRawText(textToUse);
    onNormalize(textToUse);
  };

  const handleEditorChangeProfile = (pid: string) => {
    const textToUse = getCurrentDocText();
    onChangeRawText(textToUse);
    onChangeProfile(pid, textToUse);
  };

  const handleSheetInput = () => {
    recalculatePages();
    if (inputDebounceTimerRef.current) {
      clearTimeout(inputDebounceTimerRef.current);
    }
    inputDebounceTimerRef.current = setTimeout(() => {
      const text = getCurrentDocText();
      if (text && text.trim().length > 10) {
        onChangeRawText(text);
      }
    }, 600);
  };

  // Sync normalized A4 HTML into the interactive A4 canvas when normResult updates
  useEffect(() => {
    if (normResult?.a4_preview_html && a4SheetRef.current) {
      a4SheetRef.current.innerHTML = normResult.a4_preview_html;
      setTimeout(recalculatePages, 60);
    }
  }, [normResult]);

  // Responsive auto-fit on mobile, tablet & smaller laptop screens so 210mm (794px) A4 never clips horizontally
  useEffect(() => {
    const updateResponsiveZoom = () => {
      const vw = window.innerWidth;
      setViewportWidth(vw);
      if (vw < 840) {
        setShowInspector(false);
        const fittedZoom = Math.max(44, Math.min(95, Math.floor(((vw - 36) / 794) * 100)));
        setZoomPercent(fittedZoom);
      } else if (vw < 1120) {
        setShowInspector(false);
        setZoomPercent(85);
      } else if (vw < 1360) {
        setShowInspector(true);
        setZoomPercent(92);
      } else {
        setShowInspector(true);
        setZoomPercent(100);
      }
    };
    updateResponsiveZoom();
    window.addEventListener('resize', updateResponsiveZoom);
    return () => window.removeEventListener('resize', updateResponsiveZoom);
  }, []);

  const handleExecCommand = (cmd: string, value?: string) => {
    if (!a4SheetRef.current) return;
    a4SheetRef.current.focus();
    document.execCommand(cmd, false, value);
  };

  const handleNewBlankDoc = () => {
    if (a4SheetRef.current) {
      a4SheetRef.current.innerHTML = `
        <div class="a4-sheet" style="font-family:'Times New Roman',Times,serif;font-size:14pt;line-height:1.35;color:#000;background:#fff;width:100%;max-width:210mm;min-height:297mm;margin:0 auto;padding:20mm 15mm 20mm 30mm;box-sizing:border-box;">
          <p style="margin:0 0 6pt 0;text-indent:1.27cm;">Nhập hoặc dán nội dung văn bản hành chính vào đây...</p>
        </div>
      `;
    }
    onChangeRawText('');
    message.info('Đã tạo trang soạn thảo A4 mới.');
  };

  const handleInsertTable = () => {
    const html = `
      <table style="width:100%;border-collapse:collapse;margin:8pt 0;font-family:'Times New Roman',serif;font-size:13pt;">
        <tr>
          <td style="border:1px solid #000;padding:4pt 6pt;font-weight:bold;text-align:center;">STT</td>
          <td style="border:1px solid #000;padding:4pt 6pt;font-weight:bold;text-align:center;">Nội dung công việc</td>
          <td style="border:1px solid #000;padding:4pt 6pt;font-weight:bold;text-align:center;">Đơn vị thực hiện</td>
        </tr>
        <tr>
          <td style="border:1px solid #000;padding:4pt 6pt;text-align:center;">1</td>
          <td style="border:1px solid #000;padding:4pt 6pt;">...</td>
          <td style="border:1px solid #000;padding:4pt 6pt;">...</td>
        </tr>
      </table>
    `;
    handleExecCommand('insertHTML', html);
  };

  const handleInsertHeaderTable = () => {
    const html = `
      <table style="width:100%;border-collapse:collapse;border:none;margin-bottom:10pt;font-family:'Times New Roman',serif;">
        <tr>
          <td style="width:44%;vertical-align:top;text-align:center;border:none;padding:0;">
            <div style="font-size:12pt;">TÊN CƠ QUAN CẤP TRÊN</div>
            <div style="font-size:12pt;font-weight:bold;">TÊN CƠ QUAN BAN HÀNH</div>
            <div style="width:35%;margin:2pt auto 4pt auto;border-bottom:1pt solid #000;"></div>
            <div style="font-size:13pt;">Số: .../...</div>
          </td>
          <td style="width:56%;vertical-align:top;text-align:center;border:none;padding:0;">
            <div style="font-size:12pt;font-weight:bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
            <div style="font-size:13pt;font-weight:bold;">Độc lập - Tự do - Hạnh phúc</div>
            <div style="width:45%;margin:2pt auto 6pt auto;border-bottom:1pt solid #000;"></div>
            <div style="font-size:13pt;font-style:italic;">Địa danh, ngày ... tháng ... năm 2026</div>
          </td>
        </tr>
      </table>
    `;
    handleExecCommand('insertHTML', html);
  };

  const handleInsertFooterTable = () => {
    const html = `
      <table style="width:100%;border-collapse:collapse;border:none;margin-top:14pt;font-family:'Times New Roman',serif;">
        <tr>
          <td style="width:48%;vertical-align:top;border:none;padding:0;font-size:11pt;">
            <div style="font-size:12pt;font-weight:bold;font-style:italic;text-decoration:underline;">Nơi nhận:</div>
            <div>- Như trên;</div>
            <div>- Lưu: VT.</div>
          </td>
          <td style="width:52%;vertical-align:top;text-align:center;border:none;padding:0;font-size:13pt;">
            <div style="font-weight:bold;">QUYỀN HẠN, CHỨC VỤ NGƯỜI KÝ</div>
            <div style="height:48pt;"></div>
            <div style="font-weight:bold;">Họ và tên</div>
          </td>
        </tr>
      </table>
    `;
    handleExecCommand('insertHTML', html);
  };

  const handleInsertPageBreak = () => {
    const html = `<div style="page-break-after:always;border-bottom:1px dashed #94A3B8;margin:16pt 0;text-align:center;font-size:10pt;color:#64748B;">--- Ngắt trang (Page Break) ---</div>`;
    handleExecCommand('insertHTML', html);
  };

  const handleApplyTableBorderStyle = (bordered: boolean) => {
    if (!a4SheetRef.current) return;
    const tables = a4SheetRef.current.querySelectorAll('table');
    tables.forEach((tbl) => {
      const cells = tbl.querySelectorAll('td, th');
      cells.forEach((cell) => {
        (cell as HTMLElement).style.border = bordered ? '1px solid #000000' : 'none';
      });
    });
    message.success(bordered ? 'Đã bật đường viền bảng' : 'Đã ẩn đường viền bảng (chuẩn thể thức)');
  };

  const handleApplyParagraphIndent = (indentCm: string) => {
    if (!a4SheetRef.current) return;
    const paras = a4SheetRef.current.querySelectorAll('p');
    paras.forEach((p) => {
      (p as HTMLElement).style.textIndent = indentCm;
    });
    message.success(`Đã áp dụng thụt lề đoạn văn ${indentCm}`);
  };

  const handleReplaceAll = () => {
    if (!findQuery.trim() || !a4SheetRef.current) return;
    const currentHtml = a4SheetRef.current.innerHTML;
    const escaped = findQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    a4SheetRef.current.innerHTML = currentHtml.replace(regex, replaceQuery);
    message.success(`Đã thay thế "${findQuery}" thành "${replaceQuery}"`);
  };

  const handleCopyMsoWordFormat = async () => {
    // Extract inner content from interactive A4 sheet without outer canvas wrapper styles
    const sheetEl =
      a4SheetRef.current?.querySelector<HTMLElement>('.a4-preview-sheet, .a4-sheet') ||
      a4SheetRef.current;
    const liveInner = sheetEl ? sheetEl.innerHTML : normResult?.a4_preview_html || '';
    const msoHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset='utf-8'>
<style>
@page Section1 {size:21.0cm 29.7cm; margin:2.0cm 1.5cm 2.0cm 3.0cm; mso-header-margin:1.0cm; mso-footer-margin:1.0cm; mso-title-page:yes;}
div.Section1 {page:Section1; font-family:'Times New Roman',serif;}
table {border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;}
u {text-decoration:underline;}
b, strong {font-weight:bold;}
i, em {font-style:italic;}
</style></head>
<body><div class='Section1'>${liveInner}</div></body></html>`;

    const plainText = a4SheetRef.current?.innerText || normResult?.normalized_text || rawText;

    try {
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        const htmlBlob = new Blob([msoHtml], { type: 'text/html' });
        const textBlob = new Blob([plainText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({ 'text/html': htmlBlob, 'text/plain': textBlob }),
        ]);
        message.success(
          'Đã Copy chuẩn định dạng Microsoft Word! Bấm Ctrl+V vào Word giữ nguyên bảng 2 cột & Times New Roman.'
        );
        return;
      }
    } catch {
      // Fallback DOM copy
    }

    if (a4SheetRef.current) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(a4SheetRef.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
      document.execCommand('copy');
      selection?.removeAllRanges();
      message.success('Đã Copy trang A4 chuẩn! Hãy nhấn Ctrl+V vào Microsoft Word.');
    }
  };

  const handleDownloadDocx = () => {
    const liveText = getCurrentDocText();
    // Auto re-normalize if user made edits on A4 canvas before downloading docx
    if (liveText && normResult && liveText.trim() !== normResult.normalized_text?.trim()) {
      message.info('Đang đồng bộ hóa nội dung vừa sửa trước khi tải tệp .DOCX...');
      handleTriggerNormalize(liveText);
      return;
    }

    if (!normResult?.docx_base64) {
      message.warning('Vui lòng bấm [Chuẩn Hóa Thể Thức] trước khi tải tệp .DOCX!');
      return;
    }
    const byteCharacters = atob(normResult.docx_base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = normResult.docx_filename || 'VanBan_ChuanHoa_3DoHub.docx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`Đã tải về tệp ${normResult.docx_filename}`);
  };

  return (
    <div
      style={{
        border: '1px solid #CBD5E1',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)',
      }}
    >
      {/* Hidden DOCX File Input */}
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

      {/* 1. Top Word Ribbon Toolbar */}
      <WordRibbonToolbar
        profiles={profiles}
        selectedProfile={selectedProfile}
        appliedProfileName={normResult?.profile_name}
        mismatchWarning={normResult?.mismatch_warning}
        onChangeProfile={handleEditorChangeProfile}
        onNewDoc={handleNewBlankDoc}
        onOpenDocx={() => fileInputRef.current?.click()}
        onExecCommand={handleExecCommand}
        onInsertTable={handleInsertTable}
        onInsertHeaderTable={handleInsertHeaderTable}
        onInsertFooterTable={handleInsertFooterTable}
        onInsertPageNumber={() => setShowPageNumber((prev) => !prev)}
        onInsertPageBreak={handleInsertPageBreak}
        onTogglePageSetup={() => setPageSetupOpen((prev) => !prev)}
        onToggleFindBar={() => setFindBarOpen((prev) => !prev)}
        findBarOpen={findBarOpen}
        pageSetupOpen={pageSetupOpen}
        onOpenTemplatesModal={onOpenTemplatesModal}
        onOpenUnitModal={onOpenUnitModal}
        onOpenLogicModal={onOpenLogicModal}
        onNormalize={() => handleTriggerNormalize()}
        onCopyWordFormat={handleCopyMsoWordFormat}
        onDownloadDocx={handleDownloadDocx}
        loading={loading}
        warningsCount={normResult?.warnings_count || 0}
      />

      {/* Optional Find & Replace Bar */}
      {findBarOpen && (
        <div
          style={{
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <SearchOutlined style={{ color: '#1D4ED8' }} />
          <Input
            size="small"
            placeholder="Tìm từ khóa (VD: [Nội dung])..."
            value={findQuery}
            onChange={(e) => setFindQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <Input
            size="small"
            placeholder="Thay thế bằng..."
            value={replaceQuery}
            onChange={(e) => setReplaceQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <Button size="small" type="primary" onClick={handleReplaceAll}>
            Thay thế tất cả
          </Button>
          <Button
            size="small"
            type="text"
            icon={<CloseOutlined />}
            onClick={() => setFindBarOpen(false)}
          />
        </div>
      )}

      {/* Optional Page Setup Bar */}
      {pageSetupOpen && (
        <div
          style={{
            background: '#EFF6FF',
            borderBottom: '1px solid #BFDBFE',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            fontSize: 12,
          }}
        >
          <Space wrap>
            <Tag color="blue" style={{ margin: 0 }}>
              Khổ giấy chuẩn: A4 (210mm × 297mm)
            </Tag>
            <Text style={{ fontSize: 12 }}>
              Lề trên: <b>20mm</b> • Lề dưới: <b>20mm</b> • Lề trái: <b>30mm</b> • Lề phải: <b>15mm</b>
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              (Theo QĐ 399-QĐ/TW, HD 05-HD/VPTW & Nghị định 30/2020/NĐ-CP)
            </Text>
          </Space>
          <Button size="small" type="text" onClick={() => setPageSetupOpen(false)}>
            Đóng
          </Button>
        </div>
      )}

      {/* 2. Center A4 Workspace + Right Properties Sidebar */}
      <div style={{ display: 'flex', flex: 1, minHeight: 680, maxHeight: 'calc(100vh - 180px)' }}>
        {/* Center Gray Word Document Viewport */}
        <div
          ref={canvasViewportRef}
          onScroll={(e) => {
            const scrollTop = e.currentTarget.scrollTop;
            const scaledPagePx = 1122 * (zoomPercent / 100);
            const pageIdx = Math.min(
              totalPages,
              Math.max(1, Math.floor((scrollTop + scaledPagePx * 0.35) / scaledPagePx) + 1)
            );
            setCurrentPage(pageIdx);
          }}
          style={{
            flex: 1,
            background: '#F1F5F9',
            overflow: 'auto',
            padding: '24px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: 0,
          }}
        >
          <div
            style={{
              width: '210mm',
              transform: `scale(${zoomPercent / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.15s ease',
            }}
          >
            {showPageNumber && (
              <div
                style={{
                  textAlign: 'center',
                  fontSize: 11,
                  color: '#64748B',
                  marginBottom: 4,
                  fontFamily: "'Times New Roman', Times, serif",
                }}
              >
                Khổ A4 chuẩn ({totalPages} trang)
              </div>
            )}
            <div
              ref={a4SheetRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleSheetInput}
              onPaste={(e) => {
                const pastedText = e.clipboardData?.getData('text/plain');
                if (pastedText && pastedText.trim().length > 20) {
                  onChangeRawText(pastedText);
                }
                setTimeout(recalculatePages, 80);
              }}
              style={{
                outline: 'none',
                boxShadow: '0 4px 20px rgba(15, 23, 42, 0.12)',
                background: '#FFFFFF',
                minHeight: '297mm',
              }}
            />
          </div>
        </div>

        {/* Right TEXT / TABLE / DÁN THÔ Properties Sidebar (Inline on desktop, Drawer on compact/mobile) */}
        {!isCompactInspector && showInspector && (
          <WordInspectorSidebar
            rawText={rawText}
            onChangeRawText={onChangeRawText}
            onNormalize={() => handleTriggerNormalize(rawText)}
            onExecCommand={handleExecCommand}
            onApplyTableBorderStyle={handleApplyTableBorderStyle}
            onInsertHeaderTable={handleInsertHeaderTable}
            onInsertFooterTable={handleInsertFooterTable}
            onApplyParagraphIndent={handleApplyParagraphIndent}
            loading={loading}
          />
        )}

        {isCompactInspector && (
          <Drawer
            title="Thuộc tính văn bản & Bảng biểu"
            placement="right"
            width={290}
            open={showInspector}
            onClose={() => setShowInspector(false)}
            styles={{ body: { padding: 0 } }}
          >
            <WordInspectorSidebar
              rawText={rawText}
              onChangeRawText={onChangeRawText}
              onNormalize={() => {
                handleTriggerNormalize(rawText);
                setShowInspector(false);
              }}
              onExecCommand={handleExecCommand}
              onApplyTableBorderStyle={handleApplyTableBorderStyle}
              onInsertHeaderTable={handleInsertHeaderTable}
              onInsertFooterTable={handleInsertFooterTable}
              onApplyParagraphIndent={handleApplyParagraphIndent}
              loading={loading}
            />
          </Drawer>
        )}
      </div>

      {/* 3. Bottom Word Status Bar (Responsive across mobile & desktop) */}
      <div
        style={{
          minHeight: 34,
          background: '#F8FAFC',
          borderTop: '1px solid #E2E8F0',
          padding: isMobile ? '4px 10px' : '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 6,
          fontSize: 12,
          color: '#334155',
        }}
      >
        <Space size={8} wrap>
          <span>
            Page{' '}
            <span
              style={{
                display: 'inline-block',
                border: '1px solid #CBD5E1',
                background: '#FFFFFF',
                padding: '0 6px',
                borderRadius: 3,
                fontWeight: 600,
                margin: '0 3px',
              }}
            >
              {currentPage}
            </span>{' '}
            of {totalPages}
          </span>
          {normResult && (
            <>
              <Tag
                color={normResult.profile_source === 'AUTO' ? 'cyan' : 'blue'}
                style={{ margin: 0, fontSize: 11, borderRadius: 3 }}
              >
                {normResult.profile_source === 'AUTO' ? 'Tự động nhận diện: ' : 'Khối: '}
                {normResult.profile_name}
              </Tag>
              {!isMobile && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {normResult.stats.lines_processed} đoạn văn • {normResult.stats.execution_ms} ms
                </Text>
              )}
            </>
          )}
        </Space>

        <Space size={6}>
          <ZoomOutOutlined
            style={{ cursor: 'pointer', color: '#64748B' }}
            onClick={() => setZoomPercent((z) => Math.max(40, z - 10))}
          />
          {!isMobile && (
            <Slider
              min={45}
              max={130}
              step={5}
              value={zoomPercent}
              onChange={(val) => setZoomPercent(val)}
              style={{ width: 85, margin: 0 }}
            />
          )}
          <ZoomInOutlined
            style={{ cursor: 'pointer', color: '#64748B' }}
            onClick={() => setZoomPercent((z) => Math.min(130, z + 10))}
          />
          <span style={{ minWidth: 36, textAlign: 'right', fontWeight: 600 }}>
            {zoomPercent}%
          </span>
          <Button
            size="small"
            type={showInspector ? 'primary' : 'default'}
            ghost={showInspector}
            icon={<LayoutOutlined />}
            onClick={() => setShowInspector((prev) => !prev)}
            style={{ marginLeft: 2, fontSize: 11 }}
          >
            {isMobile ? 'Thuộc tính' : 'Bảng thuộc tính'}
          </Button>
        </Space>
      </div>
    </div>
  );
};
