"""Core 6-Step Document Normalization Engine ported from ChuanHoa_VanBanDang.dotm."""

import re
from typing import Any
from app.modules.van_ban.profiles import (
    get_profile,
    TEXT_QUOC_HIEU,
    TEXT_TIEU_NGU,
    TEXT_TIEU_NGU_DANG,
)
from app.modules.van_ban.text_utils import (
    to_ascii,
    clean_para_text,
    normalize_so_ky_hieu,
    normalize_ngay_thang,
    normalize_tham_quyen,
    normalize_recipient_punctuation,
)
from app.modules.van_ban.detector import (
    resolve_profile,
    is_doc_number_line,
    is_date_line,
    is_separator_line,
    is_party_doc_title,
    split_glued_title_line,
    is_kinh_gui_start,
    is_signature_auth,
    is_signature_role,
)


def classify_body_paragraph(line: str, profile_id: str) -> dict[str, Any]:
    """Classify a body paragraph into heading level, bold, italic, alignment, and indent."""
    s = clean_para_text(line)
    s_asc = to_ascii(s)
    prof = get_profile(profile_id)
    body_size = prof["numbers"]["BODY_SIZE"]

    # Explicit Page Break: --- Ngắt trang --- or [PAGE_BREAK]
    if "NGAT TRANG" in s_asc or "PAGE BREAK" in s_asc or s == "\x0c":
        return {
            "text": "--- Ngắt trang (Page Break) ---",
            "kind": "PAGE_BREAK",
            "align": "CENTER",
            "bold": False,
            "italic": True,
            "size_pt": 11.0,
            "indent_cm": 0.0,
        }

    # Table row: | Cột 1 | Cột 2 | Cột 3 |
    if s.startswith("|") and s.endswith("|") and s.count("|") >= 3:
        cells = [c.strip() for c in s.strip("|").split("|")]
        return {
            "text": s,
            "cells": cells,
            "kind": "TABLE_ROW",
            "align": "LEFT",
            "bold": False,
            "italic": False,
            "size_pt": 13.0,
            "indent_cm": 0.0,
        }

    # Decision verb: QUYẾT ĐỊNH:
    if s_asc in ("QUYET DINH:", "QUYET DINH :"):
        return {
            "text": "QUYẾT ĐỊNH:",
            "kind": "DECISION_VERB",
            "align": "CENTER",
            "bold": True,
            "italic": False,
            "size_pt": body_size,
            "indent_cm": 0.0,
        }

    # Điều 1., Điều 2.
    m_dieu = re.match(r"^(Điều\s+\d+[\.:])(.*)$", s, flags=re.IGNORECASE)
    if m_dieu or re.match(r"^DIEU\s+\d+[\.:]", s_asc):
        dot_pos = s.find(".") if "." in s[:12] else s.find(":")
        prefix = s[: dot_pos + 1] if dot_pos > 0 else s
        rest = s[dot_pos + 1 :].strip() if dot_pos > 0 else ""
        return {
            "text": s,
            "prefix_bold": prefix,
            "rest_text": rest,
            "kind": "DIEU",
            "align": "JUSTIFY",
            "bold": False,
            "italic": False,
            "size_pt": body_size,
            "indent_cm": prof["numbers"]["INDENT_CM"],
        }

    # Roman numerals: I., II., III., IV.
    if re.match(r"^(I|II|III|IV|V|VI|VII|VIII|IX|X)[\.\-]\s+", s_asc):
        return {
            "text": s.upper() if s == s.upper() else s,
            "kind": "ROMAN",
            "align": "LEFT",
            "bold": True,
            "italic": False,
            "size_pt": body_size,
            "indent_cm": 0.0,
        }

    # Arabic headings: 1., 2., 3. (not 1.1)
    if re.match(r"^\d{1,2}\.\s+", s_asc) and not re.match(r"^\d+\.\d+", s_asc):
        return {
            "text": s,
            "kind": "ARABIC",
            "align": "JUSTIFY",
            "bold": True,
            "italic": False,
            "size_pt": body_size,
            "indent_cm": prof["numbers"]["INDENT_CM"],
        }

    # Subsections: 1.1., 1.2., a), b)
    if re.match(r"^(\d+\.\d+\.?|[a-zđ]\))\s+", s, flags=re.IGNORECASE):
        return {
            "text": s,
            "kind": "SUBITEM",
            "align": "JUSTIFY",
            "bold": False,
            "italic": False,
            "size_pt": body_size,
            "indent_cm": prof["numbers"]["INDENT_CM"],
        }

    # Legal basis: Căn cứ ..., - Căn cứ ..., Theo đề nghị ..., Xét đề nghị ...
    is_legal = (
        s_asc.startswith("CAN CU ")
        or s_asc.startswith("- CAN CU ")
        or s_asc.startswith("THEO DE NGHI ")
        or s_asc.startswith("XET DE NGHI ")
        or s_asc.startswith("- XET DE NGHI ")
    )
    if is_legal:
        return {
            "text": s,
            "kind": "LEGAL_BASIS",
            "align": "JUSTIFY",
            "bold": False,
            "italic": prof["booleans"]["LEGAL_BASIS_ITALIC"],
            "size_pt": body_size,
            "indent_cm": prof["numbers"]["INDENT_CM"],
        }

    return {
        "text": s,
        "kind": "BODY",
        "align": "JUSTIFY",
        "bold": False,
        "italic": False,
        "size_pt": body_size,
        "indent_cm": prof["numbers"]["INDENT_CM"],
    }


def normalize_document_lines(
    raw_lines: list[str], force_profile: str = "AUTO"
) -> dict[str, Any]:
    """Execute the 6-step normalization pipeline on a list of document lines."""
    # Step 0: Clean soft breaks & split glued titles
    cleaned: list[str] = []
    for raw in raw_lines:
        for sub in raw.replace("\x0b", "\n").splitlines():
            c = clean_para_text(sub)
            if not c:
                continue
            t_prefix, t_rest = split_glued_title_line(c)
            if t_prefix and t_rest:
                cleaned.append(t_prefix)
                cleaned.append(t_rest)
            else:
                cleaned.append(c)

    res_info = resolve_profile(cleaned, force_profile)
    pid = res_info["applied_profile"]
    prof = get_profile(pid)
    motto_kind = prof["strings"]["MOTTO_KIND"]

    # Step 0.3a & Step 3: Parse Header Zone (top of document before Title/Kính gửi/Body)
    organ_lines: list[str] = []
    doc_number = ""
    cv_summary = ""
    date_line = ""
    idx = 0
    n = len(cleaned)

    while idx < min(n, 12):
        line = cleaned[idx]
        s_asc = to_ascii(line)
        if is_party_doc_title(s_asc) or is_kinh_gui_start(s_asc):
            break
        if s_asc.startswith("DIEU ") or re.match(r"^(I|II|III)\.\s+", s_asc):
            break
        if "DANG CONG SAN VIET NAM" in s_asc or "CONG HOA XA HOI CHU NGHIA" in s_asc:
            idx += 1
            continue
        if "DOCLAP-TUDO" in s_asc.replace(" ", ""):
            idx += 1
            continue
        if is_separator_line(line):
            idx += 1
            continue
        if is_doc_number_line(s_asc):
            doc_number = normalize_so_ky_hieu(line, pid)
            idx += 1
            continue
        if is_date_line(s_asc):
            date_line = normalize_ngay_thang(line)
            idx += 1
            continue
        if s_asc.startswith("V/V") or s_asc.startswith("VE VIEC"):
            if not organ_lines and not doc_number:
                break
            cv_summary = line
            idx += 1
            continue
        if len(organ_lines) < 3 and len(line) < 85 and not doc_number and not date_line:
            organ_lines.append(line.upper())
            idx += 1
            continue
        break

    # Build Header Right Motto
    if motto_kind == "DANG":
        motto_lines = [TEXT_TIEU_NGU_DANG]
    else:
        motto_lines = [TEXT_QUOC_HIEU, TEXT_TIEU_NGU]

    # Step 0.3b & Step 4: Parse Title & Summary Zone
    title_text = ""
    summary_text = ""
    if idx < n:
        s_asc = to_ascii(cleaned[idx])
        if is_party_doc_title(s_asc):
            title_text = cleaned[idx].upper().rstrip(":")
            idx += 1
            if idx < n and is_separator_line(cleaned[idx]):
                idx += 1
            if idx < n:
                next_asc = to_ascii(cleaned[idx])
                if (
                    not is_kinh_gui_start(next_asc)
                    and not next_asc.startswith("CAN CU ")
                    and not next_asc.startswith("- CAN CU ")
                    and not next_asc.startswith("DIEU ")
                    and not re.match(r"^(I|II|III)\.\s+", next_asc)
                    and len(cleaned[idx]) < 220
                ):
                    summary_text = cleaned[idx]
                    idx += 1
                    # Trích yếu có thể xuống nhiều dòng (dòng tiếp bắt đầu bằng chữ thường)
                    while (
                        idx < n
                        and not is_separator_line(cleaned[idx])
                        and cleaned[idx][:1].islower()
                        and len(cleaned[idx]) < 220
                        and not summary_text.rstrip().endswith((".", ";", ":"))
                    ):
                        summary_text = f"{summary_text.rstrip()} {cleaned[idx].strip()}"
                        idx += 1
                    if idx < n and is_separator_line(cleaned[idx]):
                        idx += 1

    # Step 0.3d & Step 3.5: Scan Footer Zone from bottom (Nơi nhận & Chữ ký)
    footer_start = n
    noi_nhan_items: list[str] = []
    sign_auth = ""
    sign_role = ""
    sign_name = ""
    left_signer_role = ""
    left_signer_name = ""

    scan_from = max(idx, n - 45)
    for f_idx in range(scan_from, n):
        s_asc = to_ascii(cleaned[f_idx])
        if (
            s_asc.startswith("NOI NHAN")
            or is_signature_auth(s_asc)
            or is_signature_role(s_asc)
            or s_asc.startswith("THU KY:")
        ):
            footer_start = f_idx
            break

    in_noi_nhan = False
    sig_candidates: list[str] = []
    for f_idx in range(footer_start, n):
        f_line = cleaned[f_idx]
        f_asc = to_ascii(f_line)
        if f_asc.startswith("THU KY:"):
            parts = f_line[7:].split("|")
            left_signer_role = parts[0].strip().upper() if parts else "THƯ KÝ"
            left_signer_name = parts[1].strip() if len(parts) > 1 else ""
            continue
        if f_asc.startswith("NOI NHAN"):
            in_noi_nhan = True
            rest_nn = re.sub(r"^Nơi\s+nhận\s*:?\s*", "", f_line, flags=re.IGNORECASE).strip()
            if rest_nn:
                noi_nhan_items.append(rest_nn)
            continue
        if is_signature_auth(f_asc):
            in_noi_nhan = False
            sign_auth = normalize_tham_quyen(f_line, pid)
            continue
        if is_signature_role(f_asc) and not sign_role:
            in_noi_nhan = False
            sign_role = f_line.upper()
            continue
        if in_noi_nhan and (
            f_line.startswith("-")
            or f_asc.startswith("NHU ")
            or f_asc.startswith("LUU")
            or f_line.endswith(";")
        ):
            noi_nhan_items.append(f_line)
        else:
            in_noi_nhan = False
            sig_candidates.append(f_line)

    if sig_candidates:
        if not sign_role and len(sig_candidates) >= 2:
            sign_role = sig_candidates[0].upper()
            sign_name = sig_candidates[-1]
        else:
            sign_name = sig_candidates[-1]

    noi_nhan_items = normalize_recipient_punctuation(noi_nhan_items)

    # Step 0.3c & Step 4: Parse Kính gửi and Body Paragraphs between idx and footer_start
    kinh_gui_prefix = ""
    kinh_gui_items: list[str] = []
    body_paragraphs: list[dict[str, Any]] = []

    b_idx = idx
    while b_idx < footer_start:
        b_line = cleaned[b_idx]
        b_asc = to_ascii(b_line)
        if is_separator_line(b_line):
            b_idx += 1
            continue
        if not body_paragraphs and is_kinh_gui_start(b_asc):
            if ":" in b_line:
                k_pre, k_rest = b_line.split(":", 1)
                kinh_gui_prefix = k_pre.strip().lstrip("- ").strip() + ":"
                if k_rest.strip():
                    kinh_gui_items.append(k_rest.strip())
            else:
                kinh_gui_prefix = "Kính gửi:"
            b_idx += 1
            while b_idx < footer_start and cleaned[b_idx].startswith("-"):
                kinh_gui_items.append(cleaned[b_idx])
                b_idx += 1
            continue
        body_paragraphs.append(classify_body_paragraph(b_line, pid))
        b_idx += 1

    # Extract unit info for "Lấy từ văn bản đang mở"
    cap_tren = organ_lines[0] if len(organ_lines) >= 2 else ""
    co_quan = organ_lines[-1] if organ_lines else ""
    viet_tat = ""
    if doc_number:
        m_vt = re.search(r"[/\-]([A-ZĐ0-9]+)$", doc_number.upper())
        if m_vt:
            viet_tat = m_vt.group(1)
    dia_danh = date_line.split(",")[0].strip() if "," in date_line else ""

    return {
        "detected_profile": res_info["detected_profile"],
        "applied_profile": pid,
        "profile_source": res_info["source"],
        "mismatch_warning": res_info["mismatch_warning"],
        "profile": prof,
        "header": {
            "organ_lines": organ_lines,
            "doc_number": doc_number,
            "cv_summary": cv_summary,
            "motto_lines": motto_lines,
            "date_line": date_line,
        },
        "title_block": {
            "title": title_text,
            "summary": summary_text,
        },
        "kinh_gui": {
            "prefix": kinh_gui_prefix,
            "items": kinh_gui_items,
        },
        "body_paragraphs": body_paragraphs,
        "footer": {
            "noi_nhan_label": "Nơi nhận:" if noi_nhan_items else "",
            "noi_nhan_items": noi_nhan_items,
            "left_signer_role": left_signer_role,
            "left_signer_name": left_signer_name,
            "sign_auth": sign_auth,
            "sign_role": sign_role,
            "sign_name": sign_name,
        },
        "extracted_unit": {
            "cap_tren": cap_tren,
            "co_quan": co_quan,
            "viet_tat": viet_tat,
            "dia_danh": dia_danh,
            "tham_quyen": sign_auth,
            "chuc_vu": sign_role,
            "ho_ten": sign_name,
        },
        "raw_cleaned_lines": cleaned,
    }

