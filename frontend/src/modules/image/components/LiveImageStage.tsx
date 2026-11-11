'use client';

import React, { useState } from 'react';
import {
  Button,
  Card,
  Col,
  Row,
  Segmented,
  Space,
  Spin,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import {
  ExpandOutlined,
  DownloadOutlined,
  DeleteOutlined,
  EyeOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { ImageFileItem, ProcessedImageResult } from '../types/image';
import { formatBytes, downloadBlob } from '../services/image-decode';
import { openFancyboxGallery } from '../services/fancybox-helper';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { ResultBanner, ResultTable } from './ImageCommon';

const { Text } = Typography;

export interface LivePreviewState {
  origUrl: string;
  procUrl: string;
  blob: Blob;
  name: string;
  width: number;
  height: number;
  origSize: number;
  procSize: number;
  percentReduction: number;
  isKeptOriginal: boolean;
}

interface LiveImageStageProps {
  items: ImageFileItem[];
  activeId: string;
  onSelectActive: (id: string) => void;
  onRemoveItem: (id: string) => void;
  livePreview: LivePreviewState | null;
  previewLoading: boolean;
  controlsSlot: React.ReactNode;
  actionsSlot: React.ReactNode;
  results: ProcessedImageResult[];
  onResetResults: () => void;
  resultTitle: string;
}

export const LiveImageStage: React.FC<LiveImageStageProps> = ({
  items,
  activeId,
  onSelectActive,
  onRemoveItem,
  livePreview,
  previewLoading,
  controlsSlot,
  actionsSlot,
  results,
  onResetResults,
  resultTitle,
}) => {
  const isMobile = useIsMobile();
  const [stageMode, setStageMode] = useState<'RESULT' | 'COMPARE'>('RESULT');
  const [sliderPos, setSliderPos] = useState<number>(50);

  const activeItem = items.find((it) => it.id === activeId) || items[0];
  const displayProcUrl = livePreview?.procUrl || activeItem?.previewUrl || '';
  const displayOrigUrl = livePreview?.origUrl || activeItem?.previewUrl || '';

  const handleOpenFancybox = () => {
    if (!activeItem) return;
    const slides = [];
    if (livePreview?.procUrl) {
      slides.push({
        src: livePreview.procUrl,
        caption: `Kết quả xem trước: ${livePreview.name} (${livePreview.width}x${livePreview.height} · ${formatBytes(livePreview.procSize)})`,
      });
    }
    slides.push({
      src: displayOrigUrl,
      caption: `Ảnh gốc: ${activeItem.name} (${formatBytes(activeItem.size)})`,
    });
    void openFancyboxGallery(slides, 0);
  };

  return (
    <div>
      {results.length > 0 && (
        <ResultBanner
          results={results}
          onReset={onResetResults}
          title={resultTitle}
        />
      )}

      <Row gutter={[16, 16]}>
        {/* LEFT COLUMN: LIVE PREVIEW + FANCYBOX */}
        <Col xs={24} lg={14}>
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
            styles={{ body: { padding: isMobile ? 10 : 14 } }}
            title={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <Space size={6}>
                  <EyeOutlined style={{ color: '#1D4ED8' }} />
                  <span style={{ fontWeight: 600 }}>Xem trước trực tiếp</span>
                </Space>
                <Space size={6}>
                  <Segmented
                    size="small"
                    value={stageMode}
                    onChange={(v) => setStageMode(v as 'RESULT' | 'COMPARE')}
                    options={[
                      { label: 'Kết quả', value: 'RESULT' },
                      { label: 'Trước / Sau', value: 'COMPARE', icon: <SwapOutlined /> },
                    ]}
                  />
                  <Button
                    size="small"
                    icon={<ExpandOutlined />}
                    onClick={handleOpenFancybox}
                  >
                    {!isMobile && 'Phóng to'}
                  </Button>
                </Space>
              </div>
            }
          >
            {/* Preview Canvas */}
            <Spin spinning={previewLoading} tip="Đang cập nhật xem trước...">
              <div
                onClick={stageMode === 'RESULT' ? handleOpenFancybox : undefined}
                title={stageMode === 'RESULT' ? 'Bấm để phóng to bằng Fancybox' : undefined}
                style={{
                  position: 'relative',
                  width: '100%',
                  height: isMobile ? 280 : 400,
                  borderRadius: 4,
                  background: '#0F172A',
                  backgroundImage:
                    'radial-gradient(#334155 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  overflow: 'hidden',
                  cursor: stageMode === 'RESULT' ? 'zoom-in' : 'default',
                }}
              >
                {displayProcUrl && (
                  <img
                    src={displayProcUrl}
                    alt="Kết quả"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      userSelect: 'none',
                    }}
                  />
                )}

                {stageMode === 'COMPARE' && displayOrigUrl && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        pointerEvents: 'none',
                      }}
                    >
                      <img
                        src={displayOrigUrl}
                        alt="Ảnh gốc"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '100%',
                          objectFit: 'contain',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: `${sliderPos}%`,
                        width: 2,
                        background: '#FFFFFF',
                        boxShadow: '0 0 8px rgba(0,0,0,0.8)',
                        pointerEvents: 'none',
                      }}
                    />
                    <Tag
                      color="blue"
                      style={{ position: 'absolute', top: 8, left: 8, margin: 0 }}
                    >
                      Gốc
                    </Tag>
                    <Tag
                      color="green"
                      style={{ position: 'absolute', top: 8, right: 8, margin: 0 }}
                    >
                      Kết quả
                    </Tag>
                  </>
                )}
              </div>

              {stageMode === 'COMPARE' && (
                <div style={{ marginTop: 8 }}>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={sliderPos}
                    onChange={(e) => setSliderPos(Number(e.target.value))}
                    style={{ width: '100%', cursor: 'ew-resize' }}
                  />
                </div>
              )}
            </Spin>

            {/* Real-time Dimensions & Size Footer */}
            {livePreview && (
              <div
                style={{
                  marginTop: 12,
                  padding: '8px 12px',
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 4,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                <Space wrap size={8}>
                  <Tag color="default" style={{ margin: 0 }}>
                    {livePreview.width} × {livePreview.height} px
                  </Tag>
                  <Text style={{ fontSize: 13 }}>
                    <span style={{ color: '#64748B' }}>
                      {formatBytes(livePreview.origSize)}
                    </span>{' '}
                    → <strong>{formatBytes(livePreview.procSize)}</strong>
                  </Text>
                  {livePreview.percentReduction > 0 ? (
                    <Tag color="green" style={{ margin: 0, fontWeight: 600 }}>
                      -{livePreview.percentReduction}%
                    </Tag>
                  ) : livePreview.isKeptOriginal ? (
                    <Tag color="default" style={{ margin: 0 }}>
                      Giữ gốc
                    </Tag>
                  ) : null}
                </Space>

                <Button
                  size="small"
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadBlob(livePreview.blob, livePreview.name)}
                  style={{ background: '#16A34A', borderColor: '#16A34A' }}
                >
                  Tải ảnh này
                </Button>
              </div>
            )}

            {/* Thumbnail Strip */}
            <div
              style={{
                marginTop: 12,
                display: 'flex',
                gap: 8,
                overflowX: 'auto',
                paddingBottom: 4,
              }}
            >
              {items.map((item) => {
                const isSelected = item.id === activeItem?.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onSelectActive(item.id)}
                    style={{
                      position: 'relative',
                      width: 76,
                      flexShrink: 0,
                      borderRadius: 4,
                      border: isSelected
                        ? '2px solid #1D4ED8'
                        : '1px solid #E2E8F0',
                      padding: 3,
                      cursor: 'pointer',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                    }}
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: 54,
                        objectFit: 'cover',
                        borderRadius: 2,
                      }}
                    />
                    <Tooltip title="Xóa ảnh">
                      <Button
                        size="small"
                        type="text"
                        danger
                        icon={<DeleteOutlined style={{ fontSize: 11 }} />}
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveItem(item.id);
                        }}
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: 2,
                          width: 20,
                          height: 20,
                          minWidth: 20,
                          padding: 0,
                          background: 'rgba(255,255,255,0.88)',
                        }}
                      />
                    </Tooltip>
                    <div
                      style={{
                        fontSize: 10,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: 2,
                        textAlign: 'center',
                        color: '#475569',
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* RIGHT COLUMN: TOOLS & BATCH ACTIONS */}
        <Col xs={24} lg={10}>
          <Space direction="vertical" style={{ width: '100%' }} size={12}>
            <Card
              size="small"
              style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
              styles={{ body: { padding: isMobile ? 12 : 16 } }}
            >
              {controlsSlot}
            </Card>

            <Card
              size="small"
              style={{ borderRadius: 6, border: '1px solid #E2E8F0', background: '#F8FAFC' }}
              styles={{ body: { padding: isMobile ? 12 : 14 } }}
            >
              {actionsSlot}
            </Card>
          </Space>
        </Col>
      </Row>

      {results.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <ResultTable results={results} originalFiles={items} />
        </div>
      )}
    </div>
  );
};

