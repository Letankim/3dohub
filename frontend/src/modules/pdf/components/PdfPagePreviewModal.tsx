'use client';

import React, { useEffect, useState } from 'react';
import { Button, Modal, Spin } from 'antd';
import { CloseOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { renderPagePreview } from '../services/pdf-thumbnail';

interface Props {
  open: boolean;
  buffer: ArrayBuffer | null;
  pageNumber: number;
  totalPages: number;
  rotation?: number;
  onNavigate: (pageNumber: number) => void;
  onClose: () => void;
}

/** Cửa sổ xem trước một trang với nút chuyển trang */
export const PdfPagePreviewModal: React.FC<Props> = ({
  open,
  buffer,
  pageNumber,
  totalPages,
  rotation = 0,
  onNavigate,
  onClose,
}) => {
  const [src, setSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !buffer) return;
    let cancelled = false;
    setLoading(true);
    renderPagePreview(buffer, pageNumber, rotation).then((url) => {
      if (cancelled) return;
      setSrc(url);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [open, buffer, pageNumber, rotation]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      destroyOnClose
      width="min(94vw, 720px)"
      title={`Trang ${pageNumber} / ${totalPages}`}
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button icon={<LeftOutlined />} disabled={pageNumber <= 1} onClick={() => onNavigate(pageNumber - 1)} />
            <Button icon={<RightOutlined />} disabled={pageNumber >= totalPages} onClick={() => onNavigate(pageNumber + 1)} />
          </div>
          <Button icon={<CloseOutlined />} onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
      styles={{ body: { padding: 8, background: '#F1F5F9' } }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 260 }}>
        {loading && !src ? (
          <Spin />
        ) : src ? (
          <img
            src={src}
            alt={`Trang ${pageNumber}`}
            style={{
              maxWidth: '100%',
              maxHeight: 'calc(100vh - 230px)',
              objectFit: 'contain',
              background: '#fff',
              boxShadow: '0 1px 6px rgba(15,23,42,0.18)',
              opacity: loading ? 0.5 : 1,
            }}
          />
        ) : (
          <span style={{ color: '#64748B' }}>Không xem trước được trang này.</span>
        )}
      </div>
    </Modal>
  );
};

