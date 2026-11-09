'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onErrorFallback?: () => void;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class EditorErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message || 'Lỗi giao diện trình soạn thảo' };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('EditorErrorBoundary caught an error:', error, errorInfo);
    if (this.props.onErrorFallback) {
      this.props.onErrorFallback();
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <Alert
          type="warning"
          showIcon
          message="Không thể tải Trình soạn thảo nâng cao"
          description={`Trình duyệt gặp sự cố khi khởi tạo thư viện: ${this.state.errorMessage}. Hệ thống đã tự động chuyển về Trình soạn thảo chuẩn để bạn tiếp tục làm việc.`}
          action={
            <Button
              size="small"
              icon={<ReloadOutlined />}
              onClick={() => this.setState({ hasError: false, errorMessage: '' })}
            >
              Thử lại
            </Button>
          }
          style={{ margin: '16px 0' }}
        />
      );
    }

    return this.props.children;
  }
}

