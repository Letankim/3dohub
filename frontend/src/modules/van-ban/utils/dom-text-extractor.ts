/**
 * Utility to extract clean, logically-ordered administrative document text
 * from the live interactive A4 ContentEditable DOM canvas.
 *
 * It understands 2-column Header Tables (Organ/DocNumber left, Motto/Date right),
 * Title & Summary, Kính gửi blocks, Body paragraphs, Body Data Tables,
 * and 2-column Footer Tables (Nơi nhận left, Signature block right).
 */

export function extractDocumentTextFromA4Sheet(container: HTMLElement | null): string {
  if (!container) return '';

  // Look for the inner A4 sheet wrapper if present
  const sheet =
    container.querySelector<HTMLElement>('.a4-preview-sheet, .a4-sheet') || container;

  const lines: string[] = [];

  // Helper to extract clean non-decorative text lines from an element
  const getCleanLines = (el: Element): string[] => {
    const htmlEl = el as HTMLElement;
    const styleStr = htmlEl.getAttribute('style') || '';

    // Ignore decorative visual dividers like border-bottom underline spans/divs
    if (styleStr.includes('border-bottom') || styleStr.includes('border-top')) {
      const txt = (htmlEl.innerText || htmlEl.textContent || '').trim();
      if (!txt || txt === '-----' || txt === '***') return [];
    }

    // Ignore vertical spacing divs like <div style="height:48pt;"></div>
    if (styleStr.includes('height:') && !(htmlEl.textContent || '').trim()) {
      return [];
    }

    const paras = Array.from(htmlEl.querySelectorAll('p, div'));
    if (paras.length > 0) {
      const res: string[] = [];
      for (const p of paras) {
        const pEl = p as HTMLElement;
        const pStyle = pEl.getAttribute('style') || '';
        if (pStyle.includes('border-bottom') && !(pEl.textContent || '').trim()) continue;
        if (pStyle.includes('height:') && !(pEl.textContent || '').trim()) continue;

        const t = (pEl.innerText ?? pEl.textContent ?? '').trim();
        if (t && t !== '* * *') {
          res.push(t);
        }
      }
      return res;
    }

    const raw = htmlEl.innerText ?? htmlEl.textContent ?? '';
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && l !== '* * *');
  };

  const tables = Array.from(sheet.querySelectorAll('table'));
  let headerTable: HTMLTableElement | null = null;
  let footerTable: HTMLTableElement | null = null;

  if (tables.length > 0) {
    // 1. Detect Header Table: first table having 2 columns with organ/motto/date markers
    const firstTbl = tables[0];
    const firstText = (firstTbl.textContent || '').toUpperCase();
    if (
      firstText.includes('ĐẢNG CỘNG SẢN') ||
      firstText.includes('CỘNG HÒA XÃ HỘI') ||
      firstText.includes('SỐ:') ||
      firstText.includes('SỐ ') ||
      firstText.includes('NGÀY')
    ) {
      headerTable = firstTbl;
    }

    // 2. Detect Footer Table: last table having 2 columns with Nơi nhận / Signature markers
    const lastTbl = tables[tables.length - 1];
    if (lastTbl !== headerTable) {
      const lastText = (lastTbl.textContent || '').toUpperCase();
      if (
        lastText.includes('NƠI NHẬN') ||
        lastText.includes('BÍ THƯ') ||
        lastText.includes('CHỦ TỊCH') ||
        lastText.includes('GIÁM ĐỐC') ||
        lastText.includes('TM.') ||
        lastText.includes('T/M') ||
        lastText.includes('KT.') ||
        lastText.includes('TL.') ||
        lastText.includes('NGƯỜI KÝ')
      ) {
        footerTable = lastTbl;
      }
    }
  }

  const extractHeaderTable = (tbl: HTMLTableElement) => {
    const rows = Array.from(tbl.querySelectorAll('tr'));
    if (!rows.length) return;
    const cells = Array.from(rows[0].querySelectorAll('td'));
    if (cells.length >= 2) {
      // Left cell: Organ lines, separator line (*), Doc Number, CV Summary
      lines.push(...getCleanLines(cells[0]));
      // Right cell: Motto lines, Date line
      lines.push(...getCleanLines(cells[1]));
    } else {
      for (const row of rows) {
        for (const cell of Array.from(row.querySelectorAll('td, th'))) {
          lines.push(...getCleanLines(cell));
        }
      }
    }
  };

  const extractFooterTable = (tbl: HTMLTableElement) => {
    const rows = Array.from(tbl.querySelectorAll('tr'));
    if (!rows.length) return;
    const cells = Array.from(rows[0].querySelectorAll('td'));
    if (cells.length >= 2) {
      // Left cell: Nơi nhận items
      lines.push(...getCleanLines(cells[0]));
      // Right cell: Signature block (Authority, Role, Name)
      lines.push(...getCleanLines(cells[1]));
    } else {
      for (const row of rows) {
        for (const cell of Array.from(row.querySelectorAll('td, th'))) {
          lines.push(...getCleanLines(cell));
        }
      }
    }
  };

  const extractDataTable = (tbl: HTMLTableElement) => {
    const rows = Array.from(tbl.querySelectorAll('tr'));
    for (const row of rows) {
      const cells = Array.from(row.querySelectorAll('td, th'));
      if (cells.length > 0) {
        const rowText = cells
          .map((c) => (c.textContent || '').replace(/\s+/g, ' ').trim())
          .join(' | ');
        lines.push(`| ${rowText} |`);
      }
    }
  };

  // Iterate over sheet direct children in DOM order
  const children = Array.from(sheet.children);
  for (const child of children) {
    if (child === headerTable) {
      extractHeaderTable(headerTable);
    } else if (child === footerTable) {
      extractFooterTable(footerTable);
    } else if (child.tagName === 'TABLE') {
      extractDataTable(child as HTMLTableElement);
    } else {
      // Look for nested tables
      const nestedTables = Array.from(child.querySelectorAll('table'));
      if (nestedTables.length > 0) {
        for (const tbl of nestedTables) {
          if (tbl === headerTable) extractHeaderTable(tbl);
          else if (tbl === footerTable) extractFooterTable(tbl);
          else extractDataTable(tbl);
        }
      } else {
        lines.push(...getCleanLines(child));
      }
    }
  }

  // Fallback if no lines were extracted through structure
  if (!lines.length) {
    const raw = container.innerText || container.textContent || '';
    return raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .join('\n');
  }

  return lines.join('\n');
}
