"""Process SpellCheck data from mau-theo into clean TypeScript modules for 3DoHub."""

import os
import json

SPELL_DATA_DIR = "mau-theo/SpellCheck/Data"
OUT_DIR = "frontend/src/modules/spell-check/data"
os.makedirs(OUT_DIR, exist_ok=True)


def build_confusable_phrases():
    fp = os.path.join(SPELL_DATA_DIR, "confusable_phrases.json")
    if not os.path.exists(fp):
        print(f"File not found: {fp}")
        return
    with open(fp, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Convert to compact list of entries
    entries = []
    seen_wrongs = set()
    for wrong, val in data.items():
        seen_wrongs.add(wrong.lower())
        entries.append(
            {
                "wrong": wrong,
                "correct": val.get("replacement", ""),
                "description": val.get("description", ""),
                "category": val.get("category", "spelling"),
                "severity": val.get("severity", "warning"),
                "example": val.get("examples", [""])[0] if val.get("examples") else "",
            }
        )

    extra_phrases = [
        {
            "wrong": "bàng giao",
            "correct": "bàn giao",
            "description": "Từ ngữ chuẩn mực trong văn bản hành chính là 'bàn giao' (chuyển giao công việc, tài sản).",
            "category": "spelling",
            "severity": "error",
            "example": "Đúng: Tổ chức lễ bàn giao nhiệm vụ và tài sản công.",
        },
        {
            "wrong": "dành quyền",
            "correct": "giành quyền",
            "description": "Dùng 'giành quyền' (tranh thủ, đạt được quyền lợi/quyền hạn bằng nỗ lực), không viết 'dành quyền'.",
            "category": "spelling",
            "severity": "error",
            "example": "Đúng: Giành quyền chủ động trong chỉ đạo, điều hành.",
        },
        {
            "wrong": "đọc giả",
            "correct": "độc giả",
            "description": "Từ Hán-Việt chuẩn mực là 'độc giả' (người đọc), không viết 'đọc giả'.",
            "category": "spelling",
            "severity": "warning",
            "example": "Đúng: Phục vụ nhu cầu tìm hiểu của đông đảo độc giả.",
        },
        {
            "wrong": "xúc tích",
            "correct": "súc tích",
            "description": "Từ chuẩn mực là 'súc tích' (cô đọng, ngắn gọn nhưng đầy đủ ý nghĩa).",
            "category": "spelling",
            "severity": "warning",
            "example": "Đúng: Báo cáo tổng kết cần viết ngắn gọn, súc tích.",
        },
        {
            "wrong": "sáng lạng",
            "correct": "xán lạn",
            "description": "Từ Hán-Việt chuẩn mực là 'xán lạn' (rực rỡ, tốt đẹp).",
            "category": "spelling",
            "severity": "warning",
            "example": "Đúng: Tương lai phát triển xán lạn.",
        },
    ]
    for ex in extra_phrases:
        if ex["wrong"].lower() not in seen_wrongs:
            entries.append(ex)
            seen_wrongs.add(ex["wrong"].lower())

    ts_content = f"""/**
 * 404 Commonly Confused Administrative Phrases & Collocations in Vietnamese.
 * In-House Linguistic Knowledge Base for 3DoHub.
 */

export interface ConfusablePhraseEntry {{
  wrong: string;
  correct: string;
  description: string;
  category: string;
  severity: 'error' | 'warning' | 'info';
  example: string;
}}

export const CONFUSABLE_PHRASES: ConfusablePhraseEntry[] = {json.dumps(entries, ensure_ascii=False, indent=2)};
"""
    with open(os.path.join(OUT_DIR, "confusable-phrases.ts"), "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Generated {len(entries)} confusable phrases!")


def build_typo_map():
    fp = os.path.join(SPELL_DATA_DIR, "typo_map.json")
    if not os.path.exists(fp):
        print(f"File not found: {fp}")
        return
    with open(fp, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Compact map: wrong -> correct string
    clean_map = {}
    for wrong, val in data.items():
        suggs = val.get("suggestions", [])
        if suggs:
            clean_map[wrong] = suggs[0]

    ts_content = f"""/**
 * Common Vietnamese Telex/VNI Typing Typo Dictionary for 3DoHub.
 */

export const TYPO_MAP: Record<string, string> = {json.dumps(clean_map, ensure_ascii=False, indent=2)};
"""
    with open(os.path.join(OUT_DIR, "typo-map.ts"), "w", encoding="utf-8") as f:
        f.write(ts_content)
    print(f"Generated {len(clean_map)} typo map entries!")


def build_rules():
    # Capitalization rules
    cap_fp = os.path.join(SPELL_DATA_DIR, "capitalization_rules.json")
    with open(cap_fp, "r", encoding="utf-8") as f:
        cap_data = json.load(f)
    cap_ts = f"""/**
 * Administrative Capitalization Rules (NĐ 30/2020 & HD 05-HD/VPTW).
 */

export interface CapitalizationRule {{
  id: string;
  category: string;
  severity: string;
  description: string;
  source: string;
}}

export const CAPITALIZATION_RULES: CapitalizationRule[] = {json.dumps([
    {
        "id": r["id"],
        "category": r.get("category", "capitalization"),
        "severity": r.get("severity", "warning"),
        "description": r.get("description", ""),
        "source": f"{r.get('source', {}).get('document', '')} {r.get('source', {}).get('appendix', '')}".strip()
    }
    for r in cap_data
], ensure_ascii=False, indent=2)};
"""
    with open(os.path.join(OUT_DIR, "capitalization-rules.ts"), "w", encoding="utf-8") as f:
        f.write(cap_ts)

    # Punctuation rules
    punct_fp = os.path.join(SPELL_DATA_DIR, "punctuation_rules.json")
    with open(punct_fp, "r", encoding="utf-8") as f:
        punct_data = json.load(f).get("rules", [])
    punct_ts = f"""/**
 * Vietnamese Administrative Punctuation & Spacing Rules.
 */

export interface PunctuationRule {{
  id: string;
  punctuation: string[];
  rule: string;
  example_error: string;
  example_correct: string;
}}

export const PUNCTUATION_RULES: PunctuationRule[] = {json.dumps(punct_data, ensure_ascii=False, indent=2)};
"""
    with open(os.path.join(OUT_DIR, "punctuation-rules.ts"), "w", encoding="utf-8") as f:
        f.write(punct_ts)

    # Protected patterns
    prot_fp = os.path.join(SPELL_DATA_DIR, "protected_patterns.json")
    with open(prot_fp, "r", encoding="utf-8") as f:
        prot_data = json.load(f).get("patterns", [])
    prot_ts = f"""/**
 * Protected Text Patterns (Document Codes, Dates, Emails, Decimals).
 * These must never be flagged as spelling errors.
 */

export interface ProtectedPattern {{
  name: string;
  regex: string;
  description: string;
}}

export const PROTECTED_PATTERNS: ProtectedPattern[] = {json.dumps([
    {
        "name": p["name"],
        "regex": p["regex"],
        "description": p.get("description", "")
    }
    for p in prot_data
], ensure_ascii=False, indent=2)};
"""
    with open(os.path.join(OUT_DIR, "protected-patterns.ts"), "w", encoding="utf-8") as f:
        f.write(prot_ts)

    print("Generated rules & patterns successfully!")


if __name__ == "__main__":
    build_confusable_phrases()
    build_typo_map()
    build_rules()
