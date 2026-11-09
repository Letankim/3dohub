"""Core 11-Step Excel A4 Print & Table Normalization Engine
Ported 100% from ChuanHoa_Excel.xlam (Module1.bas.bas).
"""

import io
import math
from typing import Any, Optional
import openpyxl
from openpyxl.styles import Font, Alignment
from openpyxl.utils import get_column_letter

from app.modules.excel_norm.detector import (
    build_merge_map,
    calc_cell_required_height_pt,
    cell_str,
    clamp_last_col_to_header,
    col_width_to_pt,
    find_table_data_end_row,
    find_table_header_rows,
    get_true_data_bounds,
)
from app.modules.excel_norm.formula_engine import evaluate_worksheet_formulas


def normalize_worksheet(
    ws: Any,
    orientation_mode: str = "AUTO",
    cached_ws: Optional[Any] = None,
    wb_sheets: Optional[dict[str, Any]] = None,
    cached_sheets: Optional[dict[str, Any]] = None,
) -> dict[str, Any]:
    """Execute the full 11-step ChuanHoa_TrangIn_Excel pipeline on an openpyxl Worksheet."""
    eval_map = evaluate_worksheet_formulas(
        ws=ws, cached_ws=cached_ws, wb_sheets=wb_sheets, cached_sheets=cached_sheets
    )
    merge_map = build_merge_map(ws)
    bounds = get_true_data_bounds(ws, merge_map, eval_map)
    if not bounds:
        return {"sheet_name": ws.title, "has_data": False}

    first_row, last_row, first_col, last_col = bounds
    has_header, h_start, h_end = find_table_header_rows(
        ws, first_row, last_row, first_col, last_col, merge_map
    )
    if has_header:
        last_col = clamp_last_col_to_header(ws, first_col, last_col, h_start, merge_map)

    table_end_row = find_table_data_end_row(
        ws, first_row, last_row, first_col, last_col, h_end, has_header, merge_map
    )

    # Step 1: Standardize Font = Times New Roman, VerticalAlignment = center, ShrinkToFit = False, Smart WrapText
    scan_start = h_start if has_header else first_row
    col_widths: dict[int, float] = {}
    for c in range(first_col, last_col + 1):
        col_letter = get_column_letter(c)
        cur_w = ws.column_dimensions[col_letter].width
        col_widths[c] = float(cur_w) if cur_w and cur_w > 0 else 10.0

    for r in range(first_row, last_row + 1):
        is_outside_table = (has_header and r < h_start) or (r > table_end_row)
        for c in range(first_col, last_col + 1):
            cell = ws.cell(row=r, column=c)
            old_f = cell.font
            f_sz = float(old_f.sz) if (old_f and old_f.sz) else 11.0
            cell.font = Font(
                name="Times New Roman",
                size=f_sz,
                bold=bool(old_f and old_f.b),
                italic=bool(old_f and old_f.i),
                underline=old_f.u if old_f else None,
                color=old_f.color if old_f else None,
            )

            m = merge_map.get((r, c))
            wrap_val = True
            if is_outside_table and not m and c < last_col:
                txt = cell_str(eval_map.get((r, c), cell.value))
                next_cell = ws.cell(row=r, column=c + 1)
                next_m = merge_map.get((r, c + 1))
                next_txt = cell_str(eval_map.get((r, c + 1), next_cell.value))
                if len(txt) > col_widths[c] and not next_m and not next_txt:
                    wrap_val = False

            old_al = cell.alignment
            h_al = old_al.horizontal if (old_al and old_al.horizontal) else None
            cell.alignment = Alignment(
                horizontal=h_al,
                vertical="center",
                wrap_text=wrap_val,
                shrink_to_fit=False,
            )

    # Step 2: FitColumnsSmart (prevent ### for numbers/formulas and fit content harmoniously)
    for c in range(first_col, last_col + 1):
        col_letter = get_column_letter(c)
        if ws.column_dimensions[col_letter].hidden:
            continue
        cur_w = col_widths[c]
        max_num_len = 0
        max_text_len = 0
        has_any = False
        for r in range(scan_start, table_end_row + 1):
            if ws.row_dimensions[r].hidden:
                continue
            m = merge_map.get((r, c))
            if m and (m[3] - m[1] + 1) > 1:
                continue
            cell = ws.cell(row=r, column=c)
            eval_val = eval_map.get((r, c), cell.value)
            val_s = cell_str(eval_val)
            if val_s:
                has_any = True
                if isinstance(eval_val, (int, float)) and not isinstance(eval_val, bool):
                    clean_num_s = str(round(float(eval_val), 2))
                    max_num_len = max(max_num_len, len(val_s), len(clean_num_s))
                else:
                    max_text_len = max(max_text_len, min(42, len(val_s)))

        if max_num_len > 0:
            req_w = min(26.0, (max_num_len * 1.15) + 2.2)
            cur_w = max(cur_w, req_w)
        if max_text_len > 0:
            ideal_w = min(34.0, max(6.0, max_text_len * 0.92 + 3.0))
            cur_w = max(cur_w, ideal_w)
        elif has_any and cur_w < 4.2:
            cur_w = 4.5

        col_widths[c] = round(cur_w, 2)
        ws.column_dimensions[col_letter].width = col_widths[c]

    # Step 3: Calculate total width & determine A4 Portrait vs A4 Landscape
    visible_cols = sum(
        1
        for c in range(first_col, last_col + 1)
        if not ws.column_dimensions[get_column_letter(c)].hidden
    )
    total_width_pt = sum(
        col_width_to_pt(col_widths[c])
        for c in range(first_col, last_col + 1)
        if not ws.column_dimensions[get_column_letter(c)].hidden
    )
    logical_cols = visible_cols
    if has_header:
        l_cnt = sum(
            1
            for c in range(first_col, last_col + 1)
            if not ws.column_dimensions[get_column_letter(c)].hidden
            and (
                (h_start, c) not in merge_map
                or (merge_map[(h_start, c)][0] == h_start and merge_map[(h_start, c)][1] == c)
            )
        )
        if l_cnt >= 2:
            logical_cols = l_cnt

    mode_up = (orientation_mode or "AUTO").upper()
    if mode_up == "LANDSCAPE":
        chosen_orient = "landscape"
    elif mode_up == "PORTRAIT":
        chosen_orient = "portrait"
    elif visible_cols <= 6 and logical_cols <= 6 and total_width_pt <= 545.0:
        chosen_orient = "portrait"
    else:
        chosen_orient = "landscape"

    target_page_w_pt = 518.0 if chosen_orient == "portrait" else 762.0
    target_page_h_pt = 745.0 if chosen_orient == "portrait" else 500.0

    # Expand narrow tables to fill A4 page width harmoniously
    if 40.0 < total_width_pt < target_page_w_pt * 0.78:
        expand_ratio = min(1.35, (target_page_w_pt * 0.92) / total_width_pt)
        for c in range(first_col, last_col + 1):
            col_letter = get_column_letter(c)
            if not ws.column_dimensions[col_letter].hidden:
                new_w = round(col_widths[c] * expand_ratio, 2)
                if new_w <= 75.0:
                    col_widths[c] = new_w
                    ws.column_dimensions[col_letter].width = new_w
        total_width_pt = sum(
            col_width_to_pt(col_widths[c])
            for c in range(first_col, last_col + 1)
            if not ws.column_dimensions[get_column_letter(c)].hidden
        )

    print_scale = 1.0
    if total_width_pt > target_page_w_pt and total_width_pt > 0:
        print_scale = max(0.45, target_page_w_pt / total_width_pt)

    # Step 4: AutoFitRowsAccurate (single cells, horizontal merges & vertical merges)
    scale_safety = 1.04
    if print_scale < 0.9:
        scale_safety = min(1.08, 1.04 + ((0.9 - print_scale) * 0.1))

    row_heights: dict[int, float] = {}
    for r in range(first_row, last_row + 1):
        if ws.row_dimensions[r].hidden:
            row_heights[r] = 0.0
            continue
        cur_row_h = float(ws.row_dimensions[r].height or 0.0)
        row_has_text = False
        max_font_sz = 0.0
        for c in range(first_col, last_col + 1):
            cell = ws.cell(row=r, column=c)
            eval_val = eval_map.get((r, c), cell.value)
            if cell_str(eval_val):
                row_has_text = True
                cfs = float(cell.font.sz) if (cell.font and cell.font.sz) else 12.0
                if 6.0 <= cfs <= 36.0 and cfs > max_font_sz:
                    max_font_sz = cfs

        if not row_has_text:
            if r > table_end_row:
                row_heights[r] = 14.5 if (cur_row_h == 0.0 or cur_row_h > 15.5) else cur_row_h
            else:
                row_heights[r] = 16.0 if (cur_row_h == 0.0 or cur_row_h > 20.0) else cur_row_h
        else:
            if max_font_sz < 6.0:
                max_font_sz = 12.0
            min_row_h = (max_font_sz * 1.35) + 4.0
            if has_header and h_start <= r <= h_end:
                min_row_h = max(min_row_h, (max_font_sz * 1.45) + 5.0)
            max_req_h = min_row_h
            has_vert_merge_start = False
            for c in range(first_col, last_col + 1):
                m = merge_map.get((r, c))
                if m and (m[0] != r or m[1] != c):
                    continue
                if m and (m[2] - m[0] + 1) > 1:
                    has_vert_merge_start = True
                    continue
                req_h = calc_cell_required_height_pt(
                    ws, r, c, col_widths, merge_map, scale_safety, eval_map
                )
                if req_h > max_req_h:
                    max_req_h = req_h
            if not has_vert_merge_start and max_req_h < cur_row_h < 400.0:
                max_req_h = cur_row_h + 3.0
            row_heights[r] = min(409.0, round(max_req_h, 1))
        ws.row_dimensions[r].height = row_heights[r]

    # Distribute height across multi-row vertical merges (targetSpan = 2..12)
    for target_span in range(2, 13):
        for r in range(first_row, last_row + 1):
            if ws.row_dimensions[r].hidden:
                continue
            for c in range(first_col, last_col + 1):
                m = merge_map.get((r, c))
                if not m or m[0] != r or m[1] != c:
                    continue
                m_row_span = m[2] - m[0] + 1
                if (target_span < 12 and m_row_span == target_span) or (
                    target_span == 12 and m_row_span >= 12
                ):
                    total_req_h = calc_cell_required_height_pt(
                        ws, r, c, col_widths, merge_map, scale_safety, eval_map
                    )
                    if total_req_h > 0:
                        vis_rows = [
                            mr
                            for mr in range(m[0], m[2] + 1)
                            if not ws.row_dimensions[mr].hidden
                        ]
                        cur_total_h = sum(row_heights.get(mr, 16.0) for mr in vis_rows)
                        if vis_rows and cur_total_h < total_req_h:
                            add_per_row = (total_req_h - cur_total_h) / len(vis_rows)
                            for mr in vis_rows:
                                new_h = min(409.0, round(row_heights[mr] + add_per_row, 1))
                                row_heights[mr] = new_h
                                ws.row_dimensions[mr].height = new_h

    # Step 5: Compute Print Zoom & Smart Tall-Page Orphan Prevention
    total_height_pt = sum(row_heights.get(r, 0.0) for r in range(first_row, last_row + 1))
    table_height_pt = sum(row_heights.get(r, 0.0) for r in range(first_row, table_end_row + 1))
    scaled_h_pt = total_height_pt * print_scale
    scaled_tbl_h_pt = table_height_pt * print_scale

    target_tall_pages = 0
    if scaled_h_pt <= target_page_h_pt * 1.50:
        target_tall_pages = 1
    elif (
        table_end_row < last_row
        and scaled_tbl_h_pt <= target_page_h_pt * 1.35
        and scaled_h_pt <= target_page_h_pt * 1.75
    ):
        target_tall_pages = 1
    else:
        full_pages = int(scaled_h_pt // target_page_h_pt)
        rem_pages = (scaled_h_pt / target_page_h_pt) - full_pages
        if 1 <= full_pages <= 12:
            if 0 < rem_pages <= 0.45:
                target_tall_pages = full_pages
            elif (
                table_end_row < last_row
                and int(scaled_tbl_h_pt // target_page_h_pt) <= full_pages
                and rem_pages <= 0.65
            ):
                target_tall_pages = full_pages

    zoom_w = (
        (target_page_w_pt / total_width_pt) * 98.0
        if total_width_pt > target_page_w_pt and total_width_pt > 0
        else 100.0
    )
    zoom_h = 100.0
    if target_tall_pages > 0 and total_height_pt > 0:
        avail_tall_pt = target_page_h_pt * target_tall_pages
        if total_height_pt > avail_tall_pt:
            zoom_h = (avail_tall_pt / total_height_pt) * 97.0

    calc_zoom = max(45, min(100, int(min(zoom_w, zoom_h))))

    # Step 6: Configure A4 PageSetup, Margins (1.0cm / 1.2cm), PrintArea, PrintTitleRows & Footer
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.orientation = chosen_orient
    ws.page_setup.scale = calc_zoom
    ws.page_setup.fitToWidth = False
    ws.page_setup.fitToHeight = False
    ws.sheet_properties.pageSetUpPr.fitToPage = False

    ws.page_margins.left = round(1.0 / 2.54, 4)
    ws.page_margins.right = round(1.0 / 2.54, 4)
    ws.page_margins.top = round(1.2 / 2.54, 4)
    ws.page_margins.bottom = round(1.2 / 2.54, 4)
    ws.page_margins.header = round(0.5 / 2.54, 4)
    ws.page_margins.footer = round(0.5 / 2.54, 4)

    ws.print_options.horizontalCentered = True
    ws.print_options.verticalCentered = False
    ws.print_options.gridLines = False
    ws.print_options.headings = False

    print_area_str = f"{get_column_letter(first_col)}{first_row}:{get_column_letter(last_col)}{last_row}"
    ws.print_area = print_area_str

    estimated_pages = max(
        1, int(math.ceil((total_height_pt * (calc_zoom / 100.0)) / target_page_h_pt))
    )
    repeating_rows_str = ""
    if has_header and estimated_pages > 1 and h_start <= 10:
        repeating_rows_str = f"{h_start}:{h_end}"
        ws.print_title_rows = repeating_rows_str

    if estimated_pages > 1:
        ws.oddFooter.center.text = "Trang &P/&N"
        ws.oddFooter.center.font = "Times New Roman"
        ws.oddFooter.center.size = 11

    min_font_pt = 11.0
    for r in range(first_row, last_row + 1):
        for c in range(first_col, last_col + 1):
            cell = ws.cell(row=r, column=c)
            if cell_str(eval_map.get((r, c), cell.value)) and cell.font and cell.font.sz:
                min_font_pt = min(min_font_pt, float(cell.font.sz))

    effective_font_pt = round(min_font_pt * (calc_zoom / 100.0), 1)
    warnings: list[dict[str, str]] = []
    if effective_font_pt < 8.5:
        warnings.append(
            {
                "code": "SMALL_PRINTED_FONT",
                "severity": "WARNING",
                "message": (
                    f"Cỡ chữ khi in ra chỉ còn khoảng {effective_font_pt}pt (thu phóng {calc_zoom}%), "
                    "có thể hơi nhỏ khi đọc. Nên bỏ bớt cột phụ hoặc tách bảng."
                ),
            }
        )

    return {
        "sheet_name": ws.title,
        "has_data": True,
        "orientation": "LANDSCAPE" if chosen_orient == "landscape" else "PORTRAIT",
        "orientation_label": "A4 Ngang (Landscape)" if chosen_orient == "landscape" else "A4 Dọc (Portrait)",
        "zoom_percent": calc_zoom,
        "estimated_pages": estimated_pages,
        "print_area": print_area_str,
        "data_bounds": {
            "first_row": first_row,
            "last_row": last_row,
            "first_col": first_col,
            "last_col": last_col,
            "visible_cols": visible_cols,
            "logical_cols": logical_cols,
        },
        "header_detected": has_header,
        "header_rows": f"${h_start}:${h_end}" if has_header else None,
        "repeating_title_rows": f"${repeating_rows_str}" if repeating_rows_str else None,
        "table_end_row": table_end_row,
        "effective_min_font_pt": effective_font_pt,
        "warnings": warnings,
        "col_widths": col_widths,
        "row_heights": row_heights,
        "h_start": h_start,
        "h_end": h_end,
        "eval_map": eval_map,
    }


def normalize_workbook_bytes(
    xlsx_bytes: bytes, orientation_mode: str = "AUTO", active_sheet_name: str = ""
) -> tuple[bytes, list[dict[str, Any]], dict[str, Any]]:
    """Normalize all visible worksheets in an .xlsx workbook and return (normalized_bytes, sheets_meta, active_meta)."""
    wb = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=False)
    try:
        wb_cached = openpyxl.load_workbook(io.BytesIO(xlsx_bytes), data_only=True)
    except Exception:
        wb_cached = None

    wb_sheets = {s.title: s for s in wb.worksheets}
    cached_sheets = {s.title: s for s in wb_cached.worksheets} if wb_cached else {}

    sheets_meta: list[dict[str, Any]] = []
    active_meta: dict[str, Any] = {}

    for ws in wb.worksheets:
        if ws.sheet_state != "visible":
            continue
        cached_ws = cached_sheets.get(ws.title)
        meta = normalize_worksheet(
            ws,
            orientation_mode=orientation_mode,
            cached_ws=cached_ws,
            wb_sheets=wb_sheets,
            cached_sheets=cached_sheets,
        )
        if meta.get("has_data"):
            sheets_meta.append(meta)
            if active_sheet_name and ws.title == active_sheet_name:
                active_meta = meta

    if not active_meta and sheets_meta:
        active_meta = sheets_meta[0]

    out_buf = io.BytesIO()
    wb.save(out_buf)
    return out_buf.getvalue(), sheets_meta, active_meta
