'use client';

import React from 'react';
import { Card, Checkbox, Space, Tooltip, Typography, Button } from 'antd';
import {
  RotateRightOutlined,
  DeleteOutlined,
  UndoOutlined,
} from '@ant-design/icons';
import { PdfPageItem } from '../types/pdf';

const { Text } = Typography;

interface PdfPageThumbnailCardProps {
  page: PdfPageItem;
  selectable?: boolean;
  onToggleSelect?: (pageIndex: number) => void;
  onRotate?: (pageIndex: number) => void;
  onDelete?: (pageIndex: number) => void;
  onRestore?: (pageIndex: number) => void;
}

export const PdfPageThumbnailCard: React.FC<PdfPageThumbnailCardProps> = ({
  page,
  selectable = false,
  onToggleSelect,
  onRotate,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(page.isDeleted);

  return (
    <Card
      hoverable={!isDeleted}
      style={{
        width: 146,
        borderRadius: 6,
        border: page.selected ? '2px solid #1D4ED8' : '1px solid #E2E8F0',
        background: isDeleted ? '#F1F5F9' : page.selected ? '#EFF6FF' : '#FFFFFF',
        opacity: isDeleted ? 0.5 : 1,
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      styles={{ body: { padding: '8px 8px 6px 8px' } }}
      onClick={() => {
        if (!isDeleted && selectable && onToggleSelect) {
          onToggleSelect(page.pageIndex);
        }
      }}
    >
      {/* Top Bar: Page number & Selection Checkbox */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <span
          style={{
            background: page.selected ? '#1D4ED8' : '#334155',
            color: '#FFFFFF',
            fontSize: 11,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 3,
          }}
        >
          {page.pageNumber}
        </span>

        {selectable && !isDeleted && (
          <Checkbox
            checked={page.selected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect?.(page.pageIndex);
            }}
          />
        )}
      </div>

      {/* Thumbnail Image Container */}
      <div
        style={{
          width: '100%',
          height: 160,
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
          <div style={{ textAlign: 'center', color: '#94A3B8', fontSize: 12 }}>
            Trang {page.pageNumber}
          </div>
        )}
      </div>

      {/* Action Buttons: Rotate & Delete */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 6,
          paddingTop: 4,
          borderTop: '1px solid #F1F5F9',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {isDeleted ? (
          <Button
            type="link"
            size="small"
            icon={<UndoOutlined />}
            onClick={() => onRestore?.(page.pageIndex)}
            style={{ padding: 0, fontSize: 12, color: '#059669' }}
          >
            Khôi phục
          </Button>
        ) : (
          <>
            {onRotate && (
              <Tooltip title="Xoay trang 90°">
                <Button
                  type="text"
                  size="small"
                  icon={<RotateRightOutlined />}
                  onClick={() => onRotate(page.pageIndex)}
                  style={{ color: '#475569', fontSize: 12 }}
                />
              </Tooltip>
            )}

            {page.rotation > 0 && (
              <Text style={{ fontSize: 10, color: '#1D4ED8', fontWeight: 600 }}>
                {page.rotation}°
              </Text>
            )}

            {onDelete && (
              <Tooltip title="Xóa trang này">
                <Button
                  type="text"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(page.pageIndex)}
                  style={{ fontSize: 12 }}
                />
              </Tooltip>
            )}
          </>
        )}
      </div>
    </Card>
  );
};
