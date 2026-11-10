'use client';

import React from 'react';
import { Button, Typography } from 'antd';
import { CheckCircleOutlined, FilePdfOutlined, RedoOutlined } from '@ant-design/icons';
import { useIsMobile } from '../hooks/useIsMobile';

const { Text } = Typography;

/** Thanh thông tin file đang mở + nút đổi file */
export const PdfFileSummary: React.FC<{
  name: string;
  meta: string;
  onChange: () => void;
  extra?: React.ReactNode;
}> = ({ name, meta, onChange, extra }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '10px 12px',
      background: '#F8FAFC',
      borderRadius: 6,
      border: '1px solid #E2E8F0',
      marginBottom: 16,
      flexWrap: 'wrap',
    }}
  >
    <FilePdfOutlined style={{ fontSize: 26, color: '#DC2626', flexShrink: 0 }} />
    <div style={{ flex: '1 1 140px', minWidth: 0 }}>
      <Text strong ellipsis style={{ display: 'block', fontSize: 13.5, color: '#0F172A' }}>
        {name}
      </Text>
      <Text type="secondary" style={{ fontSize: 12 }}>
        {meta}
      </Text>
    </div>
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {extra}
      <Button size="small" icon={<RedoOutlined />} onClick={onChange} style={{ borderRadius: 4 }}>
        Đổi file
      </Button>
    </div>
  </div>
);

/** Khối kết quả thành công + nút tải về */
export const PdfResultBanner: React.FC<{
  title: string;
  children?: React.ReactNode;
  downloadLabel: string;
  downloadIcon: React.ReactNode;
  onDownload: () => void;
  againLabel: string;
  onAgain: () => void;
}> = ({ title, children, downloadLabel, downloadIcon, onDownload, againLabel, onAgain }) => {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        background: '#F0FDF4',
        border: '1px solid #86EFAC',
        borderRadius: 6,
        padding: isMobile ? 14 : 20,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <CheckCircleOutlined style={{ color: '#16A34A', fontSize: 20 }} />
        <Text strong style={{ color: '#15803D', fontSize: 15 }}>
          {title}
        </Text>
      </div>
      {children && <div style={{ marginBottom: 14 }}>{children}</div>}
      <div style={{ display: 'flex', gap: 10, flexDirection: isMobile ? 'column' : 'row' }}>
        <Button
          type="primary"
          size="large"
          icon={downloadIcon}
          onClick={onDownload}
          block={isMobile}
          style={{ background: '#16A34A', borderColor: '#16A34A', borderRadius: 4, fontWeight: 600 }}
        >
          {downloadLabel}
        </Button>
        <Button size="large" icon={<RedoOutlined />} onClick={onAgain} block={isMobile} style={{ borderRadius: 4 }}>
          {againLabel}
        </Button>
      </div>
    </div>
  );
};

/** Lưới hình thu nhỏ tự co giãn theo màn hình */
export const PdfPageGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isMobile = useIsMobile();
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 96 : 130}px, 1fr))`,
        gap: isMobile ? 8 : 12,
        maxHeight: isMobile ? 380 : 480,
        overflowY: 'auto',
        padding: isMobile ? 6 : 10,
        border: '1px solid #E2E8F0',
        borderRadius: 6,
        background: '#FAFAFA',
      }}
    >
      {children}
    </div>
  );
};

