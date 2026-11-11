'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Button, Tag, Typography, Space, Empty, Badge, message } from 'antd';
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { runSpellCheck, applySingleFix, applySafeAutoFixes } from '../services/spell-engine';
import { SpellIssue } from '../types/spell-check';

const { Text, Paragraph } = Typography;

interface QuickSpellCheckModalProps {
  open: boolean;
  onClose: () => void;
  initialText: string;
  onApplyCorrectedText?: (fixedText: string) => void;
}

export const QuickSpellCheckModal: React.FC<QuickSpellCheckModalProps> = ({
  open,
  onClose,
  initialText,
  onApplyCorrectedText,
}) => {
  const [workingText, setWorkingText] = useState<string>(initialText);

  useEffect(() => {
    if (open) {
      setWorkingText(initialText);
    }
  }, [open, initialText]);

  const { issues, stats } = useMemo(() => runSpellCheck(workingText), [workingText]);

  const handleFixOne = (iss: SpellIssue) => {
    setWorkingText((prev) => applySingleFix(prev, iss));
    message.success(`Đã sửa "${iss.original}" → "${iss.replacement}"`);
  };

  const handleFixAll = () => {
    if (issues.length === 0) return;
    const fixed = applySafeAutoFixes(workingText, issues);
    setWorkingText(fixed);
    if (onApplyCorrectedText) {
      onApplyCorrectedText(fixed);
      message.success(`Đã sửa ${issues.length} lỗi và cập nhật văn bản!`);
      onClose();
    } else {
      message.success(`Đã sửa ${issues.length} lỗi!`);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="min(94vw, 720px)"
      centered
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#059669' }} />
          <span>Rà soát chính tả & ngữ phong nhanh</span>
          <Badge count={stats.total} style={{ backgroundColor: stats.total > 0 ? '#DC2626' : '#16A34A' }} />
        </Space>
      }
      footer={
        <Space wrap>
          <Button
            icon={<CopyOutlined />}
            onClick={() => {
              navigator.clipboard.writeText(workingText);
              message.success('Đã sao chép văn bản đã sửa!');
            }}
          >
            Sao chép bản sửa
          </Button>
          {onApplyCorrectedText && (
            <Button
              type="primary"
              icon={<ThunderboltOutlined />}
              disabled={issues.length === 0}
              onClick={handleFixAll}
              style={{ background: '#1D4ED8' }}
            >
              Sửa tất cả ({stats.total}) & Áp dụng
            </Button>
          )}
        </Space>
      }
    >
      <div style={{ maxHeight: 400, overflowY: 'auto', paddingRight: 4 }}>
        {issues.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không phát hiện lỗi chính tả hoặc cụm từ dễ nhầm lẫn nào!"
            style={{ padding: '32px 0' }}
          />
        ) : (
          <Space direction="vertical" style={{ width: '100%' }} size={8}>
            {issues.map((iss) => (
              <div
                key={iss.id}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 4,
                  padding: '8px 12px',
                  background: '#F8FAFC',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <Tag
                    color={
                      iss.category === 'SPELLING'
                        ? 'error'
                        : iss.category === 'CONFUSABLE'
                        ? 'warning'
                        : 'blue'
                    }
                  >
                    {iss.categoryLabel}
                  </Tag>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleFixOne(iss)}
                    style={{ background: '#16A34A', borderColor: '#16A34A', fontSize: 12 }}
                  >
                    Sửa: {iss.replacement === '' ? 'Xóa khoảng trắng' : iss.replacement}
                  </Button>
                </div>
                <div style={{ fontSize: 13 }}>
                  <Text delete type="danger">
                    {iss.original.trim() === '' ? '[khoảng trắng]' : iss.original}
                  </Text>
                  <span style={{ margin: '0 6px', color: '#94A3B8' }}>→</span>
                  <Text strong style={{ color: '#16A34A' }}>
                    {iss.replacement === '' ? '[xóa]' : iss.replacement}
                  </Text>
                </div>
                <Paragraph type="secondary" style={{ fontSize: 12, margin: '4px 0 0 0' }}>
                  {iss.message}
                </Paragraph>
              </div>
            ))}
          </Space>
        )}
      </div>
    </Modal>
  );
};
