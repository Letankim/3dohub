"""In-house 4-layer Vietnamese Administrative Spell Check & Style Engine (Backend)."""

import difflib
import json
import os
import re
import time
import unicodedata
from typing import Any, Optional

_DATASET_PATH = os.path.join(os.path.dirname(__file__), "data", "spell_dataset.json")
_CACHE: Optional[dict[str, Any]] = None

ADMIN_CAPITALIZATION = [
    (re.compile(r"đảng cộng sản việt nam", re.IGNORECASE), "Đảng Cộng sản Việt Nam", "Tên tổ chức chính trị"),
    (re.compile(r"ban chấp hành trung ương", re.IGNORECASE), "Ban Chấp hành Trung ương", "Tên cơ quan lãnh đạo Đảng"),
    (re.compile(r"chính phủ", re.IGNORECASE), "Chính phủ", "Tên cơ quan hành chính cao nhất"),
    (re.compile(r"quốc hội", re.IGNORECASE), "Quốc hội", "Tên cơ quan quyền lực cao nhất"),
    (re.compile(r"thủ tướng chính phủ", re.IGNORECASE), "Thủ tướng Chính phủ", "Chức danh người đứng đầu Chính phủ"),
    (re.compile(r"chủ tịch nước", re.IGNORECASE), "Chủ tịch nước", "Chức danh nguyên thủ quốc gia"),
    (re.compile(r"ủy ban nhân dân", re.IGNORECASE), "Ủy ban nhân dân", "Tên cơ quan chính quyền địa phương"),
    (re.compile(r"hội đồng nhân dân", re.IGNORECASE), "Hội đồng nhân dân", "Tên cơ quan dân cử địa phương"),
    (re.compile(r"bác hồ", re.IGNORECASE), "Bác Hồ", "Danh từ tôn xưng lãnh tụ"),
]

_WORD_RX = re.compile(r"[A-Za-zÀ-ỹĐđ]+")
_EXTRA_SAFE_PATTERN_STRS = [
    r"\[\^\d+\]",          # markdown footnote [^1]
    r"\[[^\]]+\]",         # template placeholder [Họ và tên]
]


def _unaccent(s: str) -> str:
    nfkd = unicodedata.normalize("NFD", s)
    return "".join(c for c in nfkd if unicodedata.category(c) != "Mn").replace("đ", "d").replace("Đ", "D").lower()


def _load_resources() -> dict[str, Any]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE

    with open(_DATASET_PATH, "r", encoding="utf-8") as f:
        raw = json.load(f)

    protected_rxs = []
    for p in raw.get("protected_patterns", []):
        try:
            protected_rxs.append(re.compile(p["regex"]))
        except re.error:
            pass
    for extra in _EXTRA_SAFE_PATTERN_STRS:
        protected_rxs.append(re.compile(extra))

    confusable_compiled = []
    for c in raw.get("confusable_phrases", []):
        esc = re.escape(c["wrong"])
        confusable_compiled.append((re.compile(esc, re.IGNORECASE), c))

    lexicon_set = set(raw.get("lexicon", []))
    # Add valid uppercase/common monosyllables and digits/roman prefixes safely
    lexicon_set.update({"ok", "email", "file", "pdf", "word", "excel", "online", "web", "app", "api", "vip"})

    unaccent_map: dict[str, list[str]] = {}
    for w in lexicon_set:
        ua = _unaccent(w)
        unaccent_map.setdefault(ua, []).append(w)

    _CACHE = {
        "confusable": confusable_compiled,
        "typo_map": raw.get("typo_map", {}),
        "protected_rxs": protected_rxs,
        "lexicon": lexicon_set,
        "unaccent_map": unaccent_map,
        "unaccent_keys": list(unaccent_map.keys()),
    }
    return _CACHE


def _preserve_case(orig: str, repl: str) -> str:
    if orig.isupper():
        return repl.upper()
    if orig and orig[0].isupper():
        return repl[0].upper() + repl[1:]
    return repl


def _is_word_char(ch: str) -> bool:
    return ch.isalnum()


def _is_boundary(text: str, start: int, end: int) -> bool:
    prev_ok = start == 0 or not _is_word_char(text[start - 1])
    next_ok = end >= len(text) or not _is_word_char(text[end])
    return prev_ok and next_ok


def _in_protected(start: int, end: int, ranges: list[tuple[int, int]]) -> bool:
    return any(max(start, r0) < min(end, r1) for r0, r1 in ranges)


def _snippet(text: str, start: int, end: int) -> str:
    b = text[max(0, start - 24):start]
    m = text[start:end]
    a = text[end:min(len(text), end + 24)]
    return re.sub(r"\s+", " ", f"{b}[{m}]{a}").strip()


def analyze_spelling(text: str) -> dict[str, Any]:
    """Run 4-layer Vietnamese administrative spelling and style analysis."""
    t0 = time.perf_counter()
    if not text or not text.strip():
        return {
            "issues": [],
            "stats": {
                "total": 0, "spelling": 0, "confusable": 0,
                "capitalization": 0, "punctuation": 0,
                "wordsCount": 0, "charsCount": 0, "executionMs": 0.0,
            },
        }

    res = _load_resources()
    protected_ranges: list[tuple[int, int]] = []
    for rx in res["protected_rxs"]:
        for m in rx.finditer(text):
            protected_ranges.append((m.start(), m.end()))

    issues: list[dict[str, Any]] = []
    seq = 1

    # Layer 1: Punctuation spacing
    for m in re.finditer(r"(\S)([ \t]+)(?=[,.:;!?])", text):
        s, e = m.start(2), m.end(2)
        if not _in_protected(s, e, protected_ranges):
            issues.append({
                "id": f"punct_{seq}", "startIndex": s, "endIndex": e,
                "original": m.group(2), "replacement": "",
                "category": "PUNCTUATION", "categoryLabel": "Dấu câu",
                "severity": "info", "message": "Không đặt dấu cách trước dấu câu (xóa khoảng trắng thừa)",
                "context": _snippet(text, m.start(), e + 1), "ruleId": "PUNCT_NO_SPACE_BEFORE",
                "isSafeAutoFix": True,
            })
            seq += 1

    for m in re.finditer(r"([,;])(?=[^\s\d,.:;!?)\"'»\]])", text):
        s, e = m.start(1), m.end(1)
        if not _in_protected(s, e, protected_ranges):
            issues.append({
                "id": f"punct_{seq}", "startIndex": s, "endIndex": e,
                "original": m.group(1), "replacement": f"{m.group(1)} ",
                "category": "PUNCTUATION", "categoryLabel": "Dấu câu",
                "severity": "info", "message": "Cần có một dấu cách sau dấu phẩy hoặc chấm phẩy",
                "context": _snippet(text, s, min(len(text), e + 2)), "ruleId": "PUNCT_SPACE_AFTER",
                "isSafeAutoFix": True,
            })
            seq += 1

    # Layer 2: Confusable Administrative Phrases (406 entries)
    for rx, meta in res["confusable"]:
        for m in rx.finditer(text):
            s, e = m.start(), m.end()
            if _is_boundary(text, s, e) and not _in_protected(s, e, protected_ranges):
                orig = m.group(0)
                repl = _preserve_case(orig, meta["correct"])
                issues.append({
                    "id": f"confuse_{seq}", "startIndex": s, "endIndex": e,
                    "original": orig, "replacement": repl,
                    "category": "CONFUSABLE", "categoryLabel": "Ngữ cảnh từ vựng",
                    "severity": meta.get("severity", "warning"),
                    "message": meta.get("description") or f'Từ ngữ chuẩn mực là "{meta["correct"]}"',
                    "context": _snippet(text, s, e), "ruleId": f"CONFUSE_{meta['wrong']}",
                    "isSafeAutoFix": True,
                })
                seq += 1

    # Layer 3: Telex/VNI typos & Syllable lexicon check
    typo_map = res["typo_map"]
    lexicon = res["lexicon"]
    unaccent_map = res["unaccent_map"]
    for m in _WORD_RX.finditer(text):
        word = m.group(0)
        s, e = m.start(), m.end()
        if _in_protected(s, e, protected_ranges):
            continue
        lower = word.lower()
        if lower in typo_map:
            repl = _preserve_case(word, typo_map[lower])
            issues.append({
                "id": f"typo_{seq}", "startIndex": s, "endIndex": e,
                "original": word, "replacement": repl,
                "category": "SPELLING", "categoryLabel": "Lỗi gõ phím",
                "severity": "error", "message": f'Lỗi gõ phím dính dấu: "{word}" nên viết là "{repl}"',
                "context": _snippet(text, s, e), "ruleId": f"TYPO_{lower}",
                "isSafeAutoFix": True,
            })
            seq += 1
        elif word.islower() and len(word) >= 2 and lower not in lexicon:
            # Fuzzy match closest unaccented syllable
            ua = _unaccent(lower)
            cands = unaccent_map.get(ua)
            if not cands:
                near_keys = difflib.get_close_matches(ua, res["unaccent_keys"], n=1, cutoff=0.75)
                if near_keys:
                    cands = unaccent_map.get(near_keys[0])
            if cands:
                sug = cands[0]
                issues.append({
                    "id": f"lex_{seq}", "startIndex": s, "endIndex": e,
                    "original": word, "replacement": sug,
                    "category": "SPELLING", "categoryLabel": "Chính tả từ đơn",
                    "severity": "warning", "message": f'Nghi vấn sai chính tả âm tiết "{word}". Gợi ý gần nhất: "{sug}"',
                    "context": _snippet(text, s, e), "ruleId": "LEXICON_UNKNOWN_SYLLABLE",
                    "isSafeAutoFix": False,
                })
                seq += 1

    # Layer 4: Administrative Capitalization Rules
    for rx, correct, label in ADMIN_CAPITALIZATION:
        for m in rx.finditer(text):
            orig = m.group(0)
            s, e = m.start(), m.end()
            if orig != correct and _is_boundary(text, s, e) and not _in_protected(s, e, protected_ranges):
                issues.append({
                    "id": f"cap_{seq}", "startIndex": s, "endIndex": e,
                    "original": orig, "replacement": correct,
                    "category": "CAPITALIZATION", "categoryLabel": "Viết hoa thể thức",
                    "severity": "warning", "message": f'Quy tắc viết hoa hành chính ({label}): "{correct}"',
                    "context": _snippet(text, s, e), "ruleId": "CAP_ADMIN_ORG",
                    "isSafeAutoFix": True,
                })
                seq += 1

    # Deduplicate overlapping spans (prefer earlier start, then longer match)
    issues.sort(key=lambda x: (x["startIndex"], -(x["endIndex"] - x["startIndex"])))
    deduped = []
    last_end = -1
    for iss in issues:
        if iss["startIndex"] >= last_end:
            deduped.append(iss)
            last_end = iss["endIndex"]

    elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
    words_count = len(text.split())

    return {
        "issues": deduped,
        "stats": {
            "total": len(deduped),
            "spelling": sum(1 for i in deduped if i["category"] == "SPELLING"),
            "confusable": sum(1 for i in deduped if i["category"] == "CONFUSABLE"),
            "capitalization": sum(1 for i in deduped if i["category"] == "CAPITALIZATION"),
            "punctuation": sum(1 for i in deduped if i["category"] == "PUNCTUATION"),
            "wordsCount": words_count,
            "charsCount": len(text),
            "executionMs": elapsed_ms,
        },
    }


def apply_safe_auto_fixes(text: str, issues: list[dict[str, Any]]) -> tuple[str, int]:
    """Apply all safe automatic fixes back-to-front."""
    safe = sorted([i for i in issues if i.get("isSafeAutoFix")], key=lambda x: x["startIndex"], reverse=True)
    updated = text
    for iss in safe:
        s, e = iss["startIndex"], iss["endIndex"]
        if 0 <= s <= e <= len(updated):
            updated = updated[:s] + iss["replacement"] + updated[e:]
    return updated, len(safe)

