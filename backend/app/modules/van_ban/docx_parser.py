"""DOCX parser and text/footnote extractor for 3DoHub Document Normalization module."""

import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import Any
from docx import Document
from docx.oxml.ns import qn

_W_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
_SUPERSCRIPT_MAP = {
    "¹": "1", "²": "2", "³": "3", "⁴": "4", "⁵": "5",
    "⁶": "6", "⁷": "7", "⁸": "8", "⁹": "9", "⁰": "0",
}


def _extract_docx_footnotes(file_bytes: bytes) -> dict[str, str]:
    """Extract footnote id -> text mapping from word/footnotes.xml in a .docx archive."""
    footnotes: dict[str, str] = {}
    try:
        with zipfile.ZipFile(io.BytesIO(file_bytes), "r") as z:
            if "word/footnotes.xml" not in z.namelist():
                return footnotes
            xml_data = z.read("word/footnotes.xml")
            root = ET.fromstring(xml_data)
            for fn in root.findall(f"{{{_W_NS}}}footnote"):
                fn_type = fn.attrib.get(f"{{{_W_NS}}}type")
                fn_id = fn.attrib.get(f"{{{_W_NS}}}id")
                if not fn_id or fn_type in ("separator", "continuationSeparator"):
                    continue
                p_texts: list[str] = []
                for p in fn.findall(f"{{{_W_NS}}}p"):
                    runs = [t.text for t in p.iter(f"{{{_W_NS}}}t") if t.text]
                    t_full = "".join(runs).strip()
                    if t_full:
                        p_texts.append(t_full)
                fn_body = " ".join(p_texts).strip()
                # Remove leading footnote number or tab if present (e.g. "1\tTỷ lệ..." or "1. Tỷ lệ...")
                fn_body = re.sub(r"^(\d+|[¹²³⁴⁵⁶⁷⁸⁹])[\.\:\s\t]+", "", fn_body).strip()
                if fn_body:
                    footnotes[str(fn_id)] = fn_body
    except Exception:
        pass
    return footnotes


def _extract_p_text_with_footnotes(
    p_el: Any,
    footnotes_map: dict[str, str],
    id_to_seq: dict[str, int],
    ordered_footnotes: list[tuple[str, str]],
) -> str:
    """Extract text from a <w:p> element, converting <w:footnoteReference> and superscript runs to [^n]."""
    parts: list[str] = []

    # Check for paragraph-level pageBreakBefore
    pPr = p_el.find(f"{{{_W_NS}}}pPr")
    if pPr is not None and pPr.find(f"{{{_W_NS}}}pageBreakBefore") is not None:
        parts.append("[PAGE_BREAK]\n")

    for child in p_el:
        tag = child.tag.split("}")[-1]
        if tag == "r":
            # Check for page break in run: <w:br w:type="page"/>
            for br in child.findall(f"{{{_W_NS}}}br"):
                b_type = br.attrib.get(f"{{{_W_NS}}}type") or br.attrib.get("type")
                if b_type == "page":
                    parts.append("\n[PAGE_BREAK]\n")

            fn_ref = child.find(f"{{{_W_NS}}}footnoteReference")
            if fn_ref is not None:
                fn_id = fn_ref.attrib.get(f"{{{_W_NS}}}id") or fn_ref.attrib.get("id")
                if fn_id and fn_id in footnotes_map:
                    if fn_id not in id_to_seq:
                        seq_num = len(id_to_seq) + 1
                        id_to_seq[fn_id] = seq_num
                        ordered_footnotes.append((str(seq_num), footnotes_map[fn_id]))
                    parts.append(f"[^{id_to_seq[fn_id]}]")
                elif fn_id:
                    parts.append(f"[^{fn_id}]")
                continue

            rPr = child.find(f"{{{_W_NS}}}rPr")
            is_sup = False
            if rPr is not None:
                va = rPr.find(f"{{{_W_NS}}}vertAlign")
                if va is not None and (
                    va.attrib.get(f"{{{_W_NS}}}val") == "superscript"
                    or va.attrib.get("val") == "superscript"
                ):
                    is_sup = True
                rs = rPr.find(f"{{{_W_NS}}}rStyle")
                if rs is not None and (
                    rs.attrib.get(f"{{{_W_NS}}}val") == "FootnoteReference"
                    or rs.attrib.get("val") == "FootnoteReference"
                ):
                    is_sup = True

            run_text = "".join(t.text for t in child.findall(f"{{{_W_NS}}}t") if t.text)
            if is_sup and re.fullmatch(r"\d+", run_text.strip()):
                parts.append(f"[^{run_text.strip()}]")
            else:
                parts.append(run_text)
        elif tag == "footnoteReference":
            fn_id = child.attrib.get(f"{{{_W_NS}}}id") or child.attrib.get("id")
            if fn_id and fn_id in footnotes_map:
                if fn_id not in id_to_seq:
                    seq_num = len(id_to_seq) + 1
                    id_to_seq[fn_id] = seq_num
                    ordered_footnotes.append((str(seq_num), footnotes_map[fn_id]))
                parts.append(f"[^{id_to_seq[fn_id]}]")
            elif fn_id:
                parts.append(f"[^{fn_id}]")
        elif tag == "hyperlink":
            for r in child.findall(f"{{{_W_NS}}}r"):
                parts.append("".join(t.text for t in r.findall(f"{{{_W_NS}}}t") if t.text))
        elif tag == "t" and child.text:
            parts.append(child.text)

    text = "".join(parts).strip()

    # Convert inline unicode superscripts if present (e.g. đảng viên¹ -> đảng viên[^1])
    if any(k in text for k in _SUPERSCRIPT_MAP):
        text = re.sub(
            r"([¹²³⁴⁵⁶⁷⁸⁹]+)",
            lambda m: "[^" + "".join(_SUPERSCRIPT_MAP.get(c, c) for c in m.group(1)) + "]",
            text,
        )

    # Standardize bottom footnote lines starting with "[^1] Nội dung" -> "[^1]: Nội dung"
    m_sup = re.match(r"^\[\^(\d+)\][\.\:\s\t]*(.+)$", text)
    if m_sup:
        text = f"[^{m_sup.group(1)}]: {m_sup.group(2)}"

    return text


def extract_lines_from_docx_bytes(file_bytes: bytes) -> list[str]:
    """Extract all lines from an uploaded .docx file (including Header/Footer tables, body, and footnotes)."""
    doc = Document(io.BytesIO(file_bytes))
    lines: list[str] = []
    footnotes_map = _extract_docx_footnotes(file_bytes)
    id_to_seq: dict[str, int] = {}
    ordered_footnotes: list[tuple[str, str]] = []

    def _add_p_line(p_text: str) -> None:
        if not p_text:
            return
        for sub in p_text.splitlines():
            s_clean = sub.strip()
            if s_clean:
                lines.append(s_clean)

    # Iterate through document body elements in document order (tables and paragraphs)
    for child in doc.element.body.iterchildren():
        tag = child.tag.split("}")[-1]
        if tag == "p":
            full_p = _extract_p_text_with_footnotes(child, footnotes_map, id_to_seq, ordered_footnotes)
            _add_p_line(full_p)
        elif tag == "tbl":
            rows_els = list(child.iter(qn("w:tr")))
            # If table has >= 2 rows, extract as pipe-delimited body data table rows
            if len(rows_els) >= 2:
                for tr_el in rows_els:
                    row_cells: list[str] = []
                    for tc_el in tr_el.findall(qn("w:tc")):
                        cell_paras = []
                        for p_el in tc_el.iter(qn("w:p")):
                            t_str = _extract_p_text_with_footnotes(p_el, footnotes_map, id_to_seq, ordered_footnotes)
                            if t_str:
                                cell_paras.append(t_str)
                        row_cells.append(" ".join(cell_paras))
                    if any(row_cells):
                        lines.append("| " + " | ".join(row_cells) + " |")
            else:
                for cell in child.iter(qn("w:tc")):
                    for p_el in cell.iter(qn("w:p")):
                        full_p = _extract_p_text_with_footnotes(p_el, footnotes_map, id_to_seq, ordered_footnotes)
                        _add_p_line(full_p)

    # Append referenced footnotes as "[^n]: text" lines at the end of the document
    for seq_str, fn_text in ordered_footnotes:
        lines.append(f"[^{seq_str}]: {fn_text}")

    # Append any remaining unreferenced footnotes from word/footnotes.xml
    for fn_id, fn_text in footnotes_map.items():
        if fn_id not in id_to_seq:
            seq_num = len(id_to_seq) + 1
            id_to_seq[fn_id] = seq_num
            lines.append(f"[^{seq_num}]: {fn_text}")

    # Only if document did NOT have word/footnotes.xml, check for manual bottom footnotes with explicit bracket or superscript
    if not footnotes_map and not ordered_footnotes:
        all_body_text = "\n".join(lines)
        ref_nums = set(re.findall(r"\[\^(\d+)\]", all_body_text))
        if ref_nums:
            cleaned_lines: list[str] = []
            for l in lines:
                m_fn_body = re.match(r"^(\[|\^)?(\d+|[¹²³⁴⁵⁶⁷⁸⁹]+)(\])?[\.\:\s\t]+(.+)$", l.strip())
                if (
                    m_fn_body
                    and (m_fn_body.group(1) or m_fn_body.group(3) or any(c in m_fn_body.group(2) for c in _SUPERSCRIPT_MAP))
                    and m_fn_body.group(2) in ref_nums
                    and not l.strip().lower().startswith(("điều", "dieu", "phần", "chương"))
                ):
                    n_val = "".join(_SUPERSCRIPT_MAP.get(c, c) for c in m_fn_body.group(2))
                    cleaned_lines.append(f"[^{n_val}]: {m_fn_body.group(4).strip()}")
                else:
                    cleaned_lines.append(l)
            lines = cleaned_lines

    return lines

