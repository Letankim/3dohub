'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import { RotateRightOutlined, DownloadOutlined, UndoOutlined } from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { PdfFileSummary, PdfPageGrid, PdfResultBanner } from './PdfCommon';
import { PdfPageThumbnailCard } from './PdfPageThumbnailCard';
import { PdfPagePreviewModal } from './PdfPagePreviewModal';
import { PdfLoadedFile, PdfPageItem } from '../types/pdf';
import {
  buildPageItems,
  downloadBlob,
  formatBytes,
  loadThumbnails,
  organizePdfPages,
  readPdfFile,
} from '../services/pdf-engine';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text } = Typography;

export const PdfOrganizeTab: React.FC = () => {
  const isMobile = useIsMobile();
  const [loadedFile, setLoadedFile] = useState<PdfLoadedFile | null>(null);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [saved, setSaved] = useState<{ blob: Blob; name: string } | null>(null);
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
      setSaved(null);
      setPages(buildPageItems(info.pageCount));
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

  const patch = (pageIndex: number, fn: (p: PdfPageItem) => Partial<PdfPageItem>) =>
    setPages((prev) => prev.map((p) => (p.pageIndex === pageIndex ? { ...p, ...fn(p) } : p)));

  const handleSave = async () => {
    if (!loadedFile) return;
    setProcessing(true);
    try {
      const bytes = await organizePdfPages(loadedFile.arrayBuffer, pages);
      setSaved({
        blob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
        name: `${loadedFile.name.replace(/\.pdf$/i, '')}_DaSapXep.pdf`,
      });
    } catch (err: any) {
      message.error(err.message || 'Không lưu được file.');
    } finally {
      setProcessing(false);
    }
  };

  if (!loadedFile) return <PdfDropzone onFilesSelected={handleFileSelected} />;

  const activeCount = pages.filter((p) => !p.isDeleted).length;
  const hasChanges = pages.some((p) => p.rotation !== 0 || p.isDeleted);
  const previewItem = pages.find((p) => p.pageNumber === previewPage);

  return (
    <Card style={{ borderRadius: 6, border: '1px solid #E2E8F0' }} styles={{ body: { padding: isMobile ? 12 : 20 } }}>
      <PdfFileSummary
        name={loadedFile.name}
        meta={`${activeCount}/${loadedFile.pageCount} trang • ${formatBytes(loadedFile.sizeBytes)}`}
        onChange={() => setLoadedFile(null)}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <Button
          icon={<RotateRightOutlined />}
          onClick={() => setPages((prev) => prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 })))}
          style={{ borderRadius: 4 }}
        >
          Xoay tất cả
        </Button>
        {hasChanges && (
          <Button
            icon={<UndoOutlined />}
            onClick={() => setPages((prev) => prev.map((p) => ({ ...p, rotation: 0, isDeleted: false })))}
            style={{ borderRadius: 4 }}
          >
            Hoàn tác
          </Button>
        )}
      </div>

      <div style={{ marginBottom: 16 }}>
        <PdfPageGrid>
          {pages.map((p) => (
            <PdfPageThumbnailCard
              key={p.pageIndex}
              page={p}
              onPreview={setPreviewPage}
              onRotate={(i) => patch(i, (x) => ({ rotation: (x.rotation + 90) % 360 }))}
              onDelete={(i) => patch(i, () => ({ isDeleted: true }))}
              onRestore={(i) => patch(i, () => ({ isDeleted: false }))}
            />
          ))}
        </PdfPageGrid>
      </div>

      {!saved ? (
        <Button
          type="primary"
          size="large"
          block={isMobile}
          icon={<DownloadOutlined />}
          loading={processing}
          onClick={handleSave}
          style={{ borderRadius: 4, background: '#1D4ED8', fontWeight: 600 }}
        >
          Lưu file ({activeCount} trang)
        </Button>
      ) : (
        <PdfResultBanner
          title="Đã lưu xong"
          downloadLabel="Tải file"
          downloadIcon={<DownloadOutlined />}
          onDownload={() => downloadBlob(saved.blob, saved.name)}
          againLabel="Sửa tiếp"
          onAgain={() => setSaved(null)}
        >
          <Text style={{ fontSize: 13, wordBreak: 'break-all' }}>{saved.name}</Text>
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
