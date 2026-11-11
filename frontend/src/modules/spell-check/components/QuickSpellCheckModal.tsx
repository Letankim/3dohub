'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Tag, Typography, Space, Empty, Badge, Spin, message } from 'antd';
import {
  SafetyCertificateOutlined,
  ThunderboltOutlined,
  CheckOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import { hubApi } from '@/services/api-client';
import { SpellCheckIssueItem, SpellCheckResultData } from '@/types/api';

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
  const [loading, setLoading] = useState<boolean>(false);
  const [fixingAll, setFixingAll] = useState<boolean>(false);
  const [result, setResult] = useState<SpellCheckResultData>({
    issues: [],
    stats: {
      total: 0,
      spelling: 0,
      confusable: 0,
      capitalization: 0,
      punctuation: 0,
      wordsCount: 0,
      charsCount: 0,
      executionMs: 0,
    },
  });

  const analyzeText = useCallback(async (txt: string) => {
    if (!txt || !txt.trim()) {
      setResult((prev) => ({ ...prev, issues: [], stats: { ...prev.stats, total: 0 } }));
      return;
    }
    setLoading(true);
    try {
      const res = await hubApi.analyzeSpelling(txt);
      if (res.data) {
        setResult(res.data);
      }
    } catch {
      message.error('Không thể kiểm tra chính tả từ máy chủ.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setWorkingText(initialText);
      void analyzeText(initialText);
    }
  }, [open, initialText, analyzeText]);

  const handleFixOne = (iss: SpellCheckIssueItem) => {
    if (iss.startIndex < 0 || iss.endIndex > workingText.length) return;
    const nextText =
      workingText.slice(0, iss.startIndex) +
      iss.replacement +
      workingText.slice(iss.endIndex);
    setWorkingText(nextText);
    void analyzeText(nextText);
    message.success(`Đã sửa "${iss.original.trim() || '[khoảng trắng]'}" → "${iss.replacement || '[xóa]'}"`);
  };

  const handleFixAll = async () => {
    if (result.issues.length === 0) return;
    setFixingAll(true);
    try {
      const res = await hubApi.autoFixSpelling(workingText);
      if (res.data) {
        setWorkingText(res.data.fixed_text);
        setResult(res.data.remaining);
        if (onApplyCorrectedText) {
          onApplyCorrectedText(res.data.fixed_text);
          message.success(`Đã sửa ${res.data.fixed_count} lỗi và cập nhật văn bản!`);
          onClose();
        } else {
          message.success(`Đã sửa ${res.data.fixed_count} lỗi!`);
        }
      }
    } catch {
      message.error('Không thể sửa lỗi từ máy chủ.');
    } finally {
      setFixingAll(false);
    }
  };

  const { issues, stats } = result;
  const safeCount = issues.filter((i) => i.isSafeAutoFix).length;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width="min(94vw, 760px)"
      centered
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#059669' }} />
          <span>Rà soát chính tả & ngữ phong văn bản</span>
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
              loading={fixingAll}
              disabled={safeCount === 0}
              onClick={() => void handleFixAll()}
              style={{ background: '#1D4ED8' }}
            >
              Sửa {safeCount} lỗi an toàn & Áp dụng
            </Button>
          )}
        </Space>
      }
    >
      <Spin spinning={loading} tip="Đang rà soát chính tả trên máy chủ...">
        <div style={{ maxHeight: 420, minHeight: 160, overflowY: 'auto', paddingRight: 4 }}>
          {issues.length === 0 && !loading ? (
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
      </Spin>
    </Modal>
  );
};
