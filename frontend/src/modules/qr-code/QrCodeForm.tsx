'use client';

import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Select,
  Switch,
  Segmented,
  Typography,
  Space,
} from 'antd';
import {
  LinkOutlined,
  FileTextOutlined,
  WifiOutlined,
  IdcardOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  QrContentType,
  WifiConfig,
  VCardConfig,
  EmailConfig,
  PhoneConfig,
} from './qr-types';
import {
  buildWifiPayload,
  buildVCardPayload,
  buildEmailPayload,
  buildPhonePayload,
} from './qr-generator-utils';

const { Text } = Typography;
const { TextArea } = Input;

interface QrCodeFormProps {
  onChange: (payload: string, title: string, type: QrContentType) => void;
}

export const QrCodeForm: React.FC<QrCodeFormProps> = ({ onChange }) => {
  const [type, setType] = useState<QrContentType>('URL');
  const [url, setUrl] = useState('https://3dohub.com');
  const [text, setText] = useState('Chào mừng bạn đến với 3DoHub!');
  const [wifi, setWifi] = useState<WifiConfig>({
    ssid: 'Cong_Ty_3DoHub',
    password: 'MatKhauWifi2026',
    encryption: 'WPA',
    hidden: false,
  });
  const [vcard, setVcard] = useState<VCardConfig>({
    fullName: 'Nguyễn Văn A',
    phone: '0901234567',
    email: 'contact@3dohub.com',
    organization: '3DoHub Platform',
    title: 'Chuyên viên kỹ thuật',
    website: 'https://3dohub.com',
    address: 'Hà Nội, Việt Nam',
  });
  const [email, setEmail] = useState<EmailConfig>({
    email: '3do.service@gmail.com',
    subject: 'Liên hệ từ mã QR',
    body: 'Kính gửi ban quản trị 3DoHub,',
  });
  const [phone, setPhone] = useState<PhoneConfig>({
    phone: '0901234567',
    action: 'call',
    smsBody: 'Xin chào!',
  });

  useEffect(() => {
    let payload = '';
    let title = '';

    switch (type) {
      case 'URL':
        payload = url.trim();
        title = url ? `Liên kết: ${url}` : 'Mã QR liên kết';
        break;
      case 'TEXT':
        payload = text;
        title = 'Mã QR văn bản';
        break;
      case 'WIFI':
        payload = buildWifiPayload(wifi);
        title = `Wi-Fi: ${wifi.ssid}`;
        break;
      case 'VCARD':
        payload = buildVCardPayload(vcard);
        title = `Danh thiếp: ${vcard.fullName}`;
        break;
      case 'EMAIL':
        payload = buildEmailPayload(email);
        title = `Email: ${email.email}`;
        break;
      case 'PHONE':
        payload = buildPhonePayload(phone);
        title = phone.action === 'sms' ? `SMS đến ${phone.phone}` : `Gọi ${phone.phone}`;
        break;
    }

    onChange(payload || 'https://3dohub.com', title, type);
  }, [type, url, text, wifi, vcard, email, phone, onChange]);

  const segmentedOptions = [
    { label: 'Liên kết web', value: 'URL', icon: <LinkOutlined /> },
    { label: 'Văn bản', value: 'TEXT', icon: <FileTextOutlined /> },
    { label: 'Wi-Fi', value: 'WIFI', icon: <WifiOutlined /> },
    { label: 'Danh thiếp', value: 'VCARD', icon: <IdcardOutlined /> },
    { label: 'Email', value: 'EMAIL', icon: <MailOutlined /> },
    { label: 'Số điện thoại', value: 'PHONE', icon: <PhoneOutlined /> },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 13, display: 'block', marginBottom: 8, color: '#334155' }}>
          Loại nội dung mã QR:
        </Text>
        <Segmented
          options={segmentedOptions}
          value={type}
          onChange={(val) => setType(val as QrContentType)}
          block
          style={{ background: '#F1F5F9', padding: 3, borderRadius: 6 }}
        />
      </div>

      <Form layout="vertical">
        {type === 'URL' && (
          <Form.Item label={<Text strong style={{ fontSize: 13 }}>Địa chỉ website (URL)</Text>}>
            <Input
              prefix={<GlobalOutlined style={{ color: '#94A3B8' }} />}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              size="large"
              style={{ borderRadius: 4 }}
              allowClear
            />
          </Form.Item>
        )}

        {type === 'TEXT' && (
          <Form.Item label={<Text strong style={{ fontSize: 13 }}>Nội dung văn bản</Text>}>
            <TextArea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nhập đoạn văn bản hoặc thông điệp cần chia sẻ..."
              style={{ borderRadius: 4 }}
            />
          </Form.Item>
        )}

        {type === 'WIFI' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Form.Item label={<Text strong style={{ fontSize: 13 }}>Tên mạng Wi-Fi (SSID)</Text>} required>
              <Input
                prefix={<WifiOutlined style={{ color: '#94A3B8' }} />}
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="Tên Wi-Fi"
                style={{ borderRadius: 4 }}
              />
            </Form.Item>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Mật khẩu Wi-Fi</Text>}>
                <Input.Password
                  prefix={<LockOutlined style={{ color: '#94A3B8' }} />}
                  value={wifi.password}
                  onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                  placeholder="Mật khẩu"
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>

              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Loại mã hóa</Text>}>
                <Select
                  value={wifi.encryption}
                  onChange={(val) => setWifi({ ...wifi, encryption: val })}
                  options={[
                    { label: 'WPA / WPA2 / WPA3', value: 'WPA' },
                    { label: 'WEP', value: 'WEP' },
                    { label: 'Không mật khẩu', value: 'nopass' },
                  ]}
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
            </div>

            <Space>
              <Switch
                checked={wifi.hidden}
                onChange={(checked) => setWifi({ ...wifi, hidden: checked })}
                size="small"
              />
              <Text style={{ fontSize: 13 }}>Mạng Wi-Fi ẩn (Hidden SSID)</Text>
            </Space>
          </div>
        )}

        {type === 'VCARD' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Họ và tên</Text>} required>
                <Input
                  prefix={<UserOutlined style={{ color: '#94A3B8' }} />}
                  value={vcard.fullName}
                  onChange={(e) => setVcard({ ...vcard, fullName: e.target.value })}
                  placeholder="Nguyễn Văn A"
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Số điện thoại</Text>} required>
                <Input
                  prefix={<PhoneOutlined style={{ color: '#94A3B8' }} />}
                  value={vcard.phone}
                  onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                  placeholder="0901234567"
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Email</Text>}>
                <Input
                  prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
                  value={vcard.email}
                  onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                  placeholder="name@example.com"
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Chức vụ</Text>}>
                <Input
                  value={vcard.title}
                  onChange={(e) => setVcard({ ...vcard, title: e.target.value })}
                  placeholder="Trưởng phòng"
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Cơ quan / Công ty</Text>}>
                <Input
                  value={vcard.organization}
                  onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                  placeholder="Tên cơ quan"
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Website</Text>}>
                <Input
                  value={vcard.website}
                  onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                  placeholder="https://..."
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
            </div>
          </div>
        )}

        {type === 'EMAIL' && (
          <div>
            <Form.Item label={<Text strong style={{ fontSize: 13 }}>Địa chỉ Email nhận</Text>} required>
              <Input
                prefix={<MailOutlined style={{ color: '#94A3B8' }} />}
                value={email.email}
                onChange={(e) => setEmail({ ...email, email: e.target.value })}
                placeholder="contact@example.com"
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
            <Form.Item label={<Text strong style={{ fontSize: 13 }}>Tiêu đề thư</Text>}>
              <Input
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                placeholder="Tiêu đề thư"
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
            <Form.Item label={<Text strong style={{ fontSize: 13 }}>Nội dung thư mẫu</Text>}>
              <TextArea
                rows={3}
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                placeholder="Nội dung thư..."
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
          </div>
        )}

        {type === 'PHONE' && (
          <div>
            <Form.Item label={<Text strong style={{ fontSize: 13 }}>Hành động</Text>}>
              <Segmented
                options={[
                  { label: 'Gọi điện trực tiếp', value: 'call' },
                  { label: 'Gửi tin nhắn SMS', value: 'sms' },
                ]}
                value={phone.action}
                onChange={(val) => setPhone({ ...phone, action: val as 'call' | 'sms' })}
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
            <Form.Item label={<Text strong style={{ fontSize: 13 }}>Số điện thoại</Text>} required>
              <Input
                prefix={<PhoneOutlined style={{ color: '#94A3B8' }} />}
                value={phone.phone}
                onChange={(e) => setPhone({ ...phone, phone: e.target.value })}
                placeholder="0901234567"
                style={{ borderRadius: 4 }}
              />
            </Form.Item>
            {phone.action === 'sms' && (
              <Form.Item label={<Text strong style={{ fontSize: 13 }}>Nội dung tin nhắn SMS</Text>}>
                <TextArea
                  rows={2}
                  value={phone.smsBody}
                  onChange={(e) => setPhone({ ...phone, smsBody: e.target.value })}
                  placeholder="Nội dung tin nhắn..."
                  style={{ borderRadius: 4 }}
                />
              </Form.Item>
            )}
          </div>
        )}
      </Form>
    </div>
  );
};

