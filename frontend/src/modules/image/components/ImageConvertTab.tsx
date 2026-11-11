'use client';

import React, { useMemo, useState } from 'react';
import { Button, ColorPicker, Radio, Slider, Space, Typography, message } from 'antd';
import {
  SwapOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { useLiveImagePreview } from '../hooks/useLiveImagePreview';
import { ConvertFormat, ConvertOptions } from '../types/image';
import { processConvert } from '../services/image-convert';
import { LiveImageStage } from './LiveImageStage';

const { Text } = Typography;

export const ImageConvertTab: React.FC = () => {
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

  const convertOpts = useMemo<ConvertOptions>(
    () => ({
      targetFormat,
      quality,
      backgroundColor: bgColor,
    }),
    [targetFormat, quality, bgColor]
  );

  const { activeId, setActiveId, livePreview, previewLoading } =
    useLiveImagePreview(items, convertOpts, processConvert);

  const handleRunBatch = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const newResults = [];
    try {
      for (const item of items) {
        const res = await processConvert(item.file, convertOpts);
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
    <LiveImageStage
      items={items}
      activeId={activeId}
      onSelectActive={setActiveId}
      onRemoveItem={removeFile}
      livePreview={livePreview}
      previewLoading={previewLoading}
      results={results}
      onResetResults={() => setResults([])}
      resultTitle="Đã đổi định dạng"
      controlsSlot={
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: '#0F172A' }}>
            Định dạng đích
          </div>
          <Radio.Group
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="image/jpeg">JPG / JPEG (Phổ biến)</Radio>
              <Radio value="image/png">PNG (Nền trong suốt)</Radio>
              <Radio value="image/webp">WebP (Siêu nhẹ)</Radio>
            </Space>
          </Radio.Group>

          {targetFormat !== 'image/png' && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
              <Text style={{ fontSize: 13 }}>
                Chất lượng xuất: <strong>{Math.round(quality * 100)}%</strong>
              </Text>
              <Slider
                min={60}
                max={100}
                value={Math.round(quality * 100)}
                onChange={(v) => setQuality(v / 100)}
              />
            </div>
          )}

          {targetFormat === 'image/jpeg' && (
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 13 }}>Màu nền (nếu ảnh trong suốt):</Text>
              <ColorPicker
                value={bgColor}
                onChangeComplete={(color) => setBgColor(color.toHexString())}
                size="small"
              />
            </div>
          )}
        </div>
      }
      actionsSlot={
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Button
            type="primary"
            icon={<SwapOutlined />}
            loading={processing}
            onClick={handleRunBatch}
            block
            size="large"
            style={{ background: '#1D4ED8' }}
          >
            {items.length > 1
              ? `Chuyển đổi tất cả (${items.length} ảnh)`
              : 'Áp dụng & xuất file'}
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
      }
    />
  );
};
