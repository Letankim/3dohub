"""Bounds, Table Header, Signature Footer & Row Height Detection for Excel Print Normalizer.
Ported from ChuanHoa_Excel.xlam (Module1.bas.bas).
"""

from typing import Any, Optional
from openpyxl.utils import get_column_letter
from app.modules.van_ban.text_utils import to_ascii

HEADER_KEYWORDS = (
    "STT", "TT", "TRUC", "NHOM", "NOI DUNG", "NHIEM VU", "SAN PHAM",
    "DON VI", "CHI TIEU", "THOI GIAN", "PHAN CONG", "HO VA TEN", "HO TEN",
    "CHUC VU", "SO LUONG", "GHI CHU", "TIEN DO", "KET QUA",
    "MO TA", "CHI TIET", "DIEN GIAI", "DON GIA", "THANH TIEN", "NGUOI THUC HIEN",
    "DU TOAN", "DIEU CHINH", "TANG", "GIAM", "KINH PHI",
)

FOOTER_MARKERS = (
    "T/M ", "TM.", "K/T ", "KT.", "T/L ", "TL.",
    "NGUOI LAP", "LAP BIEU", "BI THU", "PHO BI THU",
    "CHU TICH", "TRUONG BAN", "CHANH VAN PHONG", "VAN PHONG",
    "THU TRUONG", "GIAM DOC", "XAC NHAN", "DUYET", "NOI NHAN",
)


def col_width_to_pt(col_width: float) -> float:
    """Convert Excel column width units (character width) to points (~5.35pt per unit)."""
    return max(12.0, col_width * 5.35)


def build_merge_map(ws: Any) -> dict[tuple[int, int], tuple[int, int, int, int]]:
    """Map every (row, col) inside a merged range to its (min_row, min_col, max_row, max_col)."""
    m_map: dict[tuple[int, int], tuple[int, int, int, int]] = {}
    for rng in ws.merged_cells.ranges:
        bounds = (rng.min_row, rng.min_col, rng.max_row, rng.max_col)
        for r in range(rng.min_row, rng.max_row + 1):
            for c in range(rng.min_col, rng.max_col + 1):
                m_map[(r, c)] = bounds
    return m_map


def cell_str(val: Any) -> str:
    if val is None:
        return ""
    if isinstance(val, float):
        if val.is_integer():
            return f"{int(val):,}"
        return f"{val:,.2f}"
    if isinstance(val, int) and not isinstance(val, bool):
        return f"{val:,}" if abs(val) >= 1000 else str(val)
    return str(val).strip().replace("\u2026", "...")


def get_true_data_bounds(
    ws: Any,
    merge_map: dict[tuple[int, int], tuple[int, int, int, int]],
    eval_map: Optional[dict[tuple[int, int], Any]] = None,
) -> Optional[tuple[int, int, int, int]]:
    """Port of GetTrueDataBounds: find true (first_row, last_row, first_col, last_col) and trim stray bottom numbers."""
    min_r, max_r, min_c, max_c = 10**9, 0, 10**9, 0
    for r in range(1, ws.max_row + 1):
        for c in range(1, ws.max_column + 1):
            v = ws.cell(row=r, column=c).value
            if v is not None and str(v).strip() != "":
                if r < min_r:
                    min_r = r
                if r > max_r:
                    max_r = r
                if c < min_c:
                    min_c = c
                if c > max_c:
                    max_c = c

    if max_r == 0 or max_c == 0:
        return None

    first_row = min_r if min_r <= 3 else 1
    first_col = min_c if min_c <= 2 else 1
    last_row = max_r
    last_col = max_c

    for r in range(first_row, last_row + 1):
        m = merge_map.get((r, last_col))
        if m and last_col < m[3] <= last_col + 15:
            last_col = m[3]

    for c in range(first_col, last_col + 1):
        m = merge_map.get((last_row, c))
        if m and last_row < m[2] <= last_row + 15:
            last_row = m[2]

    if last_row > first_row + 6:
        bot_non_empty = 0
        bot_is_num = False
        for c in range(first_col, last_col + 1):
            cell = ws.cell(row=last_row, column=c)
            val = eval_map.get((last_row, c), cell.value) if eval_map else cell.value
            if cell.value is not None and str(cell.value).strip() != "":
                bot_non_empty += 1
                has_top_border = bool(cell.border and cell.border.top and cell.border.top.style)
                if isinstance(val, (int, float)) and not isinstance(val, bool) and not has_top_border:
                    bot_is_num = True
        if bot_non_empty == 1 and bot_is_num:
            prev_has_data = False
            for r in range(last_row - 2, last_row):
                for c in range(first_col, last_col + 1):
                    v = ws.cell(row=r, column=c).value
                    if v is not None and str(v).strip() != "":
                        prev_has_data = True
            if not prev_has_data:
                for r in range(last_row - 3, first_row - 1, -1):
                    if any(
                        ws.cell(row=r, column=c).value is not None
                        and str(ws.cell(row=r, column=c).value).strip() != ""
                        for c in range(first_col, last_col + 1)
                    ):
                        last_row = r
                        break

    return first_row, last_row, first_col, last_col


def find_table_header_rows(
    ws: Any,
    first_row: int,
    last_row: int,
    first_col: int,
    last_col: int,
    merge_map: dict[tuple[int, int], tuple[int, int, int, int]],
) -> tuple[bool, int, int]:
    """Port of FindTableHeaderRows: detect (has_header, h_start, h_end)."""
    max_scan = min(last_row, first_row + 25)
    best_row = 0
    max_score = 0

    for r in range(first_row, max_scan + 1):
        col_count_text = 0
        covered_cols = 0
        row_asc_parts: list[str] = []
        for c in range(first_col, last_col + 1):
            m = merge_map.get((r, c))
            if m and (m[0] != r or m[1] != c):
                continue
            val_str = cell_str(ws.cell(row=r, column=c).value)
            if val_str:
                col_count_text += 1
                covered_cols += (m[3] - m[1] + 1) if m else 1
                row_asc_parts.append(to_ascii(val_str))

        is_candidate = col_count_text >= 3 or (col_count_text >= 2 and covered_cols >= 3)
        if not is_candidate:
            continue

        row_asc = " ".join(row_asc_parts)
        if any(
            k in row_asc
            for k in ("DANG CONG SAN", "CONG HOA XA HOI", "DOC LAP", "DANG BO", "DANG UY", "UY BAN")
        ) or ("NGAY" in row_asc and "THANG" in row_asc and "NAM" in row_asc):
            continue

        if col_count_text <= 2 and any(
            k in row_asc
            for k in (
                "DANH MUC", "PHU LUC", "KE HOACH", "BAO CAO", "DANH SACH",
                "BANG TONG HOP", "BANG PHAN CONG", "QUYET DINH", "THONG BAO",
            )
        ):
            continue

        kw_hits = sum(1 for kw in HEADER_KEYWORDS if kw in row_asc)
        score = col_count_text * 10 + kw_hits * 20
        if kw_hits >= 1 or col_count_text >= 4:
            if score > max_score:
                max_score = score
                best_row = r
            if score >= 50:
                break

    if best_row == 0 or max_score < 40:
        return False, first_row, first_row

    h_start = best_row
    h_end = best_row
    for c in range(first_col, last_col + 1):
        m = merge_map.get((best_row, c))
        if m and m[2] > h_end:
            h_end = m[2]

    if h_end < last_row:
        next_r = h_end + 1
        num_cols_idx = 0
        for c in range(first_col, last_col + 1):
            n_val = cell_str(ws.cell(row=next_r, column=c).value)
            if n_val and (
                (n_val.startswith("(") and n_val.endswith(")"))
                or n_val.isdigit()
                or n_val in ("a", "b")
                or "=" in n_val
            ):
                num_cols_idx += 1
        if num_cols_idx >= 3:
            h_end = next_r

    return True, h_start, h_end


def clamp_last_col_to_header(
    ws: Any,
    first_col: int,
    last_col: int,
    h_start: int,
    merge_map: dict[tuple[int, int], tuple[int, int, int, int]],
) -> int:
    """Port of ClampLastColToTableHeader."""
    if last_col <= first_col + 1:
        return last_col
    true_last = 0
    for c in range(first_col, last_col + 1):
        m = merge_map.get((h_start, c))
        top_r, top_c = (m[0], m[1]) if m else (h_start, c)
        hdr_txt = cell_str(ws.cell(row=top_r, column=top_c).value)
        if not hdr_txt or "KEM THEO" in to_ascii(hdr_txt):
            break
        true_last = c
    if first_col + 1 <= true_last < last_col:
        return true_last
    return last_col


def find_table_data_end_row(
    ws: Any,
    first_row: int,
    last_row: int,
    first_col: int,
    last_col: int,
    h_end: int,
    has_header: bool,
    merge_map: dict[tuple[int, int], tuple[int, int, int, int]],
) -> int:
    """Port of FindTableDataEndRow: separate main data table from bottom signature zone."""
    min_check = (h_end + 1) if has_header else (first_row + 1)
    if last_row <= min_check:
        return last_row
    start_scan = max(min_check, last_row - 18)

    for r in range(start_scan, last_row + 1):
        non_empty = 0
        row_asc_parts: list[str] = []
        for c in range(first_col, last_col + 1):
            m = merge_map.get((r, c))
            if m and (m[0] != r or m[1] != c):
                continue
            val_str = cell_str(ws.cell(row=r, column=c).value)
            if val_str:
                non_empty += 1
                row_asc_parts.append(to_ascii(val_str))
        if 0 < non_empty <= 4:
            row_asc = " ".join(row_asc_parts)
            is_sig = any(mk in row_asc for mk in FOOTER_MARKERS) or (
                "NGAY" in row_asc and "THANG" in row_asc and "NAM" in row_asc
            )
            if is_sig and r - 1 >= min_check:
                return r - 1
    return last_row


def count_word_wrapped_lines(paragraph_text: str, max_chars_per_line: int) -> int:
    """Port of CountWordWrappedLines."""
    max_c = max(4, max_chars_per_line)
    words = paragraph_text.split(" ")
    lines_count = 1
    cur_len = 0
    for w in words:
        w_len = len(w)
        if w_len == 0:
            continue
        if cur_len == 0:
            if w_len <= max_c:
                cur_len = w_len
            else:
                extra = (w_len - 1) // max_c
                lines_count += extra
                cur_len = w_len - (extra * max_c)
        elif cur_len + 1 + w_len <= max_c:
            cur_len += 1 + w_len
        else:
            lines_count += 1
            if w_len <= max_c:
                cur_len = w_len
            else:
                extra = (w_len - 1) // max_c
                lines_count += extra
                cur_len = w_len - (extra * max_c)
    return max(1, lines_count)


def calc_cell_required_height_pt(
    ws: Any,
    r: int,
    c: int,
    col_widths: dict[int, float],
    merge_map: dict[tuple[int, int], tuple[int, int, int, int]],
    scale_safety: float,
    eval_map: Optional[dict[tuple[int, int], Any]] = None,
) -> float:
    """Port of CalcCellRequiredHeightPt."""
    cell = ws.cell(row=r, column=c)
    raw_or_eval = eval_map.get((r, c), cell.value) if eval_map else cell.value
    val_str = cell_str(raw_or_eval)
    if not val_str:
        return 0.0

    m = merge_map.get((r, c))
    c_start, c_end = (m[1], m[3]) if m else (c, c)
    merge_width_pt = sum(
        col_width_to_pt(col_widths.get(ci, 10.0))
        for ci in range(c_start, c_end + 1)
        if not ws.column_dimensions[get_column_letter(ci)].hidden
    )
    usable_width_pt = max(24.0, merge_width_pt - 10.0)

    f_size = float(cell.font.sz) if (cell.font and cell.font.sz) else 12.0
    if f_size < 6.0 or f_size > 36.0:
        f_size = 12.0
    is_bold = bool(cell.font and cell.font.b)

    char_w_pt = f_size * 0.47
    if is_bold:
        char_w_pt *= 1.1
    if val_str == val_str.upper() and len(val_str) > 6:
        char_w_pt *= 1.12
    char_w_pt *= scale_safety

    max_chars = max(4, int(usable_width_pt / char_w_pt))
    hard_lines = val_str.replace("\r\n", "\n").replace("\r", "\n").split("\n")

    wrap_enabled = True if (cell.alignment is None or cell.alignment.wrap_text is not False) else False
    if not m and not wrap_enabled:
        total_lines = len(hard_lines)
    else:
        total_lines = sum(
            1 if not hl.strip() else count_word_wrapped_lines(hl.strip(), max_chars)
            for hl in hard_lines
        )

    total_lines = max(1, total_lines)
    line_height_pt = f_size * 1.35
    return (total_lines * line_height_pt) + 5.0

