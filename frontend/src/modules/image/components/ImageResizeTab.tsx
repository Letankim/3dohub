'use client';

import React, { useMemo, useState } from 'react';
import {
  Button,
  Checkbox,
  InputNumber,
  Radio,
  Select,
  Space,
  Typography,
  message,
} from 'antd';
import {
  ScissorOutlined,
  RotateRightOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { useLiveImagePreview } from '../hooks/useLiveImagePreview';
import { ResizeMode, ResizeOptions } from '../types/image';
import { RESIZE_PRESETS, processResize } from '../services/image-resize';
import { LiveImageStage } from './LiveImageStage';

const { Text } = Typography;

export const ImageResizeTab: React.FC = () => {
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

  const [mode, setMode] = useState<ResizeMode>('PRESET');
  const [presetId, setPresetId] = useState<string>('THE_3X4');
  const [width, setWidth] = useState<number | undefined>(800);
  const [height, setHeight] = useState<number | undefined>(600);
  const [percent, setPercent] = useState<number>(50);
  const [keepRatio, setKeepRatio] = useState<boolean>(true);
  const [rotate, setRotate] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const resizeOpts = useMemo<ResizeOptions>(
    () => ({
      mode,
      presetId,
      width,
      height,
      percent,
      keepAspectRatio: keepRatio,
      rotate,
      flipH,
      flipV,
    }),
    [mode, presetId, width, height, percent, keepRatio, rotate, flipH, flipV]
  );

  const { activeId, setActiveId, livePreview, previewLoading } =
    useLiveImagePreview(items, resizeOpts, processResize);

  const handleRunBatch = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const newResults = [];
    try {
      for (const item of items) {
        const res = await processResize(item.file, resizeOpts);
        newResults.push(res);
      }
      setResults(newResults);
      message.success(`Đã đổi kích cỡ ${newResults.length} ảnh!`);
    } catch (err: any) {
      message.error(err?.message || 'Có lỗi xảy ra khi đổi kích thước ảnh.');
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
      resultTitle="Đã đổi kích cỡ"
      controlsSlot={
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: '#0F172A' }}>
            Kích thước & Xoay lật
          </div>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ width: '100%', marginBottom: 12 }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="PRESET">Theo mẫu có sẵn</Radio>
              <Radio value="PX">Theo điểm ảnh (px)</Radio>
              <Radio value="PERCENT">Theo phần trăm (%)</Radio>
            </Space>
          </Radio.Group>

          {mode === 'PRESET' && (
            <Select
              value={presetId}
              onChange={setPresetId}
              style={{ width: '100%' }}
              options={RESIZE_PRESETS.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.width}×${p.height})`,
              }))}
            />
          )}

          {mode === 'PX' && (
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              <InputNumber
                addonBefore="Rộng"
                addonAfter="px"
                min={10}
                max={10000}
                value={width}
                onChange={(v) => setWidth(v || undefined)}
                style={{ width: '100%' }}
              />
              <InputNumber
                addonBefore="Cao"
                addonAfter="px"
                min={10}
                max={10000}
                value={height}
                onChange={(v) => setHeight(v || undefined)}
                style={{ width: '100%' }}
              />
              <Checkbox
                checked={keepRatio}
                onChange={(e) => setKeepRatio(e.target.checked)}
              >
                Khóa tỉ lệ khung hình
              </Checkbox>
            </Space>
          )}

          {mode === 'PERCENT' && (
            <div>
              <Text style={{ display: 'block', marginBottom: 4, fontSize: 13 }}>
                Tỉ lệ thu phóng:
              </Text>
              <InputNumber
                min={10}
                max={200}
                value={percent}
                onChange={(v) => setPercent(v || 50)}
                addonAfter="%"
                style={{ width: '100%' }}
              />
            </div>
          )}

          <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
            <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8, color: '#475569' }}>
              Thao tác nhanh
            </div>
            <Space wrap>
              <Button
                size="small"
                icon={<RotateRightOutlined />}
                onClick={() => setRotate((prev) => (prev + 90) % 360)}
              >
                Xoay 90° ({rotate}°)
              </Button>
              <Button
                size="small"
                icon={<SwapOutlined />}
                type={flipH ? 'primary' : 'default'}
                onClick={() => setFlipH((prev) => !prev)}
              >
                Lật ngang
              </Button>
              <Button
                size="small"
                icon={<SwapOutlined style={{ transform: 'rotate(90deg)' }} />}
                type={flipV ? 'primary' : 'default'}
                onClick={() => setFlipV((prev) => !prev)}
              >
                Lật dọc
              </Button>
            </Space>
          </div>
        </div>
      }
      actionsSlot={
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Button
            type="primary"
            icon={<ScissorOutlined />}
            loading={processing}
            onClick={handleRunBatch}
            block
            size="large"
            style={{ background: '#1D4ED8' }}
          >
            {items.length > 1
              ? `Áp dụng cho ${items.length} ảnh`
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
