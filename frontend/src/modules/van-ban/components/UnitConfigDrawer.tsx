'use client';

import React from 'react';
import { Drawer, Form, Input, Button, Space, Alert, Divider, Typography } from 'antd';
import { SaveOutlined, ImportOutlined, ClearOutlined } from '@ant-design/icons';
import { UnitConfig } from '@/types/api';

const { Text } = Typography;

interface UnitConfigDrawerProps {
  open: boolean;
  onClose: () => void;
  unitInfo: UnitConfig;
  onChangeUnitInfo: (next: UnitConfig) => void;
  onExtractFromCurrentDoc: () => void;
  extracting?: boolean;
}

export const UnitConfigDrawer: React.FC<UnitConfigDrawerProps> = ({
  open,
  onClose,
  unitInfo,
  onChangeUnitInfo,
  onExtractFromCurrentDoc,
  extracting,
}) => {
  const handleFieldChange = (field: keyof UnitConfig, value: string) => {
    onChangeUnitInfo({
      ...unitInfo,
      [field]: value,
    });
  };

  const handleReset = () => {
    onChangeUnitInfo({
      cap_tren: '',
      co_quan: '',
      viet_tat: '',
      dia_danh: '',
      tham_quyen: '',
      chuc_vu: '',
      ho_ten: '',
    });
  };

  return (
    <Drawer
      title="Cấu Hình Thông Tin Đơn Vị (Tự động điền khi tạo Mẫu)"
      placement="right"
      width={460}
      open={open}
      onClose={onClose}
      extra={
        <Button type="primary" icon={<SaveOutlined />} onClick={onClose}>
          Lưu & Đóng
        </Button>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16, borderRadius: 4 }}
        message="Tương thích 100% tính năng Thông tin đơn vị trên Ribbon Word"
        description="Các thông tin dưới đây được tự động lưu trên trình duyệt và chèn trực tiếp vào Tiêu đề, Số ký hiệu, Địa danh và Bảng chữ ký khi bạn tạo văn bản mẫu."
      />

      <Button
        block
        icon={<ImportOutlined />}
        loading={extracting}
        onClick={onExtractFromCurrentDoc}
        style={{ marginBottom: 16, fontWeight: 500 }}
      >
        Lấy thông tin đơn vị từ văn bản đang mở
      </Button>

      <Divider style={{ margin: '12px 0' }} />

      <Form layout="vertical">
        <Form.Item
          label={<Text strong>1. Cơ quan / Đảng bộ cấp trên trực tiếp</Text>}
          extra="Khối Đảng ghi ĐẢNG BỘ cấp trên (VD: ĐẢNG BỘ TỈNH BẾN TRE). Xuống dòng bằng dấu |"
        >
          <Input
            placeholder="VD: ĐẢNG BỘ TỈNH ... hoặc ỦY BAN NHÂN DÂN HUYỆN ..."
            value={unitInfo.cap_tren}
            onChange={(e) => handleFieldChange('cap_tren', e.target.value)}
          />
        </Form.Item>

        <Form.Item
          label={<Text strong>2. Tên cơ quan, tổ chức ban hành</Text>}
          extra="Tên dài muốn ngắt dòng thì gõ dấu | (VD: ỦY BAN NHÂN DÂN | XÃ BÌNH THẠNH)"
        >
          <Input
            placeholder="VD: ĐẢNG ỦY XÃ THẠNH PHÚ"
            value={unitInfo.co_quan}
            onChange={(e) => handleFieldChange('co_quan', e.target.value)}
          />
        </Form.Item>

        <Space style={{ display: 'flex' }} align="start">
          <Form.Item label={<Text strong>3. Chữ viết tắt cơ quan</Text>} style={{ flex: 1 }}>
            <Input
              placeholder="VD: ĐU, UBND"
              value={unitInfo.viet_tat}
              onChange={(e) => handleFieldChange('viet_tat', e.target.value)}
            />
          </Form.Item>

          <Form.Item label={<Text strong>4. Địa danh hành chính</Text>} style={{ flex: 1 }}>
            <Input
              placeholder="VD: Thạnh Phú"
              value={unitInfo.dia_danh}
              onChange={(e) => handleFieldChange('dia_danh', e.target.value)}
            />
          </Form.Item>
        </Space>

        <Form.Item
          label={<Text strong>5. Quyền hạn / Thẩm quyền ký</Text>}
          extra="VD: T/M BAN THƯỜNG VỤ, TM. ỦY BAN NHÂN DÂN, KT. CHỦ TỊCH (Để trống nếu ký trực tiếp)"
        >
          <Input
            placeholder="VD: T/M BAN THƯỜNG VỤ"
            value={unitInfo.tham_quyen}
            onChange={(e) => handleFieldChange('tham_quyen', e.target.value)}
          />
        </Form.Item>

        <Form.Item label={<Text strong>6. Chức vụ người ký</Text>}>
          <Input
            placeholder="VD: BÍ THƯ, CHỦ TỊCH, PHÓ CHỦ TỊCH"
            value={unitInfo.chuc_vu}
            onChange={(e) => handleFieldChange('chuc_vu', e.target.value)}
          />
        </Form.Item>

        <Form.Item label={<Text strong>7. Họ và tên người ký (kèm cấp bậc hàm nếu có)</Text>}>
          <Input
            placeholder="VD: Nguyễn Văn A"
            value={unitInfo.ho_ten}
            onChange={(e) => handleFieldChange('ho_ten', e.target.value)}
          />
        </Form.Item>

        <Button danger icon={<ClearOutlined />} onClick={handleReset} block>
          Xóa trắng các ô cấu hình
        </Button>
      </Form>
    </Drawer>
  );
};

