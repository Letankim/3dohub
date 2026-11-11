'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  Spin,
  message,
} from 'antd';
import {
  FileAddOutlined,
  BankOutlined,
  AppstoreOutlined,
  SearchOutlined,
  FileTextOutlined,
  ReloadOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { TemplateItem, ExtendedTemplateItem } from '@/types/api';
import { hubApi } from '@/services/api-client';

const { Title, Text, Paragraph } = Typography;

const CATEGORY_DEFS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'DANG', label: 'Khối Đảng' },
  { key: 'HANH_CHINH', label: 'Hành chính' },
  { key: 'THI_DUA', label: 'Khen thưởng' },
  { key: 'CAND', label: 'Công an' },
  { key: 'QUAN_DOI', label: 'Quân đội' },
  { key: 'DOAN', label: 'Đoàn TN' },
  { key: 'DON_TU', label: 'Đơn từ' },
  { key: 'CHUYEN_NGANH', label: 'Chuyên ngành' },
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
  onSelectTemplate: (tag: string) => Promise<void> | void;
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
  const [allTemplates, setAllTemplates] = useState<ExtendedTemplateItem[]>([]);
  const [fetching, setFetching] = useState<boolean>(false);
  const [generatingTag, setGeneratingTag] = useState<string | null>(null);

  const loadFromBackend = useCallback(async (force = false) => {
    if (!force && allTemplates.length > 0) return;
    setFetching(true);
    try {
      const res = await hubApi.getExtendedTemplates();
      if (res.data) {
        setAllTemplates(res.data);
      }
    } catch {
      message.error('Không thể tải kho mẫu từ máy chủ. Vui lòng thử lại.');
    } finally {
      setFetching(false);
    }
  }, [allTemplates.length]);

  useEffect(() => {
    if (open) {
      void loadFromBackend(false);
    }
  }, [open, loadFromBackend]);

  const categoryTabs = useMemo(() => {
    return CATEGORY_DEFS.map((def) => ({
      key: def.key,
      label: `${def.label} (${
        def.key === 'ALL'
          ? allTemplates.length
          : allTemplates.filter((t) => t.category === def.key).length
      })`,
    }));
  }, [allTemplates]);

  const filteredItems = useMemo(() => {
    let list = allTemplates;
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
      const kw = (item.keywords || []).map(removeVietnameseTones).join(' ');
      return (
        name.includes(q) ||
        docType.includes(q) ||
        legal.includes(q) ||
        desc.includes(q) ||
        tag.includes(q) ||
        kw.includes(q)
      );
    });
  }, [allTemplates, activeTab, searchText]);

  const handlePickTemplate = async (tag: string) => {
    if (generatingTag) return;
    setGeneratingTag(tag);
    try {
      await onSelectTemplate(tag);
      onClose();
    } finally {
      setGeneratingTag(null);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={generatingTag ? undefined : onClose}
      closable={!generatingTag}
      maskClosable={!generatingTag}
      footer={null}
      width="95vw"
      style={{ maxWidth: 1440, minWidth: 320, top: 20 }}
      styles={{ body: { padding: '14px 20px 20px' } }}
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
              Kho mẫu văn bản thể thức chuẩn
            </span>
            <Badge
              count={allTemplates.length}
              overflowCount={999}
              style={{ backgroundColor: '#1D4ED8' }}
            />
          </Space>
          <Space wrap>
            <Button
              size="small"
              icon={<ReloadOutlined spin={fetching} />}
              onClick={() => void loadFromBackend(true)}
              disabled={fetching || Boolean(generatingTag)}
            >
              Tải lại từ máy chủ
            </Button>
            <Button
              size="small"
              icon={<BankOutlined />}
              disabled={Boolean(generatingTag)}
              onClick={() => {
                onClose();
                onOpenUnitModal();
              }}
            >
              Cấu hình đơn vị
            </Button>
          </Space>
        </div>
      }
    >
      <Spin
        spinning={fetching || Boolean(generatingTag) || Boolean(loading)}
        tip={
          generatingTag
            ? 'Đang tạo & chuẩn hóa mẫu văn bản từ máy chủ...'
            : 'Đang tải danh sách mẫu từ máy chủ...'
        }
        size="large"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Input
            size="large"
            placeholder="Tìm mẫu theo tên, loại văn bản (Nghị quyết, Tờ trình...), số hiệu (NĐ 30, TT 68, NĐ 152)..."
            prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ borderRadius: 4 }}
          />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            size="small"
            items={categoryTabs}
            style={{ marginBottom: 0 }}
          />

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
              Hiển thị <strong>{filteredItems.length}</strong> / {allTemplates.length} mẫu chuẩn
            </span>
            {searchText && (
              <Button
                type="link"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => setSearchText('')}
                style={{ padding: 0 }}
              >
                Xóa lọc tìm kiếm
              </Button>
            )}
          </div>

          <div
            style={{
              height: 'calc(86vh - 230px)',
              minHeight: 340,
              overflowY: 'auto',
              paddingRight: 6,
            }}
          >
            {filteredItems.length === 0 && !fetching ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy mẫu văn bản phù hợp với từ khóa"
                style={{ padding: '60px 0' }}
              />
            ) : (
              <Row gutter={[14, 14]}>
                {filteredItems.map((tpl) => {
                  const isPicking = generatingTag === tpl.tag;
                  return (
                    <Col xs={24} sm={12} md={8} xl={6} key={tpl.id}>
                      <Card
                        size="small"
                        hoverable
                        style={{
                          borderRadius: 6,
                          border: isPicking ? '1.5px solid #1D4ED8' : '1px solid #E2E8F0',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        bodyStyle={{
                          display: 'flex',
                          flexDirection: 'column',
                          flex: 1,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 8,
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
                            margin: '0 0 6px 0',
                            fontSize: 14,
                            color: '#0F172A',
                            lineHeight: 1.35,
                            minHeight: 38,
                          }}
                        >
                          {tpl.name}
                        </Title>

                        <Paragraph
                          type="secondary"
                          ellipsis={{ rows: 2 }}
                          style={{
                            fontSize: 12,
                            marginBottom: 10,
                            color: '#64748B',
                            flex: 1,
                          }}
                        >
                          {tpl.description || tpl.doc_type}
                        </Paragraph>

                        <div style={{ marginBottom: 12 }}>
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
                          loading={isPicking}
                          disabled={Boolean(generatingTag) && !isPicking}
                          block
                          onClick={() => void handlePickTemplate(tpl.tag)}
                          style={{ background: '#1D4ED8', borderRadius: 4, height: 30 }}
                        >
                          {isPicking ? 'Đang tải mẫu...' : 'Sử dụng mẫu'}
                        </Button>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </div>
        </div>
      </Spin>
    </Modal>
  );
};
