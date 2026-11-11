'use client';

import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import {
  CompressOutlined,
  SwapOutlined,
  ScissorOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
import { ImageCompressTab } from './components/ImageCompressTab';
import { ImageConvertTab } from './components/ImageConvertTab';
import { ImageResizeTab } from './components/ImageResizeTab';
import { ImageToPdfTab } from './components/ImageToPdfTab';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

export interface ImageHubWorkspaceProps {
  initialTab?: 'compress' | 'convert' | 'resize' | 'image-to-pdf';
}

export const ImageHubWorkspace: React.FC<ImageHubWorkspaceProps> = ({
  initialTab = 'compress',
}) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  const tabItems = [
    {
      key: 'compress',
      label: (
        <span>
          <CompressOutlined style={{ marginRight: 6 }} />
          Nén
        </span>
      ),
      children: <ImageCompressTab />,
    },
    {
      key: 'convert',
      label: (
        <span>
          <SwapOutlined style={{ marginRight: 6 }} />
          Đổi định dạng
        </span>
      ),
      children: <ImageConvertTab />,
    },
    {
      key: 'resize',
      label: (
        <span>
          <ScissorOutlined style={{ marginRight: 6 }} />
          Thay đổi cỡ
        </span>
      ),
      children: <ImageResizeTab />,
    },
    {
      key: 'image-to-pdf',
      label: (
        <span>
          <FilePdfOutlined style={{ marginRight: 6 }} />
          Ảnh → PDF
        </span>
      ),
      children: <ImageToPdfTab />,
    },
  ];

  return (
    <Card
      style={{
        borderRadius: 6,
        border: '1px solid #E2E8F0',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
      }}
      bodyStyle={{ padding: isMobile ? 12 : 20 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size={isMobile ? 'small' : 'middle'}
        style={{ minHeight: 480 }}
      />
    </Card>
  );
};

export default ImageHubWorkspace;

