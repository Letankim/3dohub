'use client';

import React, { useState } from 'react';
import {
  Card,
  QRCode,
  Button,
  Space,
  Typography,
  message,
  Tooltip,
  Tag,
} from 'antd';
import {
  DownloadOutlined,
  CopyOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  ShareAltOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { QrCustomization, QrContentType } from './qr-types';
import {
  downloadQrCanvasAsPng,
  downloadQrSvg,
  copyQrCanvasToClipboard,
  printQrElement,
} from './qr-generator-utils';

const { Text, Title, Paragraph } = Typography;

interface QrCodePreviewCardProps {
  payload: string;
  title: string;
  type: QrContentType;
  customization: QrCustomization;
  onSaveToHistory?: () => void;
}

const QR_ELEMENT_ID = 'main-generated-qr-canvas';

export const QrCodePreviewCard: React.FC<QrCodePreviewCardProps> = ({
  payload,
  title,
  type,
  customization,
  onSaveToHistory,
}) => {
  const [copied, setCopied] = useState(false);

  const handleDownloadPng = () => {
    const success = downloadQrCanvasAsPng(QR_ELEMENT_ID, `QR_${type.toLowerCase()}.png`);
    if (success) {
      message.success('Đã tải hình ảnh mã QR (PNG)!');
      onSaveToHistory?.();
    } else {
      message.error('Không thể tạo file ảnh tải về.');
    }
  };

  const handleDownloadSvg = () => {
    const success = downloadQrSvg(QR_ELEMENT_ID, `QR_${type.toLowerCase()}.svg`);
    if (success) {
      message.success('Đã tải file vector SVG!');
      onSaveToHistory?.();
    } else {
      message.warning('Tải bản PNG thay thế vì trình duyệt đang kết xuất Canvas.');
    }
  };

  const handleCopyImage = async () => {
    const ok = await copyQrCanvasToClipboard(QR_ELEMENT_ID);
    if (ok) {
      setCopied(true);
      message.success('Đã sao chép hình ảnh mã QR vào bộ nhớ tạm!');
      setTimeout(() => setCopied(false), 2500);
      onSaveToHistory?.();
    } else {
      // Fallback: copy raw text
      navigator.clipboard.writeText(payload);
      message.info('Đã sao chép nội dung mã QR vào bộ nhớ tạm.');
    }
  };

  const handlePrint = () => {
    printQrElement(QR_ELEMENT_ID, title || 'Mã QR');
    onSaveToHistory?.();
  };

  return (
    <Card
      style={{
        borderRadius: 6,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
        background: '#FFFFFF',
      }}
      styles={{ body: { padding: 24, textAlign: 'center' } }}
    >
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ fontSize: 14, color: '#0F172A' }}>
          Kết quả mã QR trực tiếp
        </Text>
        <Tag color="blue" style={{ borderRadius: 4, fontWeight: 500 }}>
          {type}
        </Tag>
      </div>

      {/* QR Code Canvas Container */}
      <div
        id={QR_ELEMENT_ID}
        style={{
          display: 'inline-flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 16,
          background: customization.bgColor || '#FFFFFF',
          borderRadius: 8,
          border: customization.bordered ? '1px solid #E2E8F0' : 'none',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.06)',
          margin: '12px auto',
        }}
      >
        <QRCode
          value={payload || 'https://3dohub.com'}
          size={customization.size}
          color={customization.fgColor}
          bgColor={customization.bgColor}
          errorLevel={customization.errorLevel}
          icon={customization.icon}
          iconSize={customization.iconSize || 40}
          bordered={false}
          type="svg"
        />
      </div>

      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <Title level={5} style={{ margin: '0 0 4px 0', color: '#0F172A', fontWeight: 600 }}>
          {title || 'Mã QR của bạn'}
        </Title>
        <Paragraph
          ellipsis={{ rows: 2 }}
          style={{ margin: 0, fontSize: 12, color: '#64748B', maxWidth: 360, marginInline: 'auto' }}
        >
          {payload}
        </Paragraph>
      </div>

      {/* Action Buttons */}
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownloadPng}
            size="large"
            style={{ borderRadius: 4, backgroundColor: '#1D4ED8', fontWeight: 600 }}
          >
            Tải ảnh PNG
          </Button>
          <Button
            icon={<PictureOutlined />}
            onClick={handleDownloadSvg}
            size="large"
            style={{ borderRadius: 4 }}
          >
            Tải file SVG
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button
            icon={copied ? <CheckCircleOutlined style={{ color: '#16A34A' }} /> : <CopyOutlined />}
            onClick={handleCopyImage}
            style={{ borderRadius: 4 }}
          >
            {copied ? 'Đã sao chép' : 'Sao chép ảnh QR'}
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={handlePrint}
            style={{ borderRadius: 4 }}
          >
            In mã QR
          </Button>
        </div>
      </Space>
    </Card>
  );
};

