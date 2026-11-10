"""Hồi quy: chuẩn hóa lần 2 trên nội dung lấy lại từ editor KHÔNG được làm mất gì.

Mô phỏng đúng thuật toán `extractTextAndFootnotesFromSfdt` (frontend/utils/sfdt-extract.ts):
mỗi đoạn (kể cả trong ô bảng) = 1 dòng; footnote thật -> [^n] + dòng định nghĩa cuối văn bản.
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from app.modules.van_ban.normalizer import normalize_document_lines
from app.modules.van_ban.sfdt_builder import build_sfdt

LINES = """ĐẢNG BỘ THÀNH PHỐ CẦN THƠ
ĐẢNG ỦY XÃ THẠNH PHÚ
Số: 01-BC/ĐU
ĐẢNG CỘNG SẢN VIỆT NAM
Thạnh Phú, ngày 04 tháng 11 năm 2026
BÁO CÁO
tình hình thực hiện nhiệm vụ 10 tháng đầu năm
và phương hướng, nhiệm vụ trọng tâm 02 tháng cuối năm 2026
Thực hiện nghiêm túc đảng viên[^1]. Đây là đoạn hai.
Sử dụng Sổ tay đảng viên điện tử[^2].
Nơi nhận:
- Như trên
TM. BAN THƯỜNG VỤ
BÍ THƯ
Nguyễn Văn A
[^1]: Tỷ lệ đảng viên tham gia học tập đạt 98,9%.
[^2]: Ban hành Kế hoạch số 67-KH/ĐU ngày 25/9/2026.""".splitlines()


def extract_like_frontend(sfdt: dict) -> tuple[list[str], list[dict]]:
    lines: list[str] = []
    fns: list[dict] = []

    def para(inlines: list) -> str:
        out = ""
        for inl in inlines:
            if inl.get("footnoteType"):
                body = " ".join(
                    "".join(i.get("text", "") for i in b.get("inlines", []) if not i.get("footnoteType")).strip()
                    for b in inl.get("blocks", [])
                ).strip()
                n = str(len(fns) + 1)
                out += f"[^{n}]"
                fns.append({"n": n, "text": body})
            elif isinstance(inl.get("text"), str):
                out += inl["text"]
        return out

    def walk(block: dict) -> None:
        if "inlines" in block:
            t = para(block["inlines"]).strip()
            if t:
                lines.append(t)
            return
        for row in block.get("rows", []):
            for cell in row.get("cells", []):
                for b in cell.get("blocks", []):
                    walk(b)

    for sec in sfdt["sections"]:
        for b in sec["blocks"]:
            walk(b)
    for f in fns:
        lines.append(f"[^{f['n']}]: {f['text']}")
    return lines, fns


def test_double_normalize_keeps_everything():
    n1 = normalize_document_lines(LINES, "AUTO")
    assert len(n1["footnotes"]) == 2
    lines2, fns2 = extract_like_frontend(build_sfdt(n1))
    n2 = normalize_document_lines(lines2, "AUTO", fns2)
    n3_lines, n3_fns = extract_like_frontend(build_sfdt(n2))
    n3 = normalize_document_lines(n3_lines, "AUTO", n3_fns)

    for other in (n2, n3):
        assert other["footnotes"] == n1["footnotes"], "Footnote bị mất/đổi sau khi chuẩn hóa lại"
        assert other["header"] == n1["header"], "Tiêu ngữ/số/ngày bị mất sau khi chuẩn hóa lại"
        assert other["footer"] == n1["footer"], "Nơi nhận/chữ ký bị mất sau khi chuẩn hóa lại"
        assert other["body_paragraphs"] == n1["body_paragraphs"], "Thân văn bản bị đổi"
    print("[PASS] test_double_normalize_keeps_everything")


if __name__ == "__main__":
    test_double_normalize_keeps_everything()

