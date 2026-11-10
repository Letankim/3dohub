'use client';

import React, { useState } from 'react';
import { Card, List, Tag, Typography, Badge, Empty, Space, Segmented } from 'antd';
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
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const errorCount = warnings.filter((w) => w.severity === 'ERROR').length;
  const warningCount = warnings.filter((w) => w.severity === 'WARNING').length;
  const infoCount = warnings.filter((w) => w.severity === 'INFO').length;

  const filteredWarnings =
    filterSeverity === 'ALL'
      ? warnings
      : warnings.filter((w) => w.severity === filterSeverity);

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
                backgroundColor: warnings.length === 0 ? '#059669' : errorCount > 0 ? '#DC2626' : '#D97706',
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

      {warnings.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <Segmented
            value={filterSeverity}
            onChange={(val) => setFilterSeverity(String(val))}
            options={[
              { label: `Tất cả (${warnings.length})`, value: 'ALL' },
              {
                label: (
                  <span style={{ color: errorCount > 0 ? '#DC2626' : undefined, fontWeight: errorCount > 0 ? 600 : 400 }}>
                    Lỗi ({errorCount})
                  </span>
                ),
                value: 'ERROR',
                disabled: errorCount === 0,
              },
              {
                label: (
                  <span style={{ color: warningCount > 0 ? '#D97706' : undefined, fontWeight: warningCount > 0 ? 600 : 400 }}>
                    Cảnh báo ({warningCount})
                  </span>
                ),
                value: 'WARNING',
                disabled: warningCount === 0,
              },
              {
                label: `Lưu ý (${infoCount})`,
                value: 'INFO',
                disabled: infoCount === 0,
              },
            ]}
          />
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
      ) : filteredWarnings.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có mục nào trong danh mục đã chọn." />
      ) : (
        <List
          size="small"
          dataSource={filteredWarnings}
          renderItem={(w) => {
            const isErr = w.severity === 'ERROR';
            const isWarn = w.severity === 'WARNING';
            const borderCol = isErr ? '#EF4444' : isWarn ? '#F59E0B' : '#3B82F6';
            const bgCol = isErr ? '#FEF2F2' : isWarn ? '#FFFBEB' : '#F8FAFC';

            return (
              <List.Item
                style={{
                  padding: '10px 12px',
                  marginBottom: 8,
                  borderRadius: 4,
                  border: '1px solid #E2E8F0',
                  borderLeft: `4px solid ${borderCol}`,
                  background: bgCol,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 4 }}>
                    <Space size={6}>
                      <Tag style={{ margin: 0, fontWeight: 600 }}>#{w.index}</Tag>
                      <Text strong style={{ fontSize: 13, color: isErr ? '#B91C1C' : isWarn ? '#92400E' : '#1E40AF' }}>
                        {w.category}
                      </Text>
                    </Space>
                    {getSeverityBadge(w.severity)}
                  </div>
                  <div style={{ fontSize: 13, color: '#1E293B', lineHeight: 1.5 }}>{w.message}</div>
                </div>
              </List.Item>
            );
          }}
        />
      )}
    </Card>
  );
};
