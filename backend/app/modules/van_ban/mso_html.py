"""HTML & Microsoft Office Clipboard (MSO) Renderer for 3DoHub Document Normalizer."""

import html
import re
from typing import Any


def _highlight_brackets_html(text: str) -> str:
    """Escape HTML and wrap [...] placeholders in yellow highlight span."""
    escaped = html.escape(text or "")
    escaped = re.sub(r"\[\^(\d+)\]", r"<sup>\1</sup>", escaped)
    return re.sub(
        r"(\[[^\]]+\])",
        r'<span style="background-color:#FEF08A;mso-highlight:yellow;">\1</span>',
        escaped,
    )


def _format_run(
    text: str,
    bold: bool = False,
    italic: bool = False,
    underline: bool = False,
) -> str:
    """Wrap highlighted text in semantic HTML tags for 100% MS Word & Google Docs fidelity."""
    res = _highlight_brackets_html(text)
    if bold:
        res = f"<b>{res}</b>"
    if italic:
        res = f"<i>{res}</i>"
    if underline:
        res = f'<u style="text-decoration:underline;">{res}</u>'
    return res


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
        inner = _format_run(org, bold=is_bold)
        left_parts.append(
            f'<p align="center" style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{organ_size}pt;font-weight:{weight};line-height:1.25;">{inner}</p>'
        )

    if is_dang:
        left_parts.append(
            f'<p align="center" style="margin:2pt 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{organ_size}pt;line-height:1.1;"><b>*</b></p>'
        )
    elif org_lines and bools["ORGAN_UNDERLINE"]:
        left_parts.append(
            '<p align="center" style="margin:1pt auto 3pt auto;text-align:center;'
            'font-family:\'Times New Roman\',serif;font-size:10pt;line-height:1;color:#000000;">'
            '<b>─────</b></p>'
        )

    if hdr.get("doc_number"):
        left_parts.append(
            f'<p align="center" style="margin:2pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{doc_num_size}pt;line-height:1.25;">'
            f'{_format_run(hdr["doc_number"])}</p>'
        )

    if hdr.get("cv_summary"):
        cv_it = bools["CV_SUMMARY_ITALIC"]
        style_it = "italic" if cv_it else "normal"
        left_parts.append(
            f'<p align="center" style="margin:2pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["CV_SUMMARY_SIZE"]}pt;font-style:{style_it};line-height:1.2;">'
            f'{_format_run(hdr["cv_summary"], italic=cv_it)}</p>'
        )

    # Right Header Cell: Motto + Sub-motto + Line + Date
    right_align = "right" if strs["RIGHT_ALIGN"] == "RIGHT" else "center"
    right_parts: list[str] = []
    motto_lines = hdr.get("motto_lines", [])
    if is_dang and motto_lines:
        inner_motto = _format_run(motto_lines[0], bold=True, underline=True)
        right_parts.append(
            f'<p align="{right_align}" style="margin:0;text-align:{right_align};font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["PARTY_MOTTO_SIZE"]}pt;font-weight:bold;line-height:1.25;">{inner_motto}</p>'
        )
    elif len(motto_lines) >= 2:
        inner_qh = _format_run(motto_lines[0], bold=True)
        inner_tn = _format_run(motto_lines[1], bold=True, underline=True)
        right_parts.append(
            f'<p align="center" style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["QH_SIZE"]}pt;font-weight:bold;line-height:1.25;">{inner_qh}</p>'
        )
        right_parts.append(
            f'<p align="center" style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{nums["TN_SIZE"]}pt;font-weight:bold;line-height:1.25;">{inner_tn}</p>'
        )

    if hdr.get("date_line"):
        inner_date = _format_run(hdr["date_line"], italic=True)
        right_parts.append(
            f'<p align="{right_align}" style="margin:4pt 0 0 0;text-align:{right_align};font-family:\'Times New Roman\',serif;'
            f'font-size:{date_size}pt;font-style:italic;line-height:1.25;">{inner_date}</p>'
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
        inner_title = _format_run(title_blk["title"], bold=True)
        title_parts.append(
            f'<p align="center" style="margin:12pt 0 2pt 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{title_size}pt;font-weight:bold;line-height:1.25;">{inner_title}</p>'
        )
    if title_blk.get("summary"):
        inner_sum = _format_run(title_blk["summary"], bold=True)
        title_parts.append(
            f'<p align="center" style="margin:0 0 4pt 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{summary_size}pt;font-weight:bold;line-height:1.25;">{inner_sum}</p>'
        )
    if title_blk.get("title") or title_blk.get("summary"):
        title_parts.append(
            '<p align="center" style="margin:2pt auto 8pt auto;text-align:center;'
            'font-family:\'Times New Roman\',serif;font-size:11pt;line-height:1;color:#000000;">'
            '<b>────────</b></p>'
        )

    # Kính gửi Block
    kg_html = ""
    if kg.get("prefix"):
        kg_it = bools["KINH_GUI_ITALIC"]
        style_it = "italic" if kg_it else "normal"
        prefix_html = _format_run(kg["prefix"], italic=kg_it)
        kg_items = kg.get("items", [])
        if len(kg_items) <= 1:
            rec_text = kg_items[0] if kg_items else ""
            rec_bold = not is_dang
            rec_html = _format_run(rec_text, bold=rec_bold)
            kg_html = (
                f'<p style="margin:6pt 0 8pt 0;text-indent:1.27cm;text-align:justify;'
                f'font-family:\'Times New Roman\',serif;font-size:{body_size}pt;line-height:1.3;">'
                f"{prefix_html} {rec_html}</p>"
            )
        else:
            rows_kg = "".join(
                f'<p style="margin:0 0 2pt 0;font-family:\'Times New Roman\',serif;'
                f'font-size:{body_size}pt;line-height:1.3;">{_format_run(it)}</p>'
                for it in kg_items
            )
            kg_html = (
                '<table style="width:100%;border-collapse:collapse;border:none;margin:6pt 0 8pt 0;">'
                "<tr>"
                f'<td style="width:26%;vertical-align:top;text-align:right;padding-right:6pt;border:none;'
                f'font-family:\'Times New Roman\',serif;font-size:{body_size}pt;font-style:{style_it};">'
                f'{prefix_html}</td>'
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
                    cell_inner = _format_run(c_txt, bold=(r_i == 0))
                    tds.append(
                        f'<td style="border:1px solid #000;padding:4pt 6pt;text-align:{c_align};'
                        f'font-weight:{c_weight};font-family:\'Times New Roman\',serif;font-size:13pt;">'
                        f"{cell_inner}</td>"
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
            prefix_part = _format_run(p["prefix_bold"], bold=True)
            rest_part = _format_run(p.get("rest_text", ""))
            inner = f"{prefix_part} {rest_part}"
        else:
            inner = _format_run(p["text"], bold=p["bold"], italic=p["italic"])

        body_html_list.append(
            f'<p align="{align}" style="margin:6pt 0 0 0;{indent}text-align:{align};{keep_next}'
            f'font-family:\'Times New Roman\',serif;font-size:{p["size_pt"]}pt;'
            f'font-weight:{weight};font-style:{style};line-height:1.35;">{inner}</p>'
        )
        b_idx += 1

    # Footer Table (Nơi nhận left, Signer right)
    left_ftr_parts: list[str] = []
    if ftr.get("left_signer_role"):
        left_ftr_parts.append(
            f'<p align="center" style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:bold;">'
            f'{_format_run(ftr["left_signer_role"], bold=True)}</p>'
        )
        if ftr.get("left_signer_name"):
            left_ftr_parts.append(
                f'<p align="center" style="margin:42pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
                f'font-size:{sign_size}pt;font-weight:bold;">'
                f'{_format_run(ftr["left_signer_name"], bold=True)}</p>'
            )
    elif ftr.get("noi_nhan_items"):
        nn_u = "underline" if bools["NN_LABEL_UNDERLINE"] else "none"
        nn_b = "bold" if bools["NN_LABEL_BOLD"] else "normal"
        nn_i = "italic" if bools["NN_LABEL_ITALIC"] else "normal"
        lbl = _format_run(
            "Nơi nhận:",
            bold=bools["NN_LABEL_BOLD"],
            italic=bools["NN_LABEL_ITALIC"],
            underline=bools["NN_LABEL_UNDERLINE"],
        )
        left_ftr_parts.append(
            f'<p style="margin:0 0 2pt 0;font-family:\'Times New Roman\',serif;'
            f'font-size:{nn_label_size}pt;font-weight:{nn_b};font-style:{nn_i};'
            f'text-decoration:{nn_u};">{lbl}</p>'
        )
        for item in ftr["noi_nhan_items"]:
            left_ftr_parts.append(
                f'<p style="margin:0;font-family:\'Times New Roman\',serif;'
                f'font-size:{nn_item_size}pt;line-height:1.25;">'
                f"{_format_run(item)}</p>"
            )

    right_ftr_parts: list[str] = []
    if ftr.get("sign_auth"):
        right_ftr_parts.append(
            f'<p align="center" style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:bold;line-height:1.25;">'
            f'{_format_run(ftr["sign_auth"], bold=True)}</p>'
        )
    if ftr.get("sign_role"):
        is_role_bold = not ftr.get("sign_auth") or bools["ROLE_UNDER_AUTH_BOLD"]
        role_weight = "bold" if is_role_bold else "normal"
        right_ftr_parts.append(
            f'<p align="center" style="margin:0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:{role_weight};line-height:1.25;">'
            f'{_format_run(ftr["sign_role"], bold=is_role_bold)}</p>'
        )
    if ftr.get("sign_name"):
        right_ftr_parts.append(
            f'<p align="center" style="margin:42pt 0 0 0;text-align:center;font-family:\'Times New Roman\',serif;'
            f'font-size:{sign_size}pt;font-weight:bold;line-height:1.25;">'
            f'{_format_run(ftr["sign_name"], bold=True)}</p>'
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

    fns = norm_doc.get("footnotes") or []
    footnotes_html = ""
    if fns:
        rows = "".join(
            f'<p style="margin:0;font-family:\'Times New Roman\',serif;font-size:10pt;line-height:1.2;">'
            f"<sup>{html.escape(str(fn['n']))}</sup> {_highlight_brackets_html(fn['text'])}</p>"
            for fn in fns
        )
        footnotes_html = (
            '<p style="margin:10pt 0 2pt 0;font-family:\'Times New Roman\',serif;font-size:10pt;line-height:1;">'
            "<b>────────</b></p>" + rows
        )

    return (
        header_table_html
        + "".join(title_parts)
        + kg_html
        + "".join(body_html_list)
        + footer_table_html
        + footnotes_html
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
        "u {text-decoration:underline;}"
        "b, strong {font-weight:bold;}"
        "i, em {font-style:italic;}"
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

    for fn in norm_doc.get("footnotes") or []:
        lines.append(f"[^{fn['n']}]: {fn['text']}")

    return "\n".join(lines)
