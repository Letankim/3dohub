'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Radio,
  Row,
  Space,
  Tooltip,
  Typography,
  message,
} from 'antd';
import {
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  EyeOutlined,
  ExpandOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { ImageToPdfOptions, PdfPageSize, PdfOrientation } from '../types/image';
import { processImagesToPdf } from '../services/image-to-pdf';
import { formatBytes, downloadBlob } from '../services/image-decode';
import { openFancyboxGallery } from '../services/fancybox-helper';
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

  const handleOpenGallery = (startIndex: number) => {
    void openFancyboxGallery(
      items.map((it, idx) => ({
        src: it.previewUrl,
        caption: `Trang ${idx + 1}/${items.length}: ${it.name} (${it.width}×${it.height} · ${formatBytes(it.size)})`,
      })),
      startIndex
    );
  };

  const handleCreatePdf = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const options: ImageToPdfOptions = { pageSize, orientation, marginMm };
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
          styles={{ body: { padding: isMobile ? 12 : 16 } }}
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

      <Row gutter={[16, 16]}>
        {/* LEFT COLUMN: VISUAL PAGE PREVIEW WITH FANCYBOX */}
        <Col xs={24} lg={14}>
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
            styles={{ body: { padding: isMobile ? 10 : 14 } }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space size={6}>
                  <EyeOutlined style={{ color: '#1D4ED8' }} />
                  <span style={{ fontWeight: 600 }}>Xem trước trang PDF ({items.length} trang)</span>
                </Space>
                <Button
                  size="small"
                  icon={<ExpandOutlined />}
                  onClick={() => handleOpenGallery(0)}
                >
                  {!isMobile && 'Xem slide'}
                </Button>
              </div>
            }
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile
                  ? 'repeat(auto-fill, minmax(115px, 1fr))'
                  : 'repeat(auto-fill, minmax(145px, 1fr))',
                gap: 12,
                maxHeight: 460,
                overflowY: 'auto',
                paddingRight: 4,
              }}
            >
              {items.map((it, idx) => (
                <Card
                  key={it.id}
                  size="small"
                  style={{ borderRadius: 6, overflow: 'hidden', textAlign: 'center', position: 'relative' }}
                  styles={{ body: { padding: 8 } }}
                  cover={
                    <div
                      onClick={() => handleOpenGallery(idx)}
                      title="Bấm để phóng to bằng Fancybox"
                      style={{
                        height: 124,
                        background: '#FFFFFF',
                        borderBottom: '1px solid #E2E8F0',
                        padding: pageSize === 'FIT' ? 0 : Math.max(2, marginMm * 0.8),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        cursor: 'zoom-in',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          background: 'rgba(15,23,42,0.75)',
                          color: '#fff',
                          borderRadius: 3,
                          padding: '1px 6px',
                          fontSize: 11,
                          fontWeight: 700,
                        }}
                      >
                        Trang {idx + 1}
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
                    <Tooltip title="Đưa lên trước">
                      <Button
                        size="small"
                        icon={<ArrowUpOutlined />}
                        disabled={idx === 0}
                        onClick={() => moveItem(idx, 'UP')}
                      />
                    </Tooltip>
                    <Tooltip title="Đưa xuống sau">
                      <Button
                        size="small"
                        icon={<ArrowDownOutlined />}
                        disabled={idx === items.length - 1}
                        onClick={() => moveItem(idx, 'DOWN')}
                      />
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeFile(it.id)}
                      />
                    </Tooltip>
                  </Space>
                </Card>
              ))}
            </div>
          </Card>
        </Col>

        {/* RIGHT COLUMN: PDF CONTROLS */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card
              size="small"
              style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
              styles={{ body: { padding: isMobile ? 12 : 16 } }}
            >
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: '#0F172A' }}>
                Thiết lập trang PDF
              </div>

              <div style={{ marginBottom: 12 }}>
                <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                  Khổ giấy:
                </Text>
                <Radio.Group value={pageSize} onChange={(e) => setPageSize(e.target.value)}>
                  <Space direction="vertical">
                    <Radio value="A4">A4 (Tiêu chuẩn)</Radio>
                    <Radio value="FIT">Vừa khớp từng ảnh</Radio>
                    <Radio value="LETTER">Letter</Radio>
                  </Space>
                </Radio.Group>
              </div>

              {pageSize !== 'FIT' && (
                <div style={{ marginBottom: 12, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                  <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                    Chiều giấy:
                  </Text>
                  <Radio.Group value={orientation} onChange={(e) => setOrientation(e.target.value)}>
                    <Space wrap>
                      <Radio value="AUTO">Tự động</Radio>
                      <Radio value="PORTRAIT">Dọc</Radio>
                      <Radio value="LANDSCAPE">Ngang</Radio>
                    </Space>
                  </Radio.Group>
                </div>
              )}

              <div style={{ paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
                <Text strong style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                  Lề trang:
                </Text>
                <Radio.Group value={marginMm} onChange={(e) => setMarginMm(e.target.value)}>
                  <Space wrap>
                    <Radio value={0}>Không lề</Radio>
                    <Radio value={5}>5 mm</Radio>
                    <Radio value={10}>10 mm</Radio>
                    <Radio value={15}>15 mm</Radio>
                  </Space>
                </Radio.Group>
              </div>
            </Card>

            <Card
              size="small"
              style={{ borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC' }}
              styles={{ body: { padding: isMobile ? 12 : 14 } }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size={10}>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  loading={processing}
                  onClick={handleCreatePdf}
                  block
                  size="large"
                  style={{ background: '#1D4ED8' }}
                >
                  Tạo tệp PDF ({items.length} trang)
                </Button>
                <Space style={{ width: '100%', justifyContent: 'space-between' }} wrap>
                  <FileDropzone
                    variant="inline"
                    accept="image/*"
                    multiple
                    label="Thêm ảnh"
                    onFilesSelected={addFiles}
                  />
                  <Button icon={<DeleteOutlined />} onClick={clearAll} danger>
                    Xóa hết
                  </Button>
                </Space>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};
