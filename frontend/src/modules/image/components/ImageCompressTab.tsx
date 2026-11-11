'use client';

import React, { useMemo, useState } from 'react';
import { Button, InputNumber, Radio, Space, Typography, message } from 'antd';
import {
  CompressOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { useLiveImagePreview } from '../hooks/useLiveImagePreview';
import { CompressOptions, CompressMode } from '../types/image';
import { processCompress } from '../services/image-compress';
import { LiveImageStage } from './LiveImageStage';

const { Text } = Typography;

export const ImageCompressTab: React.FC = () => {
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

  const [mode, setMode] = useState<CompressMode>('KEEP_SHARP');
  const [targetKb, setTargetKb] = useState<number>(300);

  const compressOpts = useMemo<CompressOptions>(
    () => ({
      mode,
      targetKb: mode === 'TARGET_SIZE' ? targetKb : undefined,
    }),
    [mode, targetKb]
  );

  const { activeId, setActiveId, livePreview, previewLoading } =
    useLiveImagePreview(items, compressOpts, processCompress);

  const handleRunBatch = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const newResults = [];
    try {
      for (const item of items) {
        const res = await processCompress(item.file, compressOpts);
        newResults.push(res);
      }
      setResults(newResults);
      message.success(`Đã nén xong ${newResults.length} ảnh!`);
    } catch (err: any) {
      message.error(err?.message || 'Có lỗi xảy ra khi nén ảnh.');
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
      resultTitle="Đã nén xong"
      controlsSlot={
        <div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12, color: '#0F172A' }}>
            Mức nén
          </div>
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            style={{ width: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Radio value="KEEP_SHARP">Giữ nét (Mặc định)</Radio>
              <Radio value="BALANCED">Cân bằng</Radio>
              <Radio value="SMALLEST">Nhỏ nhất</Radio>
              <Radio value="TARGET_SIZE">Theo dung lượng tối đa</Radio>
            </Space>
          </Radio.Group>

          {mode === 'TARGET_SIZE' && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid #E2E8F0' }}>
              <Text style={{ display: 'block', marginBottom: 6, fontSize: 13 }}>
                Dung lượng mục tiêu:
              </Text>
              <InputNumber
                min={50}
                max={10000}
                value={targetKb}
                onChange={(val) => setTargetKb(val || 300)}
                addonAfter="KB"
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      }
      actionsSlot={
        <Space direction="vertical" style={{ width: '100%' }} size={10}>
          <Button
            type="primary"
            icon={<CompressOutlined />}
            loading={processing}
            onClick={handleRunBatch}
            block
            size="large"
            style={{ background: '#1D4ED8' }}
          >
            {items.length > 1 ? `Nén tất cả (${items.length} ảnh)` : 'Áp dụng & xuất file'}
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
