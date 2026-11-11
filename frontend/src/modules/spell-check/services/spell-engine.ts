/**
 * In-House Vietnamese Administrative Spelling & Style Engine.
 * 4-Layer Rule System running 100% in the browser.
 */

import { SpellIssue, SpellCheckResult, SpellStats } from '../types/spell-check';
import { CONFUSABLE_PHRASES } from '../data/confusable-phrases';
import { TYPO_MAP } from '../data/typo-map';
import { PROTECTED_PATTERNS } from '../data/protected-patterns';

const VI_CHARS = 'A-Za-z0-9\\u00C0-\\u024F\\u1E00-\\u1EFF';
const VI_CHAR_TEST = new RegExp(`[${VI_CHARS}]`);

// Common administrative capitalization terms that must follow standard style
const ADMINISTRATIVE_CAPITALIZATION: Array<{ pattern: RegExp; correct: string; label: string }> = [
  { pattern: /đảng cộng sản việt nam/gi, correct: 'Đảng Cộng sản Việt Nam', label: 'Tên tổ chức chính trị' },
  { pattern: /ban chấp hành trung ương/gi, correct: 'Ban Chấp hành Trung ương', label: 'Tên cơ quan lãnh đạo Đảng' },
  { pattern: /chính phủ/gi, correct: 'Chính phủ', label: 'Tên cơ quan hành chính cao nhất' },
  { pattern: /quốc hội/gi, correct: 'Quốc hội', label: 'Tên cơ quan quyền lực cao nhất' },
  { pattern: /thủ tướng chính phủ/gi, correct: 'Thủ tướng Chính phủ', label: 'Chức danh người đứng đầu Chính phủ' },
  { pattern: /chủ tịch nước/gi, correct: 'Chủ tịch nước', label: 'Chức danh nguyên thủ quốc gia' },
  { pattern: /ủy ban nhân dân/gi, correct: 'Ủy ban nhân dân', label: 'Tên cơ quan chính quyền địa phương' },
  { pattern: /hội đồng nhân dân/gi, correct: 'Hội đồng nhân dân', label: 'Tên cơ quan dân cử địa phương' },
  { pattern: /bác hồ/gi, correct: 'Bác Hồ', label: 'Danh từ tôn xưng lãnh tụ' },
];

function isWordBoundaryMatch(text: string, start: number, end: number): boolean {
  const prevOk = start === 0 || !VI_CHAR_TEST.test(text[start - 1]);
  const nextOk = end >= text.length || !VI_CHAR_TEST.test(text[end]);
  return prevOk && nextOk;
}

function preserveCase(original: string, replacement: string): string {
  if (original === original.toUpperCase()) return replacement.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return replacement.charAt(0).toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

function getProtectedRanges(text: string): Array<{ start: number; end: number }> {
  const ranges: Array<{ start: number; end: number }> = [];
  for (const pat of PROTECTED_PATTERNS) {
    try {
      const rx = new RegExp(pat.regex, 'g');
      let match: RegExpExecArray | null;
      while ((match = rx.exec(text)) !== null) {
        ranges.push({ start: match.index, end: match.index + match[0].length });
      }
    } catch {
      // ignore invalid regex if any
    }
  }
  return ranges;
}

function isInsideProtected(index: number, length: number, ranges: Array<{ start: number; end: number }>): boolean {
  const end = index + length;
  return ranges.some((r) => Math.max(index, r.start) < Math.min(end, r.end));
}

function getContextSnippet(text: string, start: number, end: number): string {
  const before = text.slice(Math.max(0, start - 25), start);
  const matched = text.slice(start, end);
  const after = text.slice(end, Math.min(text.length, end + 25));
  return `${before}[${matched}]${after}`.replace(/\s+/g, ' ').trim();
}

export function runSpellCheck(text: string): SpellCheckResult {
  const t0 = performance.now();
  if (!text || !text.trim()) {
    return {
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
  }

  const protectedRanges = getProtectedRanges(text);
  const issues: SpellIssue[] = [];
  let issueId = 1;

  // 1. Layer 1: Punctuation & Spacing Rules
  const spaceBeforePunctRx = /(\S)([ \t]+)(?=[,.:;!?])/g;
  let m: RegExpExecArray | null;
  while ((m = spaceBeforePunctRx.exec(text)) !== null) {
    const startIdx = m.index + m[1].length;
    const endIdx = startIdx + m[2].length;
    if (!isInsideProtected(startIdx, endIdx - startIdx, protectedRanges)) {
      issues.push({
        id: `punct_${issueId++}`,
        startIndex: startIdx,
        endIndex: endIdx,
        original: m[2],
        replacement: '',
        category: 'PUNCTUATION',
        categoryLabel: 'Dấu câu',
        severity: 'info',
        message: 'Không đặt dấu cách trước dấu câu (xóa khoảng trắng thừa)',
        context: getContextSnippet(text, m.index, endIdx + 1),
        ruleId: 'PUNCT_NO_SPACE_BEFORE',
        isSafeAutoFix: true,
      });
    }
  }

  const spaceAfterPunctRx = /([,;])(?=[^\s\d,.:;!?)"'»\]])/g;
  while ((m = spaceAfterPunctRx.exec(text)) !== null) {
    const startIdx = m.index;
    const endIdx = m.index + 1;
    if (!isInsideProtected(startIdx, 1, protectedRanges)) {
      issues.push({
        id: `punct_${issueId++}`,
        startIndex: startIdx,
        endIndex: endIdx,
        original: m[1],
        replacement: `${m[1]} `,
        category: 'PUNCTUATION',
        categoryLabel: 'Dấu câu',
        severity: 'info',
        message: 'Cần có một dấu cách sau dấu phẩy hoặc chấm phẩy',
        context: getContextSnippet(text, m.index, Math.min(text.length, m.index + 3)),
        ruleId: 'PUNCT_SPACE_AFTER',
        isSafeAutoFix: true,
      });
    }
  }

  // 2. Layer 2: Confusable Phrases & Collocations (404 entries)
  for (const item of CONFUSABLE_PHRASES) {
    const escaped = item.wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const rx = new RegExp(escaped, 'gi');
    while ((m = rx.exec(text)) !== null) {
      const endIdx = m.index + m[0].length;
      if (
        isWordBoundaryMatch(text, m.index, endIdx) &&
        !isInsideProtected(m.index, m[0].length, protectedRanges)
      ) {
        const orig = m[0];
        const repl = preserveCase(orig, item.correct);
        issues.push({
          id: `confuse_${issueId++}`,
          startIndex: m.index,
          endIndex: endIdx,
          original: orig,
          replacement: repl,
          category: 'CONFUSABLE',
          categoryLabel: 'Ngữ cảnh từ vựng',
          severity: item.severity || 'warning',
          message: item.description || `Từ ngữ chuẩn mực trong văn bản hành chính là "${item.correct}"`,
          context: getContextSnippet(text, m.index, endIdx),
          ruleId: `CONFUSE_${item.wrong}`,
          isSafeAutoFix: true,
        });
      }
    }
  }

  // 3. Layer 3: Typing Typos (Telex/VNI)
  const wordsRx = new RegExp(`[${VI_CHARS}]+`, 'g');
  while ((m = wordsRx.exec(text)) !== null) {
    const word = m[0];
    const lower = word.toLowerCase();
    if (TYPO_MAP[lower] && !isInsideProtected(m.index, word.length, protectedRanges)) {
      const repl = preserveCase(word, TYPO_MAP[lower]);
      issues.push({
        id: `typo_${issueId++}`,
        startIndex: m.index,
        endIndex: m.index + word.length,
        original: word,
        replacement: repl,
        category: 'SPELLING',
        categoryLabel: 'Lỗi gõ phím',
        severity: 'error',
        message: `Phát hiện lỗi gõ phím dính dấu: "${word}" nên viết là "${repl}"`,
        context: getContextSnippet(text, m.index, m.index + word.length),
        ruleId: `TYPO_${lower}`,
        isSafeAutoFix: true,
      });
    }
  }

  // 4. Layer 4: Administrative Capitalization Rules
  for (const cap of ADMINISTRATIVE_CAPITALIZATION) {
    const rxCap = new RegExp(cap.pattern.source, 'gi');
    while ((m = rxCap.exec(text)) !== null) {
      const orig = m[0];
      const endIdx = m.index + orig.length;
      if (
        orig !== cap.correct &&
        isWordBoundaryMatch(text, m.index, endIdx) &&
        !isInsideProtected(m.index, orig.length, protectedRanges)
      ) {
        issues.push({
          id: `cap_${issueId++}`,
          startIndex: m.index,
          endIndex: endIdx,
          original: orig,
          replacement: cap.correct,
          category: 'CAPITALIZATION',
          categoryLabel: 'Viết hoa thể thức',
          severity: 'warning',
          message: `Quy tắc viết hoa hành chính (${cap.label}): "${cap.correct}"`,
          context: getContextSnippet(text, m.index, endIdx),
          ruleId: 'CAP_ADMIN_ORG',
          isSafeAutoFix: true,
        });
      }
    }
  }

  // Deduplicate overlapping issues (prefer longer or earlier issues)
  issues.sort((a, b) => a.startIndex - b.startIndex || b.endIndex - a.endIndex);
  const deduped: SpellIssue[] = [];
  let lastEnd = -1;
  for (const iss of issues) {
    if (iss.startIndex >= lastEnd) {
      deduped.push(iss);
      lastEnd = iss.endIndex;
    }
  }

  const words = text.trim().split(/\s+/).filter(Boolean);
  const elapsed = Math.round((performance.now() - t0) * 100) / 100;

  const stats: SpellStats = {
    total: deduped.length,
    spelling: deduped.filter((i) => i.category === 'SPELLING').length,
    confusable: deduped.filter((i) => i.category === 'CONFUSABLE').length,
    capitalization: deduped.filter((i) => i.category === 'CAPITALIZATION').length,
    punctuation: deduped.filter((i) => i.category === 'PUNCTUATION').length,
    wordsCount: words.length,
    charsCount: text.length,
    executionMs: elapsed,
  };

  return { issues: deduped, stats };
}

export function applySingleFix(text: string, issue: SpellIssue): string {
  if (issue.startIndex < 0 || issue.endIndex > text.length) return text;
  return text.slice(0, issue.startIndex) + issue.replacement + text.slice(issue.endIndex);
}

export function applySafeAutoFixes(text: string, issues: SpellIssue[]): string {
  const safeIssues = [...issues]
    .filter((i) => i.isSafeAutoFix)
    .sort((a, b) => b.startIndex - a.startIndex); // replace from back to front to preserve offsets

  let updated = text;
  for (const iss of safeIssues) {
    if (iss.startIndex >= 0 && iss.endIndex <= updated.length) {
      updated = updated.slice(0, iss.startIndex) + iss.replacement + updated.slice(iss.endIndex);
    }
  }
  return updated;
}
