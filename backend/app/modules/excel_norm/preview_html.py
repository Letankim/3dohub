"""HTML A4 Print Preview, MSO Clipboard Exporter & TSV-to-XLSX Parser for Excel Print Normalizer."""

import html
import io
from typing import Any
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

from app.modules.excel_norm.detector import build_merge_map, cell_str, col_width_to_pt
from app.modules.excel_norm.formula_engine import evaluate_worksheet_formulas


def render_excel_a4_preview_html(
    xlsx_bytes: bytes, active_meta: dict[str, Any]
) -> tuple[str, str]:
    """Render an openpyxl worksheet into an A4 Print Preview HTML table and an MSO Clipboard HTML string."""
    if not active_meta or not active_meta.get("has_data"):
        empty_html = "<div style='padding:24px;font-family:\"Times New Roman\",serif;'>Sheet không có dữ liệu để in.</div>"
        return empty_html, empty_html

    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=False)
    sheet_name = active_meta.get("sheet_name", wb.sheetnames[0])
    ws = wb[sheet_name] if sheet_name in wb.sheetnames else wb.active
    eval_map: dict[tuple[int, int], Any] = active_meta.get("eval_map") or evaluate_worksheet_formulas(ws)

    merge_map = build_merge_map(ws)
    bounds = active_meta["data_bounds"]
    first_row = bounds["first_row"]
    last_row = bounds["last_row"]
    first_col = bounds["first_col"]
    last_col = bounds["last_col"]

    has_header = bool(active_meta.get("header_detected"))
    h_start = int(active_meta.get("h_start", first_row))
    h_end = int(active_meta.get("h_end", first_row))
    table_end_row = int(active_meta.get("table_end_row", last_row))
    col_widths: dict[int, float] = active_meta.get("col_widths", {})
    row_heights: dict[int, float] = active_meta.get("row_heights", {})
    zoom_pct = int(active_meta.get("zoom_percent", 100))

    visible_cols = [
        c
        for c in range(first_col, last_col + 1)
        if not ws.column_dimensions[get_column_letter(c)].hidden
    ]
    total_w_pt = sum(col_width_to_pt(col_widths.get(c, 10.0)) for c in visible_cols) or 500.0

    colgroup_parts = ["<colgroup>"]
    for c in visible_cols:
        w_pt = col_width_to_pt(col_widths.get(c, 10.0))
        pct = round((w_pt / total_w_pt) * 100.0, 2)
        colgroup_parts.append(f"<col style='width:{pct}%;' />")
    colgroup_parts.append("</colgroup>")

    rows_html: list[str] = []
    for r in range(first_row, last_row + 1):
        if ws.row_dimensions[r].hidden:
            continue
        r_h = row_heights.get(r, 18.0)
        scaled_r_h = max(14.0, round(r_h * (zoom_pct / 100.0), 1))
        is_header_row = has_header and (h_start <= r <= h_end)
        is_table_body_row = has_header and (h_end < r <= table_end_row)

        cells_html: list[str] = []
        for c in visible_cols:
            m = merge_map.get((r, c))
            if m and (m[0] != r or m[1] != c):
                continue

            row_span = (m[2] - m[0] + 1) if m else 1
            col_span = (m[3] - m[1] + 1) if m else 1

            cell = ws.cell(row=r, column=c)
            eval_val = eval_map.get((r, c), cell.value)
            txt = html.escape(cell_str(eval_val)).replace("\n", "<br/>")

            f_sz = float(cell.font.sz) if (cell.font and cell.font.sz) else 11.0
            scaled_f_sz = max(7.5, round(f_sz * (zoom_pct / 100.0), 1))
            is_bold = bool(cell.font and cell.font.b) or is_header_row
            is_italic = bool(cell.font and cell.font.i)

            h_align = (
                cell.alignment.horizontal
                if (cell.alignment and cell.alignment.horizontal)
                else ("center" if is_header_row else "left")
            )
            if isinstance(eval_val, (int, float)) and not isinstance(eval_val, bool):
                if not (cell.alignment and cell.alignment.horizontal):
                    h_align = "right"

            has_cell_border = bool(
                cell.border
                and (
                    (cell.border.top and cell.border.top.style)
                    or (cell.border.bottom and cell.border.bottom.style)
                    or (cell.border.left and cell.border.left.style)
                    or (cell.border.right and cell.border.right.style)
                )
            )
            use_grid_border = has_cell_border or is_header_row or is_table_body_row

            bg_color = "transparent"
            if is_header_row:
                bg_color = "#F1F5F9"
            elif cell.fill and cell.fill.fill_type == "solid" and cell.fill.start_color:
                rgb = str(cell.fill.start_color.rgb or "")
                if len(rgb) == 8 and rgb != "00000000":
                    bg_color = f"#{rgb[2:]}"
                elif len(rgb) == 6:
                    bg_color = f"#{rgb}"

            style_items = [
                "font-family:'Times New Roman', Times, serif",
                f"font-size:{scaled_f_sz}pt",
                f"font-weight:{'700' if is_bold else '400'}",
                f"font-style:{'italic' if is_italic else 'normal'}",
                f"text-align:{h_align}",
                "vertical-align:middle",
                "padding:3px 5px",
                "line-height:1.3",
                "word-break:break-word",
                f"background:{bg_color}",
                (
                    "border:1px solid #334155"
                    if use_grid_border
                    else "border:1px dashed transparent"
                ),
            ]
            span_attrs = ""
            if row_span > 1:
                span_attrs += f" rowspan='{row_span}'"
            if col_span > 1:
                span_attrs += f" colspan='{col_span}'"

            tag = "th" if is_header_row else "td"
            cells_html.append(
                f"<{tag}{span_attrs} style=\"{';'.join(style_items)}\">{txt or '&nbsp;'}</{tag}>"
            )

        rows_html.append(f"<tr style='min-height:{scaled_r_h}pt;height:{scaled_r_h}pt;'>{''.join(cells_html)}</tr>")

    table_html = (
        "<table style=\"width:100%;border-collapse:collapse;table-layout:fixed;"
        "font-family:'Times New Roman',Times,serif;color:#0F172A;\">"
        + "".join(colgroup_parts)
        + "<tbody>"
        + "".join(rows_html)
        + "</tbody></table>"
    )

    mso_html = (
        "<html xmlns:o='urn:schemas-microsoft-com:office:office' "
        "xmlns:x='urn:schemas-microsoft-com:office:excel' "
        "xmlns='http://www.w3.org/TR/REC-html40'>"
        "<head><meta charset='utf-8'/></head><body>"
        + table_html
        + "</body></html>"
    )
    return table_html, mso_html


def parse_tsv_text_to_workbook_bytes(raw_tsv: str, sheet_title: str = "Bang_In_A4") -> bytes:
    """Convert pasted TSV/CSV lines from Excel/Google Sheets into a styled .xlsx workbook in memory."""
    wb = openpyxl.Workbook()
    ws = wb.active
    ws.title = (sheet_title or "Bang_In_A4")[:31]

    thin_side = Side(style="thin", color="334155")
    grid_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

    lines = [ln for ln in (raw_tsv or "").replace("\r\n", "\n").split("\n") if ln.strip()]
    parsed_rows: list[list[str]] = []
    max_cols = 1
    for ln in lines:
        sep = "\t" if "\t" in ln else ("|" if "|" in ln else ",")
        parts = [p.strip() for p in ln.split(sep)]
        parsed_rows.append(parts)
        if len(parts) > max_cols:
            max_cols = len(parts)

    for r_idx, row_vals in enumerate(parsed_rows, start=1):
        non_empty = [v for v in row_vals if v]
        is_multi_col = len(non_empty) >= 2
        for c_idx, val in enumerate(row_vals, start=1):
            cell = ws.cell(row=r_idx, column=c_idx)
            # Parse clean numbers
            clean_num = val.replace(",", "").replace(".", "")
            if clean_num.isdigit() and len(val) <= 15 and not val.startswith("0"):
                try:
                    cell.value = int(clean_num)
                except ValueError:
                    cell.value = val
            else:
                cell.value = val

            cell.font = Font(name="Times New Roman", size=11, bold=(r_idx <= 4 and not is_multi_col))
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            if is_multi_col:
                cell.border = grid_border

        if len(non_empty) == 1 and max_cols >= 3 and r_idx <= 4:
            ws.merge_cells(start_row=r_idx, start_column=1, end_row=r_idx, end_column=max_cols)
            ws.cell(row=r_idx, column=1).alignment = Alignment(
                horizontal="center", vertical="center", wrap_text=True
            )
            ws.cell(row=r_idx, column=1).font = Font(name="Times New Roman", size=13, bold=True)

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def render_raw_sheet_preview_html(raw_xlsx_bytes: bytes, active_meta: dict[str, Any]) -> str:
    """Render an un-normalized preview of the original worksheet (for 1-click Undo / HT_KhoiPhuc)."""
    if not active_meta or not active_meta.get("has_data"):
        return ""
    wb = openpyxl.load_workbook(io.BytesIO(raw_xlsx_bytes), data_only=False)
    sheet_name = active_meta.get("sheet_name", wb.sheetnames[0])
    ws = wb[sheet_name] if sheet_name in wb.sheetnames else wb.active
    eval_map: dict[tuple[int, int], Any] = active_meta.get("eval_map") or evaluate_worksheet_formulas(ws)
    merge_map = build_merge_map(ws)
    bounds = active_meta["data_bounds"]
    rows_out: list[str] = []
    for r in range(bounds["first_row"], bounds["last_row"] + 1):
        cells_out: list[str] = []
        for c in range(bounds["first_col"], bounds["last_col"] + 1):
            m = merge_map.get((r, c))
            if m and (m[0] != r or m[1] != c):
                continue
            r_span = (m[2] - m[0] + 1) if m else 1
            c_span = (m[3] - m[1] + 1) if m else 1
            cell = ws.cell(row=r, column=c)
            eval_val = eval_map.get((r, c), cell.value)
            txt = html.escape(cell_str(eval_val)).replace("\n", "<br/>")
            f_name = (cell.font.name if (cell.font and cell.font.name) else "Calibri")
            f_sz = float(cell.font.sz) if (cell.font and cell.font.sz) else 11.0
            is_b = bool(cell.font and cell.font.b)
            sp = (f" rowspan='{r_span}'" if r_span > 1 else "") + (f" colspan='{c_span}'" if c_span > 1 else "")
            cells_out.append(
                f"<td{sp} style=\"font-family:'{f_name}',sans-serif;font-size:{f_sz}pt;"
                f"font-weight:{'700' if is_b else '400'};border:1px solid #CBD5E1;padding:2px 4px;"
                f"white-space:nowrap;overflow:hidden;text-overflow:clip;\">{txt or '&nbsp;'}</td>"
            )
        rows_out.append(f"<tr>{''.join(cells_out)}</tr>")
    return (
        "<table style='width:100%;border-collapse:collapse;table-layout:fixed;color:#334155;'>"
        + "".join(rows_out)
        + "</table>"
    )

