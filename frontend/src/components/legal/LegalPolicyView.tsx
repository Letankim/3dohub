'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Alert, Button, Card, Col, Divider, Row, Space, Tag, Typography } from 'antd';
import {
  ArrowLeftOutlined,
  AuditOutlined,
  CheckCircleFilled,
  FileProtectOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { AppShell } from '@/components/layout/AppShell';
import { CommandModal } from '@/components/common/CommandModal';
import { HubNavModule } from '@/config/modules-registry';

const { Title, Paragraph, Text } = Typography;

export type LegalTabType = 'TERMS' | 'PRIVACY' | 'DATA_COMPLIANCE';

interface LegalPolicyViewProps {
  initialTab?: LegalTabType;
}

export const LegalPolicyView: React.FC<LegalPolicyViewProps> = ({
  initialTab = 'TERMS',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<LegalTabType>(initialTab);
  const [commandOpen, setCommandOpen] = useState(false);
  const [viewportWidth, setViewportWidth] = useState<number>(1280);

  useEffect(() => {
    const updateWidth = () => setViewportWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  const isMobile = viewportWidth < 640;

  useEffect(() => {
    if (pathname === '/dieu-khoan-dich-vu') setActiveTab('TERMS');
    else if (pathname === '/chinh-sach-bao-mat') setActiveTab('PRIVACY');
    else if (pathname === '/quy-dinh-bao-ve-du-lieu') setActiveTab('DATA_COMPLIANCE');
  }, [pathname]);

  const handleSwitchTab = (tab: LegalTabType) => {
    setActiveTab(tab);
    if (tab === 'TERMS' && pathname !== '/dieu-khoan-dich-vu') {
      router.push('/dieu-khoan-dich-vu');
    } else if (tab === 'PRIVACY' && pathname !== '/chinh-sach-bao-mat') {
      router.push('/chinh-sach-bao-mat');
    } else if (tab === 'DATA_COMPLIANCE' && pathname !== '/quy-dinh-bao-ve-du-lieu') {
      router.push('/quy-dinh-bao-ve-du-lieu');
    }
  };

  const handleSelectNavModule = (mod: HubNavModule) => {
    if (mod.path) router.push(mod.path);
  };

  const breadcrumbTitle =
    activeTab === 'TERMS'
      ? 'Điều khoản dịch vụ'
      : activeTab === 'PRIVACY'
      ? 'Chính sách bảo mật'
      : 'Bảo vệ dữ liệu & An toàn thông tin';

  return (
    <AppShell
      activeKey="home-overview"
      activeTitle={breadcrumbTitle}
      onSelectModule={handleSelectNavModule}
      onOpenCommand={() => setCommandOpen(true)}
      onNavigateBreadcrumb={(target) => {
        router.push(target === 'HOME' ? '/' : '/tien-ich');
      }}
    >
      <div style={{ width: '100%', paddingBottom: 16 }}>
        {/* Header Bar */}
        <Card
          size="small"
          style={{ borderRadius: 6, border: '1px solid #E2E8F0', marginBottom: 16 }}
          styles={{ body: { padding: isMobile ? '14px 14px' : '20px 24px' } }}
        >
          {/* Top action row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <Space size={8} wrap>
              <Button
                size="small"
                icon={<ArrowLeftOutlined />}
                onClick={() => router.push('/')}
              >
                Trang chủ
              </Button>
              <Tag color="blue" style={{ margin: 0, fontWeight: 600 }}>
                {isMobile ? 'TRUNG TÂM PHÁP LÝ' : 'TRUNG TÂM PHÁP LÝ & AN TOÀN DỮ LIỆU'}
              </Tag>
              <Tag color="green" style={{ margin: 0, fontWeight: 600 }}>
                Cập nhật: 09/11/2026
              </Tag>
            </Space>
          </div>

          {/* Responsive Touch-friendly Horizontal Tabs Bar (No Overflow on Mobile) */}
          <div
            style={{
              width: '100%',
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: 6,
              marginBottom: 12,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            <Space size={8} wrap={false} style={{ display: 'flex', minWidth: 'max-content' }}>
              <Button
                size={isMobile ? 'small' : 'middle'}
                type={activeTab === 'TERMS' ? 'primary' : 'default'}
                icon={<FileProtectOutlined />}
                onClick={() => handleSwitchTab('TERMS')}
                style={{
                  borderRadius: 4,
                  fontWeight: activeTab === 'TERMS' ? 600 : 500,
                  background: activeTab === 'TERMS' ? '#1D4ED8' : '#F8FAFC',
                  borderColor: activeTab === 'TERMS' ? '#1D4ED8' : '#CBD5E1',
                  color: activeTab === 'TERMS' ? '#FFFFFF' : '#334155',
                }}
              >
                Điều khoản dịch vụ
              </Button>
              <Button
                size={isMobile ? 'small' : 'middle'}
                type={activeTab === 'PRIVACY' ? 'primary' : 'default'}
                icon={<LockOutlined />}
                onClick={() => handleSwitchTab('PRIVACY')}
                style={{
                  borderRadius: 4,
                  fontWeight: activeTab === 'PRIVACY' ? 600 : 500,
                  background: activeTab === 'PRIVACY' ? '#1D4ED8' : '#F8FAFC',
                  borderColor: activeTab === 'PRIVACY' ? '#1D4ED8' : '#CBD5E1',
                  color: activeTab === 'PRIVACY' ? '#FFFFFF' : '#334155',
                }}
              >
                Chính sách bảo mật
              </Button>
              <Button
                size={isMobile ? 'small' : 'middle'}
                type={activeTab === 'DATA_COMPLIANCE' ? 'primary' : 'default'}
                icon={<SafetyCertificateOutlined />}
                onClick={() => handleSwitchTab('DATA_COMPLIANCE')}
                style={{
                  borderRadius: 4,
                  fontWeight: activeTab === 'DATA_COMPLIANCE' ? 600 : 500,
                  background: activeTab === 'DATA_COMPLIANCE' ? '#1D4ED8' : '#F8FAFC',
                  borderColor: activeTab === 'DATA_COMPLIANCE' ? '#1D4ED8' : '#CBD5E1',
                  color: activeTab === 'DATA_COMPLIANCE' ? '#FFFFFF' : '#334155',
                }}
              >
                Tuân thủ Luật Dữ liệu
              </Button>
            </Space>
          </div>

          <Title level={isMobile ? 4 : 3} style={{ margin: '4px 0 8px 0', color: '#0F172A' }}>
            {activeTab === 'TERMS' && 'Điều khoản sử dụng dịch vụ (Terms of Service)'}
            {activeTab === 'PRIVACY' && 'Chính sách bảo mật & Quyền riêng tư (Privacy Policy)'}
            {activeTab === 'DATA_COMPLIANCE' &&
              'Quy định bảo vệ dữ liệu & Tiêu chuẩn an toàn thông tin'}
          </Title>
          <Text style={{ color: '#475569', fontSize: 13.5 }}>
            Áp dụng cho người dùng và tổ chức khi truy cập, khai thác các tiện ích và dịch vụ trên{' '}
            <b>Nền tảng tiện ích trực tuyến 3DoHub Enterprise</b>.
          </Text>
        </Card>

        {/* Zero-Retention Guarantee Banner (J2Team style) */}
        <Alert
          type="info"
          showIcon
          icon={<SafetyCertificateOutlined style={{ color: '#1D4ED8' }} />}
          message={
            <span style={{ fontWeight: 700, color: '#0F172A' }}>
              Cam kết cốt lõi: Không lưu trữ tài liệu và dữ liệu nghiệp vụ trên máy chủ (Zero-Data-Retention)
            </span>
          }
          description={
            <span style={{ fontSize: 13, color: '#334155' }}>
              Mọi tệp tin và dữ liệu gửi lên được xử lý tức thời trên bộ nhớ đệm (RAM) để thực thi tác vụ
              tiện ích và trả kết quả trực tiếp về trình duyệt của bạn. Hệ thống <b>tuyệt đối không lưu trữ</b>{' '}
              nội dung tài liệu vào cơ sở dữ liệu hay ổ cứng máy chủ dưới bất kỳ hình thức nào.
            </span>
          }
          style={{ marginBottom: 16, borderRadius: 6, border: '1px solid #BFDBFE', background: '#EFF6FF' }}
        />

        {/* Content Body by Tab */}
        {activeTab === 'TERMS' && (
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
            styles={{ body: { padding: isMobile ? '16px 14px' : '24px 28px' } }}
          >
            <Title level={5} style={{ color: '#0F172A', marginTop: 0 }}>
              1. Giới thiệu và chấp thuận điều khoản
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
              Chào mừng bạn đến với <b>3DoHub Enterprise</b> — Nền tảng tiện ích trực tuyến và giải
              pháp số hóa nghiệp vụ đa lĩnh vực. Khi truy cập và sử dụng bất kỳ công cụ hoặc dịch vụ
              nào trên nền tảng, bạn xác nhận đã đọc, hiểu và đồng ý tuân thủ toàn bộ các Điều khoản
              dịch vụ này cùng các quy định pháp luật hiện hành của nước Cộng hòa xã hội chủ nghĩa
              Việt Nam.
            </Paragraph>

            <Title level={5} style={{ color: '#0F172A' }}>
              2. Phạm vi cung cấp tiện ích & Định hướng mở rộng đa lĩnh vực
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
              3DoHub được kiến trúc theo mô hình Module Hub mở, cung cấp hệ sinh thái tiện ích trực
              tuyến toàn diện và không ngừng mở rộng theo nhu cầu thực tiễn của doanh nghiệp và tổ chức:
            </Paragraph>
            <ul style={{ color: '#334155', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>
                <b>Nhóm tiện ích Hành chính - Văn thư & Soạn thảo</b>: Tự động hóa định dạng thể thức
                văn bản chuẩn 5 khối (Đảng theo QĐ 399 & HD 05, Chính quyền theo NĐ 30/2020/NĐ-CP,
                Lực lượng vũ trang theo TT 26/BCA & TT 68/BQP, MTTQ theo QĐ 207), kho 17 mẫu văn
                bản chuẩn hóa và các công cụ hỗ trợ văn phòng số.
              </li>
              <li>
                <b>Nhóm tiện ích Xử lý Bảng tính & Số liệu</b>: Chuẩn hóa trang in A4 thông minh
                (khổ đứng/khổ ngang), chống lỗi tràn cột (#), tự động ngắt dòng và lặp tiêu đề bảng,
                bảo toàn công thức tính toán.
              </li>
              <li>
                <b>Nhóm tiện ích Chuyển đổi định dạng & Công cụ năng suất</b>: Hỗ trợ xử lý, chuyển đổi
                và tối ưu hóa dữ liệu số tức thì trên trình duyệt mà không cần cài đặt phần mềm phức
                tạp.
              </li>
              <li>
                <b>Định hướng mở rộng liên tục</b>: Nền tảng liên tục tích hợp các phân hệ tiện ích mới
                thuộc nhiều lĩnh vực chuyên môn (Quản trị, Tài chính, Nghiệp vụ văn phòng, Chuyển đổi số)
                nhằm đáp ứng nhu cầu ngày càng phong phú của doanh nghiệp và tổ chức.
              </li>
            </ul>

            <Title level={5} style={{ color: '#0F172A' }}>
              3. Quyền sở hữu nội dung và trách nhiệm của người dùng
            </Title>
            <ul style={{ color: '#334155', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>
                <b>Quyền sở hữu tuyệt đối</b>: Cơ quan, đơn vị và người dùng giữ 100% bản quyền và
                quyền sở hữu đối với toàn bộ dữ liệu, văn bản, số liệu và tệp tin xử lý trên hệ thống.
              </li>
              <li>
                <b>Trách nhiệm kiểm duyệt kết quả</b>: Các công cụ hỗ trợ tự động hóa nghiệp vụ và
                rà soát quy chuẩn. Trước khi áp dụng, ký duyệt hoặc phát hành chính thức, người dùng
                có trách nhiệm kiểm tra lại toàn bộ nội dung và kết quả theo quy chế hoạt động của đơn
                vị mình.
              </li>
              <li>
                <b>Hành vi bị nghiêm cấm</b>: Nghiêm cấm sử dụng công cụ tự động (bot/script) gửi yêu
                cầu hàng loạt gây quá tải hệ thống (DoS/DDoS), tải lên tệp tin chứa mã độc, tệp nén
                tự nhân bản (Zip-Bomb) hoặc can thiệp trái phép vào giao thức bảo mật của hệ thống.
              </li>
            </ul>

            <Title level={5} style={{ color: '#0F172A' }}>
              4. Cơ chế bảo vệ hạ tầng & Giới hạn tần suất (Rate Limiting)
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
              Để đảm bảo tốc độ xử lý ổn định cho mọi người dùng, hệ thống áp dụng cơ chế giới hạn tối
              đa <b>120 yêu cầu/phút</b> đối với thao tác tra cứu thông thường và <b>35 yêu cầu/phút</b>{' '}
              đối với tác vụ xử lý tệp nặng trên mỗi địa chỉ IP. Khi vượt ngưỡng, hệ thống sẽ tạm khóa
              trong vài chục giây và tự động mở lại.
            </Paragraph>
          </Card>
        )}

        {activeTab === 'PRIVACY' && (
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
            styles={{ body: { padding: isMobile ? '16px 14px' : '24px 28px' } }}
          >
            <Title level={5} style={{ color: '#0F172A', marginTop: 0 }}>
              1. Nguyên tắc thu thập và xử lý dữ liệu tối thiểu
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
              Chúng tôi xây dựng <b>3DoHub Enterprise</b> theo triết lý <i>Privacy by Design</i> (Bảo
              mật ngay từ thiết kế). Người dùng <b>không cần đăng ký tài khoản</b>, không cần cung cấp
              thông tin danh tính cá nhân để sử dụng các tiện ích trên hệ thống. Mọi dữ liệu nghiệp vụ
              đều được xử lý trong phiên làm việc độc lập và giải phóng ngay sau khi hoàn tất.
            </Paragraph>

            <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
              <Col xs={24} md={8}>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    padding: 14,
                    height: '100%',
                  }}
                >
                  <Space size={6} style={{ marginBottom: 6 }}>
                    <LockOutlined style={{ color: '#16A34A' }} />
                    <Text strong>Xử lý 100% trên RAM</Text>
                  </Space>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    Dữ liệu nghiệp vụ và tệp tin được giải phóng khỏi bộ nhớ ngay lập tức sau khi trả
                    kết quả về trình duyệt.
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    padding: 14,
                    height: '100%',
                  }}
                >
                  <Space size={6} style={{ marginBottom: 6 }}>
                    <FileProtectOutlined style={{ color: '#1D4ED8' }} />
                    <Text strong>Lưu cấu hình tại trình duyệt</Text>
                  </Space>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    Các tùy chọn cấu hình tiện ích chỉ lưu tại <code>localStorage</code> trên chính
                    máy tính của bạn và có thể xóa bất cứ lúc nào.
                  </div>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div
                  style={{
                    background: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: 6,
                    padding: 14,
                    height: '100%',
                  }}
                >
                  <Space size={6} style={{ marginBottom: 6 }}>
                    <SecurityScanOutlined style={{ color: '#7C3AED' }} />
                    <Text strong>Không chia sẻ bên thứ ba</Text>
                  </Space>
                  <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.5 }}>
                    Không tích hợp trình theo dõi quảng cáo, không thu thập hay chuyển giao dữ liệu
                    cho bất kỳ tổ chức nào.
                  </div>
                </div>
              </Col>
            </Row>

            <Title level={5} style={{ color: '#0F172A' }}>
              2. Dữ liệu kỹ thuật phục vụ vận hành & bảo mật
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
              Khi trình duyệt gửi yêu cầu xử lý, hệ thống chỉ kiểm tra các thông số kỹ thuật ngắn hạn
              nhằm chống tấn công mạng:
            </Paragraph>
            <ul style={{ color: '#334155', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>
                <b>Mã định danh phiên ngắn hạn (Nonce & Timestamp)</b>: Lưu trong bộ nhớ tối đa 300
                giây để ngăn chặn tấn công phát lại gói tin (Replay Attack).
              </li>
              <li>
                <b>Bộ đếm tần suất theo IP (Rate-Limit Counter)</b>: Lưu trong cửa sổ trượt 60 giây
                nhằm ngăn chặn hành vi spam làm nghẽn hệ thống.
              </li>
              <li>
                <b>Bộ nhớ cục bộ trình duyệt (LocalStorage)</b>: Lưu các tùy chọn tiện ích cá nhân hóa
                trên chính trình duyệt của bạn. Bạn có thể xóa bất cứ lúc nào bằng cách xóa dữ liệu
                duyệt web.
              </li>
            </ul>

            <Title level={5} style={{ color: '#0F172A' }}>
              3. Quyền của chủ thể dữ liệu theo Nghị định 13/2023/NĐ-CP
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7, marginBottom: 0 }}>
              Tuân thủ <b>Nghị định số 13/2023/NĐ-CP</b> về Bảo vệ dữ liệu cá nhân, người dùng có
              đầy đủ quyền được biết, quyền đồng ý, quyền tự xóa toàn bộ dữ liệu cấu hình lưu trên
              trình duyệt cá nhân và quyền liên hệ giải đáp thắc mắc về an toàn thông tin qua kênh hỗ
              trợ chính thức.
            </Paragraph>
          </Card>
        )}

        {activeTab === 'DATA_COMPLIANCE' && (
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
            styles={{ body: { padding: isMobile ? '16px 14px' : '24px 28px' } }}
          >
            <Title level={5} style={{ color: '#0F172A', marginTop: 0 }}>
              1. Căn cứ pháp lý về dữ liệu và an toàn thông tin tại Việt Nam
            </Title>
            <Paragraph style={{ color: '#334155', fontSize: 14, lineHeight: 1.7 }}>
              Kiến trúc xử lý dữ liệu của <b>3DoHub Enterprise</b> được thiết kế tuân thủ nghiêm ngặt
              các văn bản quy phạm pháp luật hiện hành:
            </Paragraph>
            <ul style={{ color: '#334155', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>
                <b>Luật Dữ liệu số 60/2024/QH15</b>: Đảm bảo nguyên tắc an toàn, bảo mật, toàn vẹn dữ
                liệu trong quá trình xử lý tự động; không thu thập hoặc lưu trữ trái phép dữ liệu của
                cơ quan, tổ chức, cá nhân.
              </li>
              <li>
                <b>Nghị định số 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân</b>: Áp dụng
                biện pháp kỹ thuật bảo vệ dữ liệu ngay từ khâu thiết kế hệ thống; không lưu trữ dữ
                liệu cá nhân phát sinh trong quá trình xử lý tiện ích.
              </li>
              <li>
                <b>Luật An ninh mạng số 24/2018/QH14 & Luật Giao dịch điện tử số 20/2023/QH15</b>:
                Đảm bảo tính toàn vẹn của thông điệp dữ liệu thông qua cơ chế kiểm tra mã băm SHA-256
                và chữ ký xác thực HMAC-SHA256 giữa trình duyệt và máy chủ xử lý.
              </li>
            </ul>

            <Title level={5} style={{ color: '#0F172A' }}>
              2. Các lớp bảo vệ kỹ thuật đang vận hành trên 3DoHub
            </Title>
            <ul style={{ color: '#334155', fontSize: 14, lineHeight: 1.8, paddingLeft: 20 }}>
              <li>
                <CheckCircleFilled style={{ color: '#16A34A', marginRight: 6 }} />
                <b>Kiểm tra tính toàn vẹn dữ liệu (Payload Integrity)</b>: Mọi yêu cầu xử lý tiện ích
                đều được đối chiếu chữ ký số để ngăn chặn việc giả mạo hoặc chỉnh sửa dữ liệu trên đường
                truyền.
              </li>
              <li>
                <CheckCircleFilled style={{ color: '#16A34A', marginRight: 6 }} />
                <b>Kiểm định an toàn tệp tải lên</b>: Hệ thống tự động kiểm tra cấu trúc tệp tin, giới
                hạn dung lượng và tỷ lệ giải nén nhằm ngăn chặn mã độc macro và tấn công Zip-Bomb.
              </li>
              <li>
                <CheckCircleFilled style={{ color: '#16A34A', marginRight: 6 }} />
                <b>Tách biệt hoàn toàn phiên xử lý</b>: Mỗi yêu cầu được cấp mã định danh{' '}
                <code>request_id</code> độc lập, xử lý cô lập trong bộ nhớ và hủy ngay khi hoàn tất.
              </li>
            </ul>

            <Divider style={{ margin: '18px 0' }} />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                background: '#F8FAFC',
                padding: '12px 16px',
                borderRadius: 6,
                border: '1px solid #E2E8F0',
              }}
            >
              <Space size={10}>
                <AuditOutlined style={{ fontSize: 20, color: '#1D4ED8' }} />
                <div>
                  <Text strong style={{ display: 'block', color: '#0F172A' }}>
                    Bộ phận quản trị & hỗ trợ kỹ thuật 3DoHub
                  </Text>
                  <Text type="secondary" style={{ fontSize: 12.5 }}>
                    Tiếp nhận phản hồi về quy định bảo mật, điều khoản và giải pháp tiện ích
                  </Text>
                </div>
              </Space>
              <Button
                type="primary"
                icon={<MailOutlined />}
                href="mailto:3do.service@gmail.com"
                style={{ background: '#1D4ED8', fontWeight: 600 }}
              >
                Liên hệ: 3do.service@gmail.com
              </Button>
            </div>
          </Card>
        )}
      </div>

      <CommandModal
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onSelectModule={handleSelectNavModule}
      />
    </AppShell>
  );
};

