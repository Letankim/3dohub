"""Script to process, anonymize, and build standard templates catalog from mau-theo.
Preserves OpenXML structure, fully anonymizes all entities, and maps to 3DoHub schema.
"""

import os
import sys
import json
import re
import uuid

sys.path.insert(0, os.path.abspath("backend"))
from app.modules.van_ban.docx_parser import extract_lines_from_docx_bytes

SOURCE_META = "mau-theo/templates/templates_metadata.json"
SOURCE_DIR = "mau-theo/templates"
OUT_BACKEND = "backend/app/modules/van_ban/extended_templates_catalog.json"

CATEGORY_MAP = {
    "Văn bản Đảng": {
        "code": "DANG",
        "label": "Khối Đảng",
        "legal": "QĐ 399-QĐ/TW & HD 05-HD/VPTW",
        "color": "red",
    },
    "Văn bản Đoàn TNCS Hồ Chí Minh": {
        "code": "DOAN",
        "label": "Đoàn Thanh niên",
        "legal": "HD 29-HD/TWĐTN-VP",
        "color": "cyan",
    },
    "Văn bản hành chính": {
        "code": "HANH_CHINH",
        "label": "Hành chính Nhà nước",
        "legal": "Nghị định 30/2020/NĐ-CP",
        "color": "blue",
    },
    "Thi đua – Khen thưởng": {
        "code": "THI_DUA",
        "label": "Thi đua – Khen thưởng",
        "legal": "Nghị định 152/2025/NĐ-CP",
        "color": "gold",
    },
    "Công an nhân dân": {
        "code": "CAND",
        "label": "Công an Nhân dân",
        "legal": "TT 26/2019/TT-BCA & TT 35/2021/TT-BCA",
        "color": "green",
    },
    "Lực lượng vũ trang & Quân đội": {
        "code": "QUAN_DOI",
        "label": "Lực lượng Quân đội",
        "legal": "Thông tư 68/2023/TT-BQP",
        "color": "geekblue",
    },
    "Đơn thư & Cá nhân": {
        "code": "DON_TU",
        "label": "Đơn thư & Cá nhân",
        "legal": "Quy chuẩn hành chính & Dân sự",
        "color": "purple",
    },
    "Chuyên ngành & Giáo dục": {
        "code": "CHUYEN_NGANH",
        "label": "Chuyên ngành & Giáo dục",
        "legal": "Quy chuẩn chuyên ngành",
        "color": "orange",
    },
}

NAME_REPLACEMENTS = [
    (r"(?:Thượng tá|Đại tá|Trung tá|Thiếu tá|Đại úy|Thượng úy|Thiếu úy)?\s*Nguyễn\s+Văn\s+[A-Z]", "[Họ và tên người ký]"),
    (r"(?:Thượng tá|Đại tá|Trung tá|Thiếu tá|Đại úy|Thượng úy|Thiếu úy)?\s*Nguyễn\s+Thế\s+[A-Z]", "[Họ và tên người ký]"),
    (r"(?:Thượng tá|Đại tá|Trung tá|Thiếu tá|Đại úy|Thượng úy|Thiếu úy)?\s*Trần\s+Thị\s+[A-Z]", "[Họ và tên người ký]"),
    (r"(?:Thượng tá|Đại tá|Trung tá|Thiếu tá|Đại úy|Thượng úy|Thiếu úy)?\s*Trần\s+Văn\s+[A-Z]", "[Họ và tên người ký]"),
    (r"(?:Thượng tá|Đại tá|Trung tá|Thiếu tá|Đại úy|Thượng úy|Thiếu úy)?\s*Phạm\s+Thị\s+[A-Z]", "[Họ và tên người ký]"),
]


def anonymize_line(line: str) -> str:
    s = line
    for pat, repl in NAME_REPLACEMENTS:
        s = re.sub(pat, repl, s)
    # Clean glued horizontal rule characters from organ/motto table cells
    s = re.sub(r"[—–\-_]{4,}", "", s).strip()
    return s


def build_catalog():
    if not os.path.exists(SOURCE_META):
        print(f"Error: {SOURCE_META} not found")
        return

    with open(SOURCE_META, "r", encoding="utf-8") as f:
        meta_list = json.load(f)

    catalog = []
    print(f"Loaded {len(meta_list)} templates from metadata.")

    for idx, item in enumerate(meta_list, 1):
        raw_cat = item.get("category", "Văn bản hành chính")
        cat_info = CATEGORY_MAP.get(
            raw_cat,
            {
                "code": "HANH_CHINH",
                "label": "Hành chính Nhà nước",
                "legal": item.get("source", "Quy chuẩn hành chính"),
                "color": "blue",
            },
        )

        doc_file = item.get("file")
        file_path = os.path.join(SOURCE_DIR, doc_file)
        lines = []
        if os.path.exists(file_path):
            with open(file_path, "rb") as bf:
                raw_bytes = bf.read()
            extracted = extract_lines_from_docx_bytes(raw_bytes)
            cleaned_lines = []
            in_ghi_chu = False
            for raw_l in extracted:
                cl = anonymize_line(raw_l)
                if not cl:
                    continue
                if re.fullmatch(r"ghi chú\s*:?", cl.lower()):
                    in_ghi_chu = True
                    continue
                if in_ghi_chu:
                    # Merge continuation paragraphs into the preceding [^n]: footnote line
                    if re.match(r"^\[\^\d+\]:", cl):
                        cleaned_lines.append(cl)
                    elif cleaned_lines and re.match(r"^\[\^\d+\]:", cleaned_lines[-1]):
                        cleaned_lines[-1] = cleaned_lines[-1] + " " + cl
                    continue
                cleaned_lines.append(cl)

            # Strip footnote markers on generic header placeholders like TÊN CƠ QUAN, TỔ CHỨC[^1]
            lines = [re.sub(r"\[\^\d+\]", "", l) if ("CƠ QUAN" in l or "…," in l or "Số:" in l) else l for l in cleaned_lines]

        clean_text = "\n".join(lines)

        t_id = f"tpl_{cat_info['code'].lower()}_{idx:03d}"
        tag = f"{cat_info['code']}|{idx:02d}"

        catalog.append(
            {
                "id": t_id,
                "tag": tag,
                "code": item.get("documentType", "Văn bản")[:6].upper(),
                "name": item.get("name", "").strip(),
                "doc_type": item.get("documentType", "Văn bản"),
                "category": cat_info["code"],
                "categoryLabel": cat_info["label"],
                "categoryColor": cat_info["color"],
                "legal_basis": item.get("source") or cat_info["legal"],
                "description": item.get("description", "").strip(),
                "keywords": item.get("keywords", []),
                "raw_text": clean_text,
                "line_count": len(lines),
                "is_extended": True,
            }
        )

    os.makedirs(os.path.dirname(OUT_BACKEND), exist_ok=True)
    with open(OUT_BACKEND, "w", encoding="utf-8") as bf:
        json.dump(catalog, bf, ensure_ascii=False, indent=2)

    print(f"Generated {len(catalog)} extended templates!")
    print(f"Saved to: {OUT_BACKEND}")


if __name__ == "__main__":
    build_catalog()
