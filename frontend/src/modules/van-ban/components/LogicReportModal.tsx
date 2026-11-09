'use client';

import React from 'react';
import { Modal, Space } from 'antd';
import { AuditOutlined } from '@ant-design/icons';
import { LogicWarningItem } from '@/types/api';
import { LogicReportPanel } from './LogicReportPanel';

interface LogicReportModalProps {
  open: boolean;
  onClose: () => void;
  warnings: LogicWarningItem[];
  appliedProfileName?: string;
  legalBasis?: string;
  executionMs?: number;
}

export const LogicReportModal: React.FC<LogicReportModalProps> = ({
  open,
  onClose,
  warnings,
  appliedProfileName,
  legalBasis,
  executionMs,
}) => {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width="70%"
      centered
      style={{ maxWidth: 1050, minWidth: 310 }}
      title={
        <Space>
          <AuditOutlined style={{ color: '#1D4ED8' }} />
          <span style={{ whiteSpace: 'nowrap' }}>Rà soát lỗi thể thức</span>
        </Space>
      }
    >
      <LogicReportPanel
        warnings={warnings}
        appliedProfileName={appliedProfileName}
        legalBasis={legalBasis}
        executionMs={executionMs}
      />
    </Modal>
  );
};
