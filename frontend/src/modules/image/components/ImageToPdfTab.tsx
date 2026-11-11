'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Radio,
  Space,
  Typography,
  message,
} from 'antd';
import {
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { ImageToPdfOptions, PdfPageSize, PdfOrientation } from '../types/image';
import { processImagesToPdf } from '../services/image-to-pdf';
import { formatBytes, downloadBlob } from '../services/image-decode';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

const { Text } = Typography;

export const ImageToPdfTab: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    items,
    setItems,
    processing,
    setProcessing,
    addFiles,
    removeFile,
    clearAll,
  } = useImageQueue();

  const [pageSize, setPageSize] = useState<PdfPageSize>('A4');
  const [orientation, setOrientation] = useState<PdfOrientation>('AUTO');
  const [marginMm, setMarginMm] = useState<number>(5);
  const [generatedPdf, setGeneratedPdf] = useState<{ blob: Blob; size: number } | null>(null);

  const moveItem = (index: number, direction: 'UP' | 'DOWN') => {
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const newItems = [...items];
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;
    setItems(newItems);
  };

  const handleCreatePdf = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const options: ImageToPdfOptions = {
      pageSize,
      orientation,
      marginMm,
    };

    try {
      const files = items.map((it) => it.file);
      const pdfBlob = await processImagesToPdf(files, options);
      setGeneratedPdf({ blob: pdfBlob, size: pdfBlob.size });
      downloadBlob(pdfBlob, '3dohub_anh_gop.pdf');
      message.success(`Đã tạo thành công tệp PDF gồm ${files.length} trang!`);
    } catch (err: any) {
      message.error(err?.message || 'Có lỗi xảy ra khi tạo PDF từ ảnh.');
    } finally {
      setProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <FileDropzone
        accept="image/*"
        multiple
        label="Chọn ảnh"
        onFilesSelected={addFiles}
      />
    );
  }

  return (
    <div>
      {generatedPdf && (
        <Card
          size="small"
          style={{
            marginBottom: 16,
            background: '#F0FDF4',
            border: '1px solid #BBF7D0',
            borderRadius: 6,
          }}
          bodyStyle={{ padding: isMobile ? 12 : 16 }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: 700, color: '#166534' }}>
                <FilePdfOutlined style={{ marginRight: 6 }} />
                Đã tạo file PDF thành công ({items.length} trang)
              </div>
              <div style={{ fontSize: 13, color: '#15803D' }}>
                Dung lượng: {formatBytes(generatedPdf.size)}
              </div>
            </div>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadBlob(generatedPdf.blob, '3dohub_anh_gop.pdf')}
              style={{ background: '#16A34A', borderColor: '#16A34A' }}
            >
              Tải lại PDF
            </Button>
          </div>
        </Card>
      )}

      {/* Cấu hình PDF */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 6 }}
        bodyStyle={{ padding: isMobile ? 12 : 16 }}
      >
        <div style={{ marginBottom: 12 }}>
          <Text strong style={{ marginRight: 12 }}>Khổ giấy:</Text>
          <Radio.Group value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
            <Radio value="A4">A4 (Tiêu chuẩn)</Radio>
            <Radio value="FIT">Vừa khớp ảnh</Radio>
            <Radio value="LETTER">Letter</Radio>
          </Radio.Group>
        </div>

        {pageSize !== 'FIT' && (
          <div style={{ marginBottom: 12 }}>
            <Text strong style={{ marginRight: 12 }}>Chiều giấy:</Text>
            <Radio.Group value={orientation} onChange={(e) => setOrientation(e.target.value)}>
              <Radio value="AUTO">Tự động</Radio>
              <Radio value="PORTRAIT">Dọc</Radio>
              <Radio value="LANDSCAPE">Ngang</Radio>
            </Radio.Group>
          </div>
        )}

        <div>
          <Text strong style={{ marginRight: 12 }}>Lề trang:</Text>
          <Radio.Group value={marginMm} onChange={(e) => setMarginMm(e.target.value)}>
            <Radio value={0}>Không lề</Radio>
            <Radio value={5}>5 mm</Radio>
            <Radio value={10}>10 mm</Radio>
            <Radio value={15}>15 mm</Radio>
          </Radio.Group>
        </div>
      </Card>

      {/* Thanh hành động */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <Space>
          <FileDropzone
            variant="inline"
            accept="image/*"
            multiple
            label="Thêm ảnh"
            onFilesSelected={addFiles}
          />
          <Button icon={<DeleteOutlined />} onClick={clearAll}>
            Xóa hết
          </Button>
        </Space>

        <Button
          type="primary"
          icon={<FilePdfOutlined />}
          loading={processing}
          onClick={handleCreatePdf}
          block={isMobile}
          style={{ background: '#1D4ED8', minWidth: 140 }}
        >
          Tạo PDF
        </Button>
      </div>

      {/* Danh sách ảnh sắp xếp */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? 'repeat(auto-fill, minmax(110px, 1fr))'
            : 'repeat(auto-fill, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        {items.map((it, idx) => (
          <Card
            key={it.id}
            size="small"
            style={{ borderRadius: 6, overflow: 'hidden', textAlign: 'center', position: 'relative' }}
            bodyStyle={{ padding: 8 }}
            cover={
              <div style={{ height: 100, background: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <span
                  style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    background: 'rgba(15,23,42,0.7)',
                    color: '#fff',
                    borderRadius: 3,
                    padding: '1px 6px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  #{idx + 1}
                </span>
                <img
                  src={it.previewUrl}
                  alt={it.name}
                  style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            }
          >
            <div
              style={{
                fontSize: 11,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: 6,
              }}
            >
              {it.name}
            </div>
            <Space size={4}>
              <Button
                size="small"
                icon={<ArrowUpOutlined />}
                disabled={idx === 0}
                onClick={() => moveItem(idx, 'UP')}
              />
              <Button
                size="small"
                icon={<ArrowDownOutlined />}
                disabled={idx === items.length - 1}
                onClick={() => moveItem(idx, 'DOWN')}
              />
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFile(it.id)}
              />
            </Space>
          </Card>
        ))}
      </div>
    </div>
  );
};
