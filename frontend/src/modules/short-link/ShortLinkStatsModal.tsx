'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Table, Typography, Space, Tag, Spin, Empty, Button } from 'antd';
import { BarChartOutlined, ReloadOutlined, LinkOutlined, CloseOutlined } from '@ant-design/icons';
import { apiClient } from '@/services/api-client';
import { ShortLinkStatsData } from '@/types/api';

const { Text, Title } = Typography;

interface ShortLinkStatsModalProps {
  open: boolean;
  code: string | null;
  onClose: () => void;
}

export const ShortLinkStatsModal: React.FC<ShortLinkStatsModalProps> = ({
  open,
  code,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statsData, setStatsData] = useState<ShortLinkStatsData | null>(null);

  const fetchStats = async () => {
    if (!code) return;
    setLoading(true);
    try {
      const res = await apiClient.getShortLinkStats(code);
      if (res.data) {
        setStatsData(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && code) {
      fetchStats();
    } else {
      setStatsData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, code]);

  const columns = [
    {
      title: 'Thời gian',
      dataIndex: 'clicked_at',
      key: 'clicked_at',
      width: 160,
      render: (val: string) => (
        <Text style={{ fontSize: 12 }}>
          {val ? new Date(val).toLocaleString('vi-VN') : '—'}
        </Text>
      ),
    },
    {
      title: 'Nguồn giới thiệu',
      dataIndex: 'referer',
      key: 'referer',
      width: 160,
      render: (val: string) => {
        const displayVal = !val || val === 'Direct' ? 'Trực tiếp' : val;
        return (
          <Tag style={{ borderRadius: 4, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {displayVal}
          </Tag>
        );
      },
    },
    {
      title: 'Thiết bị & Trình duyệt',
      dataIndex: 'user_agent',
      key: 'user_agent',
      ellipsis: true,
      render: (val: string) => <Text style={{ fontSize: 12 }}>{val || '—'}</Text>,
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" icon={<CloseOutlined />} onClick={onClose} style={{ borderRadius: 4 }}>
          Đóng
        </Button>,
      ]}
      width={880}
      style={{ top: 20, maxWidth: '96vw' }}
      title={
        <Space size={8}>
          <BarChartOutlined style={{ color: '#1D4ED8' }} />
          <span>Thống kê liên kết: <strong>{code}</strong></span>
        </Space>
      }
      styles={{ body: { padding: '16px 20px 8px 20px', overflow: 'hidden' } }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin tip="Đang tải dữ liệu thống kê..." />
        </div>
      ) : statsData ? (
        <div>
          {/* Summary Banner */}
          <div
            style={{
              padding: '12px 16px',
              background: '#EFF6FF',
              borderRadius: 6,
              border: '1px solid #BFDBFE',
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ flex: 1, minWidth: 220 }}>
              <Title level={5} style={{ margin: 0, color: '#0F172A' }}>
                {statsData.link.title || statsData.link.code}
              </Title>
              <div style={{ fontSize: 12, marginTop: 4, wordBreak: 'break-all' }}>
                <LinkOutlined style={{ marginRight: 4, color: '#1D4ED8' }} />
                <a href={statsData.link.original_url} target="_blank" rel="noopener noreferrer">
                  {statsData.link.original_url}
                </a>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#1D4ED8', lineHeight: 1 }}>
                {statsData.total_clicks}
              </div>
              <Text type="secondary" style={{ fontSize: 11 }}>Tổng lượt truy cập</Text>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '0 4px', flexWrap: 'wrap', gap: 8 }}>
            <Text strong style={{ fontSize: 13 }}>
              Nhật ký 50 lượt truy cập gần nhất:
            </Text>
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={fetchStats}
              loading={loading}
              style={{ borderRadius: 4 }}
            >
              Làm mới
            </Button>
          </div>

          <Table
            dataSource={statsData.recent_clicks}
            columns={columns}
            rowKey="id"
            size="small"
            scroll={{ y: 280, x: 620 }}
            pagination={{ pageSize: 10, size: 'small', showTotal: (t) => `Tổng ${t} bản ghi` }}
            locale={{ emptyText: <Empty description="Chưa có lượt truy cập nào" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          />
        </div>
      ) : (
        <Empty description="Không có dữ liệu thống kê" />
      )}
    </Modal>
  );
};

