'use client';

import React, { useState, useMemo } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Tag,
  Typography,
  Space,
  Button,
  Tabs,
  Table,
  Empty,
  Badge,
  message,
  Collapse,
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  CopyOutlined,
  FileWordOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  FieldTimeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { REGULATIONS_DATA } from './data/regulations-data';
import { LegalRegulationItem } from './types/doc-lookup';

const { Title, Text, Paragraph } = Typography;

function removeVietnameseTones(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

interface DocLookupWorkspaceProps {
  onOpenTemplatesModal?: () => void;
  onOpenEditor?: () => void;
}

export const DocLookupWorkspace: React.FC<DocLookupWorkspaceProps> = ({
  onOpenTemplatesModal,
  onOpenEditor,
}) => {
  const isMobile = useIsMobile();
  const [searchText, setSearchText] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const filteredRegulations = useMemo(() => {
    let list = REGULATIONS_DATA;
    if (activeCategory !== 'ALL') {
      list = list.filter((r) => r.category === activeCategory);
    }
    const q = removeVietnameseTones(searchText.trim());
    if (!q) return list;

    return list.filter((r) => {
      const title = removeVietnameseTones(r.title);
      const num = removeVietnameseTones(r.documentNumber);
      const summary = removeVietnameseTones(r.summary);
      const organ = removeVietnameseTones(r.issuingOrgan);
      const kw = r.keywords.map(removeVietnameseTones).join(' ');
      const comp = r.formatRules.map((f) => removeVietnameseTones(f.component)).join(' ');
      return (
        title.includes(q) ||
        num.includes(q) ||
        summary.includes(q) ||
        organ.includes(q) ||
        kw.includes(q) ||
        comp.includes(q)
      );
    });
  }, [searchText, activeCategory]);

  const handleCopyCitation = (item: LegalRegulationItem) => {
    const text = `${item.title} (Số: ${item.documentNumber}, Cơ quan ban hành: ${item.issuingOrgan}, Ngày có hiệu lực: ${item.effectiveDate})`;
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép trích dẫn căn cứ pháp lý: ${item.documentNumber}`);
  };

  const columns = [
    {
      title: 'Thành phần thể thức',
      dataIndex: 'component',
      key: 'component',
      width: 170,
      render: (val: string) => <Text strong>{val}</Text>,
    },
    {
      title: 'Kiểu chữ',
      dataIndex: 'fontStyle',
      key: 'fontStyle',
      width: 170,
    },
    {
      title: 'Cỡ chữ',
      dataIndex: 'fontSize',
      key: 'fontSize',
      width: 100,
      render: (val: string) => <Tag color="blue">{val}</Tag>,
    },
    {
      title: 'Vị trí & Căn lề',
      dataIndex: 'alignment',
      key: 'alignment',
      width: 160,
    },
    {
      title: 'Ghi chú & Ví dụ',
      dataIndex: 'note',
      key: 'note',
      render: (val: string) => <Text type="secondary" style={{ fontSize: 12 }}>{val}</Text>,
    },
  ];

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: isMobile ? '8px 12px' : '16px 20px' }}>
      {/* Top Banner */}
      <Card
        size="small"
        style={{
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          marginBottom: 16,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <Space align="center">
              <BookOutlined style={{ fontSize: 20, color: '#1D4ED8' }} />
              <Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 18, color: '#0F172A' }}>
                Tra cứu thể thức & văn bản quy phạm
              </Title>
              <Badge count={REGULATIONS_DATA.length} style={{ backgroundColor: '#1D4ED8' }} />
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
              Cơ sở dữ liệu quy chuẩn thể thức NĐ 30/2020, HD 05-HD/VPTW, NĐ 152/2025, TT 26/2019, TT 68/2023 và HD 29-HD/TWĐTN
            </Text>
          </div>

          <Space wrap size="small">
            {onOpenEditor && (
              <Button
                size="small"
                icon={<EditOutlined />}
                onClick={onOpenEditor}
              >
                Soạn văn bản
              </Button>
            )}
            {onOpenTemplatesModal && (
              <Button
                type="primary"
                size="small"
                icon={<FileWordOutlined />}
                onClick={onOpenTemplatesModal}
                style={{ background: '#1D4ED8' }}
              >
                Mở kho 165+ mẫu
              </Button>
            )}
          </Space>
        </div>
      </Card>

      {/* Search Input & Quick Specs */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={16}>
          <Input
            placeholder="Tìm quy định theo số hiệu (30/2020, 152/2025...), từ khóa (căn lề, phông chữ, chữ ký, độ mật)..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 4, height: 40 }}
          />
        </Col>
        <Col xs={24} md={8}>
          <Card size="small" style={{ borderRadius: 4, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
              <span>Lề chuẩn A4: <strong>Trên/Dưới 20-25mm · Trái 30-35mm · Phải 15-20mm</strong></span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Category Tabs */}
      <Tabs
        activeKey={activeCategory}
        onChange={setActiveCategory}
        size="small"
        items={[
          { key: 'ALL', label: `Tất cả (${REGULATIONS_DATA.length})` },
          { key: 'HANH_CHINH', label: 'Hành chính (NĐ 30)' },
          { key: 'DANG', label: 'Khối Đảng (HD 05)' },
          { key: 'THI_DUA', label: 'Thi đua (NĐ 152)' },
          { key: 'CAND', label: 'Công an (TT 26)' },
          { key: 'QUAN_DOI', label: 'Quân đội (TT 68)' },
          { key: 'DOAN', label: 'Đoàn TN (HD 29)' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* Regulations List */}
      {filteredRegulations.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Không tìm thấy văn bản quy phạm nào phù hợp với từ khóa"
          style={{ padding: '60px 0' }}
        />
      ) : (
        <Space direction="vertical" style={{ width: '100%' }} size={16}>
          {filteredRegulations.map((reg) => (
            <Card
              key={reg.id}
              size="small"
              style={{
                borderRadius: 6,
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                <div>
                  <Space wrap align="center">
                    <Tag color={reg.categoryColor} style={{ fontWeight: 600 }}>
                      {reg.categoryLabel}
                    </Tag>
                    <Tag color="default" style={{ fontWeight: 600 }}>
                      {reg.documentNumber}
                    </Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <FieldTimeOutlined style={{ marginRight: 4 }} />
                      Hiệu lực: {reg.effectiveDate}
                    </Text>
                  </Space>
                  <Title level={5} style={{ margin: '8px 0 4px 0', fontSize: 16, color: '#0F172A' }}>
                    {reg.title}
                  </Title>
                  <Paragraph type="secondary" style={{ margin: 0, fontSize: 13, color: '#475569' }}>
                    {reg.summary}
                  </Paragraph>
                </div>

                <Space>
                  <Button
                    size="small"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyCitation(reg)}
                  >
                    Sao chép căn cứ
                  </Button>
                </Space>
              </div>

              {/* Collapsible Format Details Table */}
              <Collapse
                ghost
                size="small"
                defaultActiveKey={['format_rules']}
                items={[
                  {
                    key: 'format_rules',
                    label: (
                      <Space>
                        <InfoCircleOutlined style={{ color: '#1D4ED8' }} />
                        <span style={{ fontWeight: 600 }}>Quy cách thể thức chi tiết từng thành phần</span>
                        <Tag color="blue">{reg.formatRules.length} thành phần</Tag>
                      </Space>
                    ),
                    children: (
                      <Table
                        columns={columns}
                        dataSource={reg.formatRules.map((f, idx) => ({ ...f, key: `${reg.id}_${idx}` }))}
                        pagination={false}
                        size="small"
                        scroll={{ x: 750 }}
                        style={{ border: '1px solid #F1F5F9', borderRadius: 4 }}
                      />
                    ),
                  },
                  {
                    key: 'key_provisions',
                    label: (
                      <Space>
                        <CheckCircleOutlined style={{ color: '#16A34A' }} />
                        <span style={{ fontWeight: 600 }}>Quy định trọng tâm cần lưu ý</span>
                      </Space>
                    ),
                    children: (
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {reg.keyProvisions.map((prov, i) => (
                          <li key={i} style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                            {prov}
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]}
              />
            </Card>
          ))}
        </Space>
      )}
    </div>
  );
};
