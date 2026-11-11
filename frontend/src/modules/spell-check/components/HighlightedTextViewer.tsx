'use client';

import React from 'react';
import { Popover, Button, Tag, Typography, Space } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { SpellCheckIssueItem } from '@/types/api';

const { Text } = Typography;

interface HighlightedTextViewerProps {
  text: string;
  issues: SpellCheckIssueItem[];
  onFixIssue: (issue: SpellCheckIssueItem) => void;
}

export const HighlightedTextViewer: React.FC<HighlightedTextViewerProps> = ({
  text,
  issues,
  onFixIssue,
}) => {
  const isMobile = useIsMobile();
  if (!text) {
    return (
      <Text type="secondary" style={{ fontStyle: 'italic' }}>
        Chưa có nội dung văn bản...
      </Text>
    );
  }

  const getUnderlineStyle = (category: SpellCheckIssueItem['category']) => {
    switch (category) {
      case 'SPELLING':
        return {
          backgroundColor: '#FEE2E2',
          borderBottom: '2px solid #DC2626',
          color: '#991B1B',
        };
      case 'CONFUSABLE':
        return {
          backgroundColor: '#FEF3C7',
          borderBottom: '2px solid #D97706',
          color: '#92400E',
        };
      case 'CAPITALIZATION':
        return {
          backgroundColor: '#DBEAFE',
          borderBottom: '2px solid #2563EB',
          color: '#1E40AF',
        };
      case 'PUNCTUATION':
      default:
        return {
          backgroundColor: '#E0F2FE',
          borderBottom: '2px solid #0284C7',
          color: '#075985',
        };
    }
  };

  const segments: React.ReactNode[] = [];
  let cursor = 0;

  const sorted = [...issues].sort((a, b) => a.startIndex - b.startIndex);

  sorted.forEach((iss, idx) => {
    if (iss.startIndex > cursor) {
      segments.push(
        <span key={`plain_${idx}`}>{text.slice(cursor, iss.startIndex)}</span>
      );
    }

    const styles = getUnderlineStyle(iss.category);
    const matchedText = text.slice(iss.startIndex, iss.endIndex);

    segments.push(
      <Popover
        key={iss.id}
        trigger="click"
        title={
          <Space size={6}>
            <Tag
              color={
                iss.category === 'SPELLING'
                  ? 'error'
                  : iss.category === 'CONFUSABLE'
                  ? 'warning'
                  : 'blue'
              }
              style={{ margin: 0 }}
            >
              {iss.categoryLabel}
            </Tag>
            <Text strong>Đề xuất sửa</Text>
          </Space>
        }
        content={
          <div style={{ maxWidth: 280 }}>
            <div style={{ marginBottom: 6, fontSize: 13 }}>
              <Text delete type="danger">
                {iss.original.trim() === '' ? '[khoảng trắng]' : iss.original}
              </Text>
              <span style={{ margin: '0 6px', color: '#94A3B8' }}>→</span>
              <Text strong style={{ color: '#16A34A' }}>
                {iss.replacement === '' ? '[xóa]' : iss.replacement}
              </Text>
            </div>
            <Text
              type="secondary"
              style={{ display: 'block', fontSize: 12, marginBottom: 10 }}
            >
              {iss.message}
            </Text>
            <Button
              type="primary"
              size="small"
              icon={<CheckOutlined />}
              block
              onClick={() => onFixIssue(iss)}
              style={{ background: '#16A34A', borderColor: '#16A34A' }}
            >
              Áp dụng sửa
            </Button>
          </div>
        }
      >
        <span
          style={{
            ...styles,
            cursor: 'pointer',
            padding: '0 2px',
            borderRadius: 2,
            fontWeight: 500,
          }}
        >
          {matchedText.trim() === '' ? '␣' : matchedText}
        </span>
      </Popover>
    );

    cursor = iss.endIndex;
  });

  if (cursor < text.length) {
    segments.push(<span key="plain_tail">{text.slice(cursor)}</span>);
  }

  return (
    <div
      style={{
        fontFamily: 'Times New Roman, serif',
        fontSize: 15,
        lineHeight: 1.65,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        padding: isMobile ? 10 : 12,
        border: '1px solid #CBD5E1',
        borderRadius: 4,
        backgroundColor: '#FFFFFF',
        minHeight: isMobile ? 260 : 420,
        maxHeight: isMobile ? 400 : 500,
        overflowY: 'auto',
      }}
    >
      {segments}
    </div>
  );
};
