'use client';

import React from 'react';
import { Card, List, Tag, Typography, Badge, Empty, Space } from 'antd';
import {
  CheckCircleFilled,
  ExclamationCircleFilled,
  WarningFilled,
  InfoCircleFilled,
} from '@ant-design/icons';
import { LogicWarningItem } from '@/types/api';

const { Text } = Typography;

interface LogicReportPanelProps {
  warnings: LogicWarningItem[];
  appliedProfileName?: string;
  legalBasis?: string;
  executionMs?: number;
}

export const LogicReportPanel: React.FC<LogicReportPanelProps> = ({
  warnings,
  appliedProfileName,
  legalBasis,
  executionMs,
}) => {
  const getSeverityBadge = (severity: LogicWarningItem['severity']) => {
    switch (severity) {
      case 'ERROR':
        return (
          <Tag color="red" icon={<ExclamationCircleFilled />} style={{ margin: 0 }}>
            Lỗi nghiêm trọng
          </Tag>
        );
      case 'INFO':
        return (
          <Tag color="blue" icon={<InfoCircleFilled />} style={{ margin: 0 }}>
            Lưu ý văn thư
          </Tag>
        );
      default:
        return (
          <Tag color="gold" icon={<WarningFilled />} style={{ margin: 0 }}>
            Cảnh báo thể thức
          </Tag>
        );
    }
  };

  return (
    <Card
      size="small"
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <Space>
            <span>Báo Cáo Rà Soát Logic Thể Thức (18 Quy Tắc)</span>
            <Badge
              count={warnings.length}
              style={{
                backgroundColor: warnings.length === 0 ? '#059669' : '#D97706',
              }}
            />
          </Space>
          {executionMs !== undefined && (
            <Text type="secondary" style={{ fontSize: 12, fontWeight: 400 }}>
              Thời gian xử lý: <b>{executionMs} ms</b>
            </Text>
          )}
        </div>
      }
      style={{ borderRadius: 6, border: '1px solid #E2E8F0' }}
    >
      {appliedProfileName && (
        <div
          style={{
            padding: '8px 12px',
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 4,
            marginBottom: 12,
            fontSize: 12,
          }}
        >
          <div>
            <Text strong>Khối áp dụng: </Text>
            <Tag color="blue">{appliedProfileName}</Tag>
          </div>
          {legalBasis && (
            <div style={{ marginTop: 4, color: '#475569' }}>
              <Text strong>Căn cứ pháp lý: </Text>
              <span>{legalBasis}</span>
            </div>
          )}
        </div>
      )}

      {warnings.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Space direction="vertical" size={2}>
              <Text strong style={{ color: '#059669' }}>
                <CheckCircleFilled /> Văn bản đã đạt chuẩn logic thể thức!
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Không phát hiện lỗi nhảy số thứ tự, lệch khối, thiếu nơi nhận hay chỗ trống [ ].
              </Text>
            </Space>
          }
        />
      ) : (
        <List
          size="small"
          dataSource={warnings}
          renderItem={(w) => (
            <List.Item
              style={{
                padding: '8px 10px',
                borderBottom: '1px solid #F1F5F9',
                alignItems: 'flex-start',
              }}
            >
              <div style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Space size={6}>
                    <Tag style={{ margin: 0, fontWeight: 600 }}>#{w.index}</Tag>
                    <Text strong style={{ fontSize: 13 }}>
                      {w.category}
                    </Text>
                  </Space>
                  {getSeverityBadge(w.severity)}
                </div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.45 }}>{w.message}</div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Card>
  );
};

