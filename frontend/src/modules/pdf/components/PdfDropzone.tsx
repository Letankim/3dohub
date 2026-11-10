'use client';

import React, { useRef, useState } from 'react';
import { Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useIsMobile } from '../hooks/useIsMobile';

interface PdfDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  /** 'box': khung chọn file ban đầu; 'inline': chỉ nút nhỏ gọn */
  variant?: 'box' | 'inline';
  accept?: string;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({
  onFilesSelected,
  multiple = false,
  label,
  variant = 'box',
  accept = '.pdf,application/pdf',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isMobile = useIsMobile();

  const emit = (list: File[]) => {
    const pdfs = list.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    if (pdfs.length > 0) onFilesSelected(multiple ? pdfs : [pdfs[0]]);
  };

  const button = (
    <Button
      type="primary"
      size={variant === 'box' ? 'large' : 'middle'}
      icon={<UploadOutlined />}
      block={variant === 'box' && isMobile}
      onClick={() => inputRef.current?.click()}
      style={{ borderRadius: 4, background: '#1D4ED8', fontWeight: 600, minWidth: variant === 'box' ? 200 : undefined }}
    >
      {label || (multiple ? 'Chọn các file PDF' : 'Chọn file PDF')}
    </Button>
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragOver(false);
        emit(Array.from(e.dataTransfer.files));
      }}
      style={
        variant === 'box'
          ? {
              border: `2px dashed ${isDragOver ? '#1D4ED8' : '#CBD5E1'}`,
              borderRadius: 6,
              padding: isMobile ? '28px 16px' : '48px 20px',
              textAlign: 'center',
              background: isDragOver ? '#EFF6FF' : '#F8FAFC',
            }
          : { display: 'inline-block' }
      }
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: 'none' }}
        onChange={(e) => {
          emit(e.target.files ? Array.from(e.target.files) : []);
          e.target.value = '';
        }}
      />
      {button}
    </div>
  );
};
