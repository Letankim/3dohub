'use client';

import React, { useState } from 'react';
import { Card, Button, Typography, message } from 'antd';
import {
  MergeCellsOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { PdfResultBanner } from './PdfCommon';
import { MergeResult, PdfLoadedFile } from '../types/pdf';
import { downloadBlob, formatBytes, mergePdfBuffers, readPdfFile } from '../services/pdf-engine';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text } = Typography;

export const PdfMergeTab: React.FC = () => {
  const isMobile = useIsMobile();
  const [files, setFiles] = useState<PdfLoadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);

  const handleFilesSelected = async (selected: File[]) => {
    try {
      const items = await Promise.all(selected.map((f) => readPdfFile(f)));
      setFiles((prev) => [...prev, ...items]);
      setResult(null);
    } catch {
      message.error('Không đọc được một số file PDF.');
    }
  };

  const move = (index: number, delta: number) =>
    setFiles((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[target]] = [copy[target], copy[index]];
      return copy;
    });

  const handleMerge = async () => {
    if (files.length < 2) {
      message.warning('Cần ít nhất 2 file để gộp.');
      return;
    }
    setProcessing(true);
    try {
      const bytes = await mergePdfBuffers(files.map((f) => f.arrayBuffer));
      setResult({
        pdfBlob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
        totalPageCount: files.reduce((s, f) => s + f.pageCount, 0),
        sizeBytes: bytes.byteLength,
        downloadFilename: `TaiLieu_Gop_${Date.now()}.pdf`,
      });
    } catch {
      message.error('Không gộp được các file này.');
    } finally {
      setProcessing(false);
    }
  };

  if (files.length === 0) return <PdfDropzone multiple onFilesSelected={handleFilesSelected} />;

  const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
  const totalSize = files.reduce((s, f) => s + f.sizeBytes, 0);

  return (
    <Card style={{ borderRadius: 6, border: '1px solid #E2E8F0' }} styles={{ body: { padding: isMobile ? 12 : 20 } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        <div>
          <Text strong style={{ color: '#0F172A', display: 'block' }}>Danh sách file ({files.length})</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{totalPages} trang • {formatBytes(totalSize)}</Text>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <PdfDropzone multiple variant="inline" label="Thêm file" onFilesSelected={handleFilesSelected} />
          <Button danger icon={<DeleteOutlined />} onClick={() => { setFiles([]); setResult(null); }} style={{ borderRadius: 4 }}>
            Xóa hết
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {files.map((item, index) => (
          <div
            key={item.id}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', border: '1px solid #E2E8F0', borderRadius: 6, background: '#fff' }}
          >
            <span style={{ background: '#EFF6FF', color: '#1D4ED8', fontWeight: 700, fontSize: 12, padding: '0 7px', borderRadius: 4, border: '1px solid #BFDBFE', flexShrink: 0 }}>
              {index + 1}
            </span>
            <FilePdfOutlined style={{ fontSize: 20, color: '#DC2626', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text strong ellipsis style={{ display: 'block', fontSize: 13 }}>{item.name}</Text>
              <Text type="secondary" style={{ fontSize: 11.5 }}>{item.pageCount} trang • {formatBytes(item.sizeBytes)}</Text>
            </div>
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              <Button size="small" icon={<ArrowUpOutlined />} disabled={index === 0} onClick={() => move(index, -1)} />
              <Button size="small" icon={<ArrowDownOutlined />} disabled={index === files.length - 1} onClick={() => move(index, 1)} />
              <Button size="small" danger type="text" icon={<DeleteOutlined />} onClick={() => setFiles((p) => p.filter((f) => f.id !== item.id))} />
            </div>
          </div>
        ))}
      </div>

      {!result ? (
        <Button
          type="primary"
          size="large"
          block={isMobile}
          icon={<MergeCellsOutlined />}
          loading={processing}
          disabled={files.length < 2}
          onClick={handleMerge}
          style={{ borderRadius: 4, background: '#1D4ED8', fontWeight: 600 }}
        >
          Gộp {files.length} file
        </Button>
      ) : (
        <PdfResultBanner
          title="Đã gộp xong"
          downloadLabel="Tải file"
          downloadIcon={<DownloadOutlined />}
          onDownload={() => downloadBlob(result.pdfBlob, result.downloadFilename)}
          againLabel="Gộp lại"
          onAgain={() => setResult(null)}
        >
          <Text style={{ fontSize: 13 }}>{result.totalPageCount} trang • {formatBytes(result.sizeBytes)}</Text>
        </PdfResultBanner>
      )}
    </Card>
  );
};
