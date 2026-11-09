"""Profile definitions and legal specifications ported from ChuanHoa_VanBanDang.dotm."""

from typing import Any

VALID_PROFILE_IDS = ("AUTO", "DANG", "CHINH_QUYEN", "CONG_AN", "QUAN_DOI", "MTTQ")

TEXT_QUOC_HIEU = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
TEXT_TIEU_NGU = "Độc lập - Tự do - Hạnh phúc"
TEXT_TIEU_NGU_DANG = "ĐẢNG CỘNG SẢN VIỆT NAM"

PROFILES_METADATA: dict[str, dict[str, Any]] = {
    "DANG": {
        "id": "DANG",
        "code": "DANG",
        "name": "Khối Đảng",
        "short_label": "Đảng (QĐ 399 & HD 05-HD/VPTW)",
        "legal_basis": (
            "Quy định số 399-QĐ/TW ngày 09/01/2026 của Ban Bí thư; "
            "Hướng dẫn số 05-HD/VPTW ngày 27/5/2026 của Văn phòng Trung ương Đảng"
        ),
        "template_group": "DANG",
        "status": "ACTIVE",
        "statusLabel": "Chính thức",
        "numbers": {
            "PAGE_TOP": 20.0,
            "PAGE_BOTTOM": 20.0,
            "PAGE_LEFT": 30.0,
            "PAGE_RIGHT": 15.0,
            "PAGE_HEADER": 10.0,
            "PAGE_FOOTER": 10.0,
            "PAGE_NUMBER_SIZE": 13.5,
            "PARTY_MOTTO_SIZE": 15.0,
            "QH_SIZE": 13.0,
            "TN_SIZE": 14.0,
            "ORGAN_SIZE": 14.0,
            "HDR_LEFT_MM": 72.0,
            "HDR_RIGHT_MM": 93.0,
            "HDR_LEFT_MIN_MM": 52.0,
            "DOC_NUMBER_SIZE": 14.0,
            "DATE_SIZE": 14.0,
            "CV_SUMMARY_SIZE": 12.0,
            "TITLE_SIZE": 15.0,
            "SUMMARY_SIZE": 15.0,
            "BODY_SIZE": 15.0,
            "INDENT_CM": 1.27,
            "NN_LABEL_SIZE": 14.0,
            "NN_ITEM_SIZE": 12.0,
            "SIGN_SIZE": 14.0,
        },
        "booleans": {
            "AUTO_INSERT_MOTTO": True,
            "ORGAN_UNDERLINE": False,
            "CV_SUMMARY_ITALIC": True,
            "LEGAL_BASIS_ITALIC": False,
            "KINH_GUI_ITALIC": True,
            "NN_LABEL_UNDERLINE": True,
            "NN_LABEL_BOLD": False,
            "NN_LABEL_ITALIC": False,
            "ROLE_UNDER_AUTH_BOLD": False,
            "RANK_BEFORE_NAME": False,
            "CHECK_COLLECTIVE": True,
        },
        "strings": {
            "MOTTO_KIND": "DANG",
            "RIGHT_ALIGN": "RIGHT",
            "DOC_NUMBER_STYLE": "DANG",
            "SIGN_PREFIX_STYLE": "SLASH",
            "STATUS": "official",
        },
    },
    "CHINH_QUYEN": {
        "id": "CHINH_QUYEN",
        "code": "CHINH_QUYEN",
        "name": "Khối Chính quyền",
        "short_label": "Chính quyền (NĐ 30/2020/NĐ-CP)",
        "legal_basis": (
            "Nghị định số 30/2020/NĐ-CP ngày 05/3/2020 của Chính phủ về công tác văn thư "
            "(Phụ lục I: thể thức, kỹ thuật trình bày văn bản hành chính)"
        ),
        "template_group": "NHA_NUOC",
        "status": "ACTIVE",
        "statusLabel": "Chính thức",
        "numbers": {
            "PAGE_TOP": 20.0,
            "PAGE_BOTTOM": 20.0,
            "PAGE_LEFT": 30.0,
            "PAGE_RIGHT": 15.0,
            "PAGE_HEADER": 10.0,
            "PAGE_FOOTER": 10.0,
            "PAGE_NUMBER_SIZE": 13.0,
            "PARTY_MOTTO_SIZE": 15.0,
            "QH_SIZE": 13.0,
            "TN_SIZE": 14.0,
            "ORGAN_SIZE": 13.0,
            "HDR_LEFT_MM": 64.0,
            "HDR_RIGHT_MM": 101.0,
            "HDR_LEFT_MIN_MM": 52.0,
            "DOC_NUMBER_SIZE": 13.0,
            "DATE_SIZE": 14.0,
            "CV_SUMMARY_SIZE": 13.0,
            "TITLE_SIZE": 14.0,
            "SUMMARY_SIZE": 14.0,
            "BODY_SIZE": 14.0,
            "INDENT_CM": 1.27,
            "NN_LABEL_SIZE": 12.0,
            "NN_ITEM_SIZE": 11.0,
            "SIGN_SIZE": 14.0,
        },
        "booleans": {
            "AUTO_INSERT_MOTTO": True,
            "ORGAN_UNDERLINE": True,
            "CV_SUMMARY_ITALIC": False,
            "LEGAL_BASIS_ITALIC": True,
            "KINH_GUI_ITALIC": False,
            "NN_LABEL_UNDERLINE": False,
            "NN_LABEL_BOLD": True,
            "NN_LABEL_ITALIC": True,
            "ROLE_UNDER_AUTH_BOLD": True,
            "RANK_BEFORE_NAME": False,
            "CHECK_COLLECTIVE": False,
        },
        "strings": {
            "MOTTO_KIND": "QUOC_HIEU",
            "RIGHT_ALIGN": "CENTER",
            "DOC_NUMBER_STYLE": "NHA_NUOC",
            "SIGN_PREFIX_STYLE": "DOT",
            "STATUS": "official",
        },
    },
}

# Build CONG_AN, QUAN_DOI, MTTQ inheriting base State numbers and overriding specifics
PROFILES_METADATA["CONG_AN"] = {
    **PROFILES_METADATA["CHINH_QUYEN"],
    "id": "CONG_AN",
    "code": "CONG_AN",
    "name": "Khối Công an",
    "short_label": "Công an (TT 26/2019/TT-BCA & NĐ 30)",
    "legal_basis": (
        "Thông tư số 26/2019/TT-BCA về công tác văn thư trong Công an nhân dân "
        "(VBHN số 08/VBHN-BCA năm 2021); Điều 8, 9 Nghị định số 30/2020/NĐ-CP"
    ),
    "booleans": {
        **PROFILES_METADATA["CHINH_QUYEN"]["booleans"],
        "RANK_BEFORE_NAME": True,
    },
}

PROFILES_METADATA["QUAN_DOI"] = {
    **PROFILES_METADATA["CHINH_QUYEN"],
    "id": "QUAN_DOI",
    "code": "QUAN_DOI",
    "name": "Khối Quân đội",
    "short_label": "Quân đội (TT 68/2023/TT-BQP & NĐ 30)",
    "legal_basis": (
        "Thể thức, kỹ thuật trình bày theo Nghị định số 30/2020/NĐ-CP; "
        "Quy chế công tác văn thư trong Bộ Quốc phòng (Thông tư số 68/2023/TT-BQP)"
    ),
    "booleans": {
        **PROFILES_METADATA["CHINH_QUYEN"]["booleans"],
        "RANK_BEFORE_NAME": True,
    },
    "strings": {
        **PROFILES_METADATA["CHINH_QUYEN"]["strings"],
        "STATUS": "needs_review",
    },
}

PROFILES_METADATA["MTTQ"] = {
    **PROFILES_METADATA["CHINH_QUYEN"],
    "id": "MTTQ",
    "code": "MTTQ",
    "name": "MTTQ và tổ chức CT-XH",
    "short_label": "MTTQ & Đoàn thể (QĐ 207/QĐ-MTTW-BTT)",
    "legal_basis": (
        "Quyết định số 207/QĐ-MTTW-BTT ngày 29/8/2025 của Ban Thường trực UBTW MTTQ Việt Nam; "
        "Thể thức văn bản của từng tổ chức chính trị - xã hội ở Trung ương"
    ),
    "booleans": {
        **PROFILES_METADATA["CHINH_QUYEN"]["booleans"],
        "AUTO_INSERT_MOTTO": False,
        "LEGAL_BASIS_ITALIC": False,
    },
    "strings": {
        "MOTTO_KIND": "LINH_HOAT",
        "RIGHT_ALIGN": "CENTER",
        "DOC_NUMBER_STYLE": "LINH_HOAT",
        "SIGN_PREFIX_STYLE": "GIU_NGUYEN",
        "STATUS": "experimental",
    },
}

DOC_CODE_TITLES_DANG: dict[str, str] = {
    "BB": "BIEN BAN",
    "BC": "BAO CAO",
    "CT": "CHI THI",
    "CTR": "CHUONG TRINH",
    "CV": "CONG VAN",
    "DA": "DE AN",
    "GM": "GIAY MOI",
    "HD": "HUONG DAN",
    "KH": "KE HOACH",
    "KL": "KET LUAN",
    "NQ": "NGHI QUYET",
    "PA": "PHUONG AN",
    "QC": "QUY CHE",
    "QD": "QUYET DINH",
    "QYD": "QUY DINH",
    "TB": "THONG BAO",
    "TTR": "TO TRINH",
}

DOC_CODE_TITLES_NHA_NUOC: dict[str, str] = {
    "BB": "BIEN BAN",
    "BC": "BAO CAO",
    "CD": "CONG DIEN",
    "CT": "CHI THI",
    "CTR": "CHUONG TRINH",
    "DA": "DE AN|DU AN",
    "GGT": "GIAY GIOI THIEU",
    "GM": "GIAY MOI",
    "HD": "HUONG DAN|HOP DONG",
    "KH": "KE HOACH",
    "NQ": "NGHI QUYET",
    "PA": "PHUONG AN",
    "QC": "QUY CHE",
    "QD": "QUYET DINH",
    "QYD": "QUY DINH",
    "TB": "THONG BAO",
    "TC": "THONG CAO",
    "TTR": "TO TRINH",
}


def get_profile(profile_id: str) -> dict[str, Any]:
    """Return profile config dictionary; defaults to DANG if not found."""
    pid = (profile_id or "DANG").upper()
    return PROFILES_METADATA.get(pid, PROFILES_METADATA["DANG"])


def get_doc_code_title(profile_id: str, code_asc: str) -> str:
    """Return expected ASCII document title(s) for a given doc code."""
    code_up = code_asc.strip().upper()
    if profile_id.upper() == "DANG":
        return DOC_CODE_TITLES_DANG.get(code_up, "")
    return DOC_CODE_TITLES_NHA_NUOC.get(code_up, "")

