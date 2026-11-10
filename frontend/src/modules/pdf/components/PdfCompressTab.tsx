'use client';

import React, { useState } from 'react';
import { Card, Button, Radio, Space, Typography, Progress, message } from 'antd';
import {
  CompressOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  RedoOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { CompressLevel, CompressPreset, CompressResult, PdfLoadedFile } from '../types/pdf';
import { compressPdfDocument, formatBytes, readPdfFile } from '../services/pdf-engine';

const { Title, Text, Paragraph } = Typography;

const COMPRESS_PRESETS: CompressPreset[] = [
  {
    key: 'LOW',
    label: 'Nén nhẹ (Chất lượng cao)',
    desc: 'Giữ nguyên độ sắc nét cao nhất của văn bản và hình ảnh, dọn dẹp cấu trúc file.',
    badge: 'Chất lượng cao',
    expectedReduction: 'Tiết kiệm ~20% - 30%',
  },
  {
    key: 'MEDIUM',
    label: 'Nén chuẩn (Khuyên dùng)',
    desc: 'Cân bằng hoàn hảo giữa kích thước nhỏ và độ rõ nét, rất thích hợp gửi Email, Zalo.',
    badge: 'Khuyên dùng',
    expectedReduction: 'Tiết kiệm ~40% - 60%',
  },
  {
    key: 'HIGH',
    label: 'Nén tối đa',
    desc: 'Giảm tối đa kích thước để đáp ứng hạn mức nộp hồ sơ, cổng dịch vụ công.',
    badge: 'Dung lượng nhỏ nhất',
    expectedReduction: 'Tiết kiệm ~60% - 80%',
  },
];

export const PdfCompressTab: React.FC = () => {
  const [loadedFile, setLoadedFile] = useState<PdfLoadedFile | null>(null);
  const [level, setLevel] = useState<CompressLevel>('MEDIUM');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<CompressResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    try {
      const info = await readPdfFile(files[0]);
      setLoadedFile(info);
      setResult(null);
    } catch {
      message.error('Không thể đọc file PDF này. Vui lòng thử file khác.');
    }
  };

  const handleCompress = async () => {
    if (!loadedFile) return;
    setProcessing(true);
    try {
      const compressedBytes = await compressPdfDocument(loadedFile.arrayBuffer, level);
      const originalSize = loadedFile.sizeBytes;
      const compressedSize = compressedBytes.byteLength;
      const saved = Math.max(0, originalSize - compressedSize);
      const ratio = originalSize > 0 ? Math.round((saved / originalSize) * 100) : 0;

      const blob = new Blob([compressedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = loadedFile.name.replace(/\.pdf$/i, '');
      const downloadFilename = `${baseName}_DaNen.pdf`;

      setResult({
        originalSizeBytes: originalSize,
        compressedSizeBytes: compressedSize,
        savedBytes: saved,
        ratioPercent: ratio,
        pdfBlob: blob,
        downloadFilename,
      });
      message.success('Đã nén file PDF thành công!');
    } catch {
      message.error('Đã xảy ra sự cố khi nén file PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const url = URL.createObjectURL(result.pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    setLoadedFile(null);
    setResult(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!loadedFile ? (
        <PdfDropzone
          onFilesSelected={handleFileSelected}
          title="Kéo thả file PDF cần nén vào đây"
          subtitle="Giảm dung lượng file PDF dễ dàng, thuận tiện chia sẻ và lưu trữ"
        />
      ) : (
        <Card
          style={{
            borderRadius: 6,
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          }}
          styles={{ body: { padding: 24 } }}
        >
          {/* File summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              background: '#F8FAFC',
              borderRadius: 6,
              border: '1px solid #E2E8F0',
              marginBottom: 20,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <Space size={12}>
              <FilePdfOutlined style={{ fontSize: 28, color: '#DC2626' }} />
              <div>
                <Text strong style={{ fontSize: 14, color: '#0F172A', display: 'block' }}>
                  {loadedFile.name}
                </Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Dung lượng: {formatBytes(loadedFile.sizeBytes)} • {loadedFile.pageCount} trang
                </Text>
              </div>
            </Space>

            <Button icon={<RedoOutlined />} onClick={handleReset} style={{ borderRadius: 4 }}>
              Chọn file khác
            </Button>
          </div>

          {/* Compression Level Selector */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ margin: '0 0 12px 0', color: '#0F172A' }}>
              Chọn mức độ nén
            </Title>

            <Radio.Group
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}
            >
              {COMPRESS_PRESETS.map((item) => (
                <Radio
                  key={item.key}
                  value={item.key}
                  style={{
                    padding: '12px 16px',
                    border: level === item.key ? '1px solid #1D4ED8' : '1px solid #E2E8F0',
                    background: level === item.key ? '#EFF6FF' : '#FFFFFF',
                    borderRadius: 6,
                    width: '100%',
                    margin: 0,
                  }}
                >
                  <div style={{ display: 'inline-block', marginLeft: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Text strong style={{ color: '#0F172A', fontSize: 13.5 }}>
                        {item.label}
                      </Text>
                      <span
                        style={{
                          fontSize: 11,
                          padding: '1px 6px',
                          borderRadius: 3,
                          background: level === item.key ? '#DBEAFE' : '#F1F5F9',
                          color: level === item.key ? '#1D4ED8' : '#64748B',
                          fontWeight: 500,
                        }}
                      >
                        {item.expectedReduction}
                      </span>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12.5, display: 'block', marginTop: 2 }}>
                      {item.desc}
                    </Text>
                  </div>
                </Radio>
              ))}
            </Radio.Group>
          </div>

          {/* Action / Result */}
          {!result ? (
            <Button
              type="primary"
              size="large"
              icon={<CompressOutlined />}
              loading={processing}
              onClick={handleCompress}
              style={{
                borderRadius: 4,
                background: '#1D4ED8',
                fontWeight: 600,
                height: 42,
              }}
            >
              Tiến hành nén PDF
            </Button>
          ) : (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: 6,
                padding: '20px',
                marginTop: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 22 }} />
                <Title level={5} style={{ margin: 0, color: '#15803D' }}>
                  Nén file thành công!
                </Title>
              </div>

              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 16 }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Dung lượng gốc:</Text>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>
                    {formatBytes(result.originalSizeBytes)}
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Sau khi nén:</Text>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#15803D' }}>
                    {formatBytes(result.compressedSizeBytes)}
                  </div>
                </div>

                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Tiết kiệm được:</Text>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8' }}>
                    {formatBytes(result.savedBytes)} ({result.ratioPercent}%)
                  </div>
                </div>
              </div>

              <Progress
                percent={result.ratioPercent}
                strokeColor="#16A34A"
                format={(p) => `Giảm ${p}%`}
                style={{ marginBottom: 16 }}
              />

              <Space size={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={handleDownload}
                  style={{
                    background: '#16A34A',
                    borderColor: '#16A34A',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  Tải file PDF đã nén
                </Button>

                <Button icon={<RedoOutlined />} onClick={handleReset} style={{ borderRadius: 4 }}>
                  Nén file khác
                </Button>
              </Space>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
