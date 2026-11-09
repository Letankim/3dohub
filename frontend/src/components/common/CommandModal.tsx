'use client';

import React, { useState, useEffect } from 'react';
import { Modal, Input, List, Tag, Typography, Space } from 'antd';
import { SearchOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { HUB_MODULES_REGISTRY, HubNavModule } from '@/config/modules-registry';

const { Text } = Typography;

interface CommandModalProps {
  open: boolean;
  onClose: () => void;
  onSelectModule: (mod: HubNavModule) => void;
}

export const CommandModal: React.FC<CommandModalProps> = ({
  open,
  onClose,
  onSelectModule,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (open) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const filtered = HUB_MODULES_REGISTRY.filter(
    (m) =>
      m.label.toLowerCase().includes(query.toLowerCase()) ||
      m.shortDesc.toLowerCase().includes(query.toLowerCase()) ||
      m.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={
        <Space>
          <ThunderboltOutlined style={{ color: '#1D4ED8' }} />
          <span>Tìm kiếm nhanh công cụ & mẫu văn bản (3DoHub Command)</span>
        </Space>
      }
      width={620}
    >
      <Input
        prefix={<SearchOutlined style={{ color: '#64748B' }} />}
        placeholder="Nhập tên công cụ, mẫu Nghị quyết, Quyết định, Công văn..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        allowClear
        autoFocus
        style={{ marginBottom: 12 }}
      />
      <List
        size="small"
        bordered
        dataSource={filtered}
        style={{ maxHeight: 360, overflowY: 'auto', borderRadius: 4 }}
        renderItem={(item) => (
          <List.Item
            style={{ cursor: 'pointer', padding: '10px 14px' }}
            onClick={() => {
              onSelectModule(item);
              onClose();
            }}
          >
            <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text strong style={{ color: '#0F172A' }}>
                  {item.label}
                </Text>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {item.shortDesc}
                  </Text>
                </div>
              </div>
              <Tag color="blue" style={{ margin: 0 }}>
                Mở nhanh
              </Tag>
            </div>
          </List.Item>
        )}
      />
    </Modal>
  );
};

