'use client';

import React from 'react';
import { Alert, Button, Typography } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { HubApiException } from '@/services/api-client';

const { Text } = Typography;

interface ApiErrorAlertProps {
  error: HubApiException | null;
  onClose?: () => void;
  onRetry?: () => void;
}

export const ApiErrorAlert: React.FC<ApiErrorAlertProps> = ({ error, onClose, onRetry }) => {
  if (!error) return null;

  const extraMessages = (error.errors?.details || [])
    .map((d) => d.message)
    .filter((m) => m && m !== error.message);

  return (
    <Alert
      type="error"
      showIcon
      closable={Boolean(onClose)}
      onClose={onClose}
      action={
        onRetry && (
          <Button
            size="small"
            type="primary"
            danger
            icon={<ReloadOutlined />}
            onClick={onRetry}
            style={{ fontWeight: 500 }}
          >
            Thử lại ngay
          </Button>
        )
      }
      style={{ marginBottom: 12, borderRadius: 4, border: '1px solid #FCA5A5' }}
      message={
        <Text strong style={{ color: '#991B1B', fontSize: 13.5 }}>
          {error.message}
        </Text>
      }
      description={
        extraMessages.length > 0 ? (
          <div style={{ marginTop: 4 }}>
            {extraMessages.map((msg, idx) => (
              <div key={idx} style={{ fontSize: 13, color: '#7F1D1D' }}>
                • {msg}
              </div>
            ))}
          </div>
        ) : null
      }
    />
  );
};
