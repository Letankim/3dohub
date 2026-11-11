"""Extended catalog loader and builder for 165+ anonymized document templates."""

import os
import re
import json
from typing import Any, Optional

_EXTENDED_CATALOG_CACHE: Optional[list[dict[str, Any]]] = None
_CATALOG_PATH = os.path.join(os.path.dirname(__file__), "extended_templates_catalog.json")


def load_extended_catalog() -> list[dict[str, Any]]:
    """Load the 165+ extended templates from JSON cache."""
    global _EXTENDED_CATALOG_CACHE
    if _EXTENDED_CATALOG_CACHE is not None:
        return _EXTENDED_CATALOG_CACHE

    if os.path.exists(_CATALOG_PATH):
        try:
            with open(_CATALOG_PATH, "r", encoding="utf-8") as f:
                _EXTENDED_CATALOG_CACHE = json.load(f)
        except Exception:
            _EXTENDED_CATALOG_CACHE = []
    else:
        _EXTENDED_CATALOG_CACHE = []

    return _EXTENDED_CATALOG_CACHE


def find_extended_template(tag_or_id: str) -> Optional[dict[str, Any]]:
    """Find a template in the extended catalog by tag or ID."""
    norm = (tag_or_id or "").strip().upper()
    for item in load_extended_catalog():
        if item["tag"].upper() == norm or item["id"].upper() == norm:
            return item
    return None


def get_extended_templates_list(
    category: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Return formatted template records for the extended catalog."""
    catalog = load_extended_catalog()
    cat_norm = (category or "").strip().upper()
    out = []
    for item in catalog:
        if cat_norm and item["category"].upper() != cat_norm:
            continue
        out.append(
            {
                "id": item["id"],
                "tag": item["tag"],
                "code": item["code"],
                "name": item["name"],
                "doc_type": item["doc_type"],
                "category": item["category"],
                "categoryLabel": item["categoryLabel"],
                "categoryColor": item.get("categoryColor", "blue"),
                "legal_basis": item["legal_basis"],
                "description": item["description"],
                "keywords": item["keywords"],
                "line_count": item["line_count"],
                "is_extended": True,
            }
        )
    return out


def build_raw_text_from_extended(
    tpl: dict[str, Any], unit_info: Optional[dict[str, str]] = None
) -> str:
    """Build raw document text from an extended template and inject unit info placeholders."""
    raw = tpl.get("raw_text") or ""
    if not unit_info:
        return raw

    cap_tren = (unit_info.get("cap_tren") or "").strip()
    co_quan = (unit_info.get("co_quan") or "").strip()
    viet_tat = (unit_info.get("viet_tat") or "").strip()
    dia_danh = (unit_info.get("dia_danh") or "").strip()
    tham_quyen = (unit_info.get("tham_quyen") or "").strip()
    chuc_vu = (unit_info.get("chuc_vu") or "").strip()
    ho_ten = (unit_info.get("ho_ten") or "").strip()

    res = raw
    if cap_tren:
        res = re.sub(r"\[?ĐẢNG BỘ CẤP TRÊN TRỰC TIẾP\]?", cap_tren, res)
        res = re.sub(r"\[?TÊN CƠ QUAN CẤP TRÊN(?:\s*\(NẾU CÓ\))?\]?", cap_tren, res)
        res = re.sub(r"TỈNH ỦY\s*\.\.\.", cap_tren, res)
    if co_quan:
        res = re.sub(r"\[?ĐẢNG ỦY / CHI BỘ BAN HÀNH\]?", co_quan, res)
        res = re.sub(r"\[?TÊN CƠ QUAN(?:,\s*TỔ CHỨC)? BAN HÀNH\]?", co_quan, res)
        res = re.sub(r"TÊN CƠ QUAN,\s*TỔ CHỨC", co_quan, res)
        res = re.sub(r"ỦY BAN NHÂN DÂN\s*TỈNH\s*\.\.\.", co_quan, res)
    if dia_danh:
        res = re.sub(r"\[?Địa danh\]?", dia_danh, res)
        res = re.sub(r"…+\[\^?\d*\]?…*,\s*ngày", f"{dia_danh}, ngày", res)
        res = re.sub(r"\.{3,},\s*ngày", f"{dia_danh}, ngày", res)
    if tham_quyen:
        res = re.sub(r"\[?TM\.\s*/\s*KT\.\s*/\s*TL\.\s*\.\.\.\]?", tham_quyen, res)
        res = re.sub(r"T/M BAN THƯỜNG VỤ", tham_quyen, res)
        res = re.sub(r"QUYỀN HẠN,\s*CHỨC VỤ CỦA NGƯỜI KÝ", tham_quyen, res)
    if chuc_vu:
        res = re.sub(r"\[?CHỨC VỤ NGƯỜI KÝ\]?", chuc_vu, res)
        res = re.sub(r"\(Chữ ký[^)]*\)", chuc_vu, res)
    if ho_ten:
        res = re.sub(r"\[?Họ và tên(?: người ký)?\]?", ho_ten, res)

    return res
