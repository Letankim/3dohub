'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
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
  Spin,
  Divider,
  message,
} from 'antd';
import {
  SearchOutlined,
  BookOutlined,
  CopyOutlined,
  FileWordOutlined,
  CheckCircleOutlined,
  FieldTimeOutlined,
  EditOutlined,
  BankOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { hubApi } from '@/services/api-client';
import { LegalRegulationApiItem } from '@/types/api';

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
  const [regulations, setRegulations] = useState<LegalRegulationApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('ALL');

  const fetchRegulations = useCallback(async () => {
    setLoading(true);
    try {
      const res = await hubApi.getLegalRegulations();
      if (res.data) {
        setRegulations(res.data);
      }
    } catch {
      message.error('Không thể tải dữ liệu văn bản từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRegulations();
  }, [fetchRegulations]);

  const filteredList = useMemo(() => {
    let list = regulations;
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
      const kw = (r.keywords || []).map(removeVietnameseTones).join(' ');
      const comp = (r.formatRules || [])
        .map((f) => removeVietnameseTones(`${f.component} ${f.note}`))
        .join(' ');
      return (
        title.includes(q) ||
        num.includes(q) ||
        summary.includes(q) ||
        organ.includes(q) ||
        kw.includes(q) ||
        comp.includes(q)
      );
    });
  }, [regulations, searchText, activeCategory]);

  const handleCopyCitation = (item: LegalRegulationApiItem) => {
    const text = `${item.title} (Số: ${item.documentNumber}, Cơ quan ban hành: ${item.issuingOrgan}, Hiệu lực: ${item.effectiveDate})`;
    navigator.clipboard.writeText(text);
    message.success(`Đã sao chép căn cứ pháp lý: ${item.documentNumber}`);
  };

  const columns = [
    {
      title: 'Thành phần thể thức',
      dataIndex: 'component',
      key: 'component',
      width: 190,
      render: (val: string) => <Text strong style={{ color: '#0F172A' }}>{val}</Text>,
    },
    {
      title: 'Kiểu chữ',
      dataIndex: 'fontStyle',
      key: 'fontStyle',
      width: 210,
    },
    {
      title: 'Cỡ chữ',
      dataIndex: 'fontSize',
      key: 'fontSize',
      width: 115,
      render: (val: string) => (
        <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: 'Vị trí & Căn lề',
      dataIndex: 'alignment',
      key: 'alignment',
      width: 200,
    },
    {
      title: 'Quy chuẩn & Ví dụ',
      dataIndex: 'note',
      key: 'note',
      render: (val: string) => (
        <Text type="secondary" style={{ fontSize: 12.5 }}>
          {val}
        </Text>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto' }}>
      {/* Enterprise Search, Category Tabs & Actions */}
      <Card
        size="small"
        style={{
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          marginBottom: 16,
          background: '#FFFFFF',
        }}
        styles={{ body: { padding: isMobile ? 14 : '18px 22px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 14,
          }}
        >
          <div>
            <Space align="center">
              <BookOutlined style={{ fontSize: 20, color: '#1D4ED8' }} />
              <Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 19, color: '#0F172A' }}>
                Tra cứu thể thức & văn bản quy phạm
              </Title>
              <Badge
                count={regulations.length}
                style={{ backgroundColor: '#1D4ED8' }}
              />
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
              Hệ thống quy chuẩn thể thức NĐ 30/2020/NĐ-CP, HD 05-HD/VPTW, NĐ 152/2025/NĐ-CP, TT 26/2019/TT-BCA, TT 68/2023/TT-BQP & HD 29-HD/TWĐTN
            </Text>
          </div>

          <Space wrap size="small">
            {onOpenEditor && (
              <Button icon={<EditOutlined />} onClick={onOpenEditor}>
                Soạn văn bản
              </Button>
            )}
            {onOpenTemplatesModal && (
              <Button
                type="primary"
                icon={<FileWordOutlined />}
                onClick={onOpenTemplatesModal}
                style={{ background: '#1D4ED8' }}
              >
                Mở kho 165+ mẫu
              </Button>
            )}
          </Space>
        </div>

        <Input
          size="large"
          placeholder="Nhập số hiệu (30/2020, 05-HD/VPTW, 152/2025...) hoặc từ khóa (Quốc hiệu, dấu sao, độ mật, chữ ký...)"
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ borderRadius: 4, marginBottom: 12 }}
        />

        <Tabs
          activeKey={activeCategory}
          onChange={setActiveCategory}
          size="small"
          style={{ marginBottom: -12 }}
          items={[
            { key: 'ALL', label: `Tất cả (${regulations.length})` },
            { key: 'HANH_CHINH', label: 'Hành chính Nhà nước' },
            { key: 'DANG', label: 'Khối Đảng' },
            { key: 'THI_DUA', label: 'Thi đua – Khen thưởng' },
            { key: 'CAND', label: 'Công an Nhân dân' },
            { key: 'QUAN_DOI', label: 'Lực lượng Quân đội' },
            { key: 'DOAN', label: 'Đoàn Thanh niên' },
          ]}
        />
      </Card>

      {/* Full-Width Regulations Results */}
      <Spin spinning={loading} tip="Đang tải dữ liệu văn bản quy phạm từ máy chủ...">
        {filteredList.length === 0 && !loading ? (
          <Card style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không tìm thấy văn bản quy phạm nào phù hợp với từ khóa"
              style={{ padding: '48px 0' }}
            />
          </Card>
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={16}>
            {filteredList.map((item) => (
              <Card
                key={item.id}
                style={{ borderRadius: 6, border: '1px solid #E2E8F0', background: '#FFFFFF' }}
                styles={{ body: { padding: isMobile ? 14 : 22 } }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <Space wrap style={{ marginBottom: 8 }}>
                      <Tag color={item.categoryColor} style={{ fontWeight: 600, margin: 0 }}>
                        {item.categoryLabel}
                      </Tag>
                      <Tag color="default" style={{ fontWeight: 600, margin: 0 }}>
                        Số: {item.documentNumber}
                      </Tag>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <FieldTimeOutlined style={{ marginRight: 4 }} />
                        Hiệu lực: {item.effectiveDate}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <BankOutlined style={{ marginRight: 4 }} />
                        {item.issuingOrgan}
                      </Text>
                    </Space>

                    <Title level={4} style={{ margin: '0 0 6px 0', color: '#0F172A', lineHeight: 1.35 }}>
                      {item.title}
                    </Title>
                    <Paragraph style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                      {item.summary}
                    </Paragraph>
                  </div>

                  <Button
                    icon={<CopyOutlined />}
                    onClick={() => handleCopyCitation(item)}
                    style={{ borderRadius: 4 }}
                  >
                    Sao chép căn cứ
                  </Button>
                </div>

                <Divider style={{ margin: '16px 0' }} />

                <div style={{ marginBottom: 18 }}>
                  <Text strong style={{ display: 'block', fontSize: 14, color: '#0F172A', marginBottom: 8 }}>
                    <CheckCircleOutlined style={{ color: '#16A34A', marginRight: 6 }} />
                    Quy định trọng tâm cần tuân thủ
                  </Text>
                  <div
                    style={{
                      background: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: 6,
                      padding: '12px 16px',
                    }}
                  >
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {item.keyProvisions.map((prov, idx) => (
                        <li key={idx} style={{ fontSize: 13, color: '#334155', marginBottom: 4 }}>
                          {prov}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <Text strong style={{ display: 'block', fontSize: 14, color: '#0F172A', marginBottom: 10 }}>
                    <FileTextOutlined style={{ color: '#1D4ED8', marginRight: 6 }} />
                    Bảng thông số thể thức từng thành phần
                  </Text>
                  <Table
                    columns={columns}
                    dataSource={item.formatRules.map((f, idx) => ({ ...f, key: idx }))}
                    pagination={false}
                    size="small"
                    bordered
                    scroll={{ x: 680 }}
                  />
                </div>
              </Card>
            ))}
          </Space>
        )}
      </Spin>
    </div>
  );
};
