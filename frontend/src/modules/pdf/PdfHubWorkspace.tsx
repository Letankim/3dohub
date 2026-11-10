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
import { useIsMobile } from './hooks/useIsMobile';

const { Title, Text } = Typography;

const TAB_ITEMS: Array<{ key: PdfTabKey; label: string; icon: React.ReactNode; node: React.ReactNode }> = [
  { key: 'compress', label: 'Nén', icon: <CompressOutlined />, node: <PdfCompressTab /> },
  { key: 'split', label: 'Tách', icon: <ScissorOutlined />, node: <PdfSplitTab /> },
  { key: 'merge', label: 'Gộp', icon: <MergeCellsOutlined />, node: <PdfMergeTab /> },
  { key: 'organize', label: 'Xoay', icon: <RotateRightOutlined />, node: <PdfOrganizeTab /> },
];

export const PdfHubWorkspace: React.FC = () => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<PdfTabKey>('compress');

  useEffect(() => {
    const tabParam = new URLSearchParams(window.location.search).get('tab') as PdfTabKey;
    if (TAB_ITEMS.some((t) => t.key === tabParam)) setActiveTab(tabParam);
  }, []);

  const handleTabChange = (key: string) => {
    setActiveTab(key as PdfTabKey);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', key);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          borderRadius: 6,
          padding: isMobile ? '14px 16px' : '18px 24px',
        }}
      >
        <Title level={isMobile ? 4 : 3} style={{ color: '#FFFFFF', margin: '0 0 4px 0', fontWeight: 700 }}>
          Tiện ích PDF
        </Title>
        <Text style={{ color: '#93C5FD', fontSize: 13 }}>Nén, tách, gộp và xoay trang PDF</Text>
      </div>

      <Card
        style={{ borderRadius: 6, border: '1px solid #E2E8F0', width: '100%' }}
        styles={{ body: { padding: isMobile ? '0 10px 12px' : '4px 20px 20px' } }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          size={isMobile ? 'middle' : 'large'}
          tabBarGutter={isMobile ? 8 : 24}
          tabBarStyle={{ marginBottom: 12 }}
          items={TAB_ITEMS.map((t) => ({
            key: t.key,
            label: (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                {t.icon}
                {t.label}
              </span>
            ),
            children: t.node,
          }))}
        />
      </Card>
    </div>
  );
};
