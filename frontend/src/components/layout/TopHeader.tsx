'use client';

import React, { useState, useEffect } from 'react';
import { Breadcrumb, Button, Popover, Space, Tooltip, Typography, message } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  HomeOutlined,
  MailOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  CopyOutlined,
  CustomerServiceOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

interface TopHeaderProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  activeTitle: string;
  isFocusMode: boolean;
  onToggleFocusMode: () => void;
  onNavigateBreadcrumb?: (target: 'HOME' | 'UTILITIES') => void;
}

const SUPPORT_EMAIL = '3do.service@gmail.com';
const HOTLINES = [
  { phone: '0774.88.9191', raw: '0774889191', contact: 'Mr. Cường' },
  { phone: '0865.341.745', raw: '0865341745', contact: 'Mr. Kim' },
];

export const TopHeader: React.FC<TopHeaderProps> = ({
  collapsed,
  onToggleCollapse,
  activeTitle,
  isFocusMode,
  onToggleFocusMode,
  onNavigateBreadcrumb,
}) => {
  const [viewportWidth, setViewportWidth] = useState<number>(1280);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const isMobile = viewportWidth < 640;
  const isTablet = viewportWidth < 992;

  const getDisplayTitle = (title: string, mobile: boolean) => {
    if (!mobile) return title;
    if (title.includes('Bảo vệ dữ liệu')) return 'Bảo vệ dữ liệu';
    if (title.includes('Chính sách bảo mật')) return 'Chính sách bảo mật';
    if (title.includes('Điều khoản')) return 'Điều khoản';
    if (title.includes('Chuẩn hóa văn bản')) return 'Chuẩn hóa văn bản';
    if (title.includes('Excel') || title.includes('bảng tính')) return 'Chuẩn hóa Excel';
    if (title.includes('Tổng quan')) return 'Tổng quan';
    return title.length > 18 ? `${title.slice(0, 16)}...` : title;
  };

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText(SUPPORT_EMAIL);
    message.success(`Đã sao chép email hỗ trợ: ${SUPPORT_EMAIL}`);
  };

  const supportContent = (
    <div style={{ width: 330, maxWidth: '100%', padding: '4px 2px' }}>
      <div style={{ marginBottom: 10 }}>
        <Text strong style={{ color: '#0F172A', fontSize: 13, display: 'block' }}>
          Trung tâm hỗ trợ kỹ thuật 3DoHub
        </Text>
        <Text type="secondary" style={{ fontSize: 12 }}>
          Tiếp nhận phản hồi & hỗ trợ triển khai đơn vị
        </Text>
      </div>

      {/* Email Row - Anti-wrapping with nowrap */}
      <div
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 4,
          padding: '8px 10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <Space size={6} style={{ minWidth: 0, overflow: 'hidden' }}>
          <MailOutlined style={{ color: '#1D4ED8', fontSize: 14, flexShrink: 0 }} />
          <Text
            strong
            style={{
              fontSize: 12.5,
              color: '#1D4ED8',
              whiteSpace: 'nowrap',
            }}
          >
            {SUPPORT_EMAIL}
          </Text>
        </Space>
        <Button
          size="small"
          type="text"
          icon={<CopyOutlined />}
          onClick={handleCopyEmail}
          style={{ borderRadius: 4, fontSize: 12, padding: '0 6px', flexShrink: 0 }}
        >
          Sao chép
        </Button>
      </div>

      {/* Direct Contact / Hotline Section */}
      <div
        style={{
          background: '#F8FAFC',
          border: '1px solid #E2E8F0',
          borderRadius: 4,
          padding: '8px 10px',
          marginBottom: 12,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.3px' }}>
          Hỗ trợ & Hotline trực tiếp:
        </div>

        {HOTLINES.map((item, idx) => (
          <div
            key={item.raw}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: idx > 0 ? 6 : 0,
              borderTop: idx > 0 ? '1px dashed #E2E8F0' : 'none',
            }}
          >
            <Space size={6}>
              <PhoneOutlined style={{ color: '#16A34A', fontSize: 13 }} />
              <a
                href={`tel:${item.raw}`}
                style={{
                  fontWeight: 600,
                  color: '#0F172A',
                  fontSize: 12.5,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {item.phone}
              </a>
              <span style={{ fontSize: 11.5, color: '#475569', whiteSpace: 'nowrap' }}>
                ({item.contact})
              </span>
            </Space>
            <Button
              size="small"
              type="text"
              icon={<CopyOutlined />}
              onClick={() => {
                navigator.clipboard?.writeText(item.phone);
                message.success(`Đã sao chép SĐT ${item.contact}: ${item.phone}`);
              }}
              style={{ borderRadius: 4, fontSize: 11, padding: '0 4px', height: 22 }}
              title={`Sao chép SĐT ${item.contact}`}
            />
          </div>
        ))}
      </div>

      <Button
        type="primary"
        size="small"
        block
        icon={<MailOutlined />}
        href={`mailto:${SUPPORT_EMAIL}`}
        style={{ background: '#1D4ED8', fontWeight: 500, borderRadius: 4, height: 30 }}
      >
        Gửi email hỗ trợ
      </Button>
    </div>
  );

  return (
    <header
      style={{
        height: 52,
        background: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: isMobile ? '0 10px' : '0 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        position: 'sticky',
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Left: Sidebar Toggle & Responsive Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 6 : 10,
          minWidth: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {!isFocusMode && (
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleCollapse}
            style={{ color: '#334155', flexShrink: 0 }}
          />
        )}
        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          <Breadcrumb
            items={[
              {
                title: (
                  <span
                    onClick={() => onNavigateBreadcrumb?.('HOME')}
                    style={{
                      cursor: 'pointer',
                      color: '#475569',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                    title="Trang chủ 3DoHub"
                  >
                    <HomeOutlined />
                    {!isMobile && <span>3DoHub</span>}
                  </span>
                ),
              },
              ...(!isTablet
                ? [
                    {
                      title: (
                        <span
                          onClick={() => onNavigateBreadcrumb?.('UTILITIES')}
                          style={{
                            cursor: 'pointer',
                            color: '#1D4ED8',
                            fontWeight: 500,
                          }}
                        >
                          Tiện ích
                        </span>
                      ),
                    },
                  ]
                : []),
              {
                title: (
                  <span
                    style={{
                      display: 'inline-block',
                      maxWidth: isMobile ? 120 : isTablet ? 190 : 360,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      verticalAlign: 'bottom',
                      fontWeight: 600,
                      color: '#0F172A',
                      fontSize: isMobile ? 12.5 : 14,
                    }}
                    title={activeTitle}
                  >
                    {getDisplayTitle(activeTitle, isMobile)}
                  </span>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* Right: Adaptive Focus Fullscreen Mode & Support Contact */}
      <Space size={6} style={{ flexShrink: 0 }}>
        <Tooltip
          title={
            isFocusMode
              ? 'Thoát chế độ toàn màn hình'
              : 'Mở rộng toàn màn hình để tập trung soạn thảo'
          }
        >
          <Button
            size={isMobile ? 'small' : 'middle'}
            type={isFocusMode ? 'primary' : 'default'}
            icon={isFocusMode ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={onToggleFocusMode}
            style={isFocusMode ? { background: '#1D4ED8' } : undefined}
          >
            {!isTablet && (isFocusMode ? 'Thoát toàn màn hình' : 'Toàn màn hình')}
          </Button>
        </Tooltip>

        <Popover
          content={supportContent}
          trigger="click"
          placement="bottomRight"
          overlayStyle={{ maxWidth: '96vw' }}
        >
          <Button
            size={isMobile ? 'small' : 'middle'}
            icon={<CustomerServiceOutlined style={{ color: '#1D4ED8' }} />}
            style={{
              borderColor: '#BFDBFE',
              background: '#EFF6FF',
              color: '#1D4ED8',
              fontWeight: 500,
            }}
          >
            Hỗ trợ
          </Button>
        </Popover>
      </Space>
    </header>
  );
};
