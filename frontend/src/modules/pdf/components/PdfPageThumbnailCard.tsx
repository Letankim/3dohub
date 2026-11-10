'use client';

import React from 'react';
import { Checkbox, Tooltip, Typography, Button } from 'antd';
import { RotateRightOutlined, DeleteOutlined, UndoOutlined, EyeOutlined } from '@ant-design/icons';
import { PdfPageItem } from '../types/pdf';

const { Text } = Typography;

interface PdfPageThumbnailCardProps {
  page: PdfPageItem;
  selectable?: boolean;
  onToggleSelect?: (pageIndex: number) => void;
  onPreview?: (pageNumber: number) => void;
  onRotate?: (pageIndex: number) => void;
  onDelete?: (pageIndex: number) => void;
  onRestore?: (pageIndex: number) => void;
}

export const PdfPageThumbnailCard: React.FC<PdfPageThumbnailCardProps> = ({
  page,
  selectable = false,
  onToggleSelect,
  onPreview,
  onRotate,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(page.isDeleted);
  const iconOnly = Boolean(onRotate || onDelete);

  return (
    <div
      onClick={() => {
        if (!isDeleted && selectable) onToggleSelect?.(page.pageIndex);
      }}
      style={{
        borderRadius: 6,
        border: page.selected ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
        background: isDeleted ? '#F1F5F9' : page.selected ? '#EFF6FF' : '#FFFFFF',
        opacity: isDeleted ? 0.5 : 1,
        padding: 6,
        minWidth: 0,
        cursor: selectable && !isDeleted ? 'pointer' : 'default',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <span
          style={{
            background: page.selected ? '#1D4ED8' : '#334155',
            color: '#FFF',
            fontSize: 11,
            fontWeight: 700,
            padding: '0 6px',
            borderRadius: 3,
          }}
        >
          {page.pageNumber}
        </span>
        {selectable && !isDeleted && (
          <Checkbox checked={page.selected} onClick={(e) => e.stopPropagation()} onChange={() => onToggleSelect?.(page.pageIndex)} />
        )}
      </div>

      <div
        style={{
          width: '100%',
          aspectRatio: '3 / 4',
          background: '#F8FAFC',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          border: '1px solid #F1F5F9',
        }}
      >
        {page.thumbnailUrl ? (
          <img
            src={page.thumbnailUrl}
            alt={`Trang ${page.pageNumber}`}
            style={{
              maxWidth: '100%',
              maxHeight: '100%',
              objectFit: 'contain',
              transform: `rotate(${page.rotation}deg)`,
              transition: 'transform 0.2s ease',
            }}
          />
        ) : (
          <Text type="secondary" style={{ fontSize: 11 }}>
            Đang tải…
          </Text>
        )}
      </div>

      <div
        style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', marginTop: 4 }}
        onClick={(e) => e.stopPropagation()}
      >
        {isDeleted ? (
          <Button type="link" size="small" icon={<UndoOutlined />} onClick={() => onRestore?.(page.pageIndex)} style={{ padding: 0, fontSize: 12, color: '#059669' }}>
            Khôi phục
          </Button>
        ) : (
          <>
            {onPreview &&
              (iconOnly ? (
                <Tooltip title="Xem trang">
                  <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => onPreview(page.pageNumber)} />
                </Tooltip>
              ) : (
                <Button size="small" block icon={<EyeOutlined />} onClick={() => onPreview(page.pageNumber)} style={{ borderRadius: 4, fontSize: 12 }}>
                  Xem
                </Button>
              ))}
            {onRotate && (
              <Tooltip title="Xoay 90°">
                <Button type="text" size="small" icon={<RotateRightOutlined />} onClick={() => onRotate(page.pageIndex)} />
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip title="Xóa trang">
                <Button type="text" danger size="small" icon={<DeleteOutlined />} onClick={() => onDelete(page.pageIndex)} />
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
};
