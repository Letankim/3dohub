/** Helpers for SFDT (Syncfusion Document Editor JSON). */

type Json = Record<string, unknown>;

/** Replace footnote inlines with plain superscript text so the document can still open. */
export function stripFootnotes(sfdt: Json): Json {
  const walk = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map((n) => {
        if (n && typeof n === 'object' && 'footnoteType' in (n as Json)) {
          return { text: '*', characterFormat: { baselineAlignment: 'Superscript' } };
        }
        return walk(n);
      });
    }
    if (node && typeof node === 'object') {
      const out: Json = {};
      for (const [k, v] of Object.entries(node as Json)) out[k] = walk(v);
      return out;
    }
    return node;
  };
  return walk(sfdt) as Json;
}

/**
 * Chuyển đổi văn bản thô (plain text) thành tài liệu SFDT tối thiểu
 * để hiển thị chuẩn A4 trong Syncfusion Document Editor trước khi bấm Chuẩn hóa.
 */
export function textToSfdt(text: string): Json {
  const lines = (text || '').split(/\r?\n/);
  const blocks = lines.map((line) => ({
    paragraphFormat: {
      textAlignment: 'Left',
      firstLineIndent: 0,
      leftIndent: 0,
      beforeSpacing: 0,
      afterSpacing: 3,
      lineSpacing: 1.15,
      lineSpacingType: 'Multiple',
    },
    characterFormat: {
      fontFamily: 'Times New Roman',
      fontSize: 13,
      fontColor: '#000000',
    },
    inlines: [
      {
        text: line || '',
        characterFormat: {
          fontFamily: 'Times New Roman',
          fontSize: 13,
          fontColor: '#000000',
        },
      },
    ],
  }));

  return {
    sections: [
      {
        blocks: blocks.length > 0 ? blocks : [{ inlines: [{ text: '' }] }],
        headersFooters: {},
        sectionFormat: {
          pageWidth: 595.3,
          pageHeight: 841.9,
          leftMargin: 85.05,
          rightMargin: 42.5,
          topMargin: 56.7,
          bottomMargin: 56.7,
          headerDistance: 28.35,
          footerDistance: 28.35,
          differentFirstPage: false,
          differentOddAndEvenPages: false,
        },
      },
    ],
    characterFormat: {
      fontFamily: 'Times New Roman',
      fontSize: 13,
    },
    paragraphFormat: {
      afterSpacing: 0,
      lineSpacing: 1.15,
      lineSpacingType: 'Multiple',
    },
    background: { color: '#FFFFFFFF' },
    styles: [],
  };
}

/**
 * Trích xuất toàn bộ văn bản và danh sách footnote từ đối tượng SFDT của Syncfusion.
 * Đảm bảo các dấu [^1] trong thân bài và định nghĩa [^1]: chú thích không bao giờ bị mất khi bấm Chuẩn hóa.
 */
export function extractTextAndFootnotesFromSfdt(sfdt: Json): {
  text: string;
  footnotes: Array<{ n: string; text: string }>;
} {
  const lines: string[] = [];
  const footnotes: Array<{ n: string; text: string }> = [];

  const extractInlineText = (inlines: unknown[]): string => {
    let pText = '';
    for (const inl of inlines) {
      if (!inl || typeof inl !== 'object') continue;
      const inlObj = inl as Record<string, unknown>;

      if (typeof inlObj.text === 'string') {
        pText += inlObj.text;
      } else if (inlObj.footnoteType) {
        const fnNum = String(footnotes.length + 1);
        pText += `[^${fnNum}]`;

        const fnBlocks = (inlObj.blocks as unknown[]) || [];
        const fnBodyLines: string[] = [];
        for (const fb of fnBlocks) {
          if (fb && typeof fb === 'object') {
            const fbObj = fb as Record<string, unknown>;
            if (Array.isArray(fbObj.inlines)) {
              const fbText = extractInlineText(fbObj.inlines);
              if (fbText.trim()) fnBodyLines.push(fbText.trim());
            }
          }
        }
        const fnBody = fnBodyLines.join(' ').replace(/^(\d+|[¹²³⁴⁵⁶⁷⁸⁹])[\.\:\s\t]+/, '').trim();
        if (fnBody) {
          footnotes.push({ n: fnNum, text: fnBody });
        }
      }
    }
    return pText;
  };

  const processBlock = (block: unknown) => {
    if (!block || typeof block !== 'object') return;
    const b = block as Record<string, unknown>;

    if (Array.isArray(b.inlines)) {
      const pText = extractInlineText(b.inlines).trim();
      if (pText) lines.push(pText);
    } else if (Array.isArray(b.rows)) {
      for (const row of b.rows) {
        if (!row || typeof row !== 'object') continue;
        const rObj = row as Record<string, unknown>;
        if (Array.isArray(rObj.cells)) {
          const cellTexts: string[] = [];
          for (const cell of rObj.cells) {
            if (!cell || typeof cell !== 'object') continue;
            const cObj = cell as Record<string, unknown>;
            if (Array.isArray(cObj.blocks)) {
              const cellBlockTexts: string[] = [];
              for (const cb of cObj.blocks) {
                if (cb && typeof cb === 'object') {
                  const cbObj = cb as Record<string, unknown>;
                  if (Array.isArray(cbObj.inlines)) {
                    const cText = extractInlineText(cbObj.inlines).trim();
                    if (cText) cellBlockTexts.push(cText);
                  }
                }
              }
              cellTexts.push(cellBlockTexts.join(' '));
            }
          }
          if (cellTexts.some((c) => c.trim())) {
            lines.push(cellTexts.join('   '));
          }
        }
      }
    }
  };

  const sections = (sfdt.sections as unknown[]) || [];
  for (const sec of sections) {
    if (!sec || typeof sec !== 'object') continue;
    const secObj = sec as Record<string, unknown>;
    const blocks = (secObj.blocks as unknown[]) || [];
    for (const b of blocks) {
      processBlock(b);
    }
  }

  for (const fn of footnotes) {
    lines.push(`[^${fn.n}]: ${fn.text}`);
  }

  return { text: lines.join('\n'), footnotes };
}
