"""HTML & Microsoft Office Clipboard (MSO) Renderer for 3DoHub Document Normalizer."""

import html
import re
from typing import Any


def _highlight_brackets_html(text: str) -> str:
    """Escape HTML and wrap [...] placeholders in yellow highlight span."""
    escaped = html.escape(text or "")
    return re.sub(
        r"(\[[^\]]+\])",
        r'<span style="background-color:#FEF08A;mso-highlight:yellow;">\1</span>',
        escaped,
    )


def _build_body_inner_html(norm_doc: dict[str, Any]) -> str:
    """Build the core document tables and paragraphs with inline MSO + CSS styles."""
    prof = norm_doc["profile"]
    nums = prof["numbers"]
    bools = prof["booleans"]
    strs = prof["strings"]

    hdr = norm_doc["header"]
    title_blk = norm_doc["title_block"]
    kg = norm_doc["kinh_gui"]
    body = norm_doc["body_paragraphs"]
    ftr = norm_doc["footer"]

    is_dang = strs["MOTTO_KIND"] == "DANG"
    organ_size = nums["ORGAN_SIZE"]
    doc_num_size = nums["DOC_NUMBER_SIZE"]
    date_size = nums["DATE_SIZE"]
    title_size = nums["TITLE_SIZE"]
    summary_size = nums["SUMMARY_SIZE"]
    body_size = nums["BODY_SIZE"]
    nn_label_size = nums["NN_LABEL_SIZE"]
    nn_item_size = nums["NN_ITEM_SIZE"]
    sign_size = nums["SIGN_SIZE"]

    left_w_pct = round(nums["HDR_LEFT_MM"] / (nums["HDR_LEFT_MM"] + nums["HDR_RIGHT_MM"]) * 100, 1)
    right_w_pct = round(100.0 - left_w_pct, 1)

    # Left Header Cell: Organ lines + separator + Doc Number + CV Summary
    left_parts: list[str] = []
    org_lines = hdr.get("organ_lines", [])
    for idx, org in enumerate(org_lines):
        is_bold = (idx == len(org_lines) - 1) or len(org_lines) == 1
        weight = "bold" if is_bold else "normal"
        left_parts.append(
            f'<p style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{organ_size}pt;font-weight:{weight};line-height:1.25;">'
            f"{_highlight_brackets_html(org)}</p>"
        )

    if is_dang:
        left_parts.append(
            f'<p style="margin:2pt 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{organ_size}pt;line-height:1.1;">*</p>'
        )
    elif org_lines and bools["ORGAN_UNDERLINE"]:
        left_parts.append(
            '<div style="width:38%;margin:2pt auto 4pt auto;border-bottom:1pt solid #000;"></div>'
        )

    if hdr.get("doc_number"):
        left_parts.append(
            f'<p style="margin:2pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{doc_num_size}pt;line-height:1.25;">'
            f'{_highlight_brackets_html(hdr["doc_number"])}</p>'
        )

    if hdr.get("cv_summary"):
        cv_it = "italic" if bools["CV_SUMMARY_ITALIC"] else "normal"
        left_parts.append(
            f'<p style="margin:2pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["CV_SUMMARY_SIZE"]}pt;font-style:{cv_it};line-height:1.2;">'
            f'{_highlight_brackets_html(hdr["cv_summary"])}</p>'
        )

    # Right Header Cell: Motto + Sub-motto + Line + Date
    right_align = "right" if strs["RIGHT_ALIGN"] == "RIGHT" else "center"
    right_parts: list[str] = []
    motto_lines = hdr.get("motto_lines", [])
    if is_dang and motto_lines:
        right_parts.append(
            f'<p style="margin:0;text-align:{right_align};font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["PARTY_MOTTO_SIZE"]}pt;font-weight:bold;line-height:1.25;">'
            f'<span style="display:inline-block;border-bottom:1pt solid #000;padding-bottom:3pt;">'
            f"{html.escape(motto_lines[0])}</span></p>"
        )
    elif len(motto_lines) >= 2:
        right_parts.append(
            f'<p style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["QH_SIZE"]}pt;font-weight:bold;line-height:1.25;">'
            f"{html.escape(motto_lines[0])}</p>"
        )
        right_parts.append(
            f'<p style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["TN_SIZE"]}pt;font-weight:bold;line-height:1.25;">'
            f'<span style="display:inline-block;border-bottom:1pt solid #000;padding-bottom:3pt;">'
            f"{html.escape(motto_lines[1])}</span></p>"
        )

    if hdr.get("date_line"):
        right_parts.append(
            f'<p style="margin:4pt 0 0 0;text-align:{right_align};font-family:\'Times New Roman\',serif;'
            f'font-size:{date_size}pt;font-style:italic;line-height:1.25;">'
            f'{_highlight_brackets_html(hdr["date_line"])}</p>'
        )

    header_table_html = (
        '<table style="width:100%;border-collapse:collapse;border:none;mso-table-lspace:0pt;mso-table-rspace:0pt;'
        'margin-bottom:12pt;">'
        "<tr>"
        f'<td style="width:{left_w_pct}%;vertical-align:top;padding:0 4pt 0 0;border:none;">'
        f'{"".join(left_parts)}</td>'
        f'<td style="width:{right_w_pct}%;vertical-align:top;padding:0 0 0 4pt;border:none;">'
        f'{"".join(right_parts)}</td>'
        "</tr></table>"
    )

    # Title & Summary Block
    title_parts: list[str] = []
    if title_blk.get("title"):
        title_parts.append(
            f'<p style="margin:12pt 0 2pt 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{title_size}pt;font-weight:bold;line-height:1.25;">'
            f'{_highlight_brackets_html(title_blk["title"])}</p>'
        )
    if title_blk.get("summary"):
        title_parts.append(
            f'<p style="margin:0 0 4pt 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{summary_size}pt;font-weight:bold;line-height:1.25;">'
            f'{_highlight_brackets_html(title_blk["summary"])}</p>'
        )
    if title_blk.get("title") or title_blk.get("summary"):
        title_parts.append(
            '<div style="width:26%;margin:3pt auto 10pt auto;border-bottom:1pt solid #000;"></div>'
        )

    # Kính gửi Block
    kg_html = ""
    if kg.get("prefix"):
        kg_it = "italic" if bools["KINH_GUI_ITALIC"] else "normal"
        kg_items = kg.get("items", [])
        if len(kg_items) <= 1:
            rec_text = kg_items[0] if kg_items else ""
            kg_html = (
                f'<p style="margin:6pt 0 8pt 0;text-indent:1.27cm;text-align:justify;'
                f'font-family:\'Times New Roman\',serif;font-size:{body_size}pt;line-height:1.3;">'
                f'<span style="font-style:{kg_it};">{html.escape(kg["prefix"])}</span> '
                f'<span style="font-weight:{"normal" if is_dang else "bold"};">'
                f"{_highlight_brackets_html(rec_text)}</span></p>"
            )
        else:
            rows_kg = "".join(
                f'<p style="margin:0 0 2pt 0;font-family:\'Times New Roman\',serif;'
                f'font-size:{body_size}pt;line-height:1.3;">{_highlight_brackets_html(it)}</p>'
                for it in kg_items
            )
            kg_html = (
                '<table style="width:100%;border-collapse:collapse;border:none;margin:6pt 0 8pt 0;">'
                "<tr>"
                f'<td style="width:26%;vertical-align:top;text-align:right;padding-right:6pt;border:none;'
                f'font-family:\'Times New Roman\',serif;font-size:{body_size}pt;font-style:{kg_it};">'
                f'{html.escape(kg["prefix"])}</td>'
                f'<td style="width:74%;vertical-align:top;border:none;">{rows_kg}</td>'
                "</tr></table>"
            )

    # Body Paragraphs, Page Breaks & Data Tables
    body_html_list: list[str] = []
    b_idx = 0
    while b_idx < len(body):
        p = body[b_idx]
        if p["kind"] == "PAGE_BREAK":
            body_html_list.append(
                '<div style="page-break-after:always;mso-special-character:line-break;'
                'border-bottom:1px dashed #94A3B8;margin:14pt 0;text-align:center;'
                'font-size:10pt;color:#64748B;">--- Ngắt trang (Page Break) ---</div>'
            )
            b_idx += 1
            continue

        if p["kind"] == "TABLE_ROW":
            t_rows: list[list[str]] = []
            while b_idx < len(body) and body[b_idx]["kind"] == "TABLE_ROW":
                t_rows.append(body[b_idx].get("cells", []))
                b_idx += 1
            max_c = max((len(r) for r in t_rows), default=1)
            tr_html_parts: list[str] = []
            for r_i, r_cells in enumerate(t_rows):
                tds: list[str] = []
                for c_i in range(max_c):
                    c_txt = r_cells[c_i] if c_i < len(r_cells) else ""
                    c_align = "center" if r_i == 0 else "left"
                    c_weight = "bold" if r_i == 0 else "normal"
                    tds.append(
                        f'<td style="border:1px solid #000;padding:4pt 6pt;text-align:{c_align};'
                        f'font-weight:{c_weight};font-family:\'Times New Roman\',serif;font-size:13pt;">'
                        f"{_highlight_brackets_html(c_txt)}</td>"
                    )
                tr_html_parts.append(f"<tr>{''.join(tds)}</tr>")
            body_html_list.append(
                '<table style="width:100%;border-collapse:collapse;margin:8pt 0;page-break-inside:auto;">'
                f"{''.join(tr_html_parts)}</table>"
            )
            continue

        align = p["align"].lower()
        indent = f"text-indent:{p['indent_cm']}cm;" if p["indent_cm"] > 0 else ""
        weight = "bold" if p["bold"] else "normal"
        style = "italic" if p["italic"] else "normal"
        keep_next = (
            "page-break-after:avoid;"
            if p["kind"] in ("DECISION_VERB", "ROMAN", "ARABIC")
            else ""
        )
        if p["kind"] == "DIEU" and p.get("prefix_bold"):
            inner = (
                f'<b>{_highlight_brackets_html(p["prefix_bold"])}</b> '
                f'{_highlight_brackets_html(p.get("rest_text", ""))}'
            )
        else:
            inner = _highlight_brackets_html(p["text"])
        body_html_list.append(
            f'<p style="margin:6pt 0 0 0;{indent}text-align:{align};{keep_next}'
            f'font-family:\'Times New Roman\',serif;font-size:{p["size_pt"]}pt;'
            f'font-weight:{weight};font-style:{style};line-height:1.35;">{inner}</p>'
        )
        b_idx += 1

    # Footer Table (Nơi nhận left, Signer right)
    left_ftr_parts: list[str] = []
    if ftr.get("left_signer_role"):
        left_ftr_parts.append(
            f'<p style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:bold;">'
            f'{_highlight_brackets_html(ftr["left_signer_role"])}</p>'
        )
        if ftr.get("left_signer_name"):
            left_ftr_parts.append(
                f'<p style="margin:42pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
                f'font-size:{sign_size}pt;font-weight:bold;">'
                f'{_highlight_brackets_html(ftr["left_signer_name"])}</p>'
            )
    elif ftr.get("noi_nhan_items"):
        nn_u = "underline" if bools["NN_LABEL_UNDERLINE"] else "none"
        nn_b = "bold" if bools["NN_LABEL_BOLD"] else "normal"
        nn_i = "italic" if bools["NN_LABEL_ITALIC"] else "normal"
        left_ftr_parts.append(
            f'<p style="margin:0 0 2pt 0;font-family:\'Times New Roman\',serif;'
            f'font-size:{nn_label_size}pt;font-weight:{nn_b};font-style:{nn_i};'
            f'text-decoration:{nn_u};">Nơi nhận:</p>'
        )
        for item in ftr["noi_nhan_items"]:
            left_ftr_parts.append(
                f'<p style="margin:0;font-family:\'Times New Roman\',serif;'
                f'font-size:{nn_item_size}pt;line-height:1.25;">'
                f"{_highlight_brackets_html(item)}</p>"
            )

    right_ftr_parts: list[str] = []
    if ftr.get("sign_auth"):
        right_ftr_parts.append(
            f'<p style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:bold;line-height:1.25;">'
            f'{_highlight_brackets_html(ftr["sign_auth"])}</p>'
        )
    if ftr.get("sign_role"):
        role_b = (
            "bold"
            if (not ftr.get("sign_auth") or bools["ROLE_UNDER_AUTH_BOLD"])
            else "normal"
        )
        right_ftr_parts.append(
            f'<p style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:{role_b};line-height:1.25;">'
            f'{_highlight_brackets_html(ftr["sign_role"])}</p>'
        )
    if ftr.get("sign_name"):
        right_ftr_parts.append(
            f'<p style="margin:42pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:bold;line-height:1.25;">'
            f'{_highlight_brackets_html(ftr["sign_name"])}</p>'
        )

    footer_table_html = (
        '<table style="width:100%;border-collapse:collapse;border:none;margin-top:14pt;page-break-inside:avoid;">'
        "<tr>"
        '<td style="width:50%;vertical-align:top;padding-right:6pt;border:none;">'
        f'{"".join(left_ftr_parts)}</td>'
        '<td style="width:50%;vertical-align:top;padding-left:6pt;border:none;">'
        f'{"".join(right_ftr_parts)}</td>'
        "</tr></table>"
    )

    return (
        header_table_html
        + "".join(title_parts)
        + kg_html
        + "".join(body_html_list)
        + footer_table_html
    )


def render_a4_preview_html(norm_doc: dict[str, Any]) -> str:
    """Render HTML for the interactive Web A4 Page Preview (with 297mm multi-page guide lines)."""
    inner = _build_body_inner_html(norm_doc)
    return (
        '<div class="a4-preview-sheet" style="background-color:#FFFFFF;color:#000000;'
        "background-image:repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 1px), #CBD5E1 calc(297mm - 1px), #CBD5E1 297mm);"
        "width:210mm;min-height:297mm;padding:20mm 15mm 20mm 30mm;margin:0 auto;"
        "box-sizing:border-box;font-family:'Times New Roman',Times,serif;"
        'box-shadow:0 2px 10px rgba(15,23,42,0.12);border:1px solid #CBD5E1;">'
        f"{inner}</div>"
    )


def render_mso_clipboard_html(norm_doc: dict[str, Any]) -> str:
    """Render MS Word-compatible HTML (with MSO page margins & multi-page section styles) for Clipboard Copy/Paste."""
    inner = _build_body_inner_html(norm_doc)
    return (
        '<html xmlns:o="urn:schemas-microsoft-com:office:office" '
        'xmlns:w="urn:schemas-microsoft-com:office:word" '
        'xmlns="http://www.w3.org/TR/REC-html40">'
        "<head><meta charset='utf-8'>"
        "<style>"
        "@page Section1 {size:21.0cm 29.7cm; margin:2.0cm 1.5cm 2.0cm 3.0cm; mso-header-margin:1.0cm; mso-footer-margin:1.0cm; mso-title-page:yes;}"
        "div.Section1 {page:Section1; font-family:'Times New Roman',serif;}"
        "table {border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;}"
        "</style></head>"
        f"<body><div class='Section1'>{inner}</div></body></html>"
    )


def render_normalized_plain_text(norm_doc: dict[str, Any]) -> str:
    """Reconstruct clean editable text after normalization for the Virtual Editor."""
    lines: list[str] = []
    hdr = norm_doc["header"]
    lines.extend(hdr.get("organ_lines", []))
    if hdr.get("doc_number"):
        lines.append(hdr["doc_number"])
    if hdr.get("cv_summary"):
        lines.append(hdr["cv_summary"])
    lines.extend(hdr.get("motto_lines", []))
    if hdr.get("date_line"):
        lines.append(hdr["date_line"])

    tb = norm_doc["title_block"]
    if tb.get("title"):
        lines.append(tb["title"])
    if tb.get("summary"):
        lines.append(tb["summary"])
    if tb.get("title") or tb.get("summary"):
        lines.append("-----")

    kg = norm_doc["kinh_gui"]
    if kg.get("prefix"):
        items = kg.get("items", [])
        if len(items) == 1:
            lines.append(f"{kg['prefix']} {items[0]}")
        else:
            lines.append(kg["prefix"])
            lines.extend(items)

    for p in norm_doc["body_paragraphs"]:
        lines.append(p["text"])

    ftr = norm_doc["footer"]
    if ftr.get("noi_nhan_items"):
        lines.append("Nơi nhận:")
        lines.extend(ftr["noi_nhan_items"])
    if ftr.get("sign_auth"):
        lines.append(ftr["sign_auth"])
    if ftr.get("sign_role"):
        lines.append(ftr["sign_role"])
    if ftr.get("sign_name"):
        lines.append(ftr["sign_name"])

    return "\n".join(lines)

