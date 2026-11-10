'use client';

import React, { useState, useEffect } from 'react';
import { Card, Tabs, Typography } from 'antd';
import {
  CompressOutlined,
  ScissorOutlined,
  MergeCellsOutlined,
  RotateRightOutlined,
} from '@ant-design/icons';
import { PdfTabKey } from './types/pdf';
import { PdfCompressTab } from './components/PdfCompressTab';
import { PdfSplitTab } from './components/PdfSplitTab';
import { PdfMergeTab } from './components/PdfMergeTab';
import { PdfOrganizeTab } from './components/PdfOrganizeTab';

const { Title, Text } = Typography;

export const PdfHubWorkspace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PdfTabKey>('compress');

  // Read URL query parameter for direct tab linking (e.g. ?tab=split)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as PdfTabKey;
      if (['compress', 'split', 'merge', 'organize'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleTabChange = (key: string) => {
    const nextTab = key as PdfTabKey;
    setActiveTab(nextTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', nextTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const tabItems = [
    {
      key: 'compress',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <CompressOutlined />
          Nén PDF
        </span>
      ),
      children: <PdfCompressTab />,
    },
    {
      key: 'split',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <ScissorOutlined />
          Tách trang PDF
        </span>
      ),
      children: <PdfSplitTab />,
    },
    {
      key: 'merge',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <MergeCellsOutlined />
          Gộp file PDF
        </span>
      ),
      children: <PdfMergeTab />,
    },
    {
      key: 'organize',
      label: (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
          <RotateRightOutlined />
          Sắp xếp & Xoay trang
        </span>
      ),
      children: <PdfOrganizeTab />,
    },
  ];

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner with 3DoHub Tech Blue Theme */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          borderRadius: 6,
          padding: '20px 24px',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ color: '#FFFFFF', margin: '0 0 6px 0', fontWeight: 700 }}>
              Tiện ích PDF
            </Title>
            <Text style={{ color: '#93C5FD', fontSize: 13 }}>
              Bộ công cụ nén file, trích xuất trang, ghép nối và sắp xếp tài liệu PDF nhanh chóng, tiện lợi.
            </Text>
          </div>

          {/* Quick Capability Badges */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 14px',
                textAlign: 'center',
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#60A5FA' }}>Nén file</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Giảm dung lượng</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 14px',
                textAlign: 'center',
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#4ADE80' }}>Tách trang</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Trích xuất theo dải</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 14px',
                textAlign: 'center',
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FCD34D' }}>Gộp file</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Ghép nhiều tài liệu</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 14px',
                textAlign: 'center',
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 700, color: '#F472B6' }}>Xoay trang</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Sắp xếp trực quan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card with Tabs */}
      <Card
        style={{
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          background: '#FFFFFF',
          width: '100%',
        }}
        styles={{ body: { padding: '8px 20px 20px 20px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={tabItems}
          style={{ marginBottom: 0 }}
        />
      </Card>
    </div>
  );
};
