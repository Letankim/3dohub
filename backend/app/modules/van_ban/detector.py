"""Auto-detection and line classification engine ported from ChuanHoa_VanBanDang.dotm."""

import re
from typing import Optional
from app.modules.van_ban.text_utils import to_ascii, clean_para_text
from app.modules.van_ban.profiles import get_profile

PARTY_DOC_TITLES = (
    "NGHI QUYET",
    "QUYET DINH",
    "CHI THI",
    "KET LUAN",
    "QUY CHE",
    "QUY DINH",
    "THONG TRI",
    "HUONG DAN",
    "THONG BAO",
    "THONG CAO",
    "TUYEN BO",
    "LOI KEU GOI",
    "BAO CAO",
    "KE HOACH",
    "CHUONG TRINH",
    "DE AN",
    "DU AN",
    "PHUONG AN",
    "TO TRINH",
    "CONG VAN",
    "CONG DIEN",
    "BIEN BAN",
    "GIAY MOI",
    "GIAY GIOI THIEU",
    "GIAY NGHI PHEP",
    "PHIEU GUI",
    "PHIEU CHUYEN",
    "PHIEU BAO",
    "HOP DONG",
    "PHU LUC",
    "DANH MUC",
    "BANG TONG HOP",
)

RANK_PREFIXES = (
    "DAI TUONG",
    "THUONG TUONG",
    "TRUNG TUONG",
    "THIEU TUONG",
    "DAI TA",
    "THUONG TA",
    "TRUNG TA",
    "THIEU TA",
    "DAI UY",
    "THUONG UY",
    "TRUNG UY",
    "THIEU UY",
)

SIGN_ROLES = (
    "BI THU",
    "PHO BI THU",
    "CHU TICH",
    "PHO CHU TICH",
    "TRUONG BAN",
    "PHO TRUONG BAN",
    "CHANH VAN PHONG",
    "PHO CHANH VAN PHONG",
    "CHU NHIEM",
    "PHO CHU NHIEM",
    "GIAM DOC",
    "PHO GIAM DOC",
    "TRUONG CONG AN",
    "PHO TRUONG CONG AN",
    "CHINH TRI VIEN",
    "CHI HUY TRUONG",
    "BO TRUONG",
    "THU TRUONG",
    "TONG BI THU",
    "THUONG TRUC BAN BI THU",
    "CHU TOA",
    "CHU TRI",
    "THU KY",
    "NGUOI LAP BIEU",
)


def detect_from_header_text(s_asc: str) -> tuple[str, bool]:
    """Detect profile ID and strong flag from header ASCII text (ports TT_DetectFromHeaderText)."""
    t = s_asc.upper().replace(" ", "")
    if "DANGCONGSANVIETNAM" in t or "DANGCONGSAN" in t:
        return "DANG", True

    has_national = "CONGHOAXAHOICHUNGHIA" in t or "DOCLAP-TUDO" in t or "DOCLAP" in t

    # Check Party keywords if no national motto (or Party specific agencies)
    party_keywords = (
        "DANGUY",
        "DANGBO",
        "CHIBO",
        "TINHUY",
        "THANHUY",
        "HUYENUY",
        "QUANUY",
        "THIUY",
        "BANTHUONGVU",
        "BANCHAPHANHDANGBO",
        "UYBANKIEMTRA",
        "UBKT",
        "BANTOCHUC",
        "BANTUYENGIAO",
        "BANNOPHINH",
        "BANDANVAN",
        "VANPHONGDANGUY",
        "VPTW",
        "TRUNGUONGDANG",
    )
    if not has_national:
        for kw in party_keywords:
            if kw in t:
                return "DANG", False

    # Check Police (CAND / TT 26/2019/TT-BCA)
    police_keywords = (
        "BOCONGAN",
        "CONGAN",
        "CANHSAT",
        "ANNINH",
        "CAND",
        "CONGANTINH",
        "CONGANTP",
        "CONGANTHANHPHO",
        "CONGANHUYEN",
        "CONGANQUAN",
        "CONGANTHIXA",
        "CONGANXA",
        "CONGANPHUONG",
        "CONGANDACKHU",
        "CONGANNHANDAN",
        "TRAITAMGIAM",
        "TRAIGIAM",
        "CUCANNINH",
        "CUCCANHSAT",
        "CSGT",
        "PCCC",
        "TRUONGCONGAN",
    )
    for kw in police_keywords:
        if kw in t:
            return "CONG_AN", has_national

    # Check Military (QĐND / TT 68/2023/TT-BQP)
    military_keywords = (
        "BOQUOCPHONG",
        "BQP",
        "QUANKHU",
        "QUANDOAN",
        "BOTULENH",
        "BOCHIHUYQUANSU",
        "BANCHIHUYQUANSU",
        "BCHQS",
        "BANCHQS",
        "BCHQUANSU",
        "SUDOAN",
        "LUDOAN",
        "TRUNGDOAN",
        "TIEUDOAN",
        "DAIDOI",
        "BIENPHONG",
        "BODOIBIENPHONG",
        "CANHSATBIEN",
        "QUANDOINHANDAN",
        "QDND",
        "TONGCUCCHINHTRI",
        "BOTONGTHAMMUU",
        "HOCVIENLUCQUAN",
        "HOCVIENHAUQUAN",
        "HOCVIENQUANY",
        "HOCVIENKYTHUATQUANSU",
        "CHIHUYTRUONG",
        "CHINHTRIVIEN",
    )
    for kw in military_keywords:
        if kw in t:
            return "QUAN_DOI", has_national

    # Check Fatherland Front & Socio-Political Organizations (QĐ 207)
    mttq_keywords = (
        "MATTRANTOQUOC",
        "UYBANMATTRAN",
        "UBMTTQ",
        "MTTQ",
        "LIENDOANLAODONG",
        "CONGDOAN",
        "HOINONGDAN",
        "HOILIENHIEPPHUNU",
        "HOIPHUNU",
        "HOICUUCHIENBINH",
        "CUUCHIENBINH",
        "DOANTNCS",
        "DOANTHANHNIEN",
        "HOILHTN",
        "HOISINHVIEN",
    )
    for kw in mttq_keywords:
        if kw in t:
            return "MTTQ", has_national

    # Check State / Local Government bodies (NĐ 30/2020)
    gov_keywords = (
        "UYBANNHANDAN",
        "HOIDONGNHANDAN",
        "UBND",
        "HDND",
        "VANPHONGUBND",
        "VANPHONGHDND",
        "VANPHONGCHINHPHU",
        "CHINHPHU",
    )
    for kw in gov_keywords:
        if kw in t:
            return "CHINH_QUYEN", has_national

    # Default to CHINH_QUYEN if national motto is present
    if has_national:
        return "CHINH_QUYEN", True

    # If any Party keyword is present even without explicit motto
    for kw in party_keywords:
        if kw in t:
            return "DANG", False

    return "", False


def resolve_profile(lines: list[str], force_profile: str = "AUTO") -> dict[str, str]:
    """Resolve active profile, detected profile, and any mismatch warning (ports TT_Resolve)."""
    header_sample = " ".join(lines[:20])
    header_asc = to_ascii(header_sample)
    detected, is_strong = detect_from_header_text(header_asc)

    requested = (force_profile or "AUTO").upper()
    if requested == "AUTO":
        applied = detected if detected else "DANG"
        source = "AUTO"
    else:
        applied = requested
        source = "MANUAL"

    mismatch_warning = ""
    if source == "MANUAL" and detected and detected != applied and is_strong:
        det_name = get_profile(detected)["name"]
        app_name = get_profile(applied)["name"]
        mismatch_warning = (
            f"[Lệch khối] Văn bản có dấu hiệu thuộc '{det_name}' nhưng đang chọn chuẩn hóa theo "
            f"'{app_name}'. Khuyến nghị chuyển sang chế độ 'Tự động nhận diện' hoặc chọn đúng khối."
        )

    return {
        "detected_profile": detected or "DANG",
        "applied_profile": applied,
        "source": source,
        "mismatch_warning": mismatch_warning,
    }


def is_doc_number_line(s_asc: str) -> bool:
    """Return True if line is a document number line ('Số: ...' or 'Số ...-../..')."""
    t = s_asc.strip()
    if t.startswith("SO:") or t.startswith("SO :"):
        return True
    if t.startswith("SO ") and ("/" in t or "-" in t) and len(t) < 60:
        return True
    return False


def is_date_line(s_asc: str) -> bool:
    """Return True if line contains 'ngày ... tháng ... năm'."""
    t = s_asc.strip()
    p_ng = t.find("NGAY")
    p_th = t.find("THANG")
    p_nm = t.find("NAM")
    return 0 <= p_ng < p_th < p_nm and len(t) < 95


def is_separator_line(s: str) -> bool:
    """Return True if line is a horizontal separator ('-----', '***', '*')."""
    t = s.strip()
    if not t:
        return False
    if t in ("*", "***", "* * *"):
        return True
    return bool(re.match(r"^[-–—_]{3,20}$", t))


def is_party_doc_title(s_asc: str) -> bool:
    """Return True if line is a standalone document type title (e.g., BÁO CÁO, QUYẾT ĐỊNH)."""
    t = s_asc.strip().rstrip(":")
    return t in PARTY_DOC_TITLES


def normalize_doc_title_for_compare(s_asc: str) -> str:
    """Normalize document title for comparison."""
    return s_asc.strip().rstrip(":")


def split_glued_title_line(s_raw: str) -> tuple[Optional[str], Optional[str]]:
    """Split a line where document title and summary are glued (e.g. 'BÁO CÁO Kết quả công tác')."""
    s = clean_para_text(s_raw)
    s_asc = to_ascii(s)
    for title_asc in sorted(PARTY_DOC_TITLES, key=len, reverse=True):
        if s_asc.startswith(title_asc + " ") and len(s) > len(title_asc) + 2:
            prefix = s[: len(title_asc)].strip()
            rest = s[len(title_asc) :].strip().lstrip(":-– ").strip()
            if prefix == prefix.upper() and rest:
                return prefix, rest
    return None, None


def is_kinh_gui_start(s_asc: str) -> bool:
    """Return True if line starts with 'Kính gửi' or 'Kính trình'."""
    t = s_asc.strip().lstrip("- ").strip()
    return t.startswith("KINH GUI") or t.startswith("KINH TRINH")


def is_signature_auth(s_asc: str) -> bool:
    """Return True if line is a signer authority ('T/M ...', 'TM. ...', 'KT. ...', 'TL. ...')."""
    t = s_asc.strip()
    for p in ("T/M ", "TM.", "TM ", "K/T ", "KT.", "KT ", "T/L ", "TL.", "TL ", "T/UQ ", "TUQ.", "TUQ "):
        if t.startswith(p):
            return True
    return False


def is_signature_role(s_asc: str) -> bool:
    """Return True if line is a signer role ('BÍ THƯ', 'CHỦ TỊCH', etc.)."""
    t = s_asc.strip()
    for role in SIGN_ROLES:
        if t == role or t.startswith(role + " "):
            return True
    return False


def has_rank_prefix(s_asc: str) -> bool:
    """Return True if signer name begins with a military/police rank."""
    t = s_asc.strip()
    return any(t.startswith(r + " ") for r in RANK_PREFIXES)

