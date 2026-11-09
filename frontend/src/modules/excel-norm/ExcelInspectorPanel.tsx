'use client';

import React from 'react';
import { Alert, Badge, Col, Modal, Row, Space, Tag, Typography } from 'antd';
import {
  CheckCircleOutlined,
  ColumnWidthOutlined,
  FileSearchOutlined,
  PrinterOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { ExcelNormalizedResult } from '@/types/api';

const { Text } = Typography;

interface ExcelInspectorModalProps {
  open: boolean;
  onClose: () => void;
  result: ExcelNormalizedResult | null;
  isUndoState: boolean;
}

export const ExcelInspectorModal: React.FC<ExcelInspectorModalProps> = ({
  open,
  onClose,
  result,
  isUndoState,
}) => {
  const meta = result?.active_sheet_meta;

  const detailRows = meta
    ? [
        {
          label: 'Dòng tiêu đề bảng (Header)',
          value: meta.header_detected ? (
            <Space size={6}>
              <CheckCircleOutlined style={{ color: '#16A34A' }} />
              <Tag color="green" style={{ margin: 0, fontWeight: 600 }}>
                Dòng {meta.header_rows}
              </Tag>
            </Space>
          ) : (
            <Text type="secondary">Không phát hiện dòng tiêu đề riêng</Text>
          ),
        },
        {
          label: 'Lặp tiêu đề khi qua trang mới',
          value: meta.repeating_title_rows ? (
            <Tag color="cyan" style={{ margin: 0, fontWeight: 600 }}>
              Tự động lặp dòng {meta.repeating_title_rows}
            </Tag>
          ) : (
            <Text type="secondary">Bảng nằm gọn trên 1 trang A4 (không cần lặp)</Text>
          ),
        },
        {
          label: 'Phân tách khối chữ ký cuối bảng',
          value:
            meta.table_end_row < meta.data_bounds.last_row ? (
              <span>
                Bảng dữ liệu kết thúc tại dòng <b>{meta.table_end_row}</b> • Khối chữ ký từ dòng{' '}
                <b>
                  {meta.table_end_row + 1} – {meta.data_bounds.last_row}
                </b>
              </span>
            ) : (
              <span>Toàn bộ dữ liệu nằm liền mạch đến dòng {meta.data_bounds.last_row}</span>
            ),
        },
        {
          label: 'Chuẩn lề trang in A4',
          value: (
            <span>
              Trái / Phải: <b>1.0 cm</b> • Trên / Dưới: <b>1.2 cm</b> • Căn giữa trang theo chiều ngang
            </span>
          ),
        },
        {
          label: 'Phông chữ & định dạng ô chuẩn hóa',
          value: (
            <span>
              <b>Times New Roman</b> • Tự động xuống dòng (Wrap Text) • Chống lỗi <code>###</code> cột số liệu
            </span>
          ),
        },
      ]
    : [];

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={780}
      style={{ maxWidth: '94vw' }}
      title={
        <Space size={8} wrap>
          <PrinterOutlined style={{ color: '#16A34A' }} />
          <span style={{ fontWeight: 700 }}>Thông số trang in A4</span>
          <Tag color={isUndoState ? 'warning' : 'success'} style={{ margin: 0, fontWeight: 600 }}>
            {isUndoState ? 'Bản gốc' : 'Đã chuẩn hóa A4'}
          </Tag>
        </Space>
      }
    >
      {!meta ? (
        <Text type="secondary">Chưa có dữ liệu bảng tính.</Text>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 4 }}>
          {meta.warnings && meta.warnings.length > 0 && (
            <div>
              {meta.warnings.map((w, idx) => (
                <Alert
                  key={idx}
                  type="warning"
                  showIcon
                  icon={<WarningOutlined />}
                  message={<span style={{ fontSize: 13, fontWeight: 500 }}>{w.message}</span>}
                  style={{ marginBottom: 8 }}
                />
              ))}
            </div>
          )}

          {/* Top 4 KPI Cards - Clean, no wrapping */}
          <Row gutter={[12, 12]}>
            <Col xs={12} sm={6}>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: '10px 12px',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Khổ giấy A4</div>
                <Tag
                  color={meta.orientation === 'PORTRAIT' ? 'blue' : 'purple'}
                  style={{ margin: 0, fontWeight: 600, fontSize: 12.5 }}
                >
                  {meta.orientation === 'PORTRAIT' ? 'A4 dọc (Portrait)' : 'A4 ngang (Landscape)'}
                </Tag>
              </div>
            </Col>

            <Col xs={12} sm={6}>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: '10px 12px',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Thu phóng trang in</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1D4ED8' }}>
                  {meta.zoom_percent}%{' '}
                  <span style={{ fontSize: 12, fontWeight: 400, color: '#64748B' }}>
                    (~{meta.effective_min_font_pt}pt)
                  </span>
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6}>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: '10px 12px',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Số trang ước tính</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>
                  <Badge status="processing" style={{ marginRight: 6 }} />
                  {meta.estimated_pages} trang A4
                </div>
              </div>
            </Col>

            <Col xs={12} sm={6}>
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: 6,
                  padding: '10px 12px',
                  height: '100%',
                }}
              >
                <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>Vùng dữ liệu in</div>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#0F172A' }}>
                  <Text code style={{ fontWeight: 600 }}>
                    {meta.print_area}
                  </Text>{' '}
                  <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>
                    ({meta.data_bounds.visible_cols} cột)
                  </span>
                </div>
              </div>
            </Col>
          </Row>

          {/* Clean 1-Column Specification List (No cramped multi-column line breaks) */}
          <div
            style={{
              border: '1px solid #E2E8F0',
              borderRadius: 6,
              overflow: 'hidden',
              background: '#FFFFFF',
            }}
          >
            <div
              style={{
                background: '#F1F5F9',
                padding: '8px 14px',
                borderBottom: '1px solid #E2E8F0',
                fontWeight: 600,
                fontSize: 13,
                color: '#0F172A',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <FileSearchOutlined style={{ color: '#1D4ED8' }} />
              <span>Chi tiết thiết lập bố cục bảng & trang in</span>
            </div>

            {detailRows.map((item, index) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 8,
                  padding: '10px 14px',
                  borderBottom:
                    index < detailRows.length - 1 ? '1px solid #F1F5F9' : 'none',
                  fontSize: 13,
                }}
              >
                <span style={{ color: '#475569', fontWeight: 500, minWidth: 210 }}>
                  {item.label}
                </span>
                <div style={{ color: '#0F172A', fontWeight: 500, textAlign: 'right', flex: 1 }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
