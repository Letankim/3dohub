import React from 'react';
import type { Metadata } from 'next';
import { Be_Vietnam_Pro } from 'next/font/google';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { enterpriseTechTheme } from '@/config/theme';
import './globals.css';

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['vietnamese', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export const metadata: Metadata = {
  title: '3DoHub — Nền Tảng Tiện Ích Trực Tuyến & Xử Lý Nghiệp Vụ Đa Lĩnh Vực',
  description:
    'Nền tảng tiện ích số đa lĩnh vực, cung cấp các công cụ trực tuyến tối ưu hóa năng suất, xử lý văn bản, bảng tính và nghiệp vụ chuyên nghiệp.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={beVietnamPro.variable}>
      <body className={beVietnamPro.className}>
        <AntdRegistry>
          <ConfigProvider theme={enterpriseTechTheme} locale={viVN}>
            {children}
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
