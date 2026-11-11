'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
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
  SearchOutlined,
} from '@ant-design/icons';
import { useIsMobile } from '@/modules/pdf/hooks/useIsMobile';
import { hubApi } from '@/services/api-client';
import { SpellCheckIssueItem, SpellCheckResultData } from '@/types/api';
import { HighlightedTextViewer } from './HighlightedTextViewer';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const SAMPLE_ADMIN_TEXT = `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
Độc lập - Tự do - Hạnh phúc

BÁO CÁO
Về việc kieemr tra tình hình thực hiện nhiệm vụ công tác năm 2026

Thực hiện chỉ đạo của đảng cộng sản việt nam và ủy ban nhân dân tỉnh , Ban Thường vụ đã tiến hành rà soát ,đánh giá toàn diện.
Về công tác tổ chức: Đã hoàn thành đề án sát nhập 03 chi bộ ấp theo đúng quy định. Quá trình bàng giao cơ sở vật chất diễn ra khẩn trương ,chính xác.
Về kinh tế - xã hội: Tình hình sản xuất đạt năng xuất cao, vô hình chung tạo động lực mới và nâng cao đạo dức công vụ.
Tuy nhiên ,công tác chuẩn đoán nguyên nhân chậm trễ tại một số dự án vẫn chưa được sử lý triệt để.`;

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

function computeStatsFromIssues(
  issues: SpellCheckIssueItem[],
  text: string,
  executionMs: number
) {
  return {
    total: issues.length,
    spelling: issues.filter((i) => i.category === 'SPELLING').length,
    confusable: issues.filter((i) => i.category === 'CONFUSABLE').length,
    capitalization: issues.filter((i) => i.category === 'CAPITALIZATION').length,
    punctuation: issues.filter((i) => i.category === 'PUNCTUATION').length,
    wordsCount: text.trim() ? text.trim().split(/\s+/).length : 0,
    charsCount: text.length,
    executionMs,
  };
}

export const SpellCheckWorkspace: React.FC = () => {
  const isMobile = useIsMobile();
  const [text, setText] = useState<string>(SAMPLE_ADMIN_TEXT);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'EDIT' | 'HIGHLIGHT'>('EDIT');
  const [checking, setChecking] = useState<boolean>(false);
  const [fixingAll, setFixingAll] = useState<boolean>(false);
  const [hasChecked, setHasChecked] = useState<boolean>(false);
  const [checkResult, setCheckResult] = useState<SpellCheckResultData>(EMPTY_RESULT);
  const reqCounterRef = useRef<number>(0);

  const handleCheckSpelling = useCallback(async () => {
    if (!text || !text.trim()) {
      message.warning('Vui lòng nhập hoặc dán nội dung văn bản cần kiểm tra.');
      setCheckResult(EMPTY_RESULT);
      setHasChecked(false);
      return;
    }
    const reqId = ++reqCounterRef.current;
    setChecking(true);
    try {
      const res = await hubApi.analyzeSpelling(text);
      if (reqId === reqCounterRef.current && res.data) {
        setCheckResult(res.data);
        setHasChecked(true);
        setViewMode('HIGHLIGHT');
        if (res.data.stats.total === 0) {
          message.success('Không phát hiện lỗi chính tả nào.');
        } else {
          message.info(`Phát hiện ${res.data.stats.total} vấn đề cần rà soát.`);
        }
      }
    } catch {
      if (reqId === reqCounterRef.current) {
        message.error('Không thể kiểm tra chính tả lúc này. Vui lòng thử lại.');
      }
    } finally {
      if (reqId === reqCounterRef.current) {
        setChecking(false);
      }
    }
  }, [text]);

  const handleTextChange = (nextVal: string) => {
    setText(nextVal);
    if (hasChecked) {
      setHasChecked(false);
      setCheckResult(EMPTY_RESULT);
    }
  };

  const { issues, stats } = checkResult;

  const filteredIssues = useMemo(() => {
    if (activeCategory === 'ALL') return issues;
    return issues.filter((i) => i.category === activeCategory);
  }, [issues, activeCategory]);

  const handleFixIssue = useCallback(
    (issue: SpellCheckIssueItem) => {
      if (issue.startIndex < 0 || issue.endIndex > text.length) return;
      const updatedText =
        text.slice(0, issue.startIndex) +
        issue.replacement +
        text.slice(issue.endIndex);
      const delta = issue.replacement.length - (issue.endIndex - issue.startIndex);

      const remaining = issues
        .filter(
          (i) =>
            i.id !== issue.id &&
            (i.endIndex <= issue.startIndex || i.startIndex >= issue.endIndex)
        )
        .map((i) =>
          i.startIndex >= issue.endIndex
            ? { ...i, startIndex: i.startIndex + delta, endIndex: i.endIndex + delta }
            : i
        );

      setText(updatedText);
      setCheckResult({
        issues: remaining,
        stats: computeStatsFromIssues(remaining, updatedText, stats.executionMs),
      });
      message.success(
        `Đã sửa "${issue.original.trim() || '[khoảng trắng]'}" → "${issue.replacement || '[xóa]'}"`
      );
    },
    [text, issues, stats.executionMs]
  );

  const handleFixAllSafe = useCallback(async () => {
    if (!text.trim() || issues.length === 0) return;
    setFixingAll(true);
    try {
      const res = await hubApi.autoFixSpelling(text);
      if (res.data) {
        setText(res.data.fixed_text);
        setCheckResult(res.data.remaining);
        setHasChecked(true);
        message.success(`Đã tự động sửa ${res.data.fixed_count} lỗi!`);
      }
    } catch {
      message.error('Không thể thực hiện sửa tự động. Vui lòng thử lại.');
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
    message.success('Đã tải tệp văn bản!');
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
    <div style={{ maxWidth: 1380, margin: '0 auto', padding: isMobile ? 0 : '8px 12px' }}>
      <Card
        size="small"
        style={{
          borderRadius: 6,
          border: '1px solid #E2E8F0',
          marginBottom: isMobile ? 10 : 16,
          background: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)',
        }}
        styles={{ body: { padding: isMobile ? 10 : 14 } }}
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
              {hasChecked && (
                <Badge
                  count={stats.total}
                  overflowCount={99}
                  style={{ backgroundColor: stats.total > 0 ? '#DC2626' : '#16A34A' }}
                />
              )}
            </Space>
            <Text type="secondary" style={{ display: 'block', fontSize: 13, marginTop: 4 }}>
              Rà soát lỗi chính tả, từ ngữ dễ nhầm lẫn, quy tắc viết hoa và dấu câu theo thể thức văn bản hành chính
            </Text>
          </div>

          <Space wrap size="small">
            <Button
              type="primary"
              size="small"
              icon={<SearchOutlined />}
              loading={checking}
              onClick={() => void handleCheckSpelling()}
              disabled={!text.trim()}
              style={{ background: '#1D4ED8', fontWeight: 600 }}
            >
              Kiểm tra chính tả
            </Button>
            <Button
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => {
                setText(SAMPLE_ADMIN_TEXT);
                setHasChecked(false);
                setCheckResult(EMPTY_RESULT);
                setViewMode('EDIT');
              }}
            >
              Mẫu kiểm tra
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
              size="small"
              icon={<DeleteOutlined />}
              onClick={() => {
                setText('');
                setHasChecked(false);
                setCheckResult(EMPTY_RESULT);
                setViewMode('EDIT');
              }}
              danger
            >
              Xóa hết
            </Button>
          </Space>
        </div>
      </Card>

      <Row gutter={isMobile ? [8, 8] : [14, 14]}>
        <Col xs={24} lg={15}>
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0', height: '100%' }}
            styles={{ body: { padding: isMobile ? 10 : 14 } }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Segmented
                  size="small"
                  value={viewMode}
                  onChange={(val) => setViewMode(val as 'EDIT' | 'HIGHLIGHT')}
                  options={[
                    { label: 'Nhập văn bản', value: 'EDIT', icon: <EditOutlined /> },
                    { label: 'Xem đánh dấu lỗi', value: 'HIGHLIGHT', icon: <EyeOutlined /> },
                  ]}
                />
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {text.trim() ? text.trim().split(/\s+/).length : 0} từ · {text.length} ký tự
                </Text>
              </div>
            }
          >
            <Spin spinning={checking} tip="Đang rà soát chính tả và ngữ phong...">
              {viewMode === 'HIGHLIGHT' && hasChecked ? (
                <HighlightedTextViewer
                  text={text}
                  issues={issues}
                  onFixIssue={handleFixIssue}
                />
              ) : (
                <TextArea
                  rows={isMobile ? 12 : 20}
                  value={text}
                  onChange={(e) => handleTextChange(e.target.value)}
                  placeholder="Dán hoặc nhập nội dung văn bản hành chính tại đây, sau đó bấm 'Kiểm tra chính tả'..."
                  style={{
                    fontFamily: 'Times New Roman, serif',
                    fontSize: 15,
                    lineHeight: 1.6,
                    borderRadius: 4,
                    borderColor: '#CBD5E1',
                  }}
                />
              )}
            </Spin>
          </Card>
        </Col>

        <Col xs={24} lg={9}>
          <Card
            size="small"
            style={{ borderRadius: 6, border: '1px solid #E2E8F0', height: '100%' }}
            styles={{ body: { padding: isMobile ? 10 : 14 } }}
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                  <CheckCircleOutlined style={{ color: !hasChecked ? '#94A3B8' : stats.total > 0 ? '#DC2626' : '#16A34A' }} />
                  <span style={{ fontWeight: 600 }}>
                    {hasChecked ? `Kết quả kiểm tra (${stats.total})` : 'Kết quả kiểm tra'}
                  </span>
                </Space>
                {hasChecked && issues.filter((i) => i.isSafeAutoFix).length > 0 && (
                  <Button
                    type="primary"
                    size="small"
                    icon={<ThunderboltOutlined />}
                    loading={fixingAll}
                    onClick={() => void handleFixAllSafe()}
                    style={{ background: '#16A34A', borderColor: '#16A34A' }}
                  >
                    Sửa tất cả ({issues.filter((i) => i.isSafeAutoFix).length})
                  </Button>
                )}
              </div>
            }
          >
            <Tabs
              activeKey={activeCategory}
              onChange={setActiveCategory}
              size="small"
              items={[
                { key: 'ALL', label: `Tất cả (${stats.total})` },
                { key: 'CONFUSABLE', label: `Ngữ nghĩa (${stats.confusable})` },
                { key: 'SPELLING', label: `Chính tả (${stats.spelling})` },
                { key: 'CAPITALIZATION', label: `Viết hoa (${stats.capitalization})` },
                { key: 'PUNCTUATION', label: `Dấu câu (${stats.punctuation})` },
              ]}
              style={{ marginBottom: 8 }}
            />

            <Spin spinning={checking} tip="Đang kiểm tra văn bản...">
              <div style={{ maxHeight: isMobile ? 320 : 480, minHeight: 220, overflowY: 'auto', paddingRight: 4 }}>
                {!hasChecked && !checking ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description='Bấm nút "Kiểm tra chính tả" để bắt đầu rà soát văn bản'
                    style={{ padding: '48px 0' }}
                  />
                ) : filteredIssues.length === 0 && !checking ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Tuyệt vời! Không phát hiện lỗi chính tả hoặc ngữ phong nào."
                    style={{ padding: '48px 0' }}
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
                        styles={{ body: { padding: 10 } }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
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
                              maxWidth: isMobile ? 210 : 240,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
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
