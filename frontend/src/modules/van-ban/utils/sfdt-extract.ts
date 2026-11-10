/**
 * Trích xuất văn bản + footnote từ SFDT (Syncfusion Document Editor) để gửi lại backend chuẩn hóa.
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

/** Văn bản thuần của thân footnote (bỏ qua mọi inline footnote lồng/marker). */
function footnoteBodyText(blocks: unknown[]): string {
  const parts: string[] = [];
  for (const b of blocks) {
    if (!isObj(b)) continue;
    const t = asArr(b.inlines)
      .map((i) => (isObj(i) && !i.footnoteType && typeof i.text === 'string' ? i.text : ''))
      .join('')
      .trim();
    if (t) parts.push(t);
  }
  return parts.join(' ').replace(LEADING_MARK, '').trim();
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
      if (inl.footnoteType) {
        // Footnote kiểm tra TRƯỚC `text` để không bao giờ bị bỏ sót.
        const body = footnoteBodyText(asArr(inl.blocks));
        const n = String(footnotes.length + 1);
        out += `[^${n}]`;
        footnotes.push({ n, text: body });
      } else if (typeof inl.text === 'string') {
        out += inl.text;
      }
    }
    return out;
  };

  const walkBlock = (block: unknown): void => {
    if (!isObj(block)) return;
    if (Array.isArray(block.inlines)) {
      const t = paragraphText(block.inlines).replace(/\u00a0/g, ' ').trim();
      if (t) lines.push(t);
      return;
    }
    for (const row of asArr(block.rows)) {
      if (!isObj(row)) continue;
      for (const cell of asArr(row.cells)) {
        if (isObj(cell)) asArr(cell.blocks).forEach(walkBlock);
      }
    }
  };

  for (const sec of asArr(sfdt.sections)) {
    if (isObj(sec)) asArr(sec.blocks).forEach(walkBlock);
  }
  for (const fn of footnotes) {
    if (fn.text) lines.push(`[^${fn.n}]: ${fn.text}`);
  }
  return { text: lines.join('\n'), footnotes: footnotes.filter((f) => f.text) };
}

