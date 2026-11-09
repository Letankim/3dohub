'use client';

import React, { useRef } from 'react';
import {
  Input,
  Select,
  Slider,
  Switch,
  Typography,
  Space,
  Button,
  message,
  Tooltip,
} from 'antd';
import {
  SettingOutlined,
  PictureOutlined,
  UploadOutlined,
  DeleteOutlined,
  CheckCircleFilled,
} from '@ant-design/icons';
import { QrCustomization } from './qr-types';

const { Text } = Typography;

interface QrCodeCustomizerProps {
  value: QrCustomization;
  onChange: (next: QrCustomization) => void;
}

const COLOR_PRESETS = [
  { label: 'Đen truyền thống', color: '#000000' },
  { label: 'Xanh Royal Tech', color: '#1D4ED8' },
  { label: 'Xanh Slate đậm', color: '#0F172A' },
  { label: 'Xanh ngọc lá', color: '#16A34A' },
  { label: 'Tím hiện đại', color: '#7C3AED' },
  { label: 'Đỏ mận', color: '#DC2626' },
  { label: 'Cam san hô', color: '#EA580C' },
];

const PRESET_LOGOS = [
  {
    name: '3DoHub',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%231D4ED8"/><text x="32" y="42" font-size="28" font-weight="bold" fill="white" text-anchor="middle" font-family="sans-serif">3D</text></svg>',
  },
  {
    name: 'Internet',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%230F172A"/><circle cx="32" cy="32" r="20" fill="none" stroke="%2338BDF8" stroke-width="4"/><ellipse cx="32" cy="32" rx="9" ry="20" fill="none" stroke="%2338BDF8" stroke-width="3"/><line x1="12" y1="32" x2="52" y2="32" stroke="%2338BDF8" stroke-width="3"/></svg>',
  },
  {
    name: 'Xác thực',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="30" fill="%2316A34A"/><path d="M20 33l8 8 16-16" stroke="white" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>',
  },
];

export const QrCodeCustomizer: React.FC<QrCodeCustomizerProps> = ({ value, onChange }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file hình ảnh (PNG, JPG, SVG, WebP)!');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      message.warning('Kích thước ảnh nên nhỏ hơn 2MB để mã QR tải mượt mà.');
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onChange({
          ...value,
          icon: dataUrl,
          errorLevel: 'H',
          iconSize: value.iconSize || Math.round(value.size * 0.22),
        });
        message.success('Đã tải logo lên mã QR thành công!');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveLogo = () => {
    onChange({
      ...value,
      icon: undefined,
      errorLevel: 'M',
    });
    message.info('Đã gỡ logo khỏi mã QR.');
  };

  return (
    <div style={{ marginTop: 14, padding: '16px', background: '#F8FAFC', borderRadius: 6, border: '1px solid #E2E8F0' }}>
      <Space size={6} style={{ marginBottom: 12 }}>
        <SettingOutlined style={{ color: '#1D4ED8' }} />
        <Text strong style={{ fontSize: 13, color: '#0F172A' }}>
          Tùy chỉnh
        </Text>
      </Space>

      {/* 1. Color Presets */}
      <div style={{ marginBottom: 14 }}>
        <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 6 }}>
          Màu mã QR:
        </Text>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {COLOR_PRESETS.map((item) => (
            <div
              key={item.color}
              onClick={() => onChange({ ...value, fgColor: item.color })}
              style={{
                width: 24,
                height: 24,
                borderRadius: 4,
                background: item.color,
                cursor: 'pointer',
                border: value.fgColor === item.color ? '2px solid #3B82F6' : '1px solid rgba(0,0,0,0.15)',
                boxShadow: value.fgColor === item.color ? '0 0 0 2px rgba(59, 130, 246, 0.4)' : 'none',
              }}
              title={item.label}
            />
          ))}
          <Input
            type="color"
            value={value.fgColor}
            onChange={(e) => onChange({ ...value, fgColor: e.target.value })}
            style={{ width: 36, height: 26, padding: 0, borderRadius: 4, cursor: 'pointer' }}
          />
        </div>
      </div>

      {/* 2. Size & Error Correction */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
        <div>
          <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>
            Kích thước ({value.size}px):
          </Text>
          <Slider
            min={160}
            max={360}
            step={20}
            value={value.size}
            onChange={(val) => onChange({ ...value, size: val })}
          />
        </div>

        <div>
          <Text style={{ fontSize: 12, color: '#475569', display: 'block', marginBottom: 4 }}>
            Mức sửa lỗi:
          </Text>
          <Select
            value={value.errorLevel}
            onChange={(val) => onChange({ ...value, errorLevel: val })}
            options={[
              { label: 'Thấp (L ~7%)', value: 'L' },
              { label: 'Trung bình (M ~15%)', value: 'M' },
              { label: 'Cao (Q ~25%)', value: 'Q' },
              { label: 'Rất cao (H ~30% - có logo)', value: 'H' },
            ]}
            style={{ width: '100%', borderRadius: 4 }}
          />
        </div>
      </div>

      {/* 3. Logo in Center of QR Code */}
      <div
        style={{
          padding: '12px',
          background: '#FFFFFF',
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          marginBottom: 14,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Space size={6}>
            <PictureOutlined style={{ color: '#1D4ED8' }} />
            <Text strong style={{ fontSize: 12, color: '#0F172A' }}>
              Logo:
            </Text>
          </Space>
          {value.icon && (
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={handleRemoveLogo}
              style={{ fontSize: 11, height: 22 }}
            >
              Gỡ
            </Button>
          )}
        </div>

        {value.icon ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <img
                src={value.icon}
                alt="Xem trước"
                style={{
                  width: 38,
                  height: 38,
                  objectFit: 'contain',
                  borderRadius: 4,
                  border: '1px solid #CBD5E1',
                  background: '#F8FAFC',
                  padding: 2,
                }}
              />
              <div style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#16A34A', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircleFilled /> Đang hiển thị
                </Text>
              </div>
            </div>

            <div>
              <Text style={{ fontSize: 11, color: '#475569', display: 'block', marginBottom: 2 }}>
                Kích thước ({value.iconSize || 42}px):
              </Text>
              <Slider
                min={24}
                max={64}
                step={2}
                value={value.iconSize || 42}
                onChange={(val) => onChange({ ...value, iconSize: val })}
              />
            </div>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                icon={<UploadOutlined />}
                size="small"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderRadius: 4, fontWeight: 500 }}
              >
                Tải lên
              </Button>

              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <Text type="secondary" style={{ fontSize: 11 }}>Hoặc chọn mẫu:</Text>
                {PRESET_LOGOS.map((p) => (
                  <Button
                    key={p.name}
                    size="small"
                    icon={<PictureOutlined />}
                    onClick={() =>
                      onChange({
                        ...value,
                        icon: p.url,
                        errorLevel: 'H',
                        iconSize: 42,
                      })
                    }
                    style={{ borderRadius: 4, fontSize: 11, padding: '0 6px', height: 24 }}
                  >
                    {p.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {/* 4. Border & Background Color */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space size={8}>
          <Switch
            checked={value.bordered}
            onChange={(checked) => onChange({ ...value, bordered: checked })}
            size="small"
          />
          <Text style={{ fontSize: 12, color: '#475569' }}>Khung viền bảo vệ</Text>
        </Space>

        <Space size={6}>
          <Text style={{ fontSize: 12, color: '#475569' }}>Màu nền:</Text>
          <Input
            type="color"
            value={value.bgColor}
            onChange={(e) => onChange({ ...value, bgColor: e.target.value })}
            style={{ width: 32, height: 24, padding: 0, borderRadius: 4, cursor: 'pointer' }}
          />
        </Space>
      </div>
    </div>
  );
};
