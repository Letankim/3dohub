"""All 17 standard templates and template builder ported from ChuanHoa_VanBanDang.dotm."""

from datetime import datetime
from typing import Any, Optional
import uuid
from app.modules.van_ban.profiles import (
    TEXT_QUOC_HIEU,
    TEXT_TIEU_NGU,
    TEXT_TIEU_NGU_DANG,
)
from app.core.config import now_iso_vn

TEMPLATES_CATALOG: list[dict[str, Any]] = [
    # 9 Party Templates (Khối Đảng)
    {
        "id": "01M5P0DANG01NGHIQUYET00001",
        "tag": "DANG|1",
        "group": "DANG",
        "index": 1,
        "code": "NQ",
        "name": "Nghị quyết (Khối Đảng)",
        "doc_type": "Nghị quyết",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|NQ\nL|NGHỊ QUYẾT\nL|[về ...]\nL|-----\n"
            "L|[Phần mở đầu: căn cứ, bối cảnh ban hành nghị quyết.]\n"
            "L|I. [TÌNH HÌNH, KẾT QUẢ]\nL|[Nội dung.]\n"
            "L|II. [MỤC TIÊU, NHIỆM VỤ, GIẢI PHÁP]\nL|1. [Mục tiêu]\nL|[Nội dung.]\n"
            "L|2. [Nhiệm vụ, giải pháp]\nL|[Nội dung.]\n"
            "L|III. TỔ CHỨC THỰC HIỆN\nL|[Nội dung.]\n"
            "N|- [Nơi nhận];\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG02QUYETDINH00002",
        "tag": "DANG|2",
        "group": "DANG",
        "index": 2,
        "code": "QĐ",
        "name": "Quyết định (Khối Đảng)",
        "doc_type": "Quyết định",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|QĐ\nL|QUYẾT ĐỊNH\nL|[về việc ...]\nL|-----\n"
            "L|- Căn cứ [Điều lệ Đảng; quy chế làm việc; văn bản liên quan];\n"
            "L|- Xét đề nghị của [cơ quan, đơn vị đề nghị].\n"
            "L|QUYẾT ĐỊNH:\nL|Điều 1. [Nội dung quyết định.]\n"
            "L|Điều 2. [Nội dung quyết định.]\n"
            "L|Điều 3. [Các cơ quan, đơn vị, cá nhân] chịu trách nhiệm thi hành Quyết định này.\n"
            "N|- Như Điều 3;\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG03KEHOACH0000003",
        "tag": "DANG|3",
        "group": "DANG",
        "index": 3,
        "code": "KH",
        "name": "Kế hoạch (Khối Đảng)",
        "doc_type": "Kế hoạch",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|KH\nL|KẾ HOẠCH\nL|[Trích yếu nội dung kế hoạch]\nL|-----\n"
            "L|[Căn cứ, mở đầu kế hoạch.]\nL|I. MỤC ĐÍCH, YÊU CẦU\nL|1. Mục đích\nL|[Nội dung.]\n"
            "L|2. Yêu cầu\nL|[Nội dung.]\nL|II. NỘI DUNG\nL|[Nội dung.]\n"
            "L|III. TỔ CHỨC THỰC HIỆN\nL|[Phân công nhiệm vụ, thời gian thực hiện.]\n"
            "N|- [Nơi nhận];\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG04BAOCAO00000004",
        "tag": "DANG|4",
        "group": "DANG",
        "index": 4,
        "code": "BC",
        "name": "Báo cáo (Khối Đảng)",
        "doc_type": "Báo cáo",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|BC\nL|BÁO CÁO\nL|[Trích yếu nội dung báo cáo]\nL|-----\n"
            "L|[Mở đầu báo cáo.]\nL|I. [TÌNH HÌNH, KẾT QUẢ THỰC HIỆN]\nL|[Nội dung.]\n"
            "L|II. [HẠN CHẾ, NGUYÊN NHÂN]\nL|[Nội dung.]\n"
            "L|III. [PHƯƠNG HƯỚNG, NHIỆM VỤ THỜI GIAN TỚI]\nL|[Nội dung.]\n"
            "L|IV. [KIẾN NGHỊ, ĐỀ XUẤT]\nL|[Nội dung.]\n"
            "N|- [Nơi nhận];\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG05THONGBAO000005",
        "tag": "DANG|5",
        "group": "DANG",
        "index": 5,
        "code": "TB",
        "name": "Thông báo (Khối Đảng)",
        "doc_type": "Thông báo",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|TB\nL|THÔNG BÁO\nL|[Trích yếu nội dung thông báo]\nL|-----\n"
            "L|[Nội dung thông báo.]\nN|- [Nơi nhận];\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG06TOTRINH0000006",
        "tag": "DANG|6",
        "group": "DANG",
        "index": 6,
        "code": "TTr",
        "name": "Tờ trình (Khối Đảng)",
        "doc_type": "Tờ trình",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|TTr\nL|TỜ TRÌNH\nL|[về ...]\nL|-----\n"
            "L|Kính trình: [Cơ quan, tổ chức nhận tờ trình].\n"
            "L|[Lý do, căn cứ trình.]\nL|[Nội dung đề nghị.]\n"
            "L|Kính trình [cơ quan, tổ chức] xem xét, quyết định.\n"
            "N|- Như trên;\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG07CONGVAN0000007",
        "tag": "DANG|7",
        "group": "DANG",
        "index": 7,
        "code": "CV",
        "name": "Công văn (Khối Đảng)",
        "doc_type": "Công văn",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|CV\nCV|1\nSUM|V/v [trích yếu nội dung công văn]\n"
            "L|Kính gửi: [Cơ quan, tổ chức nhận công văn].\n"
            "L|[Nội dung công văn.]\nN|- Như trên;\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG08GIAYMOI0000008",
        "tag": "DANG|8",
        "group": "DANG",
        "index": 8,
        "code": "GM",
        "name": "Giấy mời (Khối Đảng)",
        "doc_type": "Giấy mời",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|GM\nL|GIẤY MỜI\nL|[Trích yếu: dự hội nghị, cuộc họp ...]\nL|-----\n"
            "L|[Cơ quan ban hành] trân trọng kính mời: [Đại biểu được mời].\n"
            "L|Thời gian: [giờ, ngày, tháng, năm].\nL|Địa điểm: [địa điểm].\n"
            "L|Nội dung: [nội dung].\nL|[Đề nghị chuẩn bị tài liệu, liên hệ (nếu có).]\n"
            "N|- Như trên;\nN|- Lưu Văn phòng [cấp ủy].\n"
            "A|T/M BAN THƯỜNG VỤ\nR|[BÍ THƯ / PHÓ BÍ THƯ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0DANG09BIENBAN0000009",
        "tag": "DANG|9",
        "group": "DANG",
        "index": 9,
        "code": "BB",
        "name": "Biên bản (Khối Đảng)",
        "doc_type": "Biên bản",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn HD 05-HD/VPTW",
        "dsl": (
            "CODE|BB\nL|BIÊN BẢN\nL|[Trích yếu: cuộc họp, hội nghị ...]\nL|-----\n"
            "L|Thời gian bắt đầu: [giờ, ngày, tháng, năm].\nL|Địa điểm: [địa điểm].\n"
            "L|Thành phần tham dự: [thành phần].\nL|Chủ trì: [họ tên, chức vụ].\n"
            "L|Thư ký (người ghi biên bản): [họ tên, chức vụ].\n"
            "L|Nội dung: [theo diễn biến cuộc họp, hội nghị].\n"
            "L|Cuộc họp kết thúc vào [giờ, ngày, tháng, năm].\n"
            "A|\nR|CHỦ TRÌ\nH|[Họ và tên]\nLR|THƯ KÝ\nLH|[Họ và tên]"
        ),
    },
    # 8 State Templates (Khối Nhà nước: Chính quyền, Công an, Quân đội)
    {
        "id": "01M5P0NN01QUYETDINH0000010",
        "tag": "NHA_NUOC|1",
        "group": "NHA_NUOC",
        "index": 1,
        "code": "QĐ",
        "name": "Quyết định (Khối Nhà nước)",
        "doc_type": "Quyết định",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|QĐ\nL|QUYẾT ĐỊNH\nL|Về việc [...]\nL|-----\n"
            "L|[THẨM QUYỀN BAN HÀNH, VÍ DỤ: CHỦ TỊCH ỦY BAN NHÂN DÂN ...]\n"
            "L|Căn cứ [văn bản quy định thẩm quyền, chức năng, nhiệm vụ];\n"
            "L|Căn cứ [văn bản quy định nội dung, cơ sở ban hành];\n"
            "L|Theo đề nghị của [cơ quan, đơn vị đề nghị].\n"
            "L|QUYẾT ĐỊNH:\nL|Điều 1. [Nội dung quyết định.]\n"
            "L|Điều 2. [Hiệu lực thi hành.]\n"
            "L|Điều 3. [Các cơ quan, đơn vị, cá nhân] chịu trách nhiệm thi hành Quyết định này.\n"
            "N|- Như Điều 3;\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN02KEHOACH000000011",
        "tag": "NHA_NUOC|2",
        "group": "NHA_NUOC",
        "index": 2,
        "code": "KH",
        "name": "Kế hoạch (Khối Nhà nước)",
        "doc_type": "Kế hoạch",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|KH\nL|KẾ HOẠCH\nL|[Trích yếu nội dung kế hoạch]\nL|-----\n"
            "L|[Căn cứ, mở đầu kế hoạch.]\nL|I. MỤC ĐÍCH, YÊU CẦU\nL|1. Mục đích\nL|[Nội dung.]\n"
            "L|2. Yêu cầu\nL|[Nội dung.]\nL|II. NỘI DUNG\nL|[Nội dung.]\n"
            "L|III. TỔ CHỨC THỰC HIỆN\nL|[Phân công nhiệm vụ, thời gian thực hiện.]\n"
            "N|- [Nơi nhận];\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN03BAOCAO0000000012",
        "tag": "NHA_NUOC|3",
        "group": "NHA_NUOC",
        "index": 3,
        "code": "BC",
        "name": "Báo cáo (Khối Nhà nước)",
        "doc_type": "Báo cáo",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|BC\nL|BÁO CÁO\nL|[Trích yếu nội dung báo cáo]\nL|-----\n"
            "L|[Mở đầu báo cáo.]\nL|I. [TÌNH HÌNH, KẾT QUẢ THỰC HIỆN]\nL|[Nội dung.]\n"
            "L|II. [HẠN CHẾ, NGUYÊN NHÂN]\nL|[Nội dung.]\n"
            "L|III. [PHƯƠNG HƯỚNG, NHIỆM VỤ THỜI GIAN TỚI]\nL|[Nội dung.]\n"
            "L|IV. [KIẾN NGHỊ, ĐỀ XUẤT]\nL|[Nội dung.]\n"
            "N|- [Nơi nhận];\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN04THONGBAO00000013",
        "tag": "NHA_NUOC|4",
        "group": "NHA_NUOC",
        "index": 4,
        "code": "TB",
        "name": "Thông báo (Khối Nhà nước)",
        "doc_type": "Thông báo",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|TB\nL|THÔNG BÁO\nL|[Trích yếu nội dung thông báo]\nL|-----\n"
            "L|[Nội dung thông báo.]\nN|- [Nơi nhận];\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN05TOTRINH000000014",
        "tag": "NHA_NUOC|5",
        "group": "NHA_NUOC",
        "index": 5,
        "code": "TTr",
        "name": "Tờ trình (Khối Nhà nước)",
        "doc_type": "Tờ trình",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|TTr\nL|TỜ TRÌNH\nL|[Trích yếu nội dung tờ trình]\nL|-----\n"
            "L|Kính gửi: [Cơ quan, tổ chức nhận tờ trình].\n"
            "L|[Lý do, căn cứ trình.]\nL|[Nội dung đề nghị.]\n"
            "L|Kính trình [cơ quan, tổ chức] xem xét, quyết định.\n"
            "N|- Như trên;\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN06CONGVAN000000015",
        "tag": "NHA_NUOC|6",
        "group": "NHA_NUOC",
        "index": 6,
        "code": "CV",
        "name": "Công văn (Khối Nhà nước)",
        "doc_type": "Công văn",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|\nCV|1\nSUM|V/v [trích yếu nội dung công văn]\n"
            "L|Kính gửi: [Cơ quan, tổ chức nhận công văn].\n"
            "L|[Nội dung công văn.]\nN|- Như trên;\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN07GIAYMOI000000016",
        "tag": "NHA_NUOC|7",
        "group": "NHA_NUOC",
        "index": 7,
        "code": "GM",
        "name": "Giấy mời (Khối Nhà nước)",
        "doc_type": "Giấy mời",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|GM\nL|GIẤY MỜI\nL|[Trích yếu: dự hội nghị, cuộc họp ...]\nL|-----\n"
            "L|[Cơ quan ban hành] trân trọng kính mời: [Đại biểu được mời].\n"
            "L|Thời gian: [giờ, ngày, tháng, năm].\nL|Địa điểm: [địa điểm].\n"
            "L|Nội dung: [nội dung].\nL|[Đề nghị chuẩn bị tài liệu, liên hệ (nếu có).]\n"
            "N|- Như trên;\nN|- Lưu: VT, [đơn vị soạn thảo].\n"
            "A|[TM. / KT. / TL. ...]\nR|[CHỨC VỤ NGƯỜI KÝ]\nH|[Họ và tên]"
        ),
    },
    {
        "id": "01M5P0NN08BIENBAN000000017",
        "tag": "NHA_NUOC|8",
        "group": "NHA_NUOC",
        "index": 8,
        "code": "BB",
        "name": "Biên bản (Khối Nhà nước)",
        "doc_type": "Biên bản",
        "status": "ACTIVE",
        "statusLabel": "Chuẩn NĐ 30/2020/NĐ-CP",
        "dsl": (
            "CODE|BB\nL|BIÊN BẢN\nL|[Trích yếu: cuộc họp, hội nghị ...]\nL|-----\n"
            "L|Thời gian bắt đầu: [giờ, ngày, tháng, năm].\nL|Địa điểm: [địa điểm].\n"
            "L|Thành phần tham dự: [thành phần].\nL|Chủ trì: [họ tên, chức vụ].\n"
            "L|Thư ký (người ghi biên bản): [họ tên, chức vụ].\n"
            "L|Nội dung: [theo diễn biến cuộc họp, hội nghị].\n"
            "L|Cuộc họp kết thúc vào [giờ, ngày, tháng, năm].\n"
            "A|\nR|CHỦ TỌA\nH|[Họ và tên]\nLR|THƯ KÝ\nLH|[Họ và tên]"
        ),
    },
]


for _tpl_item in TEMPLATES_CATALOG:
    _tpl_item["id"] = str(uuid.uuid5(uuid.NAMESPACE_OID, f"3dohub:template:{_tpl_item['tag']}"))


def get_templates_list(group: Optional[str] = None) -> list[dict[str, Any]]:
    """Return formatted template records for API listing."""
    ts = now_iso_vn()
    out: list[dict[str, Any]] = []
    for item in TEMPLATES_CATALOG:
        if group and item["group"] != group.upper():
            continue
        out.append(
            {
                "id": item["id"],
                "tag": item["tag"],
                "group": item["group"],
                "index": item["index"],
                "code": item["code"],
                "name": item["name"],
                "doc_type": item["doc_type"],
                "status": item["status"],
                "statusLabel": item["statusLabel"],
                "version": 1,
                "created_at": ts,
                "updated_at": ts,
            }
        )
    return out


def find_template_by_tag(tag: str) -> Optional[dict[str, Any]]:
    """Find template entry by its tag ('DANG|1', 'NHA_NUOC|1', etc.)."""
    norm_tag = (tag or "").strip().upper()
    for item in TEMPLATES_CATALOG:
        if item["tag"].upper() == norm_tag:
            return item
    return None


def build_raw_text_from_template(
    tag: str, unit_info: Optional[dict[str, str]] = None
) -> str:
    """Build raw document text from a template DSL and unit configuration (ports TT_BuildTemplateDoc)."""
    tpl = find_template_by_tag(tag)
    if not tpl:
        return ""
    u = unit_info or {}
    grp = tpl["group"]
    dsl = tpl["dsl"]

    code = ""
    is_cv = False
    summary = ""
    body_lines: list[str] = []
    recip_lines: list[str] = []
    auth = ""
    role = ""
    signer = ""
    l_role = ""
    l_name = ""
    has_left_signer = False

    for line in dsl.splitlines():
        if "|" not in line:
            continue
        tg, val = line.split("|", 1)
        if tg == "CODE":
            code = val
        elif tg == "CV":
            is_cv = True
        elif tg == "SUM":
            summary = val
        elif tg == "L":
            body_lines.append(val)
        elif tg == "N":
            recip_lines.append(val)
        elif tg == "A":
            auth = val
        elif tg == "R":
            role = val
        elif tg == "H":
            signer = val
        elif tg == "LR":
            l_role = val
            has_left_signer = True
        elif tg == "LH":
            l_name = val

    u_cap_tren = (u.get("cap_tren") or "").strip()
    u_co_quan = (u.get("co_quan") or "").strip()
    u_viet_tat = (u.get("viet_tat") or "").strip()
    u_dia_danh = (u.get("dia_danh") or "").strip()
    u_tham_quyen = (u.get("tham_quyen") or "").strip()
    u_chuc_vu = (u.get("chuc_vu") or "").strip()
    u_ho_ten = (u.get("ho_ten") or "").strip()

    if not has_left_signer:
        if u_chuc_vu or u_ho_ten or u_tham_quyen:
            auth = u_tham_quyen
        if u_chuc_vu:
            role = u_chuc_vu
        if u_ho_ten:
            signer = u_ho_ten

    organ_lines: list[str] = []
    if u_cap_tren:
        organ_lines.extend(
            [x.strip() for x in u_cap_tren.replace("\n", "|").split("|") if x.strip()]
        )
    if u_co_quan:
        organ_lines.extend(
            [x.strip() for x in u_co_quan.replace("\n", "|").split("|") if x.strip()]
        )
    if not organ_lines:
        if grp == "DANG":
            organ_lines = ["[ĐẢNG BỘ CẤP TRÊN TRỰC TIẾP]", "[ĐẢNG ỦY / CHI BỘ BAN HÀNH]"]
        else:
            organ_lines = ["[TÊN CƠ QUAN CẤP TRÊN (NẾU CÓ)]", "[TÊN CƠ QUAN BAN HÀNH]"]

    org_abbr = u_viet_tat or "[VIẾT TẮT]"
    place_name = u_dia_danh or "[Địa danh]"
    year_str = str(datetime.now().year)

    if grp == "DANG":
        so_line = f"Số   -{code}/{org_abbr}"
        motto_lines = [TEXT_TIEU_NGU_DANG]
    elif is_cv:
        so_line = f"Số:   /{org_abbr}-[ĐVST]"
        motto_lines = [TEXT_QUOC_HIEU, TEXT_TIEU_NGU]
    else:
        so_line = f"Số:   /{code}-{org_abbr}"
        motto_lines = [TEXT_QUOC_HIEU, TEXT_TIEU_NGU]

    date_line = f"{place_name}, ngày    tháng    năm {year_str}"

    out_lines: list[str] = []
    out_lines.extend(organ_lines)
    if grp == "DANG":
        out_lines.append("*")
    out_lines.append(so_line)
    if is_cv and summary:
        out_lines.append(summary)
    out_lines.extend(motto_lines)
    out_lines.append(date_line)
    out_lines.extend(body_lines)

    if has_left_signer:
        out_lines.append(f"THƯ KÝ: {l_role} | {l_name}")
    elif recip_lines:
        out_lines.append("Nơi nhận:")
        out_lines.extend(recip_lines)

    if auth:
        out_lines.append(auth)
    if role:
        out_lines.append(role)
    if signer:
        out_lines.append(signer)

    return "\n".join(out_lines)

