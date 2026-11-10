/**
 * Trích xuất văn bản + footnote từ SFDT (Syncfusion Document Editor) để gửi lại backend chuẩn hóa.
 *
 * Hỗ trợ 100% cả SFDT tối ưu hóa (compact: sec, b, i, tlp, fnt) và SFDT thường (sections, blocks, inlines, text, footnoteType).
 *
 * Nguyên tắc "không xóa bất cứ thứ gì" (theo Module1.bas VBA):
 * - Mỗi đoạn văn (kể cả đoạn trong ô bảng) là MỘT dòng riêng, theo thứ tự ô -> hàng -> bảng,
 *   giống cách macro Word duyệt `doc.Paragraphs`; không gộp ô bảng thành 1 dòng.
 * - Mỗi footnote thật trong thân bài -> chèn `[^n]` đúng vị trí và thêm dòng `[^n]: nội dung` ở cuối.
 */

type Json = Record<string, unknown>;
export interface FootnoteItem {
  n: string;
  text: string;
}

const isObj = (v: unknown): v is Json => !!v && typeof v === 'object';
const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const LEADING_MARK = /^[\s\u00a0]*(\d+|[¹²³⁴⁵⁶⁷⁸⁹⁰])?[.:\s\u00a0\t]*/;

function getInlineText(inl: Json): string {
  if (typeof inl.text === 'string') return inl.text;
  if (typeof inl.tlp === 'string') return inl.tlp;
  return '';
}

function isFootnoteInline(inl: Json): boolean {
  return inl.footnoteType !== undefined || inl.fnt !== undefined;
}

/** Văn bản thuần của thân footnote (bỏ qua mọi inline footnote lồng và ký tự marker \u0002). */
function footnoteBodyText(blocks: unknown[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (!isObj(b)) continue;
    const inlines = asArr(b.inlines || b.i);
    for (const inl of inlines) {
      if (!isObj(inl) || isFootnoteInline(inl)) continue;
      const t = getInlineText(inl);
      if (t && t !== '\u0002') parts.push(t);
    }
  }
  return parts.join('').replace(LEADING_MARK, '').trim();
}

export function extractTextAndFootnotesFromSfdt(sfdt: Json): {
  text: string;
  footnotes: FootnoteItem[];
} {
  const lines: string[] = [];
  const footnotes: FootnoteItem[] = [];

  const paragraphText = (inlines: unknown[]): string => {
    let out = '';
    for (const inl of inlines) {
      if (!isObj(inl)) continue;
      if (isFootnoteInline(inl)) {
        // Footnote kiểm tra TRƯỚC `text` để không bao giờ bị bỏ sót.
        const fnBlocks = asArr(inl.blocks || inl.b);
        const body = footnoteBodyText(fnBlocks);
        const n = String(footnotes.length + 1);
        out += `[^${n}]`;
        footnotes.push({ n, text: body });
      } else {
        out += getInlineText(inl);
      }
    }
    return out;
  };

  const walkBlock = (block: unknown): void => {
    if (!isObj(block)) return;
    const inlines = asArr(block.inlines || block.i);
    if (inlines.length > 0 || 'inlines' in block || 'i' in block) {
      const t = paragraphText(inlines).replace(/\u00a0/g, ' ').trim();
      if (t) lines.push(t);
      return;
    }
    const rows = asArr(block.rows || block.r);
    for (const row of rows) {
      if (!isObj(row)) continue;
      const cells = asArr(row.cells || row.c);
      for (const cell of cells) {
        if (isObj(cell)) {
          const cBlocks = asArr(cell.blocks || cell.b);
          cBlocks.forEach(walkBlock);
        }
      }
    }
  };

  const secs = asArr(sfdt.sections || sfdt.sec);
  for (const sec of secs) {
    if (isObj(sec)) {
      const sBlocks = asArr(sec.blocks || sec.b);
      sBlocks.forEach(walkBlock);
    }
  }
  for (const fn of footnotes) {
    if (fn.text) lines.push(`[^${fn.n}]: ${fn.text}`);
  }
  return { text: lines.join('\n'), footnotes: footnotes.filter((f) => f.text) };
}
