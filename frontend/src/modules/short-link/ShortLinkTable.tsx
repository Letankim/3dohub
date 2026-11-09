'use client';

import React, { useState } from 'react';
import {
  Table,
  Button,
  Input,
  Tag,
  Space,
  Typography,
  Popconfirm,
  Popover,
  QRCode,
  Switch,
  message,
  Tooltip,
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  CopyOutlined,
  QrcodeOutlined,
  BarChartOutlined,
  DeleteOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { apiClient, HubApiException } from '@/services/api-client';
import { ShortLinkItem } from '@/types/api';

const { Text, Paragraph } = Typography;

interface ShortLinkTableProps {
  items: ShortLinkItem[];
  loading: boolean;
  total: number;
  onRefresh: () => void;
  onSelectStats: (code: string) => void;
  onOpenCreate: () => void;
}

export const ShortLinkTable: React.FC<ShortLinkTableProps> = ({
  items,
  loading,
  total,
  onRefresh,
  onSelectStats,
  onOpenCreate,
}) => {
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép link!');
  };

  const handleToggleStatus = async (item: ShortLinkItem, checked: boolean) => {
    setActionLoading(item.code);
    try {
      await apiClient.updateShortLink(item.code, { is_active: checked });
      message.success(`Đã ${checked ? 'kích hoạt' : 'tạm dừng'} liên kết ${item.code}`);
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof HubApiException) message.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (code: string) => {
    setActionLoading(code);
    try {
      await apiClient.deleteShortLink(code);
      message.success(`Đã xóa liên kết ${code}`);
      onRefresh();
    } catch (err: unknown) {
      if (err instanceof HubApiException) message.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      item.code.toLowerCase().includes(s) ||
      (item.title && item.title.toLowerCase().includes(s)) ||
      item.original_url.toLowerCase().includes(s)
    );
  });

  const columns = [
    {
      title: 'Mã & Link rút gọn',
      key: 'code',
      width: 190,
      render: (_: unknown, record: ShortLinkItem) => {
        const fullUrl =
          typeof window !== 'undefined'
            ? `${window.location.origin}/s/${record.code}`
            : record.short_url;

        return (
          <div style={{ whiteSpace: 'nowrap' }}>
            <Space direction="horizontal" size={6} style={{ whiteSpace: 'nowrap' }}>
              <Text strong style={{ color: '#1D4ED8', fontSize: 14 }}>
                {record.code}
              </Text>
              <Popover
                content={
                  <div style={{ padding: 6, textAlign: 'center' }}>
                    <QRCode value={fullUrl} size={150} bordered={false} type="svg" />
                    <div style={{ marginTop: 6, fontWeight: 600, fontSize: 12, color: '#0F172A' }}>
                      {record.code}
                    </div>
                  </div>
                }
                title="Mã QR liên kết"
                trigger="click"
              >
                <Button
                  size="small"
                  type="text"
                  icon={<QrcodeOutlined style={{ color: '#64748B' }} />}
                  style={{ padding: '0 4px', height: 22 }}
                />
              </Popover>
              <Tooltip title="Sao chép link">
                <Button
                  size="small"
                  type="text"
                  icon={<CopyOutlined style={{ color: '#64748B' }} />}
                  onClick={() => handleCopy(fullUrl)}
                  style={{ padding: '0 4px', height: 22 }}
                />
              </Tooltip>
            </Space>
            <div style={{ fontSize: 11, color: '#64748B', marginTop: 2, whiteSpace: 'nowrap' }}>
              /s/{record.code}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Tiêu đề & URL gốc',
      key: 'details',
      render: (_: unknown, record: ShortLinkItem) => (
        <div>
          <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
            {record.title || record.code}
          </Text>
          <Paragraph
            ellipsis={{ rows: 1 }}
            style={{ margin: 0, fontSize: 12, color: '#64748B' }}
          >
            <a href={record.original_url} target="_blank" rel="noopener noreferrer">
              {record.original_url}
            </a>
          </Paragraph>
          {record.tags && record.tags.length > 0 && (
            <div style={{ marginTop: 4 }}>
              {record.tags.map((t) => (
                <Tag key={t} style={{ fontSize: 10, borderRadius: 2, padding: '0 4px' }}>
                  {t}
                </Tag>
              ))}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Lượt click',
      dataIndex: 'click_count',
      key: 'click_count',
      width: 105,
      align: 'center' as const,
      sorter: (a: ShortLinkItem, b: ShortLinkItem) => a.click_count - b.click_count,
      render: (val: number) => (
        <Tag
          color={val > 0 ? 'blue' : 'default'}
          style={{ borderRadius: 10, fontWeight: 600, padding: '0 8px' }}
        >
          {val.toLocaleString('vi-VN')}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 110,
      render: (_: unknown, record: ShortLinkItem) => {
        if (record.is_expired) {
          return (
            <Tag color="error" icon={<ClockCircleOutlined />} style={{ borderRadius: 4 }}>
              Hết hạn
            </Tag>
          );
        }
        return (
          <Switch
            checked={record.is_active}
            size="small"
            loading={actionLoading === record.code}
            onChange={(checked) => handleToggleStatus(record, checked)}
            checkedChildren="Bật"
            unCheckedChildren="Tắt"
          />
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 110,
      align: 'right' as const,
      render: (_: unknown, record: ShortLinkItem) => (
        <Space size={4}>
          <Tooltip title="Xem thống kê truy cập">
            <Button
              size="small"
              icon={<BarChartOutlined />}
              onClick={() => onSelectStats(record.code)}
              style={{ borderRadius: 4 }}
            />
          </Tooltip>
          <Popconfirm
            title="Xác nhận xóa liên kết"
            description={`Bạn có chắc muốn xóa vĩnh viễn liên kết '${record.code}'?`}
            onConfirm={() => handleDelete(record.code)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true, size: 'small', icon: <DeleteOutlined />, style: { borderRadius: 4 } }}
            cancelButtonProps={{ size: 'small', icon: <CloseOutlined />, style: { borderRadius: 4 } }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={actionLoading === record.code}
              style={{ borderRadius: 4 }}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Input
          prefix={<SearchOutlined style={{ color: '#94A3B8' }} />}
          placeholder="Tìm kiếm theo mã, tiêu đề, URL gốc..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          allowClear
          style={{ flex: 1, minWidth: 200, maxWidth: 360, borderRadius: 4 }}
        />
        <Space size={8} style={{ flexShrink: 0 }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={onRefresh}
            loading={loading}
            style={{ borderRadius: 4 }}
          >
            Làm mới
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenCreate}
            style={{
              borderRadius: 4,
              backgroundColor: '#1D4ED8',
              fontWeight: 600,
            }}
          >
            Tạo liên kết mới
          </Button>
        </Space>
      </div>

      <Table
        dataSource={filteredItems}
        columns={columns}
        rowKey="id"
        loading={loading}
        size="middle"
        scroll={{ x: 750 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['10', '20', '50'],
          showTotal: (totalCount) => `Tổng số ${totalCount} liên kết`,
        }}
        style={{
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          background: '#FFFFFF',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};
