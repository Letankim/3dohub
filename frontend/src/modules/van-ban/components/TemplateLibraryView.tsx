'use client';

import React from 'react';
import { Card, Col, Row, Button, Tag, Typography, Space } from 'antd';
import { FileAddOutlined, BankOutlined } from '@ant-design/icons';
import { TemplateItem } from '@/types/api';

const { Title, Text } = Typography;

interface TemplateLibraryViewProps {
  templates: TemplateItem[];
  onSelectTemplate: (tag: string) => void;
  onOpenUnitDrawer: () => void;
  loading?: boolean;
}

export const TemplateLibraryView: React.FC<TemplateLibraryViewProps> = ({
  templates,
  onSelectTemplate,
  onOpenUnitDrawer,
  loading,
}) => {
  const dangTemplates = templates.filter((t) => t.group === 'DANG');
  const nnTemplates = templates.filter((t) => t.group === 'NHA_NUOC');

  const renderGroup = (
    groupTitle: string,
    subTitle: string,
    badgeText: string,
    badgeColor: string,
    items: TemplateItem[]
  ) => (
    <Card
      size="small"
      title={
        <Space>
          <span style={{ fontWeight: 700, color: '#0F172A' }}>{groupTitle}</span>
          <Tag color={badgeColor}>{badgeText}</Tag>
          <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
            {subTitle}
          </Text>
        </Space>
      }
      extra={
        <Button size="small" icon={<BankOutlined />} onClick={onOpenUnitDrawer}>
          Cấu hình thông tin đơn vị điền tự động
        </Button>
      }
      style={{ marginBottom: 20, borderRadius: 6, border: '1px solid #E2E8F0' }}
    >
      <Row gutter={[12, 12]}>
        {items.map((tpl) => (
          <Col xs={24} sm={12} md={8} lg={6} key={tpl.id}>
            <Card
              size="small"
              hoverable
              style={{ borderRadius: 4, border: '1px solid #E2E8F0', height: '100%' }}
              onClick={() => onSelectTemplate(tpl.tag)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <Tag color={tpl.group === 'DANG' ? 'red' : 'blue'} style={{ margin: 0, fontWeight: 600 }}>
                  {tpl.code || 'CV'}
                </Tag>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {tpl.tag}
                </Text>
              </div>
              <Title level={5} style={{ margin: '0 0 6px 0', fontSize: 15, color: '#0F172A' }}>
                {tpl.doc_type}
              </Title>
              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
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
                Tạo văn bản mẫu
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );

  return (
    <div>
      {renderGroup(
        '1. MẪU VĂN BẢN KHỐI ĐẢNG (9 MẪU CHUẨN)',
        'Theo Quy định 399-QĐ/TW ngày 09/01/2026 & Hướng dẫn 05-HD/VPTW ngày 27/5/2026',
        '9 Mẫu Đảng',
        'red',
        dangTemplates
      )}
      {renderGroup(
        '2. MẪU VĂN BẢN KHỐI NHÀ NƯỚC — CHÍNH QUYỀN, CÔNG AN, QUÂN ĐỘI (8 MẪU CHUẨN)',
        'Theo Nghị định 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ',
        '8 Mẫu Nhà nước',
        'blue',
        nnTemplates
      )}
    </div>
  );
};

