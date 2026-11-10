'use client';

import React, { useState } from 'react';
import { Card, Button, Radio, Typography, Progress, Alert, message } from 'antd';
import { CompressOutlined, DownloadOutlined } from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { PdfFileSummary, PdfResultBanner } from './PdfCommon';
import { CompressLevel, CompressPreset, CompressResult, PdfLoadedFile } from '../types/pdf';
import { downloadBlob, formatBytes, readPdfFile } from '../services/pdf-engine';
import { compressPdfDocument } from '../services/pdf-compress';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text } = Typography;

const PRESETS: CompressPreset[] = [
  { key: 'LOW', label: 'Nhẹ', desc: 'Giữ nét cao, giảm ít' },
  { key: 'MEDIUM', label: 'Vừa', desc: 'Cân bằng, nên dùng' },
  { key: 'HIGH', label: 'Mạnh', desc: 'Nhỏ nhất, ảnh mờ hơn' },
];

export const PdfCompressTab: React.FC = () => {
  const isMobile = useIsMobile();
  const [loadedFile, setLoadedFile] = useState<PdfLoadedFile | null>(null);
  const [level, setLevel] = useState<CompressLevel>('MEDIUM');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    try {
      setLoadedFile(await readPdfFile(files[0]));
      setResult(null);
    } catch {
      message.error('Không đọc được file PDF này.');
    }
  };

  const handleCompress = async () => {
    if (!loadedFile) return;
    setProcessing(true);
    setProgress(0);
    try {
      const { bytes, method } = await compressPdfDocument(loadedFile.arrayBuffer, level, setProgress);
      const originalSize = loadedFile.sizeBytes;
      const saved = Math.max(0, originalSize - bytes.byteLength);
      setResult({
        originalSizeBytes: originalSize,
        compressedSizeBytes: method === 'ORIGINAL' ? originalSize : bytes.byteLength,
        savedBytes: saved,
        ratioPercent: originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0,
        method,
        pdfBlob: new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' }),
        downloadFilename: `${loadedFile.name.replace(/\.pdf$/i, '')}_DaNen.pdf`,
      });
    } catch {
      message.error('Không nén được file này.');
    } finally {
      setProcessing(false);
    }
  };

  if (!loadedFile) {
    return <PdfDropzone onFilesSelected={handleFileSelected} />;
  }

  return (
    <Card style={{ borderRadius: 6, border: '1px solid #E2E8F0' }} styles={{ body: { padding: isMobile ? 12 : 20 } }}>
      <PdfFileSummary
        name={loadedFile.name}
        meta={`${formatBytes(loadedFile.sizeBytes)} • ${loadedFile.pageCount} trang`}
        onChange={() => setLoadedFile(null)}
      />

      {!result ? (
        <>
          <Text strong style={{ display: 'block', marginBottom: 8, color: '#0F172A' }}>
            Mức nén
          </Text>
          <Radio.Group
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            disabled={processing}
            style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 8, marginBottom: 16 }}
          >
            {PRESETS.map((p) => (
              <Radio.Button
                key={p.key}
                value={p.key}
                style={{ height: 'auto', padding: '8px 4px', textAlign: 'center', borderRadius: 4, lineHeight: 1.35, whiteSpace: 'normal' }}
              >
                <div style={{ fontWeight: 600 }}>{p.label}</div>
                <div style={{ fontSize: 11, opacity: 0.75 }}>{p.desc}</div>
              </Radio.Button>
            ))}
          </Radio.Group>

          {processing && <Progress percent={progress} size="small" style={{ marginBottom: 12 }} />}

          <Button
            type="primary"
            size="large"
            block={isMobile}
            icon={<CompressOutlined />}
            loading={processing}
            onClick={handleCompress}
            style={{ borderRadius: 4, background: '#1D4ED8', fontWeight: 600 }}
          >
            Nén file
          </Button>
        </>
      ) : (
        <PdfResultBanner
          title={result.method === 'ORIGINAL' ? 'File đã tối ưu sẵn' : 'Đã nén xong'}
          downloadLabel="Tải file"
          downloadIcon={<DownloadOutlined />}
          onDownload={() => downloadBlob(result.pdfBlob, result.downloadFilename)}
          againLabel="Nén lại"
          onAgain={() => setResult(null)}
        >
          <div style={{ display: 'flex', gap: isMobile ? 16 : 28, flexWrap: 'wrap', marginBottom: 8 }}>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Gốc</Text>
              <div style={{ fontWeight: 600 }}>{formatBytes(result.originalSizeBytes)}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Sau nén</Text>
              <div style={{ fontWeight: 700, color: '#15803D' }}>{formatBytes(result.compressedSizeBytes)}</div>
            </div>
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>Giảm</Text>
              <div style={{ fontWeight: 700, color: '#1D4ED8' }}>{result.ratioPercent}%</div>
            </div>
          </div>
          <Progress percent={result.ratioPercent} strokeColor="#16A34A" showInfo={false} size="small" />
          {result.method === 'ORIGINAL' && (
            <Alert type="info" showIcon style={{ marginTop: 10 }} message="File này không thể nhỏ hơn nữa, giữ nguyên bản gốc." />
          )}
          {result.method === 'RASTER' && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
              Trang được lưu dạng ảnh nên không chọn/sao chép được chữ.
            </Text>
          )}
        </PdfResultBanner>
      )}
    </Card>
  );
};
