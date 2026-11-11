'use client';

import React, { useState } from 'react';
import { Button, Card, Col, Input, Row, Space, Tag, Typography } from 'antd';
import {
  FileWordOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  LinkOutlined,
  QrcodeOutlined,
  SearchOutlined,
  ArrowRightOutlined,
  ThunderboltFilled,
  CheckCircleOutlined,
  BookOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';

const { Title, Text, Paragraph } = Typography;

export interface UtilitiesHubPageProps {
  onOpenVanBanModule: () => void;
  onOpenExcelModule: () => void;
  onOpenShortLinkModule?: () => void;
  onOpenQrCodeModule?: () => void;
  onOpenPdfModule?: () => void;
  onOpenImageModule?: () => void;
  onOpenDocLookupModule?: () => void;
  onOpenSpellCheckModule?: () => void;
}

interface UtilityCardItem {
  id: string;
  code: string;
  path: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  actionLabel: string;
  onAction: () => void;
}

export const UtilitiesHubPage: React.FC<UtilitiesHubPageProps> = ({
  onOpenVanBanModule,
  onOpenExcelModule,
  onOpenShortLinkModule,
  onOpenQrCodeModule,
  onOpenPdfModule,
  onOpenImageModule,
  onOpenDocLookupModule,
  onOpenSpellCheckModule,
}) => {
  const isMobile = useIsMobile();
  const [search, setSearch] = useState('');

  const utilityCards: UtilityCardItem[] = [
    {
      id: 'util-chuan-hoa-van-ban',
      code: 'CHUAN_HOA_VB',
      path: '/tien-ich/chuan-hoa-van-ban',
      title: 'Chuẩn hóa thể thức văn bản',
      category: 'Tiện ích hành chính & Đảng',
      description:
        'Trình soạn thảo trang A4 trực tuyến nhiều trang, tự động nhận diện và chuẩn hóa thể thức 5 khối (Đảng, Chính quyền, Công an, Quân đội, MTTQ) theo QĐ 399-QĐ/TW, HD 05-HD/VPTW và Nghị định 30/2020/NĐ-CP.',
      features: [
        'Chuẩn hóa tự động 6 bước & giữ bảng biểu nhiều trang',
        'Kho 17 mẫu văn bản chuẩn (9 mẫu Đảng + 8 mẫu Nhà nước)',
        'Cấu hình & trích xuất tự động thông tin cơ quan, đơn vị',
        'Rà soát 18 quy tắc lỗi thể thức, Copy Word & tải .docx',
      ],
      badge: 'Đang hoạt động',
      badgeColor: 'blue',
      icon: <FileWordOutlined style={{ fontSize: 24, color: '#1D4ED8' }} />,
      iconBg: '#EFF6FF',
      iconBorder: '#BFDBFE',
      actionLabel: 'Mở tiện ích',
      onAction: onOpenVanBanModule,
    },
    {
      id: 'util-chuan-hoa-excel',
      code: 'CHUAN_HOA_EXCEL',
      path: '/tien-ich/chuan-hoa-excel',
      title: 'Chuẩn hóa bảng tính & trang in Excel',
      category: 'Tiện ích bảng biểu & tài chính',
      description:
        'Bảng tính Excel tương tác trực tiếp kèm tự động chuẩn hóa trang in A4 dọc (<=6 cột) hoặc A4 ngang (>6 cột), chống lỗi ### cột số tiền, chống mất chữ ở cả ô gộp dọc/ngang và hoàn tác 1 chạm.',
      features: [
        'Tương tác sửa ô, gộp ô, công thức fx & dán Ctrl+V chuẩn Excel',
        'Phông chuẩn Times New Roman, căn lề A4 (1.0cm / 1.2cm), căn giữa trang',
        'Chống che khuất chữ 100% cho ô đơn, gộp ngang & gộp dọc nhiều dòng',
        'Lặp tiêu đề khi qua trang, đánh số Trang 1/N & hoàn tác tức thì',
      ],
      badge: 'Đang hoạt động',
      badgeColor: 'green',
      icon: <FileExcelOutlined style={{ fontSize: 24, color: '#16A34A' }} />,
      iconBg: '#F0FDF4',
      iconBorder: '#BBF7D0',
      actionLabel: 'Mở tiện ích',
      onAction: onOpenExcelModule,
    },
    {
      id: 'util-rut-gon-link',
      code: 'RUT_GON_LINK',
      path: '/tien-ich/rut-gon-link',
      title: 'Rút gọn liên kết',
      category: 'Tiện ích liên kết',
      description:
        'Rút gọn liên kết URL nhanh chóng, tùy biến mã rút gọn (slug) và theo dõi chi tiết lượt truy cập.',
      features: [
        'Tạo mã rút gọn ngẫu nhiên hoặc slug tùy biến',
        'Đặt thời gian hết hạn và gắn thẻ phân loại',
        'Theo dõi số lượt click và nhật ký thiết bị',
        'Sao chép 1 chạm và quản lý trạng thái kích hoạt',
      ],
      badge: 'Đang hoạt động',
      badgeColor: 'blue',
      icon: <LinkOutlined style={{ fontSize: 24, color: '#1D4ED8' }} />,
      iconBg: '#EFF6FF',
      iconBorder: '#BFDBFE',
      actionLabel: 'Mở tiện ích',
      onAction: () => {
        if (onOpenShortLinkModule) {
          onOpenShortLinkModule();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/tien-ich/rut-gon-link';
        }
      },
    },
    {
      id: 'util-tao-ma-qr',
      code: 'TAO_MA_QR',
      path: '/tien-ich/tao-ma-qr',
      title: 'Tạo mã QR đa năng',
      category: 'Tiện ích mã phản hồi nhanh',
      description:
        'Tạo mã QR cho liên kết web, Wi-Fi, danh thiếp vCard, văn bản, email; tùy chỉnh màu sắc, logo và tải ảnh PNG/SVG.',
      features: [
        'Hỗ trợ 6 định dạng: URL, Văn bản, Wi-Fi, vCard, Email, Điện thoại',
        'Tùy chỉnh màu sắc mã QR, màu nền và kích thước',
        'Chế độ quét Wi-Fi và lưu danh thiếp 1 chạm trên điện thoại',
        'Tải ảnh PNG chất lượng cao, file vector SVG và in ấn trực tiếp',
      ],
      badge: 'Đang hoạt động',
      badgeColor: 'purple',
      icon: <QrcodeOutlined style={{ fontSize: 24, color: '#7C3AED' }} />,
      iconBg: '#F5F3FF',
      iconBorder: '#DDD6FE',
      actionLabel: 'Mở tiện ích',
      onAction: () => {
        if (onOpenQrCodeModule) {
          onOpenQrCodeModule();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/tien-ich/tao-ma-qr';
        }
      },
    },
    {
      id: 'util-xu-ly-pdf',
      code: 'XU_LY_PDF',
      path: '/tien-ich/xu-ly-pdf',
      title: 'Bộ tiện ích xử lý PDF',
      category: 'Tiện ích tài liệu & văn phòng',
      description:
        'Công cụ toàn diện xử lý tệp PDF trực quan: Nén giảm dung lượng dễ dàng gửi qua Email và Zalo, Tách dải trang hoặc xuất từng trang đóng gói ZIP, Gộp nhiều tài liệu theo thứ tự, Sắp xếp và xoay hướng trang linh hoạt.',
      features: [
        'Nén PDF với 3 mức độ tối ưu dung lượng và xem trước tỷ lệ giảm',
        'Tách trang theo dải (ví dụ: 1-5, 8, 11-15) hoặc bấm chọn trên lưới hình thu nhỏ',
        'Xuất từng trang thành các tệp riêng lẻ và tự động đóng gói tệp nén ZIP',
        'Gộp nhiều tệp PDF, kéo thả sắp xếp thứ tự và xoay hướng trang 90°/180°',
      ],
      badge: 'Mới',
      badgeColor: 'red',
      icon: <FilePdfOutlined style={{ fontSize: 24, color: '#DC2626' }} />,
      iconBg: '#FEF2F2',
      iconBorder: '#FECACA',
      actionLabel: 'Mở tiện ích',
      onAction: () => {
        if (onOpenPdfModule) {
          onOpenPdfModule();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/tien-ich/xu-ly-pdf';
        }
      },
    },
    {
      id: 'util-xu-ly-anh',
      code: 'XU_LY_ANH',
      path: '/tien-ich/xu-ly-anh',
      title: 'Tiện ích Xử lý Ảnh',
      category: 'Tiện ích hình ảnh & đồ họa',
      description:
        'Công cụ xử lý hình ảnh toàn diện: Nén ảnh giữ nét tuyệt đối, chuyển đổi linh hoạt giữa JPG/PNG/WebP, thay đổi kích thước theo mẫu thẻ CCCD/Avatar và gộp nhiều ảnh thành 1 file PDF.',
      features: [
        'Nén ảnh giữ nét, cân bằng hoặc theo dung lượng mục tiêu (KB)',
        'Đổi định dạng JPG ⇄ PNG ⇄ WebP, bảo toàn độ trong suốt',
        'Đổi cỡ ảnh theo mẫu ảnh thẻ 3x4, 4x6, avatar, xoay và lật ảnh',
        'Gộp nhiều ảnh thành 1 tệp PDF chuẩn A4, tải ảnh lẻ hoặc file ZIP',
      ],
      badge: 'Mới',
      badgeColor: 'cyan',
      icon: <FileImageOutlined style={{ fontSize: 24, color: '#0284C7' }} />,
      iconBg: '#F0F9FF',
      iconBorder: '#BAE6FD',
      actionLabel: 'Mở tiện ích',
      onAction: () => {
        if (onOpenImageModule) {
          onOpenImageModule();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/tien-ich/xu-ly-anh';
        }
      },
    },
    {
      id: 'util-tra-cuu-van-ban',
      code: 'TRA_CUU_VB',
      path: '/tien-ich/tra-cuu-van-ban',
      title: 'Tra cứu thể thức & văn bản',
      category: 'Tiện ích hành chính & pháp lý',
      description:
        'Tra cứu tức thì quy định thể thức văn bản hành chính NĐ 30/2020, HD 05-HD/VPTW, NĐ 152/2025, TT 26/2019, TT 68/2023 và HD 29-HD/TWĐTN.',
      features: [
        'Tìm kiếm không dấu siêu tốc theo số hiệu và từ khóa',
        'Bảng quy chuẩn chi tiết: phông chữ, cỡ chữ, căn lề từng phần',
        'Sao chép trích dẫn căn cứ pháp lý và mở kho 165+ mẫu chuẩn',
      ],
      badge: 'Mới',
      badgeColor: 'purple',
      icon: <BookOutlined style={{ fontSize: 24, color: '#7C3AED' }} />,
      iconBg: '#F5F3FF',
      iconBorder: '#DDD6FE',
      actionLabel: 'Mở tiện ích',
      onAction: () => {
        if (onOpenDocLookupModule) {
          onOpenDocLookupModule();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/tien-ich/tra-cuu-van-ban';
        }
      },
    },
    {
      id: 'util-check-chinh-ta',
      code: 'CHECK_CHINH_TA',
      path: '/tien-ich/check-chinh-ta',
      title: 'Soát lỗi chính tả & ngữ phong',
      category: 'Tiện ích hành chính & soạn thảo',
      description:
        'Rà soát chính tả, lỗi gõ phím Telex/VNI, từ ngữ hành chính dễ nhầm lẫn, quy tắc viết hoa chức danh tổ chức và dấu câu theo NĐ 30/2020.',
      features: [
        'Phát hiện lỗi chính tả, từ dùng sai ngữ cảnh, viết hoa và dấu câu',
        'Giữ nguyên các mã văn bản, ngày tháng và số hiệu hành chính hợp lệ',
        'Sửa lỗi từng cụm từ hoặc tự động chuẩn hóa toàn bộ chỉ với 1 chạm',
      ],
      badge: 'Mới',
      badgeColor: 'green',
      icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: '#059669' }} />,
      iconBg: '#ECFDF5',
      iconBorder: '#A7F3D0',
      actionLabel: 'Mở tiện ích',
      onAction: () => {
        if (onOpenSpellCheckModule) {
          onOpenSpellCheckModule();
        } else if (typeof window !== 'undefined') {
          window.location.href = '/tien-ich/check-chinh-ta';
        }
      },
    },
  ];

  const filtered = utilityCards.filter(
    (u) =>
      u.title.toLowerCase().includes(search.toLowerCase()) ||
      u.description.toLowerCase().includes(search.toLowerCase()) ||
      u.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ width: '100%' }}>
      {/* Header Banner */}
      <Card
        style={{
          marginBottom: 16,
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          background: '#FFFFFF',
        }}
        styles={{ body: { padding: isMobile ? 12 : '18px 22px' } }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Space align="center" style={{ marginBottom: 4 }}>
              <ThunderboltFilled style={{ color: '#1D4ED8', fontSize: 18 }} />
              <Title level={4} style={{ margin: 0, color: '#0F172A' }}>
                Danh mục tiện ích hệ thống
              </Title>
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 13 }}>
              Chọn tiện ích bên dưới để mở không gian làm việc
            </Text>
          </div>

          <Input
            prefix={<SearchOutlined style={{ color: '#64748B' }} />}
            placeholder="Tìm kiếm tiện ích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            style={{ width: isMobile ? '100%' : 260 }}
          />
        </div>
      </Card>

      {/* Single Utility Card Grid (extensible for future modules) */}
      <Row gutter={[16, 16]}>
        {filtered.map((item) => (
          <Col xs={24} md={12} lg={12} key={item.id}>
            <Card
              hoverable
              style={{
                height: '100%',
                borderRadius: 6,
                border: '1px solid #CBD5E1',
                display: 'flex',
                flexDirection: 'column',
              }}
              styles={{
                body: {
                  padding: isMobile ? 12 : 22,
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                },
              }}
              onClick={item.onAction}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 6,
                    background: item.iconBg,
                    border: `1px solid ${item.iconBorder}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </div>
                <Tag color={item.badgeColor} style={{ margin: 0, fontWeight: 600 }}>
                  {item.badge}
                </Tag>
              </div>

              <Text
                type="secondary"
                style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}
              >
                {item.category}
              </Text>
              <Title level={5} style={{ margin: '0 0 8px 0', color: '#0F172A', fontSize: 17 }}>
                {item.title}
              </Title>
              <Paragraph
                style={{
                  color: '#475569',
                  fontSize: 13,
                  lineHeight: 1.55,
                  marginBottom: 12,
                }}
              >
                {item.description}
              </Paragraph>

              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 4,
                  padding: '10px 12px',
                  marginBottom: 16,
                }}
              >
                {item.features.map((f) => (
                  <div
                    key={f}
                    style={{
                      fontSize: 12.5,
                      color: '#334155',
                      marginBottom: 4,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <CheckCircleOutlined style={{ color: '#1D4ED8', fontSize: 12, flexShrink: 0 }} />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <Button
                type="primary"
                icon={<ArrowRightOutlined />}
                block
                style={{ background: '#1D4ED8', fontWeight: 600, height: 38 }}
                onClick={(e) => {
                  e.stopPropagation();
                  item.onAction();
                }}
              >
                {item.actionLabel}
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};
