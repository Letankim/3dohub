'use client';

import React, { useState } from 'react';
import { Card, Button, Radio, Input, Space, Typography, message, Tag } from 'antd';
import {
  ScissorOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  RedoOutlined,
  CheckCircleOutlined,
  FileZipOutlined,
  SelectOutlined,
} from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { PdfLoadedFile, PdfPageItem, SplitMode, SplitResult } from '../types/pdf';
import {
  extractPdfPages,
  formatBytes,
  parsePageRangeString,
  readPdfFile,
  splitPdfIntoZip,
} from '../services/pdf-engine';
import { renderPageThumbnail } from '../services/pdf-thumbnail';
import { PdfPageThumbnailCard } from './PdfPageThumbnailCard';

const { Title, Text } = Typography;

export const PdfSplitTab: React.FC = () => {
  const [loadedFile, setLoadedFile] = useState<PdfLoadedFile | null>(null);
  const [mode, setMode] = useState<SplitMode>('CUSTOM_RANGE');
  const [rangeInput, setRangeInput] = useState<string>('1');
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<SplitResult | null>(null);

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    try {
      const info = await readPdfFile(files[0]);
      setLoadedFile(info);
      setResult(null);

      // Build pages
      const initialPages: PdfPageItem[] = [];
      for (let i = 0; i < info.pageCount; i++) {
        initialPages.push({
          pageIndex: i,
          pageNumber: i + 1,
          rotation: 0,
          selected: i === 0,
        });
      }
      setPages(initialPages);
      setRangeInput('1');

      // Async load thumbnails
      void (async () => {
        for (let i = 0; i < Math.min(info.pageCount, 24); i++) {
          const thumb = await renderPageThumbnail(info.arrayBuffer, i + 1);
          setPages((prev) =>
            prev.map((p) => (p.pageIndex === i ? { ...p, thumbnailUrl: thumb } : p))
          );
        }
      })();
    } catch {
      message.error('Không thể đọc file PDF. Vui lòng thử file khác.');
    }
  };

  const handleToggleSelectPage = (pageIndex: number) => {
    setPages((prev) => {
      const updated = prev.map((p) =>
        p.pageIndex === pageIndex ? { ...p, selected: !p.selected } : p
      );
      const selectedNums = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      setRangeInput(selectedNums.join(', '));
      return updated;
    });
  };

  const handleSelectAll = (select: boolean) => {
    setPages((prev) => {
      const updated = prev.map((p) => ({ ...p, selected: select }));
      const selectedNums = updated.filter((p) => p.selected).map((p) => p.pageNumber);
      setRangeInput(selectedNums.join(', '));
      return updated;
    });
  };

  const handleRangeInputChange = (val: string) => {
    setRangeInput(val);
    if (!loadedFile) return;
    const indices = parsePageRangeString(val, loadedFile.pageCount);
    const indexSet = new Set(indices);
    setPages((prev) =>
      prev.map((p) => ({
        ...p,
        selected: indexSet.has(p.pageIndex),
      }))
    );
  };

  const handleSplit = async () => {
    if (!loadedFile) return;
    setProcessing(true);
    try {
      const baseName = loadedFile.name.replace(/\.pdf$/i, '');

      if (mode === 'SPLIT_EACH') {
        const zipBlob = await splitPdfIntoZip(loadedFile.arrayBuffer, loadedFile.name);
        setResult({
          mode: 'SPLIT_EACH',
          files: [],
          zipBlob,
          downloadFilename: `${baseName}_TungTrang.zip`,
        });
        message.success(`Đã tách thành công ${loadedFile.pageCount} file PDF riêng lẻ!`);
      } else {
        const selectedIndices = pages.filter((p) => p.selected).map((p) => p.pageIndex);
        if (selectedIndices.length === 0) {
          message.warning('Vui lòng chọn ít nhất 1 trang để trích xuất.');
          setProcessing(false);
          return;
        }

        const splitBytes = await extractPdfPages(loadedFile.arrayBuffer, selectedIndices);
        const singleBlob = new Blob([splitBytes.buffer as ArrayBuffer], { type: 'application/pdf' });
        const pagesStr = selectedIndices.map((i) => i + 1).slice(0, 3).join('_');
        const downloadFilename = `${baseName}_Trang_${pagesStr}.pdf`;

        setResult({
          mode: 'CUSTOM_RANGE',
          files: [],
          singleBlob,
          downloadFilename,
        });
        message.success(`Đã trích xuất thành công ${selectedIndices.length} trang!`);
      }
    } catch (err: any) {
      message.error(err.message || 'Đã xảy ra lỗi khi tách file PDF.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blobToDownload = result.zipBlob || result.singleBlob;
    if (!blobToDownload) return;

    const url = URL.createObjectURL(blobToDownload);
    const a = document.createElement('a');
    a.href = url;
    a.download = result.downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const selectedCount = pages.filter((p) => p.selected).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!loadedFile ? (
        <PdfDropzone
          onFilesSelected={handleFileSelected}
          title="Kéo thả file PDF cần tách trang vào đây"
          subtitle="Trích xuất các trang cụ thể hoặc tách toàn bộ tài liệu thành các file riêng biệt"
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
                  Dung lượng: {formatBytes(loadedFile.sizeBytes)} • Tổng số {loadedFile.pageCount} trang
                </Text>
              </div>
            </Space>

            <Button icon={<RedoOutlined />} onClick={() => setLoadedFile(null)} style={{ borderRadius: 4 }}>
              Chọn file khác
            </Button>
          </div>

          {/* Mode Selector */}
          <div style={{ marginBottom: 20 }}>
            <Title level={5} style={{ margin: '0 0 10px 0', color: '#0F172A' }}>
              Phương thức tách file
            </Title>

            <Radio.Group
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}
            >
              <Radio value="CUSTOM_RANGE" style={{ fontSize: 13.5 }}>
                Trích xuất dải trang tùy chọn (ví dụ: 1-3, 5, 8)
              </Radio>
              <Radio value="SPLIT_EACH" style={{ fontSize: 13.5 }}>
                Tách từng trang thành các file riêng (tải file .ZIP)
              </Radio>
            </Radio.Group>
          </div>

          {mode === 'CUSTOM_RANGE' && (
            <div style={{ marginBottom: 24, background: '#F8FAFC', padding: 16, borderRadius: 6, border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, flexWrap: 'wrap', gap: 8 }}>
                <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
                  Các trang cần trích xuất:
                </Text>

                <Space size={8}>
                  <Button size="small" onClick={() => handleSelectAll(true)} style={{ borderRadius: 4 }}>
                    Chọn tất cả ({loadedFile.pageCount})
                  </Button>
                  <Button size="small" onClick={() => handleSelectAll(false)} style={{ borderRadius: 4 }}>
                    Bỏ chọn hết
                  </Button>
                </Space>
              </div>

              <Input
                value={rangeInput}
                onChange={(e) => handleRangeInputChange(e.target.value)}
                placeholder="Ví dụ: 1-3, 5, 8-10"
                style={{ borderRadius: 4, height: 38, marginBottom: 8 }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Mẹo: Bạn có thể nhập số trang ở ô trên, hoặc click trực tiếp vào từng trang bên dưới để chọn. Đang chọn: <b>{selectedCount} trang</b>.
              </Text>
            </div>
          )}

          {/* Interactive Page Thumbnails Grid */}
          <div style={{ marginBottom: 24 }}>
            <Title level={5} style={{ margin: '0 0 12px 0', color: '#0F172A' }}>
              Xem trước danh sách trang ({loadedFile.pageCount} trang)
            </Title>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                maxHeight: 420,
                overflowY: 'auto',
                padding: '8px 4px',
                border: '1px solid #F1F5F9',
                borderRadius: 6,
              }}
            >
              {pages.map((p) => (
                <PdfPageThumbnailCard
                  key={p.pageIndex}
                  page={p}
                  selectable={mode === 'CUSTOM_RANGE'}
                  onToggleSelect={handleToggleSelectPage}
                />
              ))}
            </div>
          </div>

          {/* Action / Result */}
          {!result ? (
            <Button
              type="primary"
              size="large"
              icon={<ScissorOutlined />}
              loading={processing}
              onClick={handleSplit}
              style={{
                borderRadius: 4,
                background: '#1D4ED8',
                fontWeight: 600,
                height: 42,
              }}
            >
              {mode === 'SPLIT_EACH'
                ? `Tách thành ${loadedFile.pageCount} file riêng (.ZIP)`
                : `Trích xuất ${selectedCount} trang đã chọn`}
            </Button>
          ) : (
            <div
              style={{
                background: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: 6,
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 22 }} />
                <Title level={5} style={{ margin: 0, color: '#15803D' }}>
                  Tách file thành công!
                </Title>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: '#334155' }}>
                  File đã sẵn sàng tải về: <b>{result.downloadFilename}</b>
                </Text>
              </div>

              <Space size={12}>
                <Button
                  type="primary"
                  size="large"
                  icon={result.zipBlob ? <FileZipOutlined /> : <DownloadOutlined />}
                  onClick={handleDownload}
                  style={{
                    background: '#16A34A',
                    borderColor: '#16A34A',
                    borderRadius: 4,
                    fontWeight: 600,
                  }}
                >
                  {result.zipBlob ? 'Tải file .ZIP về máy' : 'Tải file PDF trích xuất'}
                </Button>

                <Button icon={<RedoOutlined />} onClick={() => setResult(null)} style={{ borderRadius: 4 }}>
                  Tách dải trang khác
                </Button>
              </Space>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
