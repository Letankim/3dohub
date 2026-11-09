"""Standard Administrative Excel Templates for 3DoHub Excel Print Normalizer."""

import io
import uuid
from typing import Any, Optional
import openpyxl
from openpyxl.styles import Font, Alignment, Border, Side, PatternFill
from app.core.config import now_iso_vn

EXCEL_SAMPLES_CATALOG: list[dict[str, Any]] = [
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_OID, "3dohub:excel_sample:BANG_PHAN_CONG")),
        "code": "BANG_PHAN_CONG",
        "name": "Bảng phân công nhiệm vụ & tiến độ thực hiện (Khối Đảng / Hành chính)",
        "orientation_hint": "LANDSCAPE",
        "description": "Bảng 8 cột kèm Quốc hiệu, Tiêu đề, Header gộp 2 tầng, ô nội dung dài nhiều dòng và khối Chữ ký cuối bảng.",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn A4 Ngang",
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_OID, "3dohub:excel_sample:DANH_SACH_CAN_BO")),
        "code": "DANH_SACH_CAN_BO",
        "name": "Danh sách trích ngang đại biểu / cán bộ (5 cột chuẩn A4 Dọc)",
        "orientation_hint": "PORTRAIT",
        "description": "Bảng 5 cột gọn chuẩn khổ A4 Dọc (Portrait), tự động giãn đều độ rộng cột và căn giữa trang in.",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn A4 Dọc",
    },
    {
        "id": str(uuid.uuid5(uuid.NAMESPACE_OID, "3dohub:excel_sample:BANG_TONG_HOP_KINH_PHI")),
        "code": "BANG_TONG_HOP_KINH_PHI",
        "name": "Bảng tổng hợp dự toán kinh phí (Có ô Merge dọc & số liệu lớn)",
        "orientation_hint": "LANDSCAPE",
        "description": "Kiểm thử chống che khuất chữ 100% cho cả ô đơn, Merge ngang, Merge dọc nhiều dòng và chống lỗi ### ở cột số tiền.",
        "status": "ACTIVE",
        "statusLabel": "Merge Dọc & Số Liệu",
    },
]


def get_excel_samples_list() -> list[dict[str, Any]]:
    ts = now_iso_vn()
    return [
        {
            **item,
            "version": 1,
            "created_at": ts,
            "updated_at": ts,
        }
        for item in EXCEL_SAMPLES_CATALOG
    ]


def build_sample_workbook_bytes(sample_code: str) -> Optional[bytes]:
    """Generate a realistic un-normalized .xlsx workbook for the requested sample_code."""
    code = (sample_code or "").strip().upper()
    wb = openpyxl.Workbook()
    ws = wb.active
    thin = Side(border_style="thin", color="000000")
    border_all = Border(left=thin, right=thin, top=thin, bottom=thin)
    hdr_fill = PatternFill(start_color="F1F5F9", end_color="F1F5F9", fill_type="solid")

    if code == "DANH_SACH_CAN_BO":
        ws.title = "DanhSach_A4Doc"
        ws["A1"] = "ĐẢNG BỘ TỈNH BẾN TRE"
        ws["A2"] = "ĐẢNG ỦY XÃ THẠNH PHÚ"
        ws["D1"] = "ĐẢNG CỘNG SẢN VIỆT NAM"
        ws["D2"] = "Thạnh Phú, ngày 09 tháng 11 năm 2026"
        ws.merge_cells("A4:E4")
        ws["A4"] = "DANH SÁCH TỔ CÔNG TÁC CHUYỂN ĐỔI SỐ NĂM 2026"
        ws["A4"].font = Font(name="Calibri", size=14, bold=True)
        ws["A4"].alignment = Alignment(horizontal="center")

        headers = ["STT", "Họ và tên", "Chức vụ, đơn vị", "Nhiệm vụ phân công", "Ghi chú"]
        for col_idx, h_text in enumerate(headers, start=1):
            c = ws.cell(row=6, column=col_idx, value=h_text)
            c.font = Font(name="Calibri", size=12, bold=True)
            c.alignment = Alignment(horizontal="center", vertical="center")
            c.border = border_all
            c.fill = hdr_fill

        rows_data = [
            [1, "Nguyễn Văn An", "Bí thư Đảng ủy", "Tổ trưởng, phụ trách chỉ đạo chung toàn diện công tác chuyển đổi số", "Trực tiếp"],
            [2, "Trần Thị Bình", "Phó Bí thư Thường trực", "Tổ phó, chỉ đạo rà soát chuẩn hóa quy trình văn bản điện tử", ""],
            [3, "Lê Hoàng Cường", "Chánh Văn phòng ĐU", "Ủy viên Thường trực, quản trị hệ thống 3DoHub và tổng hợp báo cáo định kỳ", "Thư ký Tổ"],
            [4, "Phạm Minh Dũng", "Công chức Văn phòng - Thống kê", "Phụ trách kỹ thuật số hóa hồ sơ, dữ liệu bảng biểu và lưu trữ điện tử", ""],
            [5, "Võ Thị Hồng Hạnh", "Chủ tịch UB MTTQ xã", "Phối hợp tuyên truyền, hướng dẫn các chi bộ và đoàn thể triển khai thực hiện", ""],
        ]
        for r_offset, r_vals in enumerate(rows_data, start=7):
            for c_idx, val in enumerate(r_vals, start=1):
                cell = ws.cell(row=r_offset, column=c_idx, value=val)
                cell.font = Font(name="Calibri", size=12)
                cell.border = border_all
                cell.alignment = Alignment(horizontal="center" if c_idx == 1 else "left")

        ws["D14"] = "T/M BAN THƯỜNG VỤ"
        ws["D15"] = "BÍ THƯ"
        ws["D18"] = "Nguyễn Văn An"

    elif code == "BANG_TONG_HOP_KINH_PHI":
        ws.title = "DuToan_MergeDoc"
        ws["A1"] = "ỦY BAN NHÂN DÂN HUYỆN THẠNH PHÚ"
        ws["A2"] = "ỦY BAN NHÂN DÂN XÃ THẠNH PHÚ"
        ws["E1"] = "CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM"
        ws["E2"] = "Độc lập - Tự do - Hạnh phúc"
        ws.merge_cells("A4:G4")
        ws["A4"] = "BẢNG TỔNG HỢP DỰ TOÁN KINH PHÍ CHUYỂN ĐỔI SỐ NĂM 2026"
        ws["A4"].font = Font(name="Arial", size=14, bold=True)
        ws["A4"].alignment = Alignment(horizontal="center")

        headers = ["STT", "Nhóm hạng mục", "Nội dung chi tiết công việc thực hiện", "Đơn vị chủ trì", "Số lượng", "Đơn giá (VNĐ)", "Thành tiền (VNĐ)"]
        for c_idx, h_text in enumerate(headers, start=1):
            c = ws.cell(row=6, column=c_idx, value=h_text)
            c.font = Font(name="Arial", size=11, bold=True)
            c.border = border_all
            c.fill = hdr_fill
            c.alignment = Alignment(horizontal="center", vertical="center")

        data = [
            [1, "Hạ tầng & Phần mềm lõi (Triển khai đồng bộ tại Văn phòng và các bộ phận chuyên môn trực thuộc)", "Nâng cấp nền tảng chuẩn hóa văn bản & bảng biểu tự động 3DoHub Enterprise", "Văn phòng", 1, 45000000, "=E7*F7"],
            [2, "", "Trang bị máy quét tài liệu tốc độ cao phục vụ số hóa hồ sơ lưu trữ", "Văn phòng", 2, 18500000, "=E8*F8"],
            [3, "", "Tập huấn kỹ năng soạn thảo, chuẩn hóa văn bản & bảng in A4 cho cán bộ công chức", "Phòng Nội vụ", 3, 6500000, "=E9*F9"],
            [4, "An toàn thông tin", "Thiết lập hệ thống tường lửa, chữ ký HMAC-SHA256 và sao lưu định kỳ", "Bộ phận CNTT", 1, 28000000, "=E10*F10"],
        ]
        for r_idx, row_vals in enumerate(data, start=7):
            for c_idx, val in enumerate(row_vals, start=1):
                cell = ws.cell(row=r_idx, column=c_idx, value=val)
                cell.font = Font(name="Arial", size=11)
                cell.border = border_all
                if c_idx in (6, 7):
                    cell.number_format = "#,##0"
                    cell.alignment = Alignment(horizontal="right")
                elif c_idx in (1, 5):
                    cell.alignment = Alignment(horizontal="center")

        # Row 11: Total Summary Row using =SUM(...) formulas
        ws.merge_cells("A11:D11")
        ws["A11"] = "TỔNG CỘNG KINH PHÍ DỰ TOÁN"
        ws["E11"] = "=SUM(E7:E10)"
        ws["F11"] = ""
        ws["G11"] = "=SUM(G7:G10)"
        for c_idx in range(1, 8):
            c_tot = ws.cell(row=11, column=c_idx)
            c_tot.font = Font(name="Arial", size=11, bold=True)
            c_tot.border = border_all
            c_tot.fill = hdr_fill
            if c_idx == 1:
                c_tot.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 5:
                c_tot.alignment = Alignment(horizontal="center", vertical="center")
            elif c_idx == 7:
                c_tot.number_format = "#,##0"
                c_tot.alignment = Alignment(horizontal="right", vertical="center")

        # Vertical merge across rows 7..9 in column B to test vertical merge height distribution
        ws.merge_cells("B7:B9")
        ws["F13"] = "TM. ỦY BAN NHÂN DÂN"
        ws["F14"] = "CHỦ TỊCH"
        ws["F17"] = "Trần Văn Bình"

    else:
        # Default: BANG_PHAN_CONG (8 columns -> Landscape A4)
        ws.title = "PhanCong_A4Ngang"
        ws["A1"] = "ĐẢNG BỘ TỈNH BẾN TRE"
        ws["A2"] = "ĐẢNG ỦY XÃ THẠNH PHÚ"
        ws["F1"] = "ĐẢNG CỘNG SẢN VIỆT NAM"
        ws["F2"] = "Thạnh Phú, ngày 09 tháng 11 năm 2026"
        ws.merge_cells("A4:H4")
        ws["A4"] = "BẢNG PHÂN CÔNG NHIỆM VỤ TRIỂN KHAI KẾ HOẠCH CÔNG TÁC QUÝ IV/2026"
        ws["A4"].font = Font(name="Calibri", size=14, bold=True)
        ws["A4"].alignment = Alignment(horizontal="center")

        headers = [
            "STT",
            "Nội dung nhiệm vụ trọng tâm",
            "Sản phẩm đầu ra",
            "Đơn vị chủ trì",
            "Đơn vị phối hợp",
            "Thời gian hoàn thành",
            "Người thực hiện",
            "Ghi chú",
        ]
        for c_idx, h_text in enumerate(headers, start=1):
            c = ws.cell(row=6, column=c_idx, value=h_text)
            c.font = Font(name="Calibri", size=11, bold=True)
            c.border = border_all
            c.fill = hdr_fill
            c.alignment = Alignment(horizontal="center", vertical="center")
            ws.cell(row=7, column=c_idx, value=f"({c_idx})").border = border_all
            ws.cell(row=7, column=c_idx).alignment = Alignment(horizontal="center")
            ws.cell(row=7, column=c_idx).font = Font(name="Calibri", size=10, italic=True)

        rows_data = [
            [1, "Rà soát, chuẩn hóa toàn bộ hệ thống văn bản quy phạm và văn bản chỉ đạo điều hành của Đảng ủy xã", "100% văn bản ban hành đúng chuẩn QĐ 399-QĐ/TW và HD 05-HD/VPTW", "Văn phòng Đảng ủy", "Các chi bộ trực thuộc", "15/11/2026", "Đ/c Lê Hoàng Cường", "Ưu tiên số 1"],
            [2, "Chuẩn hóa biểu mẫu báo cáo thống kê, bảng tổng hợp kinh phí và danh sách trích ngang trên Excel", "Tất cả bảng biểu in trên khổ A4 không bị tràn cột hoặc mất chữ", "Bộ phận Tài chính - Kế toán", "Văn phòng Đảng ủy", "25/11/2026", "Đ/c Phạm Minh Dũng", ""],
            [3, "Tổ chức hội nghị sơ kết công tác chuyển đổi số và biểu dương các tập thể, cá nhân tiêu biểu", "Báo cáo sơ kết, Quyết định khen thưởng và Biên bản hội nghị", "Ban Tổ chức", "UB MTTQ và các đoàn thể", "10/12/2026", "Đ/c Võ Thị Hồng Hạnh", "Báo cáo Thường trực"],
        ]
        for r_idx, r_vals in enumerate(rows_data, start=8):
            for c_idx, val in enumerate(r_vals, start=1):
                cell = ws.cell(row=r_idx, column=c_idx, value=val)
                cell.font = Font(name="Calibri", size=11)
                cell.border = border_all
                cell.alignment = Alignment(horizontal="center" if c_idx in (1, 6) else "left")

        ws["G13"] = "T/M BAN THƯỜNG VỤ"
        ws["G14"] = "BÍ THƯ"
        ws["G17"] = "Nguyễn Văn An"

    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()

