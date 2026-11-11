'use client';

import React, { useState } from 'react';
import { Button, Card, Col, InputNumber, Radio, Row, Space, Typography, message } from 'antd';
import {
  CompressOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { FileDropzone } from '@/components/common/FileDropzone';
import { useImageQueue } from '../hooks/useImageQueue';
import { CompressOptions, CompressMode } from '../types/image';
import { processCompress } from '../services/image-compress';
import { ResultBanner, ResultTable } from './ImageCommon';
import { formatBytes } from '../services/image-decode';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

const { Text } = Typography;

export const ImageCompressTab: React.FC = () => {
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

  const [mode, setMode] = useState<CompressMode>('KEEP_SHARP');
  const [targetKb, setTargetKb] = useState<number>(300);

  const handleRunCompress = async () => {
    if (items.length === 0) return;
    setProcessing(true);
    const newResults = [];

    const options: CompressOptions = {
      mode,
      targetKb: mode === 'TARGET_SIZE' ? targetKb : undefined,
    };

    try {
      for (const item of items) {
        const res = await processCompress(item.file, options);
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

  // Trạng thái ban đầu: Chỉ có 1 nút "Chọn ảnh" duy nhất theo Rule 12
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
          title="Đã nén xong"
        />
      )}

      {/* Tùy chọn mức nén */}
      <Card
        size="small"
        style={{ marginBottom: 16, borderRadius: 6 }}
        bodyStyle={{ padding: isMobile ? 12 : 16 }}
      >
        <div style={{ fontWeight: 600, marginBottom: 8 }}>Mức nén</div>
        <Radio.Group
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{ marginBottom: mode === 'TARGET_SIZE' ? 12 : 0 }}
        >
          <Space direction={isMobile ? 'vertical' : 'horizontal'}>
            <Radio value="KEEP_SHARP">Giữ nét (Mặc định)</Radio>
            <Radio value="BALANCED">Cân bằng</Radio>
            <Radio value="SMALLEST">Nhỏ nhất</Radio>
            <Radio value="TARGET_SIZE">Theo dung lượng</Radio>
          </Space>
        </Radio.Group>

        {mode === 'TARGET_SIZE' && (
          <div style={{ marginTop: 8 }}>
            <Space align="center">
              <Text>Dung lượng tối đa:</Text>
              <InputNumber
                min={50}
                max={10000}
                value={targetKb}
                onChange={(val) => setTargetKb(val || 300)}
                addonAfter="KB"
                style={{ width: 140 }}
              />
            </Space>
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
          icon={<CompressOutlined />}
          loading={processing}
          onClick={handleRunCompress}
          block={isMobile}
          style={{ background: '#1D4ED8', minWidth: 140 }}
        >
          Nén ảnh
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
