'use client';

import React, { useState } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  DatePicker,
  Space,
  Typography,
  message,
  Collapse,
  QRCode,
} from 'antd';
import {
  LinkOutlined,
  CopyOutlined,
  DownloadOutlined,
  SendOutlined,
  CheckCircleFilled,
  PlusOutlined,
  GlobalOutlined,
  ArrowRightOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { apiClient, HubApiException } from '@/services/api-client';
import { ShortLinkItem, CreateShortLinkPayload } from '@/types/api';

const { Text, Title, Paragraph } = Typography;

interface CreateShortLinkModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const CreateShortLinkModal: React.FC<CreateShortLinkModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [createdItem, setCreatedItem] = useState<ShortLinkItem | null>(null);

  const handleClose = () => {
    form.resetFields();
    setCreatedItem(null);
    onClose();
  };

  const handleSubmit = async (values: {
    original_url: string;
    custom_code?: string;
    title?: string;
    tags?: string;
    expires_at?: unknown;
  }) => {
    setLoading(true);
    try {
      const payload: CreateShortLinkPayload = {
        original_url: values.original_url.trim(),
        custom_code: values.custom_code?.trim() || undefined,
        title: values.title?.trim() || undefined,
        tags: values.tags?.trim() || undefined,
        expires_at: values.expires_at ? (values.expires_at as { toISOString: () => string }).toISOString() : undefined,
      };

      const res = await apiClient.createShortLink(payload);
      if (res.data) {
        setCreatedItem(res.data);
        message.success(res.message || 'Tạo liên kết rút gọn thành công!');
        form.resetFields();
        onCreated();
      }
    } catch (err: unknown) {
      if (err instanceof HubApiException) {
        message.error(err.message);
      } else {
        message.error('Có lỗi xảy ra khi tạo liên kết.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép liên kết vào bộ nhớ tạm!');
  };

  const handleDownloadQR = () => {
    const container = document.getElementById('modal-short-link-qr');
    const canvas = container?.querySelector('canvas');
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = `QR_${createdItem?.code || 'link'}.png`;
      a.href = url;
      a.click();
      message.success('Đã tải hình ảnh mã QR!');
      return;
    }
    const svg = container?.querySelector('svg');
    if (svg) {
      const xml = new XMLSerializer().serializeToString(svg);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const image64 = 'data:image/svg+xml;base64,' + svg64;
      const img = new Image();
      img.src = image64;
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 300;
        c.height = 300;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 300, 300);
          ctx.drawImage(img, 0, 0, 300, 300);
          const a = document.createElement('a');
          a.download = `QR_${createdItem?.code || 'link'}.png`;
          a.href = c.toDataURL('image/png');
          a.click();
          message.success('Đã tải hình ảnh mã QR (PNG)!');
        }
      };
    }
  };

  const fullShortUrl = createdItem
    ? typeof window !== 'undefined'
      ? `${window.location.origin}/s/${createdItem.code}`
      : createdItem.short_url
    : '';

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      width={800}
      style={{ top: 20, maxWidth: '96vw' }}
      destroyOnClose
      title={
        <Space size={8}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: '#EFF6FF',
              color: '#1D4ED8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LinkOutlined style={{ fontSize: 16 }} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
            {createdItem ? 'Liên kết đã được tạo' : 'Tạo liên kết rút gọn mới'}
          </span>
        </Space>
      }
      styles={{ body: { padding: '16px 0 8px 0' } }}
    >
      {!createdItem ? (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="original_url"
            label={<Text strong style={{ fontSize: 13 }}>Đường dẫn URL gốc cần rút gọn</Text>}
            rules={[
              { required: true, message: 'Vui lòng nhập đường dẫn URL cần rút gọn' },
              {
                validator: (_, val) => {
                  if (!val || val.trim().length < 4) return Promise.reject(new Error('URL quá ngắn'));
                  return Promise.resolve();
                },
              },
            ]}
          >
            <Input
              prefix={<GlobalOutlined style={{ color: '#94A3B8' }} />}
              placeholder="https://example.com/duong-dan-dai-can-chia-se..."
              size="large"
              style={{ borderRadius: 4 }}
              autoFocus
              allowClear
            />
          </Form.Item>

          <Collapse
            ghost
            items={[
              {
                key: 'adv',
                label: (
                  <Text style={{ fontSize: 13, color: '#1D4ED8', cursor: 'pointer' }}>
                    Tùy chọn nâng cao
                  </Text>
                ),
                children: (
                  <div style={{ paddingTop: 4 }}>
                    <Form.Item
                      name="custom_code"
                      label={<Text style={{ fontSize: 13 }}>Mã tùy biến (Custom Slug)</Text>}
                      tooltip="Chỉ chứa chữ thường, số, dấu gạch ngang (ví dụ: hop-dong-2026)"
                    >
                      <Input
                        addonBefore={typeof window !== 'undefined' ? `${window.location.host}/s/` : '/s/'}
                        placeholder="ma-tuy-bien"
                        style={{ borderRadius: 4 }}
                      />
                    </Form.Item>

                    <Form.Item
                      name="title"
                      label={<Text style={{ fontSize: 13 }}>Tiêu đề gợi nhớ</Text>}
                    >
                      <Input placeholder="Tài liệu giới thiệu dự án..." style={{ borderRadius: 4 }} />
                    </Form.Item>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <Form.Item
                        name="expires_at"
                        label={<Text style={{ fontSize: 13 }}>Thời điểm hết hạn</Text>}
                      >
                        <DatePicker
                          showTime
                          format="YYYY-MM-DD HH:mm"
                          style={{ width: '100%', borderRadius: 4 }}
                          placeholder="Chọn ngày hết hạn"
                        />
                      </Form.Item>

                      <Form.Item
                        name="tags"
                        label={<Text style={{ fontSize: 13 }}>Thẻ phân loại</Text>}
                      >
                        <Input placeholder="marketing, noi-bo" style={{ borderRadius: 4 }} />
                      </Form.Item>
                    </div>
                  </div>
                ),
              },
            ]}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button icon={<CloseOutlined />} onClick={handleClose} style={{ borderRadius: 4 }}>
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
              style={{
                borderRadius: 4,
                backgroundColor: '#1D4ED8',
                fontWeight: 600,
              }}
            >
              Tạo liên kết
            </Button>
          </div>
        </Form>
      ) : (
        <div style={{ padding: '8px 4px' }}>
          <div
            style={{
              padding: 16,
              background: '#F0FDF4',
              borderRadius: 6,
              border: '1px solid #BBF7D0',
              marginBottom: 16,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <CheckCircleFilled style={{ color: '#16A34A', fontSize: 20 }} />
              <Text strong style={{ color: '#0F172A', fontSize: 15 }}>
                Tạo liên kết rút gọn thành công!
              </Text>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
              <div id="modal-short-link-qr" style={{ background: '#FFFFFF', padding: 6, borderRadius: 4, border: '1px solid #E2E8F0' }}>
                <QRCode value={fullShortUrl} size={110} bordered={false} type="svg" />
              </div>

              <div style={{ flex: 1, minWidth: 240 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Link rút gọn:</Text>
                <div style={{ display: 'flex', gap: 8, marginTop: 4, marginBottom: 8 }}>
                  <Input
                    value={fullShortUrl}
                    readOnly
                    style={{ borderRadius: 4, fontWeight: 600, color: '#1D4ED8', background: '#FFFFFF' }}
                  />
                  <Button
                    type="primary"
                    icon={<CopyOutlined />}
                    onClick={() => handleCopy(fullShortUrl)}
                    style={{ borderRadius: 4, backgroundColor: '#1D4ED8' }}
                  >
                    Sao chép
                  </Button>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <Text type="secondary" style={{ fontSize: 11 }}>URL gốc: </Text>
                  <Paragraph ellipsis={{ rows: 1 }} style={{ margin: 0, fontSize: 12, color: '#475569' }}>
                    {createdItem.original_url}
                  </Paragraph>
                </div>

                <Space size={6}>
                  <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadQR}
                    style={{ borderRadius: 4 }}
                  >
                    Tải
                  </Button>
                  <Button
                    size="small"
                    icon={<ArrowRightOutlined />}
                    href={fullShortUrl}
                    target="_blank"
                    style={{ borderRadius: 4 }}
                  >
                    Mở liên kết
                  </Button>
                </Space>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <Button
              icon={<PlusOutlined />}
              onClick={() => setCreatedItem(null)}
              style={{ borderRadius: 4 }}
            >
              Tạo liên kết khác
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleFilled />}
              onClick={handleClose}
              style={{ borderRadius: 4, backgroundColor: '#1D4ED8' }}
            >
              Hoàn tất
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

