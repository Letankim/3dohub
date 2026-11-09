'use client';

import React from 'react';
import Link from 'next/link';
import { Space, Typography } from 'antd';
import {
  MailOutlined,
  SafetyCertificateOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

const { Text } = Typography;

export const AppFooter: React.FC = () => {
  return (
    <footer
      style={{
        background: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '16px 20px',
        marginTop: 'auto',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {/* Centered Legal Links & Support Contact Email */}
        <Space size={14} wrap style={{ justifyContent: 'center', fontSize: 13 }}>
          <Link
            href="/dieu-khoan-dich-vu"
            style={{ color: '#334155', textDecoration: 'none', fontWeight: 500 }}
          >
            Điều khoản dịch vụ
          </Link>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <Link
            href="/chinh-sach-bao-mat"
            style={{ color: '#334155', textDecoration: 'none', fontWeight: 500 }}
          >
            Chính sách bảo mật
          </Link>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <Link
            href="/quy-dinh-bao-ve-du-lieu"
            style={{ color: '#334155', textDecoration: 'none', fontWeight: 500 }}
          >
            Bảo vệ dữ liệu
          </Link>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <a
            href="mailto:3do.service@gmail.com"
            style={{
              color: '#1D4ED8',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <MailOutlined />
            <span>3do.service@gmail.com</span>
          </a>
          <span style={{ color: '#CBD5E1' }}>•</span>
          <Space size={4} style={{ color: '#475569', fontSize: 13, fontWeight: 500 }}>
            <PhoneOutlined style={{ color: '#16A34A' }} />
            <span>Hotline:</span>
            <a href="tel:0774889191" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 600 }}>0774.88.9191</a>
            <span style={{ color: '#64748B', fontSize: 12 }}>(Mr. Cường)</span>
            <span style={{ color: '#CBD5E1' }}>-</span>
            <a href="tel:0865341745" style={{ color: '#0F172A', textDecoration: 'none', fontWeight: 600 }}>0865.341.745</a>
            <span style={{ color: '#64748B', fontSize: 12 }}>(Mr. Kim)</span>
          </Space>
        </Space>

        {/* Bottom Row: Centered Copyright & Zero-Data-Retention Notice */}
        <Space size={8} wrap style={{ justifyContent: 'center' }}>
          <Text style={{ fontSize: 12.5, color: '#64748B' }}>
            © {new Date().getFullYear()} <b style={{ color: '#0F172A' }}>3DoHub Enterprise</b> — Nền
            tảng tiện ích số & dịch vụ trực tuyến đa lĩnh vực.
          </Text>
          <span style={{ color: '#CBD5E1' }}>|</span>
          <Text style={{ fontSize: 12, color: '#1D4ED8', fontWeight: 500 }}>
            <SafetyCertificateOutlined style={{ marginRight: 4 }} />
            Cam kết không lưu trữ tài liệu trên máy chủ (Zero-Retention)
          </Text>
        </Space>
      </div>
    </footer>
  );
};
