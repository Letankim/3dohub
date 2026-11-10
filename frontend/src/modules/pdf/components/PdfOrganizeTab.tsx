'use client';

import React, { useState } from 'react';
import { Card, Button, Space, Typography, message, Tooltip } from 'antd';
import {
  RotateRightOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  RedoOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { PdfDropzone } from './PdfDropzone';
import { PdfLoadedFile, PdfPageItem } from '../types/pdf';
import { formatBytes, organizePdfPages, readPdfFile } from '../services/pdf-engine';
import { renderPageThumbnail } from '../services/pdf-thumbnail';
import { PdfPageThumbnailCard } from './PdfPageThumbnailCard';

const { Title, Text } = Typography;

export const PdfOrganizeTab: React.FC = () => {
  const [loadedFile, setLoadedFile] = useState<PdfLoadedFile | null>(null);
  const [pages, setPages] = useState<PdfPageItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [downloadBlob, setDownloadBlob] = useState<Blob | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');

  const handleFileSelected = async (files: File[]) => {
    if (!files[0]) return;
    try {
      const info = await readPdfFile(files[0]);
      setLoadedFile(info);
      setDownloadBlob(null);

      const initialPages: PdfPageItem[] = [];
      for (let i = 0; i < info.pageCount; i++) {
        initialPages.push({
          pageIndex: i,
          pageNumber: i + 1,
          rotation: 0,
          selected: false,
          isDeleted: false,
        });
      }
      setPages(initialPages);

      // Render thumbnails asynchronously
      void (async () => {
        for (let i = 0; i < Math.min(info.pageCount, 30); i++) {
          const thumb = await renderPageThumbnail(info.arrayBuffer, i + 1);
          setPages((prev) =>
            prev.map((p) => (p.pageIndex === i ? { ...p, thumbnailUrl: thumb } : p))
          );
        }
      })();
    } catch {
      message.error('Không thể đọc file PDF. Vui lòng thử lại.');
    }
  };

  const handleRotatePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p) =>
        p.pageIndex === pageIndex ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const handleRotateAll = () => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: (p.rotation + 90) % 360 }))
    );
    message.info('Đã xoay tất cả các trang sang phải 90°');
  };

  const handleDeletePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageIndex === pageIndex ? { ...p, isDeleted: true } : p))
    );
  };

  const handleRestorePage = (pageIndex: number) => {
    setPages((prev) =>
      prev.map((p) => (p.pageIndex === pageIndex ? { ...p, isDeleted: false } : p))
    );
  };

  const handleResetModifications = () => {
    setPages((prev) =>
      prev.map((p) => ({ ...p, rotation: 0, isDeleted: false }))
    );
    message.info('Đã hoàn tác toàn bộ thay đổi trang.');
  };

  const handleSaveOrganized = async () => {
    if (!loadedFile) return;
    const activePages = pages.filter((p) => !p.isDeleted);
    if (activePages.length === 0) {
      message.warning('Tài liệu phải còn ít nhất một trang.');
      return;
    }

    setProcessing(true);
    try {
      const bytes = await organizePdfPages(loadedFile.arrayBuffer, pages);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'application/pdf' });
      const baseName = loadedFile.name.replace(/\.pdf$/i, '');
      const filename = `${baseName}_DaSapXep.pdf`;

      setDownloadBlob(blob);
      setDownloadFilename(filename);
      message.success('Đã áp dụng các thay đổi và tạo file PDF mới thành công!');
    } catch (err: any) {
      message.error(err.message || 'Đã xảy ra lỗi khi lưu file.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadBlob) return;
    const url = URL.createObjectURL(downloadBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFilename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const activePagesCount = pages.filter((p) => !p.isDeleted).length;
  const deletedCount = pages.filter((p) => p.isDeleted).length;
  const hasChanges = pages.some((p) => p.rotation !== 0 || p.isDeleted);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!loadedFile ? (
        <PdfDropzone
          onFilesSelected={handleFileSelected}
          title="Kéo thả file PDF cần xoay hoặc sắp xếp trang vào đây"
          subtitle="Xem trước toàn bộ các trang, xoay hướng trang, xóa trang thừa một cách trực quan"
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
          {/* Header Summary & Toolbar */}
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
                  Còn {activePagesCount} trang {deletedCount > 0 && `(đã xóa ${deletedCount} trang)`} • Dung lượng: {formatBytes(loadedFile.sizeBytes)}
                </Text>
              </div>
            </Space>

            <Space size={8}>
              <Button icon={<RotateRightOutlined />} onClick={handleRotateAll} style={{ borderRadius: 4 }}>
                Xoay tất cả 90°
              </Button>
              {hasChanges && (
                <Button icon={<UndoOutlined />} onClick={handleResetModifications} style={{ borderRadius: 4 }}>
                  Hoàn tác thay đổi
                </Button>
              )}
              <Button icon={<RedoOutlined />} onClick={() => setLoadedFile(null)} style={{ borderRadius: 4 }}>
                Chọn file khác
              </Button>
            </Space>
          </div>

          {/* Grid of Pages */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                maxHeight: 520,
                overflowY: 'auto',
                padding: '12px 8px',
                border: '1px solid #F1F5F9',
                borderRadius: 6,
                background: '#FAFAFA',
              }}
            >
              {pages.map((p) => (
                <PdfPageThumbnailCard
                  key={p.pageIndex}
                  page={p}
                  onRotate={handleRotatePage}
                  onDelete={handleDeletePage}
                  onRestore={handleRestorePage}
                />
              ))}
            </div>
          </div>

          {/* Action / Result */}
          {!downloadBlob ? (
            <Button
              type="primary"
              size="large"
              icon={<DownloadOutlined />}
              loading={processing}
              onClick={handleSaveOrganized}
              style={{
                borderRadius: 4,
                background: '#1D4ED8',
                fontWeight: 600,
                height: 42,
              }}
            >
              Lưu và tải file PDF ({activePagesCount} trang)
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
                  Đã tạo file PDF mới thành công!
                </Title>
              </div>

              <div style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, color: '#334155' }}>
                  File gồm <b>{activePagesCount} trang</b> sẵn sàng tải về: <b>{downloadFilename}</b>
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
                  Tải file PDF về máy
                </Button>

                <Button icon={<RedoOutlined />} onClick={() => setDownloadBlob(null)} style={{ borderRadius: 4 }}>
                  Chỉnh sửa tiếp
                </Button>
              </Space>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
