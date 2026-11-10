'use client';

import React, { useRef, useState } from 'react';
import { Button, Typography, Space } from 'antd';
import {
  FilePdfOutlined,
  UploadOutlined,
  InboxOutlined,
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface PdfDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  title?: string;
  subtitle?: string;
  accept?: string;
  maxFiles?: number;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({
  onFilesSelected,
  multiple = false,
  title = 'Kéo thả file PDF vào đây',
  subtitle = 'hoặc bấm nút bên dưới để chọn tệp từ máy tính của bạn',
  accept = '.pdf,application/pdf',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (droppedFiles.length > 0) {
      onFilesSelected(multiple ? droppedFiles : [droppedFiles[0]]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    if (selected.length > 0) {
      onFilesSelected(multiple ? selected : [selected[0]]);
      e.target.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      style={{
        border: `2px dashed ${isDragOver ? '#1D4ED8' : '#CBD5E1'}`,
        borderRadius: 6,
        padding: '36px 20px',
        textAlign: 'center',
        background: isDragOver ? '#EFF6FF' : '#F8FAFC',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <div style={{ marginBottom: 12 }}>
        <InboxOutlined style={{ fontSize: 44, color: isDragOver ? '#1D4ED8' : '#64748B' }} />
      </div>

      <Title level={5} style={{ margin: '0 0 6px 0', color: '#0F172A', fontWeight: 600 }}>
        {title}
      </Title>

      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 16 }}>
        {subtitle}
      </Text>

      <Button
        type="primary"
        icon={<UploadOutlined />}
        style={{
          borderRadius: 4,
          background: '#1D4ED8',
          height: 36,
          fontWeight: 500,
          boxShadow: '0 1px 2px rgba(29, 78, 216, 0.2)',
        }}
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        Chọn file PDF từ máy tính
      </Button>

      <div style={{ marginTop: 12 }}>
        <Text style={{ fontSize: 12, color: '#94A3B8' }}>
          Định dạng hỗ trợ: PDF ({multiple ? 'chọn nhiều file cùng lúc' : 'tối đa 1 file'})
        </Text>
      </div>
    </div>
  );
};
