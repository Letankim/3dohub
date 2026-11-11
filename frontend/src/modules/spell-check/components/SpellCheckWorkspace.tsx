'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Tag,
  Typography,
  Space,
  Badge,
  Empty,
  message,
  Tabs,
  Segmented,
} from 'antd';
import {
  CheckCircleOutlined,
  ThunderboltOutlined,
  CopyOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileTextOutlined,
  CheckOutlined,
  EditOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { runSpellCheck, applySingleFix, applySafeAutoFixes } from '../services/spell-engine';
import { SpellIssue, IssueCategory } from '../types/spell-check';
import { HighlightedTextViewer } from './HighlightedTextViewer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SAMPLE_ADMIN_TEXT = `[TÊN CƠ QUAN CẤP TRÊN]
[TÊN CƠ QUAN BAN HÀNH]
Số: 12-BC/ĐU

BÁO CÁO
Về việc kieemr tra tình hình thực hiện nhiệm vụ công tác năm 2026

Thực hiện chỉ đạo của đảng cộng sản việt nam và ủy ban nhân dân tỉnh , Ban Thường vụ đã tiến hành rà soát ,đánh giá toàn diện.
Về công tác tổ chức: Đã hoàn thành đề án sát nhập 03 chi bộ ấp theo đúng quy định. Quá trình bàng giao cơ sở vật chất diễn ra khẩn trương ,chính xác.
Về kinh tế - xã hội: Tình hình sản xuất đạt năng xuất cao, vô hình chung tạo động lực mới cho nhân dân.
Tuy nhiên ,công tác chuẩn đoán nguyên nhân chậm trễ tại một số dự án vẫn chưa được sử lý triệt để.

Nơi nhận:
- Như trên;
- Lưu: VT.
TM. BAN THƯỜNG VỤ
BÍ THƯ
[Họ và tên người ký]`;

export const SpellCheckWorkspace: React.FC = () => {
  const isMobile = useIsMobile();
  const [text, setText] = useState<string>(SAMPLE_ADMIN_TEXT);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'HIGHLIGHT' | 'EDIT'>('HIGHLIGHT');

  // Compute spell check result
  const checkResult = useMemo(() => runSpellCheck(text), [text]);
  const { issues, stats } = checkResult;

  const filteredIssues = useMemo(() => {
    if (activeCategory === 'ALL') return issues;
    return issues.filter((i) => i.category === activeCategory);
  }, [issues, activeCategory]);

  const handleFixIssue = useCallback(
    (issue: SpellIssue) => {
      const updated = applySingleFix(text, issue);
      setText(updated);
      message.success(`Đã sửa "${issue.original}" thành "${issue.replacement}"`);
    },
    [text]
  );

  const handleFixAllSafe = useCallback(() => {
    if (issues.length === 0) return;
    const updated = applySafeAutoFixes(text, issues);
    setText(updated);
    message.success(`Đã tự động sửa ${issues.length} lỗi thể thức & chính tả!`);
  }, [text, issues]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép nội dung văn bản vào khay nhớ tạm!');
  }, [text]);

  const handleDownload = useCallback(() => {
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VanBan_DaSoatLoi.txt';
    a.click();
    URL.revokeObjectURL(url);
    message.success('Đã tải tệp văn bản đã soát lỗi!');
  }, [text]);

  const getTagColor = (cat: IssueCategory) => {
    switch (cat) {
      case 'SPELLING':
        return 'error';
      case 'CONFUSABLE':
        return 'warning';
      case 'CAPITALIZATION':
        return 'blue';
      case 'PUNCTUATION':
      default:
        return 'cyan';
    }
  };

  return (
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: isMobile ? '8px 12px' : '16px 20px' }}>
      {/* Top Banner */}
      <Card
        size="small"
        style={{
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          marginBottom: 16,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Space align="center">
              <SafetyCertificateOutlined style={{ fontSize: 20, color: '#1D4ED8' }} />
              <Title level={4} style={{ margin: 0, fontSize: isMobile ? 16 : 18, color: '#0F172A' }}>
                Soát lỗi chính tả & ngữ phong hành chính
              </Title>
              <Badge count={stats.total} overflowCount={99} style={{ backgroundColor: stats.total > 0 ? '#DC2626' : '#16A34A' }} />
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
              Rà soát lỗi gõ phím Telex/VNI, 404 cụm từ dễ nhầm lẫn, quy tắc viết hoa chức vụ & dấu câu theo NĐ 30/2020/NĐ-CP
            </Text>
          </div>

          <Space wrap size="small">
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => setText(SAMPLE_ADMIN_TEXT)}
            >
              Mẫu kiểm tra
            </Button>
            <Button
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => setText('')}
              danger
            >
              Xóa hết
            </Button>
            <Button
              size="small"
              icon={<CopyOutlined />}
              onClick={handleCopy}
              disabled={!text}
            >
              Sao chép
            </Button>
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={handleDownload}
              disabled={!text}
            >
              Tải tệp .txt
            </Button>
            <Button
              type="primary"
              size="small"
              icon={<ThunderboltOutlined />}
              onClick={handleFixAllSafe}
              disabled={issues.length === 0}
              style={{ background: '#1D4ED8' }}
            >
              Sửa tất cả ({stats.total})
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Left Column: Text Area & Highlight view */}
        <Col xs={24} lg={15}>
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0', height: '100%' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Segmented
                  size="small"
                  value={viewMode}
                  onChange={(val) => setViewMode(val as 'HIGHLIGHT' | 'EDIT')}
                  options={[
                    { label: 'Xem lỗi & Sửa', value: 'HIGHLIGHT', icon: <EyeOutlined /> },
                    { label: 'Nhập / Chỉnh sửa', value: 'EDIT', icon: <EditOutlined /> },
                  ]}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {stats.wordsCount} từ · {stats.charsCount} ký tự · {stats.executionMs} ms
                </Text>
              </div>
            }
          >
            {viewMode === 'HIGHLIGHT' ? (
              <HighlightedTextViewer
                text={text}
                issues={issues}
                onFixIssue={handleFixIssue}
              />
            ) : (
              <TextArea
                rows={isMobile ? 12 : 20}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Dán hoặc nhập nội dung văn bản hành chính cần rà soát chính tả tại đây..."
                style={{
                  fontFamily: 'Times New Roman, serif',
                  fontSize: 15,
                  lineHeight: 1.6,
                  borderRadius: 4,
                  borderColor: '#CBD5E1',
                }}
              />
            )}
          </Card>
        </Col>

        {/* Right Column: Error categorization & Individual Fixes */}
        <Col xs={24} lg={9}>
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0', height: '100%' }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: stats.total > 0 ? '#DC2626' : '#16A34A' }} />
                  <span style={{ fontWeight: 600 }}>Danh sách phát hiện ({stats.total})</span>
                </Space>
              </div>
            }
          >
            {/* Filter Tabs */}
            <Tabs
              activeKey={activeCategory}
              onChange={setActiveCategory}
              size="small"
              items={[
                { key: 'ALL', label: `Tất cả (${stats.total})` },
                { key: 'CONFUSABLE', label: `Ngữ cảnh (${stats.confusable})` },
                { key: 'SPELLING', label: `Gõ phím (${stats.spelling})` },
                { key: 'CAPITALIZATION', label: `Viết hoa (${stats.capitalization})` },
                { key: 'PUNCTUATION', label: `Dấu câu (${stats.punctuation})` },
              ]}
              style={{ marginBottom: 8 }}
            />

            {/* List of issues */}
            <div style={{ maxHeight: isMobile ? 320 : 480, overflowY: 'auto', paddingRight: 4 }}>
              {filteredIssues.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    text.trim()
                      ? 'Tuyệt vời! Không phát hiện lỗi chính tả hoặc phong cách nào.'
                      : 'Nhập nội dung văn bản để bắt đầu rà soát'
                  }
                  style={{ padding: '40px 0' }}
                />
              ) : (
                <Space direction="vertical" style={{ width: '100%' }} size={10}>
                  {filteredIssues.map((iss) => (
                    <Card
                      key={iss.id}
                      size="small"
                      style={{
                        borderRadius: 4,
                        border: '1px solid #E2E8F0',
                        background: '#FAFAFA',
                      }}
                      bodyStyle={{ padding: 10 }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Tag color={getTagColor(iss.category)} style={{ margin: 0, fontSize: 11 }}>
                          {iss.categoryLabel}
                        </Tag>
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckOutlined />}
                          onClick={() => handleFixIssue(iss)}
                          style={{
                            background: '#16A34A',
                            borderColor: '#16A34A',
                            fontSize: 12,
                            height: 24,
                            padding: '0 8px',
                          }}
                        >
                          Sửa: {iss.replacement === '' ? 'Xóa khoảng trắng' : iss.replacement}
                        </Button>
                      </div>

                      <div style={{ fontSize: 13, marginBottom: 4 }}>
                        <Text delete type="danger" style={{ fontWeight: 600 }}>
                          {iss.original.trim() === '' ? '[khoảng trắng]' : iss.original}
                        </Text>
                        <Text style={{ margin: '0 6px', color: '#94A3B8' }}>→</Text>
                        <Text strong style={{ color: '#16A34A' }}>
                          {iss.replacement === '' ? '[xóa]' : iss.replacement}
                        </Text>
                      </div>

                      <Paragraph
                        type="secondary"
                        style={{ fontSize: 12, margin: '4px 0 0 0', color: '#64748B' }}
                      >
                        {iss.message}
                      </Paragraph>
                    </Card>
                  ))}
                </Space>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
