'use client';

import React from 'react';
import { Button, Card, Col, Row, Space, Tag, Typography } from 'antd';
import {
  ThunderboltFilled,
  FileAddOutlined,
  FileExcelOutlined,
  CloudUploadOutlined,
  AuditOutlined,
  CopyOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

interface HeroOverviewSectionProps {
  onOpenEditor: () => void;
  onOpenExcel: () => void;
  onOpenTemplates: () => void;
  onOpenUpload: () => void;
  onQuickTemplate?: (tag: string) => void;
}

export const HeroOverviewSection: React.FC<HeroOverviewSectionProps> = ({
  onOpenEditor,
  onOpenExcel,
  onOpenTemplates,
  onOpenUpload,
}) => {
  const highlights = [
    {
      title: 'Chuẩn hóa văn bản 6 bước tự động',
      desc: 'Tự động dựng bảng tiêu đề 2 cột, bảng nơi nhận - chữ ký, căn lề A4 (30-15-20-20mm) và cỡ chữ chuẩn từng khối.',
      icon: <ThunderboltFilled style={{ color: '#1D4ED8', fontSize: 20 }} />,
      badge: 'Văn bản A4',
    },
    {
      title: 'Chuẩn hóa bảng tính & trang in Excel',
      desc: 'Hỗ trợ gần 400 hàm công thức Excel chuẩn, tự động chọn khổ A4 dọc/ngang, chống lỗi ### và chống mất chữ ở cả ô gộp dọc/ngang.',
      icon: <CopyOutlined style={{ color: '#0284C7', fontSize: 20 }} />,
      badge: 'Excel A4',
    },
    {
      title: 'Kho 165+ mẫu chuẩn & 18 quy tắc rà soát',
      desc: 'Đầy đủ mẫu Đảng, Hành chính NĐ 30, Khen thưởng NĐ 152, Công an TT 26, Quân đội TT 68 & Đoàn TN kèm kiểm tra nhảy số tự động.',
      icon: <AuditOutlined style={{ color: '#059669', fontSize: 20 }} />,
      badge: '165+ Mẫu',
    },
  ];

  return (
    <div>
      {/* Hero Banner with Tech Blue / Slate aesthetics */}
      <div
        style={{
          background: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: 6,
          padding: '52px 32px',
          textAlign: 'center',
          marginBottom: 20,
        }}
      >
        <Tag
          color="blue"
          style={{
            marginBottom: 16,
            padding: '2px 10px',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 3,
          }}
        >
          3DOHUB ENTERPRISE · NỀN TẢNG TIỆN ÍCH TRỰC TUYẾN ĐA LĨNH VỰC
        </Tag>

        <Title
          level={1}
          style={{
            fontSize: 'clamp(26px, 3.8vw, 42px)',
            fontWeight: 800,
            color: '#0F172A',
            maxWidth: 860,
            margin: '0 auto 18px auto',
            lineHeight: 1.22,
            letterSpacing: -0.5,
          }}
        >
          Chuẩn hóa thể thức văn bản & trang in bảng tính A4 chỉ trong vài giây
        </Title>

        <Paragraph
          style={{
            fontSize: 15.5,
            color: '#475569',
            maxWidth: 740,
            margin: '0 auto 28px auto',
            lineHeight: 1.6,
          }}
        >
          Tự động hóa quy chuẩn <b>Quy định 399-QĐ/TW</b>, <b>Hướng dẫn 05-HD/VPTW</b>,{' '}
          <b>Nghị định 30/2020/NĐ-CP</b> và bảng biểu Excel hành chính. Soạn thảo trực tiếp trên trang A4,
          copy giữ nguyên định dạng hoặc tải tệp <code>.docx</code>, <code>.xlsx</code> chuẩn.
        </Paragraph>

        <Space size={12} wrap style={{ justifyContent: 'center' }}>
          <Button
            type="primary"
            size="large"
            icon={<ThunderboltFilled />}
            onClick={onOpenEditor}
            style={{
              background: '#1D4ED8',
              height: 44,
              padding: '0 22px',
              fontWeight: 600,
              borderRadius: 4,
            }}
          >
            Chuẩn hóa văn bản
          </Button>
          <Button
            size="large"
            icon={<FileExcelOutlined style={{ color: '#16A34A' }} />}
            onClick={onOpenExcel}
            style={{
              height: 44,
              padding: '0 22px',
              fontWeight: 600,
              borderRadius: 4,
              borderColor: '#16A34A',
              color: '#15803D',
            }}
          >
            Chuẩn hóa Excel
          </Button>
          <Button
            size="large"
            icon={<FileAddOutlined />}
            onClick={onOpenTemplates}
            style={{ height: 44, padding: '0 20px', fontWeight: 500, borderRadius: 4 }}
          >
            Kho 165+ mẫu chuẩn
          </Button>
          <Button
            size="large"
            icon={<CloudUploadOutlined />}
            onClick={onOpenUpload}
            style={{ height: 44, padding: '0 20px', fontWeight: 500, borderRadius: 4 }}
          >
            Tải tệp .docx
          </Button>
        </Space>
      </div>

      {/* 3 Core Capability Cards */}
      <Row gutter={[16, 16]}>
        {highlights.map((item, idx) => (
          <Col xs={24} md={8} key={idx}>
            <Card
              size="small"
              hoverable
              onClick={() => {
                if (idx === 0) onOpenEditor();
                else if (idx === 1) onOpenExcel();
                else if (idx === 2) onOpenTemplates();
              }}
              style={{
                height: '100%',
                borderRadius: 6,
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
              }}
              styles={{ body: { padding: 20 } }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                {item.icon}
                <Tag color="geekblue" style={{ margin: 0 }}>
                  {item.badge}
                </Tag>
              </div>
              <Title level={5} style={{ marginTop: 0, marginBottom: 8, color: '#0F172A' }}>
                {item.title}
              </Title>
              <Text style={{ color: '#475569', fontSize: 13, lineHeight: 1.5 }}>{item.desc}</Text>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
