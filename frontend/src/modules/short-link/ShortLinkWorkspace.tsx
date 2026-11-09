'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Typography, Space, message } from 'antd';
import {
  LinkOutlined,
  QrcodeOutlined,
  BarChartOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { apiClient } from '@/services/api-client';
import { ShortLinkItem } from '@/types/api';
import { CreateShortLinkModal } from './CreateShortLinkModal';
import { ShortLinkTable } from './ShortLinkTable';
import { ShortLinkStatsModal } from './ShortLinkStatsModal';

const { Title, Text } = Typography;

export const ShortLinkWorkspace: React.FC = () => {
  const [links, setLinks] = useState<ShortLinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatsCode, setSelectedStatsCode] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.listShortLinks({ limit: 100 });
      if (res.data) {
        setLinks(res.data);
      }
    } catch {
      message.error('Không thể tải danh sách liên kết rút gọn.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  // Handle URL query feedback (e.g. ?error=not_found from broken redirects)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const error = params.get('error');
      if (error === 'not_found') {
        message.warning('Liên kết rút gọn không tồn tại hoặc đã tạm dừng.');
        window.history.replaceState({}, '', window.location.pathname);
      } else if (error === 'expired') {
        message.warning('Liên kết rút gọn này đã hết hạn sử dụng.');
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);

  const totalLinks = links.length;
  const totalClicks = links.reduce((sum, item) => sum + (item.click_count || 0), 0);
  const activeLinks = links.filter((item) => item.is_active && !item.is_expired).length;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
          borderRadius: 6,
          padding: '20px 24px',
          color: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <Title level={3} style={{ color: '#FFFFFF', margin: '0 0 6px 0', fontWeight: 700 }}>
              Rút gọn liên kết
            </Title>
            <Text style={{ color: '#93C5FD', fontSize: 13 }}>
              Rút gọn các liên kết dài nhanh chóng, tùy biến mã rút gọn và theo dõi lượt truy cập.
            </Text>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 16px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: '#FFFFFF' }}>{totalLinks}</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Tổng số link</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 16px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: '#60A5FA' }}>{totalClicks}</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Tổng lượt click</div>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
                borderRadius: 4,
                padding: '8px 16px',
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: '#4ADE80' }}>{activeLinks}</div>
              <div style={{ fontSize: 11, color: '#CBD5E1' }}>Đang hoạt động</div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Width Table Card */}
      <Card
        style={{
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.05)',
          background: '#FFFFFF',
          width: '100%',
        }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ marginBottom: 16 }}>
          <Title level={5} style={{ margin: 0, color: '#0F172A', fontWeight: 600 }}>
            Quản lý liên kết đã tạo ({totalLinks})
          </Title>
          <Text type="secondary" style={{ fontSize: 13 }}>
            Xem danh sách, sao chép nhanh, bật/tắt kích hoạt và theo dõi nhật ký truy cập
          </Text>
        </div>

        <ShortLinkTable
          items={links}
          loading={loading}
          total={totalLinks}
          onRefresh={fetchLinks}
          onSelectStats={(code) => setSelectedStatsCode(code)}
          onOpenCreate={() => setCreateModalOpen(true)}
        />
      </Card>

      {/* Create Link Modal Popup */}
      <CreateShortLinkModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreated={() => fetchLinks()}
      />

      {/* Stats Modal */}
      <ShortLinkStatsModal
        open={Boolean(selectedStatsCode)}
        code={selectedStatsCode}
        onClose={() => setSelectedStatsCode(null)}
      />
    </div>
  );
};

