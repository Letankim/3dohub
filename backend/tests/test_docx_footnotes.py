"""Test DOCX footnote extraction and normalization."""

import io
import os
import sys
import zipfile
import xml.etree.ElementTree as ET

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from docx import Document
from app.modules.van_ban.docx_parser import extract_lines_from_docx_bytes
from app.modules.van_ban.normalizer import normalize_document_lines
from app.modules.van_ban.sfdt_builder import build_sfdt

def test_docx_superscript_footnote_extraction():
    doc = Document()
    doc.add_paragraph("ĐẢNG BỘ TỈNH BẾN TRE")
    doc.add_paragraph("ĐẢNG ỦY XÃ THẠNH PHÚ")
    doc.add_paragraph("Số: 12-BC/ĐU")
    doc.add_paragraph("ĐẢNG CỘNG SẢN VIỆT NAM")
    doc.add_paragraph("Thạnh Phú, ngày 10 tháng 2 năm 2026")
    doc.add_paragraph("BÁO CÁO")
    doc.add_paragraph("tình hình thực hiện nhiệm vụ năm 2026")
    doc.add_paragraph("Nhiệm vụ trọng tâm chuyển đổi số cán bộ, đảng viên¹. Thực hiện nghiêm Kết luận số 01-KL/TW.")
    doc.add_paragraph("¹ Tỷ lệ đảng viên tham gia học tập nghị quyết trực tuyến đạt trên 98,9%.")
    doc.add_paragraph("Nơi nhận:")
    doc.add_paragraph("- Ban Thường vụ")
    doc.add_paragraph("TM. BAN THƯỜNG VỤ")
    doc.add_paragraph("BÍ THƯ")
    doc.add_paragraph("Nguyễn Văn A")

    buf = io.BytesIO()
    doc.save(buf)
    file_bytes = buf.getvalue()

    lines = extract_lines_from_docx_bytes(file_bytes)
    assert any("[^1]" in line for line in lines), "Body text must have [^1] marker"
    assert any("[^1]:" in line for line in lines), "Footnote definition must be formatted as [^1]:"

    norm = normalize_document_lines(lines, "DANG")
    assert len(norm.get("footnotes") or []) == 1
    assert "98,9%" in norm["footnotes"][0]["text"]

    sfdt = build_sfdt(norm)
    sfdt_str = str(sfdt)
    assert "Footnote" in sfdt_str
    assert "98,9%" in sfdt_str
    print("[PASS] test_docx_superscript_footnote_extraction passed!")

def test_docx_openxml_footnote_extraction():
    # Construct a real .docx with word/footnotes.xml and <w:footnoteReference>
    doc = Document()
    doc.add_paragraph("ĐẢNG BỘ THÀNH PHỐ CẦN THƠ")
    doc.add_paragraph("ĐẢNG ỦY XÃ THẠNH PHÚ")
    doc.add_paragraph("Số: 01-BC/ĐU")
    doc.add_paragraph("ĐẢNG CỘNG SẢN VIỆT NAM")
    doc.add_paragraph("Thạnh Phú, ngày 04 tháng 11 năm 2026")
    doc.add_paragraph("BÁO CÁO")
    doc.add_paragraph("tình hình thực hiện nhiệm vụ 10 tháng đầu năm 2026")
    p = doc.add_paragraph("Công tác phát triển đảng viên")
    # Add footnoteReference in XML
    from docx.oxml import OxmlElement
    from docx.oxml.ns import qn
    r = p.add_run(". Tiếp tục củng cố.")
    fn_ref = OxmlElement("w:footnoteReference")
    fn_ref.set(qn("w:id"), "1")
    p._p.insert(len(p._p) - 1, fn_ref)

    doc.add_paragraph("Nơi nhận:")
    doc.add_paragraph("- Thường trực")
    doc.add_paragraph("TM. BAN THƯỜNG VỤ")
    doc.add_paragraph("BÍ THƯ")
    doc.add_paragraph("Trần Văn B")

    buf = io.BytesIO()
    doc.save(buf)
    base_bytes = buf.getvalue()

    # Inject word/footnotes.xml into zip
    fn_xml = b'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:footnotes xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:footnote w:type="separator" w:id="-1"/>
  <w:footnote w:type="continuationSeparator" w:id="0"/>
  <w:footnote w:id="1">
    <w:p>
      <w:r><w:footnoteRef/></w:r>
      <w:r><w:t> Ty le dang vien tham gia dat 100% chi tieu.</w:t></w:r>
    </w:p>
  </w:footnote>
</w:footnotes>'''

    new_buf = io.BytesIO()
    with zipfile.ZipFile(io.BytesIO(base_bytes), "r") as zin:
        with zipfile.ZipFile(new_buf, "w") as zout:
            for item in zin.infolist():
                zout.writestr(item, zin.read(item.filename))
            zout.writestr("word/footnotes.xml", fn_xml)

    lines = extract_lines_from_docx_bytes(new_buf.getvalue())
    assert any("[^1]" in line for line in lines), "OpenXML footnoteReference must yield [^1]"
    assert any("[^1]:" in line for line in lines), "Footnote text must be extracted as [^1]:"
    assert any("Ty le dang vien tham gia dat 100%" in line for line in lines)

    norm = normalize_document_lines(lines, "DANG")
    assert len(norm.get("footnotes") or []) == 1
    assert "100% chi tieu" in norm["footnotes"][0]["text"]
    print("[PASS] test_docx_openxml_footnote_extraction passed!")

if __name__ == "__main__":
    test_docx_superscript_footnote_extraction()
    test_docx_openxml_footnote_extraction()
