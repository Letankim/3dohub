'use client';

import React, { useState } from 'react';
import { Card, Button, Space, Typography, List, message } from 'antd';
import {
  MergeCellsOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  RedoOutlined,
} from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { MergeResult, PdfLoadedFile } from '../types/pdf';
import { formatBytes, mergePdfBuffers, readPdfFile } from '../services/pdf-engine';

const { Title, Text } = Typography;

export const PdfMergeTab: React.FC = () => {
  const [files, setFiles] = useState<PdfLoadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<MergeResult | null>(null);

  const handleFilesSelected = async (selected: File[]) => {
    try {
      const readPromises = selected.map((f) => readPdfFile(f));
      const newItems = await Promise.all(readPromises);
      setFiles((prev) => [...prev, ...newItems]);
      setResult(null);
    } catch {
      message.error('Không thể đọc một số file PDF. Vui lòng kiểm tra lại.');
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const temp = copy[index - 1];
      copy[index - 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleMoveDown = (index: number) => {
    setFiles((prev) => {
      if (index >= prev.length - 1) return prev;
      const copy = [...prev];
      const temp = copy[index + 1];
      copy[index + 1] = copy[index];
      copy[index] = temp;
      return copy;
    });
  };

  const handleRemoveFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      message.warning('Vui lòng chọn từ 2 file PDF trở lên để thực hiện ghép nối.');
      return;
    }

    setProcessing(true);
    try {
      const buffers = files.map((f) => f.arrayBuffer);
      const mergedBytes = await mergePdfBuffers(buffers);
      const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);
      const blob = new Blob([mergedBytes.buffer as ArrayBuffer], { type: 'application/pdf' });

      setResult({
        pdfBlob: blob,
        totalPageCount: totalPages,
        sizeBytes: mergedBytes.byteLength,
        downloadFilename: `TaiLieu_Gop_${Date.now()}.pdf`,
      });
      message.success(`Đã gộp thành công ${files.length} file PDF!`);
    } catch {
      message.error('Đã xảy ra lỗi trong quá trình gộp các file PDF.');
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

  const totalPagesCount = files.reduce((sum, f) => sum + f.pageCount, 0);
  const totalSizeBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {files.length === 0 ? (
        <PdfDropzone
          onFilesSelected={handleFilesSelected}
          multiple
          title="Kéo thả các file PDF cần gộp vào đây"
          subtitle="Ghép nối nhiều file PDF riêng lẻ thành một tài liệu duy nhất theo thứ tự mong muốn"
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
          {/* Header Summary & Add More */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <Title level={5} style={{ margin: '0 0 4px 0', color: '#0F172A' }}>
                Danh sách file chuẩn bị ghép ({files.length} file)
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                Tổng số trang: <b>{totalPagesCount} trang</b> • Tổng dung lượng: {formatBytes(totalSizeBytes)}
              </Text>
            </div>

            <Space size={8}>
              <div style={{ display: 'inline-block' }}>
                <PdfDropzone
                  onFilesSelected={handleFilesSelected}
                  multiple
                  title="Thêm file"
                  subtitle=""
                />
              </div>

              <Button danger icon={<DeleteOutlined />} onClick={() => setFiles([])} style={{ borderRadius: 4 }}>
                Xóa tất cả
              </Button>
            </Space>
          </div>

          {/* List of files with up/down controls */}
          <div style={{ marginBottom: 24 }}>
            <List
              dataSource={files}
              bordered
              style={{ borderRadius: 6, background: '#FFFFFF' }}
              renderItem={(item, index) => (
                <List.Item
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                  }}
                >
                  <Space size={12} style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        background: '#EFF6FF',
                        color: '#1D4ED8',
                        fontWeight: 700,
                        fontSize: 12,
                        padding: '2px 8px',
                        borderRadius: 4,
                        border: '1px solid #BFDBFE',
                      }}
                    >
                      #{index + 1}
                    </span>
                    <FilePdfOutlined style={{ fontSize: 22, color: '#DC2626' }} />
                    <div style={{ minWidth: 0, overflow: 'hidden' }}>
                      <Text strong style={{ fontSize: 13.5, color: '#0F172A', display: 'block' }}>
                        {item.name}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.pageCount} trang • {formatBytes(item.sizeBytes)}
                      </Text>
                    </div>
                  </Space>

                  <Space size={6}>
                    <Button
                      size="small"
                      icon={<ArrowUpOutlined />}
                      disabled={index === 0}
                      onClick={() => handleMoveUp(index)}
                      title="Di chuyển lên trên"
                    />
                    <Button
                      size="small"
                      icon={<ArrowDownOutlined />}
                      disabled={index === files.length - 1}
                      onClick={() => handleMoveDown(index)}
                      title="Di chuyển xuống dưới"
                    />
                    <Button
                      size="small"
                      danger
                      type="text"
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveFile(item.id)}
                      title="Xóa file này"
                    />
                  </Space>
                </List.Item>
              )}
            />
          </div>

          {/* Action / Result */}
          {!result ? (
            <Button
              type="primary"
              size="large"
              icon={<MergeCellsOutlined />}
              loading={processing}
              disabled={files.length < 2}
              onClick={handleMerge}
              style={{
                borderRadius: 4,
                background: '#1D4ED8',
                fontWeight: 600,
                height: 42,
              }}
            >
              Ghép nối {files.length} file PDF thành 1 tài liệu
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
                  Ghép nối tài liệu thành công!
                </Title>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: '#334155' }}>
                  Tài liệu hoàn chỉnh gồm <b>{result.totalPageCount} trang</b> • Dung lượng:{' '}
                  <b>{formatBytes(result.sizeBytes)}</b>
                </Text>
              </div>

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
                  Tải file PDF đã gộp về máy
                </Button>

                <Button icon={<RedoOutlined />} onClick={() => setResult(null)} style={{ borderRadius: 4 }}>
                  Gộp danh sách khác
                </Button>
              </Space>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
