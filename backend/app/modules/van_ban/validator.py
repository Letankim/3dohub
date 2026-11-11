"""18-Rule Document Logic Validator ported from KiemTra_LogicTheThuc in ChuanHoa_VanBanDang.dotm."""

import re
from typing import Any
from app.modules.van_ban.profiles import get_profile, get_doc_code_title
from app.modules.van_ban.text_utils import to_ascii
from app.modules.van_ban.detector import has_rank_prefix

ROMAN_ORDER = ("I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X")


def validate_document_logic(norm_doc: dict[str, Any]) -> list[dict[str, Any]]:
    """Run all 18 logic checks from KiemTra_LogicTheThuc and return structured warnings."""
    warnings: list[dict[str, Any]] = []
    pid = norm_doc["applied_profile"]
    prof = get_profile(pid)
    raw_lines = norm_doc.get("raw_cleaned_lines", [])
    full_text = "\n".join(raw_lines)
    full_asc = to_ascii(full_text)

    def add_warn(code: str, category: str, message: str, severity: str = "WARNING") -> None:
        warnings.append(
            {
                "index": len(warnings) + 1,
                "code": code,
                "category": category,
                "severity": severity,
                "message": message,
            }
        )

    # 1. Mismatch Warning (Lệch khối)
    if norm_doc.get("mismatch_warning"):
        add_warn("PROFILE_MISMATCH", "Lệch khối", norm_doc["mismatch_warning"], "ERROR")

    # 2. Ellipsis '...' or '…' check (ignore dots already inside [...] yellow placeholders)
    text_no_brackets = re.sub(r"\[[^\]]+\]", "", full_text)
    if "..." in text_no_brackets or "…" in text_no_brackets:
        add_warn(
            "ELLIPSIS_FOUND",
            "Dữ liệu trống",
            "[Dữ liệu trống] Phát hiện còn dấu '...' chưa điền đầy đủ thông tin.",
        )

    # 3. Bracket placeholders [...] check
    brackets = re.findall(r"\[[^\]]+\]", full_text)
    if brackets:
        sample = brackets[0]
        add_warn(
            "PLACEHOLDERS_REMAINING",
            "Chỗ trống",
            f"[Chỗ trống] Còn {len(brackets)} chỗ cần điền trong dấu [ ] (ví dụ: {sample}).",
        )

    hdr = norm_doc["header"]
    title_blk = norm_doc["title_block"]
    kg = norm_doc["kinh_gui"]
    body = norm_doc["body_paragraphs"]
    ftr = norm_doc["footer"]

    found_title_asc = to_ascii(title_blk.get("title", ""))
    is_standalone = found_title_asc in ("PHU LUC", "DANH MUC", "BANG TONG HOP", "BIEN BAN")

    # 4. Sequential numbering checks: Điều, La Mã (I, II, III), Số Ả Rập (1, 2, 3)
    next_dieu = 1
    total_dieu = 0
    next_roman = 0
    next_arabic = 1
    has_qd_verb = False

    for p in body:
        p_asc = to_ascii(p["text"])
        if p["kind"] == "DECISION_VERB":
            has_qd_verb = True
        elif p["kind"] == "DIEU":
            total_dieu += 1
            m_d = re.match(r"^DIEU\s+(\d+)", p_asc)
            if m_d:
                actual_d = int(m_d.group(1))
                if actual_d != next_dieu:
                    add_warn(
                        "DIEU_SEQUENCE_GAP",
                        "Thứ tự Điều",
                        f"[Thứ tự Điều] Nhảy cóc hoặc sai thứ tự: Kỳ vọng 'Điều {next_dieu}' nhưng gặp 'Điều {actual_d}'.",
                    )
                next_dieu = actual_d + 1
        elif p["kind"] == "ROMAN":
            m_r = re.match(r"^([IVX]+)[\.\-]", p_asc)
            if m_r and m_r.group(1) in ROMAN_ORDER:
                r_idx = ROMAN_ORDER.index(m_r.group(1))
                if r_idx != next_roman:
                    expected_r = ROMAN_ORDER[min(next_roman, len(ROMAN_ORDER) - 1)]
                    add_warn(
                        "ROMAN_SEQUENCE_GAP",
                        "Đề mục La Mã",
                        f"[Đề mục La Mã] Nhảy cóc thứ tự: Kỳ vọng mục '{expected_r}' nhưng gặp mục '{m_r.group(1)}'.",
                    )
                next_roman = r_idx + 1
                next_arabic = 1
        elif p["kind"] == "ARABIC":
            m_a = re.match(r"^(\d+)\.", p_asc)
            if m_a:
                actual_a = int(m_a.group(1))
                if actual_a != next_arabic:
                    add_warn(
                        "ARABIC_SEQUENCE_GAP",
                        "Đề mục Số",
                        f"[Đề mục Số] Nhảy cóc thứ tự khoản: Kỳ vọng mục '{next_arabic}.' nhưng gặp '{actual_a}.' ({p['text'][:35]}...).",
                    )
                next_arabic = actual_a + 1

    # 5. Document number & style checks
    so_raw = hdr.get("doc_number", "")
    found_code = ""
    if so_raw:
        so_asc = to_ascii(so_raw)
        so_body = so_asc[2:].lstrip(": ").strip()
        dash_i = so_body.find("-")
        slash_i = so_body.find("/")
        found_style = ""
        num_val = ""
        if 0 < dash_i < slash_i:
            found_style = "DANG"
            num_val = so_body[:dash_i].strip()
            found_code = so_body[dash_i + 1 : slash_i].strip()
        elif slash_i > 0:
            found_style = "NHA_NUOC"
            num_val = so_body[:slash_i].strip()
            after_sl = so_body[slash_i + 1 :]
            if "-" in after_sl:
                found_code = after_sl.split("-", 1)[0].strip()

        if not num_val or not num_val.isdigit():
            add_warn(
                "EMPTY_DOC_NUMBER",
                "Số văn bản",
                f"[Số văn bản] Đang để trống khoảng trắng ('{so_raw}') cho văn thư cấp số.",
                "INFO",
            )
        doc_num_style = prof["strings"]["DOC_NUMBER_STYLE"]
        if doc_num_style == "DANG" and found_style == "NHA_NUOC":
            add_warn(
                "WRONG_DOC_NUMBER_STYLE",
                "Số, ký hiệu",
                f"[Số, ký hiệu] Ký hiệu đang ghi theo kiểu Nhà nước ('{so_raw}'); văn bản Đảng ghi dạng 'Số 12-QĐ/ĐU'.",
            )
        elif doc_num_style == "NHA_NUOC" and found_style == "DANG":
            add_warn(
                "WRONG_DOC_NUMBER_STYLE",
                "Số, ký hiệu",
                f"[Số, ký hiệu] Ký hiệu đang ghi theo kiểu Đảng ('{so_raw}'); văn bản hành chính ghi dạng 'Số: 12/QĐ-UBND'.",
            )
    elif not is_standalone:
        add_warn(
            "MISSING_DOC_NUMBER",
            "Số văn bản",
            "[Số văn bản] Không tìm thấy dòng Số, ký hiệu văn bản ở phần Tiêu đề.",
        )

    # 6. Date validation
    date_raw = hdr.get("date_line", "")
    if date_raw:
        d_asc = to_ascii(date_raw)
        m_dt = re.search(r"NGAY\s*(.*?)\s*THANG\s*(.*?)\s*NAM\s*(\d{4})", d_asc)
        if m_dt:
            s_day, s_month = m_dt.group(1).strip(), m_dt.group(2).strip()
            if not s_day.isdigit() or not s_month.isdigit():
                add_warn(
                    "EMPTY_DATE",
                    "Ngày tháng",
                    f"[Ngày tháng] Đang để trống ngày/tháng ban hành ('{date_raw}') chờ ngày ký duyệt.",
                    "INFO",
                )
            else:
                d_int, m_int = int(s_day), int(s_month)
                if m_int < 1 or m_int > 12 or d_int < 1 or d_int > 31:
                    add_warn(
                        "INVALID_DATE",
                        "Ngày tháng",
                        f"[Ngày tháng] Ngày tháng không hợp lệ: ngày {d_int} tháng {m_int}.",
                        "ERROR",
                    )
                elif m_int in (4, 6, 9, 11) and d_int > 30:
                    add_warn(
                        "INVALID_DATE_30",
                        "Ngày tháng",
                        f"[Ngày tháng] Tháng {m_int} chỉ có tối đa 30 ngày (đang ghi ngày {d_int}).",
                        "ERROR",
                    )
                elif m_int == 2 and d_int > 29:
                    add_warn(
                        "INVALID_DATE_FEB",
                        "Ngày tháng",
                        f"[Ngày tháng] Tháng 02 không thể có ngày {d_int}.",
                        "ERROR",
                    )

    # 7. Document code vs Document title consistency
    has_vv = bool(hdr.get("cv_summary")) or ("V/V" in full_asc or "VE VIEC" in full_asc)
    has_kg = bool(kg.get("prefix")) or ("KINH GUI" in full_asc)
    expect_title = get_doc_code_title(pid, found_code) if found_code else ""
    if not expect_title and so_raw and not found_title_asc and has_vv:
        expect_title = "CONG VAN"

    if expect_title == "CONG VAN":
        if found_title_asc:
            add_warn(
                "CV_HAS_TITLE",
                "Loại văn bản",
                f"[Loại văn bản] Ký hiệu là Công văn ('CV') nhưng lại có tiêu đề '{title_blk['title']}' ở giữa bài.",
            )
        if not has_vv:
            add_warn(
                "CV_MISSING_SUMMARY",
                "Trích yếu Công văn",
                "[Trích yếu Công văn] Công văn đang thiếu dòng trích yếu 'V/v...' dưới số văn bản.",
            )
        if not has_kg:
            add_warn(
                "CV_MISSING_KINH_GUI",
                "Kính gửi",
                "[Kính gửi] Công văn đang thiếu mục 'Kính gửi:'.",
            )
    elif expect_title:
        allowed_titles = expect_title.split("|")
        if not found_title_asc:
            add_warn(
                "MISSING_DOC_TITLE",
                "Thiếu tiêu đề",
                f"[Thiếu tiêu đề] Ký hiệu văn bản là '{found_code}' nhưng thiếu dòng tên loại văn bản ('{expect_title.replace('|', ' / ')}') ở giữa trang.",
            )
        elif found_title_asc not in allowed_titles:
            add_warn(
                "MISMATCH_CODE_TITLE",
                "Mâu thuẫn loại VB",
                f"[Mâu thuẫn loại VB] Ký hiệu ghi là '{found_code}' nhưng tiêu đề văn bản lại ghi là '{title_blk['title']}'.",
            )

    # 8. Quyết định structure checks
    if found_title_asc == "QUYET DINH" or found_code == "QD":
        if not has_qd_verb or total_dieu == 0:
            add_warn(
                "QD_STRUCTURE_MISSING",
                "Cấu trúc Quyết định",
                "[Cấu trúc Quyết định] Văn bản Quyết định nhưng thiếu dòng 'QUYẾT ĐỊNH:' hoặc thiếu các 'Điều 1.', 'Điều 2.'.",
            )
        nn_joined = to_ascii(" ".join(ftr.get("noi_nhan_items", [])))
        if total_dieu > 0 and ftr.get("noi_nhan_items") and "NHU DIEU" not in nn_joined:
            add_warn(
                "QD_MISSING_NHU_DIEU",
                "Logic Nơi nhận",
                "[Logic Nơi nhận] Văn bản Quyết định có Điều khoản thi hành nhưng phần Nơi nhận thiếu dòng '- Như Điều ...;'.",
            )

    # 9. Collective vs Executive authority check (Khối Đảng)
    org_lines = hdr.get("organ_lines", [])
    issuing_org_asc = to_ascii(org_lines[-1]) if org_lines else ""
    superior_org_asc = to_ascii(org_lines[0]) if len(org_lines) >= 2 else ""
    sign_auth_asc = to_ascii(ftr.get("sign_auth", ""))

    if prof["booleans"]["CHECK_COLLECTIVE"] and issuing_org_asc and (sign_auth_asc or ftr.get("sign_role")):
        is_exec = any(
            issuing_org_asc.startswith(p)
            for p in ("VAN PHONG", "BAN TO CHUC", "BAN TUYEN GIAO", "BAN DAN VAN", "BAN NOI CHINH", "TRUNG TAM")
        )
        is_coll = not is_exec and any(
            k in issuing_org_asc
            for k in ("DANG UY", "BAN CHAP HANH", "BAN THUONG VU", "UY BAN KIEM TRA", "CHI BO")
        )
        if is_coll and not (sign_auth_asc.startswith("T/M ") or sign_auth_asc.startswith("TM.")):
            add_warn(
                "MISSING_COLLECTIVE_TM",
                "Thẩm quyền ký",
                f"[Thẩm quyền ký] Cơ quan ban hành là tập thể ('{org_lines[-1]}') nhưng chữ ký thiếu thẩm quyền 'T/M ...'.",
            )
        elif is_exec and (sign_auth_asc.startswith("T/M ") or sign_auth_asc.startswith("TM.")):
            add_warn(
                "EXEC_INVALID_TM",
                "Thẩm quyền ký",
                f"[Thẩm quyền ký] Cơ quan ban hành là '{org_lines[-1]}' (chế độ thủ trưởng) nên không được ký 'T/M'.",
            )

    # 10. Nơi nhận Lưu VT check
    nn_items = ftr.get("noi_nhan_items", [])
    if nn_items:
        nn_asc_all = to_ascii(" ".join(nn_items))
        has_luu_vt = any(
            k in nn_asc_all for k in ("LUU VT", "LUU: VT", "LUU VAN THU", "LUU: VAN THU", "LUU VAN PHONG")
        )
        has_luu_any = "LUU " in nn_asc_all or "LUU:" in nn_asc_all
        if not has_luu_vt and not has_luu_any:
            msg = (
                "[Nơi nhận] Phần 'Nơi nhận:' đang thiếu dòng lưu ở cuối (ví dụ: '- Lưu Văn phòng Tỉnh ủy.')."
                if prof["strings"]["MOTTO_KIND"] == "DANG"
                else "[Nơi nhận] Phần 'Nơi nhận:' đang thiếu dòng '- Lưu: VT...' ở cuối."
            )
            add_warn("MISSING_LUU", "Nơi nhận", msg)

    # 11. Superior party organ check (HD 05-HD/VPTW)
    if prof["strings"]["MOTTO_KIND"] == "DANG" and issuing_org_asc:
        is_local = any(
            issuing_org_asc.startswith(k) for k in ("DANG UY ", "CHI BO ")
        )
        if is_local and not superior_org_asc:
            add_warn(
                "MISSING_SUPERIOR_ORGAN",
                "Tên cơ quan",
                f"[Tên cơ quan] Văn bản của '{org_lines[-1]}' cần ghi tên đảng bộ cấp trên trực tiếp ở dòng trên (HD 05-HD/VPTW mục 2.1.2).",
            )

    # 12. Rank prefix check for Police / Military
    if prof["booleans"]["RANK_BEFORE_NAME"] and ftr.get("sign_name"):
        s_name_asc = to_ascii(ftr["sign_name"])
        if "[" not in s_name_asc and not has_rank_prefix(s_name_asc):
            add_warn(
                "MISSING_RANK_PREFIX",
                "Người ký",
                f"[Người ký] Họ tên người ký ('{ftr['sign_name']}') chưa ghi cấp bậc hàm phía trước (ví dụ: 'Đại tá Nguyễn Văn A').",
            )

    return warnings

