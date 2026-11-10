'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Radio, Input, Typography, message } from 'antd';
import { ScissorOutlined, DownloadOutlined, FileZipOutlined } from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { PdfFileSummary, PdfPageGrid, PdfResultBanner } from './PdfCommon';
import { PdfPageThumbnailCard } from './PdfPageThumbnailCard';
import { PdfPagePreviewModal } from './PdfPagePreviewModal';
import { PdfLoadedFile, PdfPageItem, SplitMode, SplitResult } from '../types/pdf';
import {
  buildPageItems,
  downloadBlob,
  extractPdfPages,
  formatBytes,
  loadThumbnails,
  parsePageRangeString,
  readPdfFile,
  splitPdfIntoZip,
} from '../services/pdf-engine';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text } = Typography;

export const PdfSplitTab: React.FC = () => {
  const isMobile = useIsMobile();
  const [loadedFile, setLoadedFile] = useState<PdfLoadedFile | null>(null);
  const [mode, setMode] = useState<SplitMode>('CUSTOM_RANGE');
  const [rangeInput, setRangeInput] = useState('1');
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [previewPage, setPreviewPage] = useState<number | null>(null);
  const signalRef = useRef({ cancelled: false });

  useEffect(() => () => { signalRef.current.cancelled = true; }, []);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    try {
      const info = await readPdfFile(files[0]);
      signalRef.current.cancelled = true;
      const signal = { cancelled: false };
      signalRef.current = signal;
      setLoadedFile(info);
      setResult(null);
      setPages(buildPageItems(info.pageCount, true));
      setRangeInput('1');
      void loadThumbnails(
        info.arrayBuffer,
        info.pageCount,
        (i, url) => setPages((prev) => prev.map((p) => (p.pageIndex === i ? { ...p, thumbnailUrl: url } : p))),
        signal
      );
    } catch {
      message.error('Không đọc được file PDF này.');
    }
  };

  const applySelection = (updater: (p: PdfPageItem) => boolean) => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, selected: updater(p) }));
      setRangeInput(updated.filter((p) => p.selected).map((p) => p.pageNumber).join(', '));
      return updated;
    });
  };

  const handleRangeChange = (val: string) => {
    setRangeInput(val);
    if (!loadedFile) return;
    const set = new Set(parsePageRangeString(val, loadedFile.pageCount));
    setPages((prev) => prev.map((p) => ({ ...p, selected: set.has(p.pageIndex) })));
  };

  const handleSplit = async () => {
    if (!loadedFile) return;
    setProcessing(true);
    try {
      const baseName = loadedFile.name.replace(/\.pdf$/i, '');
      if (mode === 'SPLIT_EACH') {
        const zipBlob = await splitPdfIntoZip(loadedFile.arrayBuffer, loadedFile.name);
        setResult({ mode, files: [], zipBlob, downloadFilename: `${baseName}_TungTrang.zip` });
      } else {
        const idx = pages.filter((p) => p.selected).map((p) => p.pageIndex);
        if (idx.length === 0) {
          message.warning('Hãy chọn ít nhất 1 trang.');
          return;
        }
        const bytes = await extractPdfPages(loadedFile.arrayBuffer, idx);
        setResult({
          mode,
          files: [],
          singleBlob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
          downloadFilename: `${baseName}_Trang_${idx.map((i) => i + 1).slice(0, 3).join('_')}.pdf`,
        });
      }
    } catch (err: any) {
      message.error(err.message || 'Không tách được file.');
    } finally {
      setProcessing(false);
    }
  };

  if (!loadedFile) return <PdfDropzone onFilesSelected={handleFileSelected} />;

  const selectedCount = pages.filter((p) => p.selected).length;
  const previewItem = pages.find((p) => p.pageNumber === previewPage);

  return (
    <Card style={{ borderRadius: 6, border: '1px solid #E2E8F0' }} styles={{ body: { padding: isMobile ? 12 : 20 } }}>
      <PdfFileSummary
        name={loadedFile.name}
        meta={`${formatBytes(loadedFile.sizeBytes)} • ${loadedFile.pageCount} trang`}
        onChange={() => setLoadedFile(null)}
      />

      <Text strong style={{ display: 'block', marginBottom: 8, color: '#0F172A' }}>Phương thức</Text>
      <Radio.Group
        value={mode}
        onChange={(e) => { setMode(e.target.value); setResult(null); }}
        optionType="button"
        buttonStyle="solid"
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 16 }}
      >
        <Radio.Button value="CUSTOM_RANGE" style={{ textAlign: 'center' }}>Trích xuất</Radio.Button>
        <Radio.Button value="SPLIT_EACH" style={{ textAlign: 'center' }}>Tách từng trang</Radio.Button>
      </Radio.Group>

      {mode === 'CUSTOM_RANGE' && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 8, flexWrap: 'wrap' }}>
            <Text strong style={{ color: '#0F172A' }}>Trang cần trích xuất ({selectedCount})</Text>
            <div style={{ display: 'flex', gap: 6 }}>
              <Button size="small" onClick={() => applySelection(() => true)} style={{ borderRadius: 4 }}>Chọn hết</Button>
              <Button size="small" onClick={() => applySelection(() => false)} style={{ borderRadius: 4 }}>Bỏ chọn</Button>
            </div>
          </div>
          <Input
            value={rangeInput}
            onChange={(e) => handleRangeChange(e.target.value)}
            placeholder="Ví dụ: 1-3, 5, 8-10"
            allowClear
            style={{ borderRadius: 4 }}
          />
        </div>
      )}

      <Text strong style={{ display: 'block', marginBottom: 8, color: '#0F172A' }}>Xem trước</Text>
      <div style={{ marginBottom: 16 }}>
        <PdfPageGrid>
          {pages.map((p) => (
            <PdfPageThumbnailCard
              key={p.pageIndex}
              page={p}
              selectable={mode === 'CUSTOM_RANGE'}
              onToggleSelect={(i) => applySelection((x) => (x.pageIndex === i ? !x.selected : x.selected))}
              onPreview={setPreviewPage}
            />
          ))}
        </PdfPageGrid>
      </div>

      {!result ? (
        <Button
          type="primary"
          size="large"
          block={isMobile}
          icon={mode === 'SPLIT_EACH' ? <FileZipOutlined /> : <ScissorOutlined />}
          loading={processing}
          onClick={handleSplit}
          style={{ borderRadius: 4, background: '#1D4ED8', fontWeight: 600 }}
        >
          {mode === 'SPLIT_EACH' ? `Tách ${loadedFile.pageCount} file (ZIP)` : `Trích xuất ${selectedCount} trang`}
        </Button>
      ) : (
        <PdfResultBanner
          title="Đã tách xong"
          downloadLabel={result.zipBlob ? 'Tải file ZIP' : 'Tải file PDF'}
          downloadIcon={result.zipBlob ? <FileZipOutlined /> : <DownloadOutlined />}
          onDownload={() => {
            const blob = result.zipBlob || result.singleBlob;
            if (blob) downloadBlob(blob, result.downloadFilename);
          }}
          againLabel="Tách lại"
          onAgain={() => setResult(null)}
        >
          <Text style={{ fontSize: 13, wordBreak: 'break-all' }}>{result.downloadFilename}</Text>
        </PdfResultBanner>
      )}

      <PdfPagePreviewModal
        open={previewPage !== null}
        buffer={loadedFile.arrayBuffer}
        pageNumber={previewPage || 1}
        totalPages={loadedFile.pageCount}
        rotation={previewItem?.rotation || 0}
        onNavigate={setPreviewPage}
        onClose={() => setPreviewPage(null)}
      />
    </Card>
  );
};
