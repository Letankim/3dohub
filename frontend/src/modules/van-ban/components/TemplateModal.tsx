'use client';

import React, { useState, useMemo } from 'react';
import {
  Modal,
  Tabs,
  Row,
  Col,
  Card,
  Tag,
  Button,
  Typography,
  Space,
  Input,
  Empty,
  Badge,
} from 'antd';
import {
  FileAddOutlined,
  BankOutlined,
  AppstoreOutlined,
  SearchOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { TemplateItem } from '@/types/api';
import extendedTemplatesData from '../data/templates-extended.json';

const { Title, Text, Paragraph } = Typography;

export interface ExtendedTemplateItem {
  id: string;
  tag: string;
  code: string;
  name: string;
  doc_type: string;
  category: string;
  categoryLabel: string;
  categoryColor: string;
  legal_basis: string;
  description: string;
  keywords: string[];
  raw_text: string;
  line_count: number;
}

const ALL_EXTENDED: ExtendedTemplateItem[] =
  extendedTemplatesData as ExtendedTemplateItem[];

const CATEGORIES = [
  { key: 'ALL', label: 'Tất cả', count: ALL_EXTENDED.length },
  {
    key: 'DANG',
    label: 'Khối Đảng',
    count: ALL_EXTENDED.filter((t) => t.category === 'DANG').length,
  },
  {
    key: 'HANH_CHINH',
    label: 'Hành chính',
    count: ALL_EXTENDED.filter((t) => t.category === 'HANH_CHINH').length,
  },
  {
    key: 'THI_DUA',
    label: 'Khen thưởng',
    count: ALL_EXTENDED.filter((t) => t.category === 'THI_DUA').length,
  },
  {
    key: 'CAND',
    label: 'Công an',
    count: ALL_EXTENDED.filter((t) => t.category === 'CAND').length,
  },
  {
    key: 'QUAN_DOI',
    label: 'Quân đội',
    count: ALL_EXTENDED.filter((t) => t.category === 'QUAN_DOI').length,
  },
  {
    key: 'DOAN',
    label: 'Đoàn TN',
    count: ALL_EXTENDED.filter((t) => t.category === 'DOAN').length,
  },
  {
    key: 'DON_TU',
    label: 'Đơn từ',
    count: ALL_EXTENDED.filter((t) => t.category === 'DON_TU').length,
  },
  {
    key: 'CHUYEN_NGANH',
    label: 'Chuyên ngành',
    count: ALL_EXTENDED.filter((t) => t.category === 'CHUYEN_NGANH').length,
  },
];

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

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
  onSelectTemplate,
  onOpenUnitModal,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchText, setSearchText] = useState<string>('');

  const filteredItems = useMemo(() => {
    let list = ALL_EXTENDED;
    if (activeTab !== 'ALL') {
      list = list.filter((item) => item.category === activeTab);
    }
    const q = removeVietnameseTones(searchText.trim());
    if (!q) return list;

    return list.filter((item) => {
      const name = removeVietnameseTones(item.name);
      const docType = removeVietnameseTones(item.doc_type);
      const legal = removeVietnameseTones(item.legal_basis);
      const desc = removeVietnameseTones(item.description);
      const tag = removeVietnameseTones(item.tag);
      const kw = item.keywords.map(removeVietnameseTones).join(' ');
      return (
        name.includes(q) ||
        docType.includes(q) ||
        legal.includes(q) ||
        desc.includes(q) ||
        tag.includes(q) ||
        kw.includes(q)
      );
    });
  }, [activeTab, searchText]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="85%"
      centered
      style={{ maxWidth: 1180, minWidth: 320 }}
      title={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingRight: 32,
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Space align="center">
            <AppstoreOutlined style={{ color: '#1D4ED8', fontSize: 18 }} />
            <span style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>
              Kho 165+ mẫu văn bản thể thức chuẩn
            </span>
            <Badge
              count={ALL_EXTENDED.length}
              overflowCount={999}
              style={{ backgroundColor: '#1D4ED8' }}
            />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {/* Search Bar */}
        <Input
          placeholder="Tìm mẫu theo tên, loại văn bản (Nghị quyết, Tờ trình...), số hiệu (NĐ 30, TT 68, NĐ 152)..."
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ borderRadius: 4 }}
        />

        {/* Categories Tab */}
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="small"
          items={CATEGORIES.map((cat) => ({
            key: cat.key,
            label: `${cat.label} (${cat.count})`,
          }))}
          style={{ marginBottom: 0 }}
        />

        {/* Results Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 12,
            color: '#64748B',
          }}
        >
          <span>
            Tìm thấy <strong>{filteredItems.length}</strong> mẫu biểu phù hợp
          </span>
          {searchText && (
            <Button
              type="link"
              size="small"
              onClick={() => setSearchText('')}
              style={{ padding: 0 }}
            >
              Xóa tìm kiếm
            </Button>
          )}
        </div>

        {/* Template Grid with scroll isolation */}
        <div
          style={{
            maxHeight: 'calc(80vh - 240px)',
            minHeight: 260,
            overflowY: 'auto',
            paddingRight: 4,
          }}
        >
          {filteredItems.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy mẫu văn bản phù hợp với từ khóa"
              style={{ padding: '40px 0' }}
            />
          ) : (
            <Row gutter={[12, 12]}>
              {filteredItems.map((tpl) => (
                <Col xs={24} sm={12} md={8} lg={6} key={tpl.id}>
                  <Card
                    size="small"
                    hoverable
                    style={{
                      borderRadius: 4,
                      border: '1px solid #E2E8F0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                    bodyStyle={{
                      display: 'flex',
                      flexDirection: 'column',
                      flex: 1,
                      padding: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 6,
                      }}
                    >
                      <Tag
                        color={tpl.categoryColor || 'blue'}
                        style={{ margin: 0, fontWeight: 600, fontSize: 11 }}
                      >
                        {tpl.categoryLabel}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {tpl.tag}
                      </Text>
                    </div>

                    <Title
                      level={5}
                      ellipsis={{ rows: 2 }}
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: 14,
                        color: '#0F172A',
                        lineHeight: 1.3,
                        minHeight: 36,
                      }}
                    >
                      {tpl.name}
                    </Title>

                    <Paragraph
                      type="secondary"
                      ellipsis={{ rows: 2 }}
                      style={{
                        fontSize: 12,
                        marginBottom: 8,
                        color: '#64748B',
                        flex: 1,
                      }}
                    >
                      {tpl.description || tpl.doc_type}
                    </Paragraph>

                    <div style={{ marginBottom: 10 }}>
                      <Text
                        type="secondary"
                        style={{
                          fontSize: 11,
                          display: 'block',
                          color: '#475569',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <FileTextOutlined style={{ marginRight: 4 }} />
                        {tpl.legal_basis}
                      </Text>
                    </div>

                    <Button
                      type="primary"
                      size="small"
                      icon={<FileAddOutlined />}
                      loading={loading}
                      block
                      onClick={() => {
                        onSelectTemplate(tpl.tag);
                        onClose();
                      }}
                      style={{ background: '#1D4ED8', borderRadius: 4 }}
                    >
                      Sử dụng mẫu
                    </Button>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </Modal>
  );
};
