'use client';

import React from 'react';
import { Menu, Typography, Button, Tooltip } from 'antd';
import {
  HomeOutlined,
  AppstoreOutlined,
  FileWordOutlined,
  FileExcelOutlined,
  LinkOutlined,
  QrcodeOutlined,
  SearchOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { HUB_MODULES_REGISTRY, HubNavModule } from '@/config/modules-registry';

const { Text } = Typography;

interface SidebarNavProps {
  activeKey: string;
  collapsed: boolean;
  onSelectModule: (mod: HubNavModule) => void;
  onOpenCommand: () => void;
}

const getModuleIcon = (key: string, fontSize = 17) => {
  switch (key) {
    case 'home-overview':
      return <HomeOutlined style={{ fontSize }} />;
    case 'utilities-hub':
      return <AppstoreOutlined style={{ fontSize }} />;
    case 'excel-module':
      return <FileExcelOutlined style={{ fontSize }} />;
    case 'short-link-module':
      return <LinkOutlined style={{ fontSize }} />;
    case 'qr-code-module':
      return <QrcodeOutlined style={{ fontSize }} />;
    case 'van-ban-module':
    default:
      return <FileWordOutlined style={{ fontSize }} />;
  }
};

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeKey,
  collapsed,
  onSelectModule,
  onOpenCommand,
}) => {
  const menuItems = HUB_MODULES_REGISTRY.map((m) => ({
    key: m.key,
    icon: getModuleIcon(m.key, 16),
    label: (
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          fontWeight: 500,
        }}
      >
        {m.label}
      </span>
    ),
    onClick: () => onSelectModule(m),
  }));

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#FFFFFF',
        borderRight: '1px solid #E2E8F0',
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: 52,
          padding: collapsed ? 0 : '0 14px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          gap: 10,
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #0F172A 0%, #1D4ED8 100%)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: 13,
            flexShrink: 0,
            letterSpacing: -0.5,
          }}
        >
          3Do
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0F172A', lineHeight: 1.2 }}>
              3DoHub
            </div>
            <div style={{ fontSize: 11, color: '#64748B', lineHeight: 1.2, marginTop: 2 }}>
              Enterprise Hub
            </div>
          </div>
        )}
      </div>

      {/* Quick Search CTRL+K */}
      <div
        style={{
          padding: collapsed ? '10px 0' : '10px 12px',
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {collapsed ? (
          <Tooltip title="Tìm kiếm nhanh (Ctrl + K)" placement="right">
            <button
              type="button"
              onClick={onOpenCommand}
              style={{
                width: 40,
                height: 36,
                borderRadius: 4,
                border: '1px solid #CBD5E1',
                background: '#F8FAFC',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <SearchOutlined style={{ fontSize: 16 }} />
            </button>
          </Tooltip>
        ) : (
          <Button
            block
            onClick={onOpenCommand}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
              borderColor: '#CBD5E1',
              color: '#64748B',
              padding: '0 10px',
              height: 34,
              borderRadius: 4,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <SearchOutlined />
              <span style={{ fontSize: 13 }}>Tìm kiếm...</span>
            </span>
            <span
              style={{
                fontSize: 10,
                padding: '1px 5px',
                background: '#E2E8F0',
                color: '#334155',
                borderRadius: 3,
                fontWeight: 600,
              }}
            >
              CTRL K
            </span>
          </Button>
        )}
      </div>

      {/* Section Header when expanded */}
      {!collapsed && (
        <div
          style={{
            padding: '4px 16px 6px 16px',
            fontSize: 11,
            fontWeight: 600,
            color: '#94A3B8',
            letterSpacing: 0.4,
          }}
        >
          TIỆN ÍCH HỆ THỐNG
        </div>
      )}

      {/* Navigation Menu: Dedicated centered icons when collapsed, full Menu when expanded */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          padding: collapsed ? '4px 0' : '0 6px',
        }}
      >
        {collapsed ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 6,
              width: '100%',
            }}
          >
            {HUB_MODULES_REGISTRY.map((m) => {
              const isSelected = m.key === activeKey;
              return (
                <Tooltip key={m.key} title={m.label} placement="right">
                  <button
                    type="button"
                    onClick={() => onSelectModule(m)}
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 4,
                      border: isSelected ? '1px solid #93C5FD' : '1px solid transparent',
                      background: isSelected ? '#EFF6FF' : 'transparent',
                      color: isSelected ? '#1D4ED8' : '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {getModuleIcon(m.key, 18)}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        ) : (
          <Menu
            mode="inline"
            selectedKeys={[activeKey]}
            items={menuItems}
            style={{ borderRight: 0, fontSize: 13 }}
          />
        )}
      </div>

      {/* Footer Info */}
      <div
        style={{
          padding: collapsed ? '12px 0' : '10px 14px',
          borderTop: '1px solid #E2E8F0',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          flexShrink: 0,
        }}
      >
        <Tooltip title={collapsed ? '3DoHub Enterprise · 3do.service@gmail.com' : ''} placement="right">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <SafetyCertificateOutlined style={{ color: '#1D4ED8', fontSize: 17 }} />
            {!collapsed && (
              <div>
                <Text strong style={{ fontSize: 12, display: 'block', color: '#0F172A' }}>
                  3DoHub Enterprise
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  3do.service@gmail.com
                </Text>
              </div>
            )}
          </div>
        </Tooltip>
      </div>
    </div>
  );
};
