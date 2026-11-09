'use client';

import React, { useState, useCallback } from 'react';
import { Row, Col, Card, Typography } from 'antd';
import { QrcodeOutlined } from '@ant-design/icons';
import { QrContentType, QrCustomization } from './qr-types';
import { QrCodeForm } from './QrCodeForm';
import { QrCodeCustomizer } from './QrCodeCustomizer';
import { QrCodePreviewCard } from './QrCodePreviewCard';

const { Title, Text } = Typography;

const DEFAULT_CUSTOMIZATION: QrCustomization = {
  size: 220,
  fgColor: '#000000',
  bgColor: '#FFFFFF',
  errorLevel: 'M',
  bordered: true,
};

export const QrCodeWorkspace: React.FC = () => {
  const [payload, setPayload] = useState('https://3dohub.com');
  const [title, setTitle] = useState('Liên kết: https://3dohub.com');
  const [type, setType] = useState<QrContentType>('URL');
  const [customization, setCustomization] = useState<QrCustomization>(DEFAULT_CUSTOMIZATION);

  const handleFormChange = useCallback((newPayload: string, newTitle: string, newType: QrContentType) => {
    setPayload(newPayload);
    setTitle(newTitle);
    setType(newType);
  }, []);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner - Full Width */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          borderRadius: 6,
          padding: '20px 24px',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Title level={3} style={{ color: '#FFFFFF', margin: '0 0 6px 0', fontWeight: 700 }}>
              Tạo mã QR
            </Title>
            <Text style={{ color: '#93C5FD', fontSize: 13 }}>
              Tạo mã QR cho liên kết web, Wi-Fi, danh thiếp, văn bản, email với đầy đủ tùy chỉnh màu sắc và tải ảnh định dạng PNG/SVG.
            </Text>
          </div>
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              padding: '6px 14px',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 13,
            }}
          >
            <QrcodeOutlined style={{ fontSize: 18, color: '#60A5FA' }} />
            <span>Mã QR sắc nét, quét ngay trên điện thoại</span>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid */}
      <Row gutter={[16, 16]}>
        {/* Left: Input Form + Customizer */}
        <Col xs={24} lg={14} xl={15}>
          <Card
            style={{
              borderRadius: 6,
              border: '1px solid #E2E8F0',
              boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
              background: '#FFFFFF',
            }}
            styles={{ body: { padding: 20 } }}
          >
            <QrCodeForm onChange={handleFormChange} />
            <QrCodeCustomizer value={customization} onChange={setCustomization} />
          </Card>
        </Col>

        {/* Right: Live Preview + Instant Actions */}
        <Col xs={24} lg={10} xl={9}>
          <QrCodePreviewCard
            payload={payload}
            title={title}
            type={type}
            customization={customization}
          />
        </Col>
      </Row>
    </div>
  );
};

