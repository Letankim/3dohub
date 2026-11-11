'use client';

import React, { useState } from 'react';
import { Button, Card, ColorPicker, Radio, Segmented, Slider, Space, Typography, message } from 'antd';
import {
  SwapOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { ConvertFormat, ConvertOptions } from '../types/image';
import { processConvert } from '../services/image-convert';
import { ResultBanner, ResultTable } from './ImageCommon';
import { formatBytes } from '../services/image-decode';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

const { Text } = Typography;

export const ImageConvertTab: React.FC = () => {
  const isMobile = useIsMobile();
  const {
    items,
    results,
    setResults,
    processing,
    setProcessing,
    addFiles,
    removeFile,
    clearAll,
  } = useImageQueue();

  const [targetFormat, setTargetFormat] = useState<ConvertFormat>('image/jpeg');
  const [quality, setQuality] = useState<number>(0.9);
  const [bgColor, setBgColor] = useState<string>('#FFFFFF');

  const handleRunConvert = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const newResults = [];

    const options: ConvertOptions = {
      targetFormat,
      quality,
      backgroundColor: bgColor,
    };

    try {
      for (const item of items) {
        const res = await processConvert(item.file, options);
        newResults.push(res);
      }
      setResults(newResults);
      message.success(`Đã chuyển đổi ${newResults.length} ảnh!`);
    } catch (err: any) {
      message.error(err?.message || 'Có lỗi xảy ra khi chuyển đổi định dạng.');
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
      {results.length > 0 && (
        <ResultBanner
          results={results}
          onReset={() => {
            setResults([]);
          }}
          title="Đã đổi định dạng"
        />
      )}

      {/* Cấu hình định dạng đích */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 6 }}
        bodyStyle={{ padding: isMobile ? 12 : 16 }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Định dạng đích</div>
        <Radio.Group
          value={targetFormat}
          onChange={(e) => setTargetFormat(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
            <Radio value="image/jpeg">JPG / JPEG (Phổ biến)</Radio>
            <Radio value="image/png">PNG (Trong suốt)</Radio>
            <Radio value="image/webp">WebP (Siêu nhẹ)</Radio>
          </Space>
        </Radio.Group>

        {targetFormat !== 'image/png' && (
          <div style={{ marginTop: 8 }}>
            <Text style={{ fontSize: 13, marginRight: 8 }}>
              Chất lượng: <strong>{Math.round(quality * 100)}%</strong>
            </Text>
            <Slider
              min={60}
              max={100}
              value={Math.round(quality * 100)}
              onChange={(v) => setQuality(v / 100)}
              style={{ maxWidth: 300 }}
            />
          </div>
        )}

        {targetFormat === 'image/jpeg' && (
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 13 }}>Màu nền thay thế vùng trong suốt:</Text>
            <ColorPicker
              value={bgColor}
              onChangeComplete={(color) => setBgColor(color.toHexString())}
              size="small"
            />
          </div>
        )}
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
          icon={<SwapOutlined />}
          loading={processing}
          onClick={handleRunConvert}
          block={isMobile}
          style={{ background: '#1D4ED8', minWidth: 140 }}
        >
          Đổi định dạng
        </Button>
      </div>

      {/* Hiển thị kết quả hoặc danh sách file */}
      {results.length > 0 ? (
        <ResultTable results={results} originalFiles={items} />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? 'repeat(auto-fill, minmax(96px, 1fr))'
              : 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 12,
          }}
        >
          {items.map((it) => (
            <Card
              key={it.id}
              size="small"
              hoverable
              style={{ borderRadius: 6, overflow: 'hidden', textAlign: 'center' }}
              bodyStyle={{ padding: 8 }}
              cover={
                <div style={{ height: 90, background: '#F1F5F9', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={it.previewUrl}
                    alt={it.name}
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'cover' }}
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
                  marginBottom: 4,
                }}
              >
                {it.name}
              </div>
              <div style={{ fontSize: 10, color: '#64748B', marginBottom: 6 }}>
                {formatBytes(it.size)}
              </div>
              <Button
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => removeFile(it.id)}
              />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

