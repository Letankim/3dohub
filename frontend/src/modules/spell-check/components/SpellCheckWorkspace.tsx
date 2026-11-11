'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
  Spin,
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
  SyncOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { hubApi } from '@/services/api-client';
import { SpellCheckIssueItem, SpellCheckResultData } from '@/types/api';
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

const EMPTY_RESULT: SpellCheckResultData = {
  issues: [],
  stats: {
    total: 0,
    spelling: 0,
    confusable: 0,
    capitalization: 0,
    punctuation: 0,
    wordsCount: 0,
    charsCount: 0,
    executionMs: 0,
  },
};

export const SpellCheckWorkspace: React.FC = () => {
  const isMobile = useIsMobile();
  const [text, setText] = useState<string>(SAMPLE_ADMIN_TEXT);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'HIGHLIGHT' | 'EDIT'>('HIGHLIGHT');
  const [checking, setChecking] = useState<boolean>(false);
  const [fixingAll, setFixingAll] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<SpellCheckResultData>(EMPTY_RESULT);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const reqCounterRef = useRef<number>(0);

  const runBackendAnalysis = useCallback(async (targetText: string) => {
    const reqId = ++reqCounterRef.current;
    if (!targetText || !targetText.trim()) {
      setCheckResult(EMPTY_RESULT);
      return;
    }
    setChecking(true);
    try {
      const res = await hubApi.analyzeSpelling(targetText);
      if (reqId === reqCounterRef.current && res.data) {
        setCheckResult(res.data);
      }
    } catch {
      if (reqId === reqCounterRef.current) {
        message.error('Không thể kết nối máy chủ kiểm tra chính tả.');
      }
    } finally {
      if (reqId === reqCounterRef.current) {
        setChecking(false);
      }
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void runBackendAnalysis(text);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [text, runBackendAnalysis]);

  const { issues, stats } = checkResult;

  const filteredIssues = useMemo(() => {
    if (activeCategory === 'ALL') return issues;
    return issues.filter((i) => i.category === activeCategory);
  }, [issues, activeCategory]);

  const handleFixIssue = useCallback(
    (issue: SpellCheckIssueItem) => {
      if (issue.startIndex < 0 || issue.endIndex > text.length) return;
      const updated =
        text.slice(0, issue.startIndex) +
        issue.replacement +
        text.slice(issue.endIndex);
      setText(updated);
      message.success(
        `Đã sửa "${issue.original.trim() || '[khoảng trắng]'}" thành "${issue.replacement || '[xóa]'}"`
      );
    },
    [text]
  );

  const handleFixAllSafe = useCallback(async () => {
    if (!text.trim() || issues.length === 0) return;
    setFixingAll(true);
    try {
      const res = await hubApi.autoFixSpelling(text);
      if (res.data) {
        setText(res.data.fixed_text);
        setCheckResult(res.data.remaining);
        message.success(`Đã tự động chuẩn hóa ${res.data.fixed_count} lỗi an toàn!`);
      }
    } catch {
      message.error('Lỗi khi tự động chuẩn hóa từ máy chủ.');
    } finally {
      setFixingAll(false);
    }
  }, [text, issues.length]);

  const handleCopy = useCallback(() => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    message.success('Đã sao chép nội dung văn bản!');
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

  const getTagColor = (cat: SpellCheckIssueItem['category']) => {
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
              <Badge
                count={stats.total}
                overflowCount={99}
                style={{ backgroundColor: stats.total > 0 ? '#DC2626' : '#16A34A' }}
              />
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
              Phân tích 4 tầng qua máy chủ: từ điển 8.345 âm tiết tiếng Việt, 406 cụm từ dễ nhầm lẫn, viết hoa & dấu câu NĐ 30/2020
            </Text>
          </div>

          <Space wrap size="small">
            <Button
              size="small"
              icon={<SyncOutlined spin={checking} />}
              onClick={() => void runBackendAnalysis(text)}
              disabled={!text.trim()}
            >
              Kiểm tra ngay
            </Button>
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
              onClick={() => {
                setText('');
                setCheckResult(EMPTY_RESULT);
              }}
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
              loading={fixingAll}
              onClick={() => void handleFixAllSafe()}
              disabled={issues.filter((i) => i.isSafeAutoFix).length === 0}
              style={{ background: '#1D4ED8' }}
            >
              Sửa lỗi an toàn ({issues.filter((i) => i.isSafeAutoFix).length})
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={[16, 16]}>
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
                {checking && <Text type="secondary" style={{ fontSize: 12 }}>Đang kiểm tra...</Text>}
              </div>
            }
          >
            <Tabs
              activeKey={activeCategory}
              onChange={setActiveCategory}
              size="small"
              items={[
                { key: 'ALL', label: `Tất cả (${stats.total})` },
                { key: 'CONFUSABLE', label: `Ngữ cảnh (${stats.confusable})` },
                { key: 'SPELLING', label: `Chính tả (${stats.spelling})` },
                { key: 'CAPITALIZATION', label: `Viết hoa (${stats.capitalization})` },
                { key: 'PUNCTUATION', label: `Dấu câu (${stats.punctuation})` },
              ]}
              style={{ marginBottom: 8 }}
            />

            <Spin spinning={checking && issues.length === 0} tip="Đang phân tích văn bản...">
              <div style={{ maxHeight: isMobile ? 320 : 480, minHeight: 200, overflowY: 'auto', paddingRight: 4 }}>
                {filteredIssues.length === 0 && !checking ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                      text.trim()
                        ? 'Tuyệt vời! Không phát hiện lỗi chính tả hoặc ngữ phong nào.'
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
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  );
};
