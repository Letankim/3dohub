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
