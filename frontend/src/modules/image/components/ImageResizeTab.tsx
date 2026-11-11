'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
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
  UploadOutlined,
  DeleteOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { ResizeMode, ResizeOptions } from '../types/image';
import { RESIZE_PRESETS, processResize } from '../services/image-resize';
import { ResultBanner, ResultTable } from './ImageCommon';
import { formatBytes } from '../services/image-decode';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

const { Text } = Typography;

export const ImageResizeTab: React.FC = () => {
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

  const [mode, setMode] = useState<ResizeMode>('PRESET');
  const [presetId, setPresetId] = useState<string>('THE_3X4');
  const [width, setWidth] = useState<number | undefined>(800);
  const [height, setHeight] = useState<number | undefined>(600);
  const [percent, setPercent] = useState<number>(50);
  const [keepRatio, setKeepRatio] = useState<boolean>(true);
  const [rotate, setRotate] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  const handleRunResize = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const newResults = [];

    const options: ResizeOptions = {
      mode,
      presetId,
      width,
      height,
      percent,
      keepAspectRatio: keepRatio,
      rotate,
      flipH,
      flipV,
    };

    try {
      for (const item of items) {
        const res = await processResize(item.file, options);
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
    <div>
      {results.length > 0 && (
        <ResultBanner
          results={results}
          onReset={() => {
            setResults([]);
          }}
          title="Đã đổi kích cỡ"
        />
      )}

      {/* Cấu hình kích cỡ */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 6 }}
        bodyStyle={{ padding: isMobile ? 12 : 16 }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Phương thức</div>
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ marginBottom: 12 }}
        >
          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
            <Radio value="PRESET">Theo mẫu có sẵn</Radio>
            <Radio value="PX">Theo điểm ảnh (px)</Radio>
            <Radio value="PERCENT">Theo phần trăm (%)</Radio>
          </Space>
        </Radio.Group>

        {mode === 'PRESET' && (
          <div style={{ marginTop: 8 }}>
            <Select
              value={presetId}
              onChange={setPresetId}
              style={{ width: isMobile ? '100%' : 260 }}
              options={RESIZE_PRESETS.map((p) => ({
                value: p.id,
                label: `${p.name} (${p.width}x${p.height})`,
              }))}
            />
          </div>
        )}

        {mode === 'PX' && (
          <div style={{ marginTop: 8 }}>
            <Space wrap align="center">
              <InputNumber
                addonBefore="Rộng"
                addonAfter="px"
                min={10}
                max={10000}
                value={width}
                onChange={(v) => setWidth(v || undefined)}
                style={{ width: 150 }}
              />
              <InputNumber
                addonBefore="Cao"
                addonAfter="px"
                min={10}
                max={10000}
                value={height}
                onChange={(v) => setHeight(v || undefined)}
                style={{ width: 150 }}
              />
              <Checkbox
                checked={keepRatio}
                onChange={(e) => setKeepRatio(e.target.checked)}
              >
                Khóa tỉ lệ
              </Checkbox>
            </Space>
          </div>
        )}

        {mode === 'PERCENT' && (
          <div style={{ marginTop: 8 }}>
            <Space align="center">
              <Text>Tỉ lệ:</Text>
              <InputNumber
                min={10}
                max={200}
                value={percent}
                onChange={(v) => setPercent(v || 50)}
                addonAfter="%"
                style={{ width: 120 }}
              />
            </Space>
          </div>
        )}

        {/* Xoay & Lật */}
        <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #F1F5F9' }}>
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
          icon={<ScissorOutlined />}
          loading={processing}
          onClick={handleRunResize}
          block={isMobile}
          style={{ background: '#1D4ED8', minWidth: 140 }}
        >
          Đổi cỡ ảnh
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
                {it.width}x{it.height}
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
