"""Native OpenXML .docx generator and .docx parser ported from ChuanHoa_VanBanDang.dotm."""

import io
import re
from typing import Any
from docx import Document
from docx.shared import Mm, Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_COLOR_INDEX
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn


def _remove_table_borders(table: Any) -> None:
    """Remove all borders on a python-docx Table via w:tblBorders XML."""
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "none")
        el.set(qn("w:sz"), "0")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "auto")
        borders.append(el)
    tbl_pr.append(borders)


def _set_data_table_borders(table: Any) -> None:
    """Apply standard 0.5pt solid black borders on body data tables."""
    tbl_pr = table._tbl.tblPr
    borders = OxmlElement("w:tblBorders")
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        el = OxmlElement(f"w:{edge}")
        el.set(qn("w:val"), "single")
        el.set(qn("w:sz"), "4")
        el.set(qn("w:space"), "0")
        el.set(qn("w:color"), "000000")
        borders.append(el)
    tbl_pr.append(borders)


def _prevent_row_split(table: Any) -> None:
    """Set w:cantSplit on all rows of a table so it never breaks awkwardly across pages."""
    for row in table.rows:
        tr_pr = row._tr.get_or_add_trPr()
        tr_pr.append(OxmlElement("w:cantSplit"))


def _add_page_number_field(paragraph: Any, font_size_pt: float) -> None:
    """Insert a centered PAGE field in the primary page header."""
    paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = paragraph.add_run()
    run.font.name = "Times New Roman"
    run.font.size = Pt(font_size_pt)
    run.font.color.rgb = RGBColor(0, 0, 0)

    fld_begin = OxmlElement("w:fldChar")
    fld_begin.set(qn("w:fldCharType"), "begin")
    instr = OxmlElement("w:instrText")
    instr.set(qn("xml:space"), "preserve")
    instr.text = " PAGE "
    fld_sep = OxmlElement("w:fldChar")
    fld_sep.set(qn("w:fldCharType"), "separate")
    fld_end = OxmlElement("w:fldChar")
    fld_end.set(qn("w:fldCharType"), "end")

    run._r.append(fld_begin)
    run._r.append(instr)
    run._r.append(fld_sep)
    run._r.append(fld_end)


def _add_runs_with_placeholder_highlight(
    paragraph: Any,
    text: str,
    size_pt: float,
    bold: bool = False,
    italic: bool = False,
    underline: bool = False,
) -> None:
    """Add text to a paragraph, highlighting [...] placeholders and rendering [^n] as superscript."""
    parts = re.split(r"(\[\^\d+\]|\[[^\]]+\])", text or "")
    for part in parts:
        if not part:
            continue
        is_fn = bool(re.fullmatch(r"\[\^\d+\]", part))
        run = paragraph.add_run(part[2:-1] if is_fn else part)
        run.font.name = "Times New Roman"
        run.font.size = Pt(size_pt)
        run.bold = bold
        run.italic = italic
        run.underline = underline
        run.font.color.rgb = RGBColor(0, 0, 0)
        if is_fn:
            run.font.superscript = True
        elif part.startswith("[") and part.endswith("]"):
            run.font.highlight_color = WD_COLOR_INDEX.YELLOW


def build_docx_bytes(norm_doc: dict[str, Any]) -> bytes:
    """Build a binary .docx document matching all 6 steps of ChuanHoa_VanBanDang.dotm."""
    doc = Document()
    prof = norm_doc["profile"]
    nums = prof["numbers"]
    bools = prof["booleans"]
    strs = prof["strings"]
    is_dang = strs["MOTTO_KIND"] == "DANG"

    # Step 1 & Step 2: A4 Page Setup + Margins + Header Page Number
    for section in doc.sections:
        section.page_width = Mm(210)
        section.page_height = Mm(297)
        section.top_margin = Mm(nums["PAGE_TOP"])
        section.bottom_margin = Mm(nums["PAGE_BOTTOM"])
        section.left_margin = Mm(nums["PAGE_LEFT"])
        section.right_margin = Mm(nums["PAGE_RIGHT"])
        section.header_distance = Mm(nums["PAGE_HEADER"])
        section.footer_distance = Mm(nums["PAGE_FOOTER"])
        section.different_first_page_header_footer = True

        hdr_p = section.header.paragraphs[0]
        hdr_p.text = ""
        _add_page_number_field(hdr_p, nums["PAGE_NUMBER_SIZE"])

    # Step 3: Header Table (1 row, 2 columns)
    hdr_data = norm_doc["header"]
    tbl_h = doc.add_table(rows=1, cols=2)
    tbl_h.alignment = WD_TABLE_ALIGNMENT.CENTER
    _remove_table_borders(tbl_h)

    c_left = tbl_h.cell(0, 0)
    c_right = tbl_h.cell(0, 1)
    c_left.width = Mm(nums["HDR_LEFT_MM"])
    c_right.width = Mm(nums["HDR_RIGHT_MM"])

    # Populate Left Header Cell
    org_lines = hdr_data.get("organ_lines", [])
    for idx, org in enumerate(org_lines):
        p = c_left.paragraphs[0] if idx == 0 else c_left.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        is_b = (idx == len(org_lines) - 1) or len(org_lines) == 1
        _add_runs_with_placeholder_highlight(p, org, nums["ORGAN_SIZE"], bold=is_b)

    if is_dang:
        p_star = c_left.add_paragraph()
        p_star.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_star.paragraph_format.space_before = Pt(0)
        p_star.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(p_star, "*", nums["ORGAN_SIZE"])
    elif org_lines and bools["ORGAN_UNDERLINE"]:
        p_line = c_left.add_paragraph()
        p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_line.paragraph_format.space_before = Pt(0)
        p_line.paragraph_format.space_after = Pt(2)
        _add_runs_with_placeholder_highlight(p_line, "-----", 10.0, bold=True)

    if hdr_data.get("doc_number"):
        p_so = c_left.add_paragraph()
        p_so.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_so.paragraph_format.space_before = Pt(2)
        p_so.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(
            p_so, hdr_data["doc_number"], nums["DOC_NUMBER_SIZE"]
        )

    if hdr_data.get("cv_summary"):
        p_cv = c_left.add_paragraph()
        p_cv.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cv.paragraph_format.space_before = Pt(2)
        p_cv.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(
            p_cv,
            hdr_data["cv_summary"],
            nums["CV_SUMMARY_SIZE"],
            italic=bools["CV_SUMMARY_ITALIC"],
        )

    # Populate Right Header Cell
    r_align = (
        WD_ALIGN_PARAGRAPH.RIGHT
        if strs["RIGHT_ALIGN"] == "RIGHT"
        else WD_ALIGN_PARAGRAPH.CENTER
    )
    motto_lines = hdr_data.get("motto_lines", [])
    if is_dang and motto_lines:
        p_m = c_right.paragraphs[0]
        p_m.alignment = r_align
        p_m.paragraph_format.space_before = Pt(0)
        p_m.paragraph_format.space_after = Pt(2)
        _add_runs_with_placeholder_highlight(
            p_m, motto_lines[0], nums["PARTY_MOTTO_SIZE"], bold=True, underline=True
        )
    elif len(motto_lines) >= 2:
        p_qh = c_right.paragraphs[0]
        p_qh.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_qh.paragraph_format.space_before = Pt(0)
        p_qh.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(p_qh, motto_lines[0], nums["QH_SIZE"], bold=True)

        p_tn = c_right.add_paragraph()
        p_tn.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_tn.paragraph_format.space_before = Pt(0)
        p_tn.paragraph_format.space_after = Pt(2)
        _add_runs_with_placeholder_highlight(
            p_tn, motto_lines[1], nums["TN_SIZE"], bold=True, underline=True
        )

    if hdr_data.get("date_line"):
        p_dt = c_right.add_paragraph()
        p_dt.alignment = r_align
        p_dt.paragraph_format.space_before = Pt(4)
        p_dt.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(
            p_dt, hdr_data["date_line"], nums["DATE_SIZE"], italic=True
        )

    # Step 4: Title & Summary
    tb = norm_doc["title_block"]
    if tb.get("title"):
        p_t = doc.add_paragraph()
        p_t.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_t.paragraph_format.space_before = Pt(12)
        p_t.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(p_t, tb["title"], nums["TITLE_SIZE"], bold=True)

    if tb.get("summary"):
        p_s = doc.add_paragraph()
        p_s.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_s.paragraph_format.space_before = Pt(2)
        p_s.paragraph_format.space_after = Pt(2)
        _add_runs_with_placeholder_highlight(
            p_s, tb["summary"], nums["SUMMARY_SIZE"], bold=True, underline=False
        )

    if tb.get("title") or tb.get("summary"):
        p_sep = doc.add_paragraph()
        p_sep.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_sep.paragraph_format.space_before = Pt(0)
        p_sep.paragraph_format.space_after = Pt(8)
        r_sep = p_sep.add_run("-----")
        r_sep.font.name = "Times New Roman"
        r_sep.font.size = Pt(11)
        r_sep.bold = True

    # Kính gửi
    kg = norm_doc["kinh_gui"]
    if kg.get("prefix"):
        kg_items = kg.get("items", [])
        p_kg = doc.add_paragraph()
        p_kg.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_kg.paragraph_format.first_line_indent = Cm(nums["INDENT_CM"])
        p_kg.paragraph_format.space_before = Pt(6)
        p_kg.paragraph_format.space_after = Pt(6)
        _add_runs_with_placeholder_highlight(
            p_kg, kg["prefix"] + " ", nums["BODY_SIZE"], italic=bools["KINH_GUI_ITALIC"]
        )
        if kg_items:
            _add_runs_with_placeholder_highlight(
                p_kg,
                "; ".join(kg_items),
                nums["BODY_SIZE"],
                bold=(not is_dang),
            )

    # Body Paragraphs, Page Breaks & Data Tables
    body_items = norm_doc["body_paragraphs"]
    b_i = 0
    while b_i < len(body_items):
        item = body_items[b_i]
        if item["kind"] == "PAGE_BREAK":
            doc.add_page_break()
            b_i += 1
            continue

        if item["kind"] == "TABLE_ROW":
            table_rows: list[list[str]] = []
            while b_i < len(body_items) and body_items[b_i]["kind"] == "TABLE_ROW":
                table_rows.append(body_items[b_i].get("cells", []))
                b_i += 1
            max_cols = max((len(r) for r in table_rows), default=1)
            tbl_b = doc.add_table(rows=len(table_rows), cols=max_cols)
            tbl_b.alignment = WD_TABLE_ALIGNMENT.CENTER
            _set_data_table_borders(tbl_b)
            _prevent_row_split(tbl_b)
            for r_idx, row_cells in enumerate(table_rows):
                for c_idx in range(max_cols):
                    cell_text = row_cells[c_idx] if c_idx < len(row_cells) else ""
                    p_cell = tbl_b.cell(r_idx, c_idx).paragraphs[0]
                    p_cell.alignment = (
                        WD_ALIGN_PARAGRAPH.CENTER if r_idx == 0 else WD_ALIGN_PARAGRAPH.LEFT
                    )
                    p_cell.paragraph_format.space_before = Pt(3)
                    p_cell.paragraph_format.space_after = Pt(3)
                    _add_runs_with_placeholder_highlight(
                        p_cell, cell_text, 13.0, bold=(r_idx == 0)
                    )
            continue

        p_b = doc.add_paragraph()
        if item["align"] == "CENTER":
            p_b.alignment = WD_ALIGN_PARAGRAPH.CENTER
        elif item["align"] == "LEFT":
            p_b.alignment = WD_ALIGN_PARAGRAPH.LEFT
        else:
            p_b.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

        if item["indent_cm"] > 0:
            p_b.paragraph_format.first_line_indent = Cm(item["indent_cm"])
        p_b.paragraph_format.space_before = Pt(6)
        p_b.paragraph_format.space_after = Pt(0)
        p_b.paragraph_format.line_spacing = 1.2
        if item["kind"] in ("DECISION_VERB", "ROMAN", "ARABIC"):
            p_b.paragraph_format.keep_with_next = True

        if item["kind"] == "DIEU" and item.get("prefix_bold"):
            _add_runs_with_placeholder_highlight(
                p_b, item["prefix_bold"] + " ", item["size_pt"], bold=True
            )
            _add_runs_with_placeholder_highlight(
                p_b, item.get("rest_text", ""), item["size_pt"], bold=False
            )
        else:
            _add_runs_with_placeholder_highlight(
                p_b,
                item["text"],
                item["size_pt"],
                bold=item["bold"],
                italic=item["italic"],
            )
        b_i += 1

    # Step 5: Footer Table (Nơi nhận & Chữ ký)
    ftr = norm_doc["footer"]
    tbl_f = doc.add_table(rows=1, cols=2)
    tbl_f.alignment = WD_TABLE_ALIGNMENT.CENTER
    _remove_table_borders(tbl_f)
    _prevent_row_split(tbl_f)
    f_left = tbl_f.cell(0, 0)
    f_right = tbl_f.cell(0, 1)
    f_left.width = Mm(82)
    f_right.width = Mm(83)

    if ftr.get("left_signer_role"):
        p_lr = f_left.paragraphs[0]
        p_lr.alignment = WD_ALIGN_PARAGRAPH.CENTER
        _add_runs_with_placeholder_highlight(
            p_lr, ftr["left_signer_role"], nums["SIGN_SIZE"], bold=True
        )
        if ftr.get("left_signer_name"):
            p_ln = f_left.add_paragraph()
            p_ln.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_ln.paragraph_format.space_before = Pt(42)
            _add_runs_with_placeholder_highlight(
                p_ln, ftr["left_signer_name"], nums["SIGN_SIZE"], bold=True
            )
    elif ftr.get("noi_nhan_items"):
        p_nn = f_left.paragraphs[0]
        p_nn.paragraph_format.space_before = Pt(6)
        p_nn.paragraph_format.space_after = Pt(2)
        _add_runs_with_placeholder_highlight(
            p_nn,
            "Nơi nhận:",
            nums["NN_LABEL_SIZE"],
            bold=bools["NN_LABEL_BOLD"],
            italic=bools["NN_LABEL_ITALIC"],
            underline=bools["NN_LABEL_UNDERLINE"],
        )
        for nn_item in ftr["noi_nhan_items"]:
            p_it = f_left.add_paragraph()
            p_it.paragraph_format.space_before = Pt(0)
            p_it.paragraph_format.space_after = Pt(1)
            _add_runs_with_placeholder_highlight(p_it, nn_item, nums["NN_ITEM_SIZE"])

    r_started = False
    if ftr.get("sign_auth"):
        p_au = f_right.paragraphs[0]
        r_started = True
        p_au.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_au.paragraph_format.space_before = Pt(6)
        p_au.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(
            p_au, ftr["sign_auth"], nums["SIGN_SIZE"], bold=True
        )

    if ftr.get("sign_role"):
        p_ro = f_right.add_paragraph() if r_started else f_right.paragraphs[0]
        r_started = True
        p_ro.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_ro.paragraph_format.space_before = Pt(2)
        p_ro.paragraph_format.space_after = Pt(0)
        role_bold = (not ftr.get("sign_auth")) or bools["ROLE_UNDER_AUTH_BOLD"]
        _add_runs_with_placeholder_highlight(
            p_ro, ftr["sign_role"], nums["SIGN_SIZE"], bold=role_bold
        )

    if ftr.get("sign_name"):
        p_nm = f_right.add_paragraph() if r_started else f_right.paragraphs[0]
        p_nm.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_nm.paragraph_format.space_before = Pt(42)
        p_nm.paragraph_format.space_after = Pt(0)
        _add_runs_with_placeholder_highlight(
            p_nm, ftr["sign_name"], nums["SIGN_SIZE"], bold=True
        )

    # Chú thích cuối trang (footnotes) — đặt sau khối chữ ký, ngăn cách bằng đường kẻ ngắn
    fns = norm_doc.get("footnotes") or []
    if fns:
        p_fl = doc.add_paragraph()
        p_fl.paragraph_format.space_before = Pt(10)
        p_fl.paragraph_format.space_after = Pt(2)
        r_fl = p_fl.add_run("-----")
        r_fl.font.name = "Times New Roman"
        r_fl.font.size = Pt(10)
        r_fl.bold = True
        for fn in fns:
            p_fn = doc.add_paragraph()
            p_fn.paragraph_format.space_before = Pt(0)
            p_fn.paragraph_format.space_after = Pt(0)
            _add_runs_with_placeholder_highlight(p_fn, f"[^{fn['n']}]", 10)
            _add_runs_with_placeholder_highlight(p_fn, " " + fn["text"], 10)

    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


# Re-export for backwards compatibility
from .docx_parser import extract_lines_from_docx_bytes

