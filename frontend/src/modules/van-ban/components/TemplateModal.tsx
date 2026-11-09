'use client';

import React, { useState } from 'react';
import { Modal, Tabs, Row, Col, Card, Tag, Button, Typography, Space } from 'antd';
import { FileAddOutlined, BankOutlined, AppstoreOutlined } from '@ant-design/icons';
import { TemplateItem } from '@/types/api';

const { Title, Text } = Typography;

interface TemplateModalProps {
  open: boolean;
  onClose: () => void;
  templates: TemplateItem[];
  onSelectTemplate: (tag: string) => void;
  onOpenUnitModal: () => void;
  loading?: boolean;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  open,
  onClose,
  templates,
  onSelectTemplate,
  onOpenUnitModal,
  loading,
}) => {
  const [activeGroup, setActiveGroup] = useState<string>('DANG');

  const dangList = templates.filter((t) => t.group === 'DANG');
  const nnList = templates.filter((t) => t.group === 'NHA_NUOC');

  const renderGrid = (items: TemplateItem[]) => (
    <Row gutter={[12, 12]}>
      {items.map((tpl) => (
        <Col xs={24} sm={12} md={8} key={tpl.id}>
          <Card
            size="small"
            hoverable
            style={{ borderRadius: 4, border: '1px solid #E2E8F0', height: '100%' }}
            onClick={() => {
              onSelectTemplate(tpl.tag);
              onClose();
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <Tag color={tpl.group === 'DANG' ? 'red' : 'blue'} style={{ margin: 0, fontWeight: 600 }}>
                {tpl.code || 'CV'}
              </Tag>
              <Text type="secondary" style={{ fontSize: 11 }}>
                {tpl.tag}
              </Text>
            </div>
            <Title level={5} style={{ margin: '0 0 4px 0', fontSize: 15, color: '#0F172A' }}>
              {tpl.doc_type}
            </Title>
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
              {tpl.statusLabel}
            </Text>
            <Button
              type="primary"
              size="small"
              icon={<FileAddOutlined />}
              loading={loading}
              block
              style={{ background: '#1D4ED8' }}
            >
              Chọn mẫu
            </Button>
          </Card>
        </Col>
      ))}
    </Row>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="70%"
      centered
      style={{ maxWidth: 1120, minWidth: 310 }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 28, gap: 8 }}>
          <Space>
            <AppstoreOutlined style={{ color: '#1D4ED8' }} />
            <span style={{ whiteSpace: 'nowrap' }}>Kho 17 mẫu văn bản</span>
          </Space>
          <Button
            size="small"
            icon={<BankOutlined />}
            onClick={() => {
              onClose();
              onOpenUnitModal();
            }}
          >
            Cấu hình đơn vị
          </Button>
        </div>
      }
    >
      <Tabs
        activeKey={activeGroup}
        onChange={setActiveGroup}
        items={[
          {
            key: 'DANG',
            label: (
              <Space>
                <span>Khối Đảng (QĐ 399 & HD 05-HD/VPTW)</span>
                <Tag color="red" style={{ margin: 0 }}>
                  9 mẫu
                </Tag>
              </Space>
            ),
            children: renderGrid(dangList),
          },
          {
            key: 'NHA_NUOC',
            label: (
              <Space>
                <span>Khối Nhà nước — Chính quyền, Công an, Quân đội (NĐ 30/2020)</span>
                <Tag color="blue" style={{ margin: 0 }}>
                  8 mẫu
                </Tag>
              </Space>
            ),
            children: renderGrid(nnList),
          },
        ]}
      />
    </Modal>
  );
};
