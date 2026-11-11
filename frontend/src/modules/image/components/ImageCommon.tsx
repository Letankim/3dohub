'use client';

import React, { useState } from 'react';
import { Button, Card, Modal, Progress, Space, Table, Tag, Tooltip } from 'antd';
import {
  DownloadOutlined,
  FileZipOutlined,
  DeleteOutlined,
  EyeOutlined,
  RedoOutlined,
  CheckCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { ProcessedImageResult, ImageFileItem } from '../types/image';
import { formatBytes, downloadBlob } from '../services/image-decode';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

export async function downloadAllAsZip(results: ProcessedImageResult[], zipName = '3dohub_anh.zip') {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();

  results.forEach((r) => {
    zip.file(r.originalName, r.blob);
  });

  const content = await zip.generateAsync({ type: 'blob' });
  downloadBlob(content, zipName);
}

interface ResultBannerProps {
  results: ProcessedImageResult[];
  onReset: () => void;
  title?: string;
}

export const ResultBanner: React.FC<ResultBannerProps> = ({
  results,
  onReset,
  title = 'Đã xử lý xong',
}) => {
  const isMobile = useIsMobile();
  const [downloadingZip, setDownloadingZip] = useState(false);

  const totalOrig = results.reduce((sum, r) => sum + r.originalSize, 0);
  const totalProc = results.reduce((sum, r) => sum + r.processedSize, 0);
  const totalSaved = Math.max(0, totalOrig - totalProc);
  const totalPct = totalOrig > 0 ? Math.round((totalSaved / totalOrig) * 100) : 0;

  const handleZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadAllAsZip(results);
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
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
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 700, fontSize: 15, color: '#166534', marginBottom: 4 }}>
            <CheckCircleOutlined style={{ marginRight: 6 }} />
            {title} ({results.length} ảnh)
          </div>
          <div style={{ fontSize: 13, color: '#15803D' }}>
            {formatBytes(totalOrig)} → <strong>{formatBytes(totalProc)}</strong>
            {totalSaved > 0 && (
              <Tag color="green" style={{ marginLeft: 8, fontWeight: 600 }}>
                Giảm {totalPct}% ({formatBytes(totalSaved)})
              </Tag>
            )}
          </div>
        </div>

        <Space direction={isMobile ? 'vertical' : 'horizontal'} style={{ width: isMobile ? '100%' : 'auto' }}>
          {results.length > 1 && (
            <Button
              type="primary"
              icon={<FileZipOutlined />}
              onClick={handleZip}
              loading={downloadingZip}
              block={isMobile}
              style={{ background: '#16A34A', borderColor: '#16A34A' }}
            >
              Tải ZIP
            </Button>
          )}
          <Button icon={<RedoOutlined />} onClick={onReset} block={isMobile}>
            Làm lại
          </Button>
        </Space>
      </div>
    </Card>
  );
};

interface BeforeAfterModalProps {
  open: boolean;
  onClose: () => void;
  origUrl: string;
  procUrl: string;
  name: string;
}

export const BeforeAfterModal: React.FC<BeforeAfterModalProps> = ({
  open,
  onClose,
  origUrl,
  procUrl,
  name,
}) => {
  const isMobile = useIsMobile();
  const [sliderPos, setSliderPos] = useState(50);

  return (
    <Modal
      title={name || 'So sánh trước / sau'}
      open={open}
      onCancel={onClose}
      footer={null}
      centered
      width="min(94vw, 840px)"
      destroyOnClose
    >
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <Space>
          <Tag color="blue">Bên trái: Ảnh gốc</Tag>
          <SwapOutlined />
          <Tag color="green">Bên phải: Kết quả</Tag>
        </Space>
      </div>

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxHeight: 'calc(100vh - 260px)',
          overflow: 'hidden',
          borderRadius: 4,
          background: '#0F172A',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <img
          src={procUrl}
          alt="Sau"
          style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 280px)', objectFit: 'contain' }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={origUrl}
            alt="Trước"
            style={{ maxWidth: '100%', maxHeight: 'calc(100vh - 280px)', objectFit: 'contain' }}
          />
        </div>

        {/* Thanh trượt phân cách */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: `${sliderPos}%`,
            width: 2,
            background: '#FFFFFF',
            boxShadow: '0 0 6px rgba(0,0,0,0.6)',
            cursor: 'ew-resize',
          }}
        />
      </div>

      <div style={{ marginTop: 12, padding: '0 8px' }}>
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>
    </Modal>
  );
};

interface ResultTableProps {
  results: ProcessedImageResult[];
  originalFiles: ImageFileItem[];
}

export const ResultTable: React.FC<ResultTableProps> = ({ results, originalFiles }) => {
  const isMobile = useIsMobile();
  const [comparing, setComparing] = useState<{ origUrl: string; procUrl: string; name: string } | null>(null);

  const columns = [
    {
      title: 'Tên ảnh',
      dataIndex: 'originalName',
      key: 'name',
      ellipsis: true,
    },
    {
      title: 'Kích thước',
      key: 'dims',
      render: (_: any, r: ProcessedImageResult) => `${r.width}x${r.height}`,
    },
    {
      title: 'Dung lượng',
      key: 'size',
      render: (_: any, r: ProcessedImageResult) => (
        <span>
          <span style={{ color: '#64748B' }}>{formatBytes(r.originalSize)}</span> →{' '}
          <strong>{formatBytes(r.processedSize)}</strong>
          {r.percentReduction > 0 ? (
            <Tag color="green" style={{ marginLeft: 6 }}>
              -{r.percentReduction}%
            </Tag>
          ) : r.isKeptOriginal ? (
            <Tag color="default" style={{ marginLeft: 6 }}>
              Giữ gốc
            </Tag>
          ) : null}
        </span>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 140,
      render: (_: any, r: ProcessedImageResult) => {
        const orig = originalFiles.find((f) => f.name === r.originalName);
        return (
          <Space>
            {orig && (
              <Tooltip title="So sánh trước/sau">
                <Button
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() =>
                    setComparing({
                      origUrl: orig.previewUrl,
                      procUrl: r.downloadUrl,
                      name: r.originalName,
                    })
                  }
                />
              </Tooltip>
            )}
            <Button
              size="small"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => downloadBlob(r.blob, r.originalName)}
            >
              Tải
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <>
      <Table
        dataSource={results}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={results.length > 10 ? { pageSize: 10 } : false}
        scroll={{ x: 500 }}
      />
      {comparing && (
        <BeforeAfterModal
          open={!!comparing}
          onClose={() => setComparing(null)}
          origUrl={comparing.origUrl}
          procUrl={comparing.procUrl}
          name={comparing.name}
        />
      )}
    </>
  );
};
