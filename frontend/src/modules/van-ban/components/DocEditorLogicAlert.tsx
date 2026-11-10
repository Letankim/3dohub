'use client';

import React from 'react';
import { Alert, Button, Tag } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { NormalizedDocResult } from '@/types/api';

interface Props {
  normResult: NormalizedDocResult | null;
  onOpenLogicModal: () => void;
}

export const DocEditorLogicAlert: React.FC<Props> = ({ normResult, onOpenLogicModal }) => {
  if (!normResult) return null;
  const warnings = normResult.warnings || [];
  if (warnings.length === 0) return null;

  const warnCount = warnings.length;
  const hasErrors = warnings.some((w) => w.severity === 'ERROR');
  const errorCount = warnings.filter((w) => w.severity === 'ERROR').length;
  const warningCount = warnings.filter((w) => w.severity === 'WARNING').length;

  return (
    <Alert
      type={hasErrors ? 'error' : 'warning'}
      showIcon
      banner
      closable
      message={
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <span>
            <b>Rà soát thể thức phát hiện {warnCount} vấn đề cần xem xét:</b>{' '}
            {errorCount > 0 && (
              <Tag color="red" style={{ marginLeft: 6 }}>
                {errorCount} lỗi nghiêm trọng
              </Tag>
            )}
            {warningCount > 0 && (
              <Tag color="gold" style={{ marginLeft: 4 }}>
                {warningCount} cảnh báo
              </Tag>
            )}
          </span>
          <Button
            size="small"
            type="primary"
            danger={hasErrors}
            icon={<AuditOutlined />}
            onClick={onOpenLogicModal}
          >
            Mở bảng rà soát chi tiết
          </Button>
        </div>
      }
    />
  );
};

