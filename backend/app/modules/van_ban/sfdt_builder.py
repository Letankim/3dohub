"""SFDT (Syncfusion Document Editor JSON) builder for the normalized document.

Produces a native Word-like document (real footnotes, header page number from page 2,
A4 margins 20-20-30-15mm) that Syncfusion DocumentEditor opens without any server service.
"""

import re
from typing import Any

FONT = "Times New Roman"
PT_PER_CM = 28.3465
PAGE_W, PAGE_H = 595.3, 841.9
M_TOP, M_BOTTOM, M_LEFT, M_RIGHT = 56.7, 56.7, 85.05, 42.5
CONTENT_W = round(PAGE_W - M_LEFT - M_RIGHT, 2)
SEP_LINE = "────────"
_TOKEN_RE = re.compile(r"(\[\^\d+\]|\[[^\]]+\])")
_ALIGN = {"left": "Left", "right": "Right", "center": "Center", "justify": "Justify"}


def _cf(size: float, bold: bool = False, italic: bool = False, underline: bool = False,
        highlight: bool = False, sup: bool = False) -> dict[str, Any]:
    return {
        "fontFamily": FONT,
        "fontSize": size,
        "bold": bold,
        "italic": italic,
        "underline": "Single" if underline else "None",
        "highlightColor": "Yellow" if highlight else "NoColor",
        "baselineAlignment": "Superscript" if sup else "Normal",
        "fontColor": "#000000",
    }


def _para(inlines: list[dict[str, Any]], align: str = "Left", size: float = 13,
          first_line: float = 0, before: float = 0, after: float = 0,
          line: float = 1.15, keep_next: bool = False) -> dict[str, Any]:
    return {
        "paragraphFormat": {
            "textAlignment": align,
            "firstLineIndent": first_line,
            "leftIndent": 0,
            "spaceBeforeAuto": False,
            "spaceAfterAuto": False,
            "beforeSpacing": before,
            "afterSpacing": after,
            "lineSpacing": line,
            "lineSpacingType": "Multiple",
            "keepWithNext": keep_next,
        },
        "characterFormat": _cf(size),
        "inlines": inlines,
    }


class _Builder:
    """Holds the footnote map so [^n] markers become real Word footnotes."""

    def __init__(self, footnotes: list[dict[str, str]]):
        self.fn = {str(f["n"]): f["text"] for f in footnotes}

    def runs(self, text: str, size: float, bold: bool = False, italic: bool = False,
             underline: bool = False) -> list[dict[str, Any]]:
        out: list[dict[str, Any]] = []
        for part in _TOKEN_RE.split(text or ""):
            if not part:
                continue
            m = re.fullmatch(r"\[\^(\d+)\]", part)
            if m and m.group(1) in self.fn:
                fn_txt = self.fn[m.group(1)]
                out.append({
                    "footnoteType": "Footnote",
                    "characterFormat": _cf(size, sup=True),
                    "blocks": [_para(
                        [
                            {"text": "\u0002", "characterFormat": _cf(10, sup=True)},
                            {"text": f" {fn_txt}", "characterFormat": _cf(10)},
                        ],
                        size=10, line=1.0, after=2,
                    )],
                })
                continue
            hl = part.startswith("[") and part.endswith("]") and not m
            out.append({"text": part, "characterFormat": _cf(size, bold, italic, underline, hl)})
        return out

    def p(self, text: str, size: float, align: str = "Left", bold: bool = False,
          italic: bool = False, underline: bool = False, **kw: Any) -> dict[str, Any]:
        return _para(self.runs(text, size, bold, italic, underline), align, size, **kw)


def _borders(visible: bool) -> dict[str, Any]:
    style = {"lineStyle": "Single", "lineWidth": 0.5, "color": "#000000"} if visible else {
        "lineStyle": "None", "lineWidth": 0}
    return {k: dict(style) for k in ("top", "bottom", "left", "right")}


def _cell(blocks: list[dict[str, Any]], width: float, visible: bool = False) -> dict[str, Any]:
    return {
        "blocks": blocks or [_para([])],
        "cellFormat": {
            "columnSpan": 1, "rowSpan": 1, "preferredWidth": width,
            "preferredWidthType": "Point", "verticalAlignment": "Top",
            "leftMargin": 2.5 if visible else 0, "rightMargin": 2.5 if visible else 0,
            "topMargin": 2 if visible else 0, "bottomMargin": 2 if visible else 0,
            "borders": _borders(visible),
        },
    }


def _table(rows: list[list[list[dict[str, Any]]]], widths: list[float], visible: bool = False) -> dict[str, Any]:
    return {
        "rows": [{
            "rowFormat": {"allowBreakAcrossPages": False, "isHeader": False, "height": 1,
                          "heightType": "AtLeast"},
            "cells": [_cell(c, widths[i], visible) for i, c in enumerate(r)],
        } for r in rows],
        "grid": widths,
        "tableFormat": {
            "allowAutoFit": False, "leftIndent": 0, "preferredWidth": sum(widths),
            "preferredWidthType": "Point", "borders": _borders(visible),
        },
        "title": None, "description": None,
    }


def _page_number_header() -> dict[str, Any]:
    cf = _cf(13)
    return {"blocks": [_para([
        {"hasFieldEnd": True, "fieldType": 0, "characterFormat": cf},
        {"text": " PAGE ", "characterFormat": cf},
        {"fieldType": 1, "characterFormat": cf},
        {"text": "2", "characterFormat": cf},
        {"fieldType": 2, "characterFormat": cf},
    ], align="Center")]}


def _header_blocks(b: _Builder, norm: dict[str, Any]) -> list[dict[str, Any]]:
    prof = norm["profile"]
    nums, bools, strs = prof["numbers"], prof["booleans"], prof["strings"]
    hdr = norm["header"]
    is_dang = strs["MOTTO_KIND"] == "DANG"
    org_size = nums["ORGAN_SIZE"]
    left_w = round(CONTENT_W * nums["HDR_LEFT_MM"] / (nums["HDR_LEFT_MM"] + nums["HDR_RIGHT_MM"]), 2)
    widths = [left_w, round(CONTENT_W - left_w, 2)]

    left: list[dict[str, Any]] = []
    orgs = hdr.get("organ_lines", [])
    for i, org in enumerate(orgs):
        bold = i == len(orgs) - 1 or len(orgs) == 1
        left.append(b.p(org, org_size, "Center", bold=bold, line=1.0))
    if is_dang:
        left.append(b.p("*", org_size, "Center", bold=True, line=1.0))
    elif orgs and bools["ORGAN_UNDERLINE"]:
        left.append(b.p("─────", 10, "Center", bold=True, line=1.0))
    if hdr.get("doc_number"):
        left.append(b.p(hdr["doc_number"], nums["DOC_NUMBER_SIZE"], "Center", before=2, line=1.0))
    if hdr.get("cv_summary"):
        left.append(b.p(hdr["cv_summary"], nums["CV_SUMMARY_SIZE"], "Center",
                        italic=bools["CV_SUMMARY_ITALIC"], before=2, line=1.0))

    right_align = "Right" if strs["RIGHT_ALIGN"] == "RIGHT" else "Center"
    right: list[dict[str, Any]] = []
    motto = hdr.get("motto_lines", [])
    if is_dang and motto:
        right.append(b.p(motto[0], nums["PARTY_MOTTO_SIZE"], right_align, bold=True, underline=True, line=1.0))
    elif len(motto) >= 2:
        right.append(b.p(motto[0], nums["QH_SIZE"], "Center", bold=True, line=1.0))
        right.append(b.p(motto[1], nums["TN_SIZE"], "Center", bold=True, underline=True, line=1.0))
    if hdr.get("date_line"):
        right.append(b.p(hdr["date_line"], nums["DATE_SIZE"], right_align, italic=True, before=4, line=1.0))

    return [_table([[left, right]], widths), _para([], size=6)]


def _body_blocks(b: _Builder, norm: dict[str, Any]) -> list[dict[str, Any]]:
    nums = norm["profile"]["numbers"]
    bools = norm["profile"]["booleans"]
    is_dang = norm["profile"]["strings"]["MOTTO_KIND"] == "DANG"
    blocks: list[dict[str, Any]] = []

    tb = norm["title_block"]
    if tb.get("title"):
        blocks.append(b.p(tb["title"], nums["TITLE_SIZE"], "Center", bold=True, before=12, after=2, line=1.0))
    if tb.get("summary"):
        blocks.append(b.p(tb["summary"], nums["SUMMARY_SIZE"], "Center", bold=True, after=2, line=1.0))
    if tb.get("title") or tb.get("summary"):
        blocks.append(b.p(SEP_LINE, 11, "Center", bold=True, after=8, line=1.0))

    kg = norm["kinh_gui"]
    if kg.get("prefix"):
        items = kg.get("items", [])
        size = nums["BODY_SIZE"]
        runs = b.runs(kg["prefix"] + " ", size, italic=bools["KINH_GUI_ITALIC"])
        runs += b.runs("; ".join(items), size, bold=not is_dang)
        blocks.append(_para(runs, "Justify", size, nums["INDENT_CM"] * PT_PER_CM, 6, 6))

    body = norm["body_paragraphs"]
    i = 0
    while i < len(body):
        item = body[i]
        if item["kind"] == "PAGE_BREAK":
            blocks.append(_para([{"text": "\f", "characterFormat": _cf(13)}]))
            i += 1
            continue
        if item["kind"] == "TABLE_ROW":
            rows: list[list[str]] = []
            while i < len(body) and body[i]["kind"] == "TABLE_ROW":
                rows.append(body[i].get("cells", []))
                i += 1
            cols = max((len(r) for r in rows), default=1)
            w = round(CONTENT_W / cols, 2)
            t_rows = [[[b.p(r[c] if c < len(r) else "", 13, "Center" if ri == 0 else "Left", bold=ri == 0,
                            line=1.0)] for c in range(cols)] for ri, r in enumerate(rows)]
            blocks.append(_table(t_rows, [w] * cols, visible=True))
            blocks.append(_para([], size=6))
            continue
        size = item["size_pt"]
        keep = item["kind"] in ("DECISION_VERB", "ROMAN", "ARABIC")
        if item["kind"] == "DIEU" and item.get("prefix_bold"):
            runs = b.runs(item["prefix_bold"], size, bold=True) + b.runs(" " + item.get("rest_text", ""), size)
        else:
            runs = b.runs(item["text"], size, bold=item["bold"], italic=item["italic"])
        blocks.append(_para(runs, _ALIGN.get(item["align"].lower(), "Justify"), size,
                            (item["indent_cm"] or 0) * PT_PER_CM, 6, 0, 1.2, keep))
        i += 1
    return blocks


def _footer_blocks(b: _Builder, norm: dict[str, Any]) -> list[dict[str, Any]]:
    nums, bools = norm["profile"]["numbers"], norm["profile"]["booleans"]
    ftr = norm["footer"]
    sign = nums["SIGN_SIZE"]
    left: list[dict[str, Any]] = []
    if ftr.get("left_signer_role"):
        left.append(b.p(ftr["left_signer_role"], sign, "Center", bold=True, line=1.0))
        if ftr.get("left_signer_name"):
            left.append(b.p(ftr["left_signer_name"], sign, "Center", bold=True, before=42, line=1.0))
    elif ftr.get("noi_nhan_items"):
        left.append(b.p("Nơi nhận:", nums["NN_LABEL_SIZE"], bold=bools["NN_LABEL_BOLD"],
                        italic=bools["NN_LABEL_ITALIC"], underline=bools["NN_LABEL_UNDERLINE"], line=1.0))
        left += [b.p(it, nums["NN_ITEM_SIZE"], line=1.0) for it in ftr["noi_nhan_items"]]
    right: list[dict[str, Any]] = []
    if ftr.get("sign_auth"):
        right.append(b.p(ftr["sign_auth"], sign, "Center", bold=True, line=1.0))
    if ftr.get("sign_role"):
        bold = not ftr.get("sign_auth") or bools["ROLE_UNDER_AUTH_BOLD"]
        right.append(b.p(ftr["sign_role"], sign, "Center", bold=bold, line=1.0))
    if ftr.get("sign_name"):
        right.append(b.p(ftr["sign_name"], sign, "Center", bold=True, before=42, line=1.0))
    half = round(CONTENT_W / 2, 2)
    return [_para([], size=8), _table([[left, right]], [half, round(CONTENT_W - half, 2)])]


def build_sfdt(norm_doc: dict[str, Any]) -> dict[str, Any]:
    """Build the SFDT JSON dict for Syncfusion DocumentEditor."""
    b = _Builder(norm_doc.get("footnotes") or [])
    blocks = _header_blocks(b, norm_doc) + _body_blocks(b, norm_doc) + _footer_blocks(b, norm_doc)
    return {
        "sections": [{
            "blocks": blocks,
            "headersFooters": {
                "header": _page_number_header(),
                "firstPageHeader": {"blocks": [_para([])]},
            },
            "sectionFormat": {
                "pageWidth": PAGE_W, "pageHeight": PAGE_H,
                "leftMargin": M_LEFT, "rightMargin": M_RIGHT,
                "topMargin": M_TOP, "bottomMargin": M_BOTTOM,
                "headerDistance": 28.35, "footerDistance": 28.35,
                "differentFirstPage": True, "differentOddAndEvenPages": False,
                "footNoteNumberFormat": "Arabic",
                "restartIndexForFootnotes": "DoNotRestart",
                "initialFootNoteNumber": 1,
            },
        }],
        "characterFormat": _cf(13),
        "paragraphFormat": {"afterSpacing": 0, "lineSpacing": 1.0, "lineSpacingType": "Multiple"},
        "footnotes": {
            "separator": [
                _para([{"text": "\u0003", "characterFormat": {"fontColor": "#00000000"}}], size=10, line=1.0)
            ],
            "continuationSeparator": [
                _para([{"text": "\u0004", "characterFormat": {"fontColor": "#00000000"}}], size=10, line=1.0)
            ],
        },
        "background": {"color": "#FFFFFFFF"},
        "styles": [],
    }

