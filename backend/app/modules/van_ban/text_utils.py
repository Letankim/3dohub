"""Text normalization utilities ported from ChuanHoa_VanBanDang.dotm."""

import re
import unicodedata
from app.modules.van_ban.profiles import get_profile


def to_ascii(text: str) -> str:
    """Convert Vietnamese Unicode string to uppercase ASCII without diacritics (ports ToAscii)."""
    if not text:
        return ""
    s = text.replace("đ", "d").replace("Đ", "D")
    nfkd = unicodedata.normalize("NFKD", s)
    ascii_str = "".join(c for c in nfkd if not unicodedata.combining(c))
    return ascii_str.upper()


def clean_para_text(text: str) -> str:
    """Strip control characters and collapse redundant spaces (ports CleanParaText)."""
    if not text:
        return ""
    s = text.replace("\r", "").replace("\n", "").replace("\x07", "").replace("\x0b", " ")
    s = s.replace("\u00a0", " ")
    s = re.sub(r"[ \t]{2,}", " ", s)
    return s.strip()


def normalize_so_ky_hieu_dang(s_raw: str) -> str:
    """Standardize Party document number: 'Số 05-QĐ/ĐU' or 'Số   -QĐ/ĐU' (ports ChuanHoa_SoKyHieu_Dang)."""
    s = clean_para_text(s_raw)
    s_asc = to_ascii(s)
    if not s_asc.startswith("SO"):
        return s
    rest = s[2:].strip()
    if rest.startswith(":"):
        rest = rest[1:].strip()

    rest = re.sub(r"\s+", "", rest)
    rest = rest.replace("\u2013", "-").replace("\u2014", "-")
    dash_pos = rest.find("-")
    slash_pos = rest.find("/")
    if dash_pos <= 0 and slash_pos <= 0:
        return f"Số {rest}"

    if 0 < slash_pos < dash_pos:
        num_part = rest[:slash_pos]
        code_part = rest[slash_pos + 1 : dash_pos]
        org_part = rest[dash_pos + 1 :]
    elif 0 < dash_pos < slash_pos:
        num_part = rest[:dash_pos]
        code_part = rest[dash_pos + 1 : slash_pos]
        org_part = rest[slash_pos + 1 :]
    else:
        return f"Số {rest}"

    if "[" in num_part and "]" in num_part:
        return f"Số {num_part}-{code_part.upper()}/{org_part.upper()}"
    clean_num = num_part.replace(".", "").replace("…", "").strip()
    if not clean_num or not clean_num.isdigit():
        return f"Số   -{code_part.upper()}/{org_part.upper()}"
    val = int(clean_num)
    if 0 < val < 10 and len(clean_num) == 1:
        clean_num = f"0{clean_num}"
    return f"Số {clean_num}-{code_part.upper()}/{org_part.upper()}"


def normalize_so_ky_hieu_nha_nuoc(s_raw: str, keep_prefix: bool = False) -> str:
    """Standardize State document number: 'Số: 05/QĐ-UBND' (ports ChuanHoa_SoKyHieu_NhaNuoc)."""
    s = clean_para_text(s_raw)
    s_asc = to_ascii(s)
    if not s_asc.startswith("SO"):
        return s
    rest = s[2:].strip()
    had_colon = rest.startswith(":")
    if had_colon:
        rest = rest[1:].strip()

    rest = re.sub(r"\s+", "", rest).replace("\u2013", "-").replace("\u2014", "-")
    if not rest:
        return s

    m = re.match(r"^((?:\[\.\.\.\]|[0-9.…])*)(.*)$", rest)
    if not m:
        return s
    num_part, tail = m.group(1), m.group(2)
    if len(tail) < 2:
        return s
    sep = tail[0]
    if sep not in ("/", "-"):
        return s
    tail_body = tail[1:]
    if sep == "-":
        sl = tail_body.find("/")
        if sl <= 0:
            return s
        if "-" not in tail_body[:sl]:
            tail_body = f"{tail_body[:sl]}-{tail_body[sl + 1 :]}"

    tail_body = tail_body.upper()
    prefix = ("Số: " if had_colon else "Số ") if keep_prefix else "Số: "
    if "[" in num_part and "]" in num_part:
        return f"{prefix}{num_part}/{tail_body}"
    clean_num = num_part.replace(".", "").replace("…", "").strip()
    if not clean_num or not clean_num.isdigit():
        return f"{prefix}  /{tail_body}"
    val = int(clean_num)
    if 0 < val < 10 and len(clean_num) == 1:
        clean_num = f"0{clean_num}"
    return f"{prefix}{clean_num}/{tail_body}"


def normalize_so_ky_hieu(s_raw: str, profile_id: str) -> str:
    """Dispatch document number normalization according to profile rules."""
    prof = get_profile(profile_id)
    style = prof["strings"]["DOC_NUMBER_STYLE"]
    if style == "DANG":
        return normalize_so_ky_hieu_dang(s_raw)
    if style == "NHA_NUOC":
        return normalize_so_ky_hieu_nha_nuoc(s_raw, keep_prefix=False)
    # LINH_HOAT
    s_asc = to_ascii(s_raw)
    dash_pos = s_asc.find("-")
    slash_pos = s_asc.find("/")
    if 0 < dash_pos < slash_pos and "SO:" not in s_asc:
        return normalize_so_ky_hieu_dang(s_raw)
    return normalize_so_ky_hieu_nha_nuoc(s_raw, keep_prefix=True)


def normalize_ngay_thang(s_raw: str) -> str:
    """Standardize date line: 'Địa danh, ngày 05 tháng 02 năm 2026' (ports ChuanHoa_NgayThang)."""
    s = clean_para_text(s_raw)
    s_asc = to_ascii(s)
    p_ngay = s_asc.find("NGAY")
    p_thang = s_asc.find("THANG")
    p_nam = s_asc.find("NAM")
    if not (0 < p_ngay < p_thang < p_nam):
        return s

    loc_part = s[:p_ngay].strip().rstrip(",").strip()
    day_part = s[p_ngay + 4 : p_thang].strip()
    month_part = s[p_thang + 5 : p_nam].strip()
    year_part = s[p_nam + 3 :].strip().rstrip(".")

    if "[" in day_part and "]" in day_part:
        day_text = f" {day_part} "
    else:
        clean_day = day_part.replace(".", "").replace("…", "").strip()
        if not clean_day or not clean_day.isdigit():
            day_text = "    "
        else:
            d_val = int(clean_day)
            day_str = f"0{d_val}" if 0 < d_val < 10 else str(d_val)
            day_text = f" {day_str} "

    if "[" in month_part and "]" in month_part:
        month_text = f" {month_part} "
    else:
        clean_month = month_part.replace(".", "").replace("…", "").strip()
        if not clean_month or not clean_month.isdigit():
            month_text = "    "
        else:
            m_val = int(clean_month)
            if m_val in (1, 2):
                month_str = f"0{m_val}"
            else:
                month_str = str(m_val)
            month_text = f" {month_str} "

    prefix = f"{loc_part}, " if loc_part else ""
    return f"{prefix}ngày{day_text}tháng{month_text}năm {year_part}"


def normalize_tham_quyen(s_raw: str, profile_id: str) -> str:
    """Standardize signer authority prefix: 'T/M' vs 'TM.' (ports ChuanHoa_ThamQuyen)."""
    s = clean_para_text(s_raw)
    prof = get_profile(profile_id)
    style = prof["strings"]["SIGN_PREFIX_STYLE"]
    if style == "GIU_NGUYEN":
        return s.upper()
    s_up = to_ascii(s)
    kind = ""
    rest = ""
    for prefix, k in [
        ("T/UQ", "TUQ"),
        ("TUQ.", "TUQ"),
        ("TUQ ", "TUQ"),
        ("T/M", "TM"),
        ("TM.", "TM"),
        ("TM ", "TM"),
        ("K/T", "KT"),
        ("KT.", "KT"),
        ("KT ", "KT"),
        ("T/L", "TL"),
        ("TL.", "TL"),
        ("TL ", "TL"),
    ]:
        if s_up.startswith(prefix):
            kind = k
            rest = s[len(prefix) :].strip()
            break
    if not kind or not rest:
        return s.upper()
    if style == "DOT":
        return f"{kind}. {rest.upper()}"
    slash_map = {"TM": "T/M", "KT": "K/T", "TL": "T/L", "TUQ": "T/UQ"}
    return f"{slash_map.get(kind, kind)} {rest.upper()}"


def normalize_recipient_punctuation(items: list[str]) -> list[str]:
    """Ensure recipient items end with ';' except the last 'Lưu...' item ending with '.'."""
    result: list[str] = []
    n = len(items)
    for idx, raw in enumerate(items):
        line = clean_para_text(raw)
        if not line:
            continue
        if not line.startswith("-"):
            line = f"- {line.lstrip('-•+ ').strip()}"
        else:
            line = f"- {line[1:].strip()}"
        line_body = line.rstrip(".,;: ")
        is_last = idx == n - 1
        s_asc = to_ascii(line_body)
        if is_last or s_asc.startswith("- LUU"):
            result.append(f"{line_body}.")
        else:
            result.append(f"{line_body};")
    return result

