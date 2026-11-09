"""Interactive Spreadsheet Grid Serializer & Deserializer for 3DoHub Excel Normalizer.
Converts between openpyxl Worksheet objects and structured 2D interactive grid state.
"""

import io
import math
from typing import Any, Optional
import openpyxl
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter

from app.modules.excel_norm.detector import build_merge_map, cell_str, col_width_to_pt
from app.modules.excel_norm.formula_engine import evaluate_worksheet_formulas


def _extract_rgb_hex(color_obj: Any, default_hex: str = "") -> str:
    if not color_obj:
        return default_hex
    rgb = str(getattr(color_obj, "rgb", "") or "")
    if len(rgb) == 8 and rgb != "00000000":
        return f"#{rgb[2:]}"
    if len(rgb) == 6:
        return f"#{rgb}"
    return default_hex


def extract_sheet_grid_data(ws: Any, sheet_meta: dict[str, Any]) -> dict[str, Any]:
    """Serialize an openpyxl Worksheet into an interactive 2D grid model for the Frontend Excel editor."""
    bounds = sheet_meta.get("data_bounds") or {
        "first_row": 1,
        "last_row": max(15, ws.max_row),
        "first_col": 1,
        "last_col": max(8, ws.max_column),
    }
    max_r = max(22, int(bounds["last_row"]) + 4)
    max_c = max(9, int(bounds["last_col"]) + 2)

    col_widths_map: dict[int, float] = sheet_meta.get("col_widths") or {}
    row_heights_map: dict[int, float] = sheet_meta.get("row_heights") or {}
    has_header = bool(sheet_meta.get("header_detected"))
    h_start = int(sheet_meta.get("h_start", 0))
    h_end = int(sheet_meta.get("h_end", 0))
    table_end_row = int(sheet_meta.get("table_end_row", bounds["last_row"]))
    orient = sheet_meta.get("orientation", "PORTRAIT")
    zoom_pct = int(sheet_meta.get("zoom_percent", 100))

    # Convert Excel column width units to screen pixels (~7.5px per unit, min 48px)
    col_widths_px: dict[str, int] = {}
    for c in range(1, max_c + 1):
        col_letter = get_column_letter(c)
        w_unit = col_widths_map.get(c) or ws.column_dimensions[col_letter].width or 11.0
        col_widths_px[str(c)] = max(48, int(round(float(w_unit) * 7.6)))

    # Convert Excel row height points to screen pixels (1pt = 1.333px, min 24px)
    row_heights_px: dict[str, int] = {}
    for r in range(1, max_r + 1):
        h_pt = row_heights_map.get(r) or ws.row_dimensions[r].height or 18.0
        row_heights_px[str(r)] = max(24, int(round(float(h_pt) * 1.35)))

    # Compute page break rows based on target A4 page height in points
    target_page_h_pt = 745.0 if orient == "PORTRAIT" else 500.0
    scale_factor = max(0.45, zoom_pct / 100.0)
    page_break_rows: list[int] = []
    acc_h_pt = 0.0
    for r in range(int(bounds["first_row"]), int(bounds["last_row"]) + 1):
        r_h_pt = float(row_heights_map.get(r) or ws.row_dimensions[r].height or 18.0) * scale_factor
        if acc_h_pt + r_h_pt > target_page_h_pt and r > int(bounds["first_row"]):
            page_break_rows.append(r - 1)
            acc_h_pt = r_h_pt
        else:
            acc_h_pt += r_h_pt

    merges_list: list[dict[str, int]] = []
    for rng in ws.merged_cells.ranges:
        merges_list.append(
            {
                "r1": int(rng.min_row),
                "c1": int(rng.min_col),
                "r2": int(rng.max_row),
                "c2": int(rng.max_col),
            }
        )

    eval_map: dict[tuple[int, int], Any] = sheet_meta.get("eval_map") or evaluate_worksheet_formulas(ws)
    cells_map: dict[str, dict[str, Any]] = {}
    for r in range(1, int(bounds["last_row"]) + 1):
        for c in range(1, int(bounds["last_col"]) + 1):
            cell = ws.cell(row=r, column=c)
            raw_val = cell.value
            eval_val = eval_map.get((r, c), raw_val)
            disp_val = cell_str(eval_val)
            has_border = bool(
                cell.border
                and (
                    (cell.border.top and cell.border.top.style)
                    or (cell.border.bottom and cell.border.bottom.style)
                    or (cell.border.left and cell.border.left.style)
                    or (cell.border.right and cell.border.right.style)
                )
            )
            bg_hex = ""
            if cell.fill and cell.fill.fill_type == "solid":
                bg_hex = _extract_rgb_hex(cell.fill.start_color, "")

            if raw_val is None and not has_border and not bg_hex:
                continue

            f_name = (cell.font.name if (cell.font and cell.font.name) else "Times New Roman")
            f_sz = float(cell.font.sz) if (cell.font and cell.font.sz) else 11.0
            is_b = bool(cell.font and cell.font.b)
            is_i = bool(cell.font and cell.font.i)
            is_u = bool(cell.font and cell.font.u)
            txt_color = _extract_rgb_hex(cell.font.color if cell.font else None, "#0F172A")

            h_al = (
                cell.alignment.horizontal
                if (cell.alignment and cell.alignment.horizontal)
                else ("right" if isinstance(eval_val, (int, float)) and not isinstance(eval_val, bool) else "left")
            )
            v_al = (
                cell.alignment.vertical
                if (cell.alignment and cell.alignment.vertical)
                else "center"
            )
            wrap = (
                True
                if (cell.alignment is None or cell.alignment.wrap_text is not False)
                else False
            )

            cells_map[f"{r}:{c}"] = {
                "value": "" if raw_val is None else str(raw_val),
                "display": disp_val,
                "fontName": f_name,
                "fontSize": f_sz,
                "bold": is_b,
                "italic": is_i,
                "underline": is_u,
                "align": h_al,
                "valign": v_al,
                "wrapText": wrap,
                "bg": bg_hex,
                "color": txt_color,
                "border": has_border,
                "numFmt": cell.number_format or "General",
            }

    return {
        "rowCount": max_r,
        "colCount": max_c,
        "colWidthsPx": col_widths_px,
        "rowHeightsPx": row_heights_px,
        "merges": merges_list,
        "cells": cells_map,
        "printGuides": {
            "firstRow": int(bounds["first_row"]),
            "lastRow": int(bounds["last_row"]),
            "firstCol": int(bounds["first_col"]),
            "lastCol": int(bounds["last_col"]),
            "headerDetected": has_header,
            "headerStartRow": h_start,
            "headerEndRow": h_end,
            "tableEndRow": table_end_row,
            "pageBreakRows": page_break_rows,
        },
    }


def build_workbook_bytes_from_grid_data(
    grid_data: dict[str, Any],
    sheet_title: str = "Bang_In_A4",
    base_xlsx_bytes: Optional[bytes] = None,
) -> bytes:
    """Apply interactive frontend grid_data back into an openpyxl Workbook and return .xlsx bytes."""
    if base_xlsx_bytes:
        wb = openpyxl.load_workbook(io.BytesIO(base_xlsx_bytes))
        ws = wb[sheet_title] if sheet_title in wb.sheetnames else wb.active
        # Clear existing merges and cell values on active sheet before applying updated grid
        for rng in list(ws.merged_cells.ranges):
            ws.unmerge_cells(str(rng))
        for r in range(1, ws.max_row + 1):
            for c in range(1, ws.max_column + 1):
                cell = ws.cell(row=r, column=c)
                cell.value = None
                cell.border = Border()
                cell.fill = PatternFill(fill_type=None)
    else:
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = (sheet_title or "Bang_In_A4")[:31]

    thin_side = Side(style="thin", color="000000")
    grid_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

    col_widths_px: dict[str, Any] = grid_data.get("colWidthsPx") or {}
    for c_str, px_val in col_widths_px.items():
        try:
            c_idx = int(c_str)
            col_letter = get_column_letter(c_idx)
            ws.column_dimensions[col_letter].width = round(max(4.5, float(px_val) / 7.6), 2)
        except Exception:
            pass

    row_heights_px: dict[str, Any] = grid_data.get("rowHeightsPx") or {}
    for r_str, px_val in row_heights_px.items():
        try:
            r_idx = int(r_str)
            ws.row_dimensions[r_idx].height = round(max(14.0, float(px_val) / 1.35), 1)
        except Exception:
            pass

    cells_map: dict[str, dict[str, Any]] = grid_data.get("cells") or {}
    for key, c_data in cells_map.items():
        if ":" not in key:
            continue
        r_s, c_s = key.split(":", 1)
        r_idx, c_idx = int(r_s), int(c_s)
        cell = ws.cell(row=r_idx, column=c_idx)

        raw_str = str(c_data.get("value") if c_data.get("value") is not None else "").strip()
        if raw_str == "":
            cell.value = None
        else:
            # Parse numeric values cleanly so FitColumnsSmart and Excel formulas work
            clean_num = raw_str.replace(",", "")
            if clean_num.lstrip("-").isdigit() and not (len(clean_num) > 1 and clean_num.startswith("0")):
                try:
                    cell.value = int(clean_num)
                except ValueError:
                    cell.value = raw_str
            else:
                try:
                    if "." in clean_num and clean_num.replace(".", "", 1).lstrip("-").isdigit():
                        cell.value = float(clean_num)
                    else:
                        cell.value = raw_str
                except ValueError:
                    cell.value = raw_str

        f_name = str(c_data.get("fontName") or "Times New Roman")
        f_sz = float(c_data.get("fontSize") or 11.0)
        is_b = bool(c_data.get("bold"))
        is_i = bool(c_data.get("italic"))
        is_u = "single" if c_data.get("underline") else None
        cell.font = Font(name=f_name, size=f_sz, bold=is_b, italic=is_i, underline=is_u)

        h_al = c_data.get("align") or "left"
        v_al = c_data.get("valign") or "center"
        wrap = bool(c_data.get("wrapText", True))
        cell.alignment = Alignment(horizontal=h_al, vertical=v_al, wrap_text=wrap)

        if c_data.get("border"):
            cell.border = grid_border

        bg = str(c_data.get("bg") or "").lstrip("#")
        if len(bg) == 6:
            cell.fill = PatternFill(start_color=bg.upper(), end_color=bg.upper(), fill_type="solid")

        if isinstance(cell.value, (int, float)) and abs(cell.value) >= 1000:
            cell.number_format = "#,##0"

    merges_list: list[dict[str, int]] = grid_data.get("merges") or []
    for m in merges_list:
        r1, c1, r2, c2 = int(m["r1"]), int(m["c1"]), int(m["r2"]), int(m["c2"])
        if r2 >= r1 and c2 >= c1 and (r2 > r1 or c2 > c1):
            try:
                ws.merge_cells(start_row=r1, start_column=c1, end_row=r2, end_column=c2)
            except Exception:
                pass

    out_buf = io.BytesIO()
    wb.save(out_buf)
    return out_buf.getvalue()

