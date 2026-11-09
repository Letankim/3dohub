'use client';

import React from 'react';
import { Modal, Form, Input, Button, Space, Alert, Row, Col, Typography } from 'antd';
import { SaveOutlined, ImportOutlined, ClearOutlined, BankOutlined } from '@ant-design/icons';
import { UnitConfig } from '@/types/api';

const { Text } = Typography;

interface UnitConfigModalProps {
  open: boolean;
  onClose: () => void;
  unitInfo: UnitConfig;
  onChangeUnitInfo: (next: UnitConfig) => void;
  onExtractFromCurrentDoc: () => void;
  extracting?: boolean;
}

export const UnitConfigModal: React.FC<UnitConfigModalProps> = ({
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
    <Modal
      open={open}
      onCancel={onClose}
      width="70%"
      centered
      style={{ maxWidth: 1120, minWidth: 310 }}
      title={
        <Space>
          <BankOutlined style={{ color: '#1D4ED8' }} />
          <span style={{ whiteSpace: 'nowrap' }}>Cấu hình đơn vị</span>
        </Space>
      }
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button danger icon={<ClearOutlined />} onClick={handleReset}>
            Xóa trắng
          </Button>
          <Space>
            <Button onClick={onClose}>Đóng</Button>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={onClose}
              style={{ background: '#1D4ED8' }}
            >
              Lưu cấu hình
            </Button>
          </Space>
        </div>
      }
    >
      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 14, borderRadius: 4 }}
        message="Tự động điền tên cơ quan, số ký hiệu, địa danh và người ký khi tạo văn bản mẫu"
        action={
          <Button
            size="small"
            type="primary"
            ghost
            icon={<ImportOutlined />}
            loading={extracting}
            onClick={onExtractFromCurrentDoc}
          >
            Trích xuất tự động
          </Button>
        }
      />

      <Form layout="vertical">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>1. Cơ quan cấp trên trực tiếp</Text>}
              extra="VD: ĐẢNG BỘ TỈNH BẾN TRE (Ngắt dòng bằng Enter hoặc dấu |)"
            >
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 4 }}
                placeholder="VD: ĐẢNG BỘ TỈNH ..."
                value={unitInfo.cap_tren}
                onChange={(e) => handleFieldChange('cap_tren', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              label={<Text strong>2. Cơ quan / Đơn vị ban hành</Text>}
              extra="VD: ĐẢNG ỦY XÃ THẠNH PHÚ"
            >
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 4 }}
                placeholder="VD: ĐẢNG ỦY XÃ ..."
                value={unitInfo.co_quan}
                onChange={(e) => handleFieldChange('co_quan', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label={<Text strong>3. Chữ viết tắt cơ quan (Số/Ký hiệu)</Text>}>
              <Input
                placeholder="VD: ĐU, UBND, HĐND"
                value={unitInfo.viet_tat}
                onChange={(e) => handleFieldChange('viet_tat', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label={<Text strong>4. Địa danh hành chính (Ngày tháng năm)</Text>}>
              <Input
                placeholder="VD: Thạnh Phú"
                value={unitInfo.dia_danh}
                onChange={(e) => handleFieldChange('dia_danh', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label={<Text strong>5. Thẩm quyền ký</Text>}>
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 3 }}
                placeholder="VD: T/M BAN THƯỜNG VỤ"
                value={unitInfo.tham_quyen}
                onChange={(e) => handleFieldChange('tham_quyen', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<Text strong>6. Chức vụ người ký</Text>}>
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 3 }}
                placeholder="VD: BÍ THƯ, CHỦ TỊCH"
                value={unitInfo.chuc_vu}
                onChange={(e) => handleFieldChange('chuc_vu', e.target.value)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label={<Text strong>7. Họ và tên người ký</Text>}>
              <Input.TextArea
                autoSize={{ minRows: 2, maxRows: 3 }}
                placeholder="VD: Nguyễn Văn A"
                value={unitInfo.ho_ten}
                onChange={(e) => handleFieldChange('ho_ten', e.target.value)}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};
