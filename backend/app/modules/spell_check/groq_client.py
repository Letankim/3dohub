"""Backend-only Groq LLM Client with automatic Model Rotation, TTL Cache & Rate-Limit Resilience.
Never exposes model names, keys, or prompts outside the backend process.
"""

from collections import OrderedDict
import hashlib
import json
import re
import threading
import time
import urllib.error
import urllib.request
from typing import Any, Optional
from app.core.config import settings

_GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

_ROTATION_LOCK = threading.Lock()
_CURSOR = 0
_COOLDOWN_UNTIL: dict[str, float] = {}

_CACHE_TTL_SEC = 180.0
_CACHE_MAX_SIZE = 128
_RESPONSE_CACHE: OrderedDict[str, tuple[float, list[dict[str, Any]]]] = OrderedDict()

_SYSTEM_PROMPT = """Bạn là chuyên gia ngôn ngữ học, biên tập viên cao cấp và chuyên viên văn thư hành chính Việt Nam (tuân thủ Từ điển Tiếng Việt Hoàng Phê, Nghị định 30/2020/NĐ-CP và Hướng dẫn 05-HD/VPTW).
Nhiệm vụ: Kiểm tra CHÍNH TẢ và NGỮ NGHĨA toàn diện trong văn bản tiếng Việt:
1. Chính tả, thanh điệu & gõ phím: sai dấu hỏi/ngã, phụ âm đầu (s/x, ch/tr, l/n, d/gi/r), vần, gõ Telex/VNI ("kieemr"->"kiểm", "nố lực"->"nỗ lực", "hạn chê"->"hạn chế", "sử lý"->"xử lý", "suốt sắc"->"xuất sắc"). Luôn ưu tiên phương án gần âm, đúng nghĩa nhất trong ngữ cảnh.
2. Chính tả NGỮ NGHĨA & NGỮ CẢNH:
   - Dùng từ sai nghĩa hoặc lẫn với từ gần âm khiến câu sai nghĩa/vô nghĩa (VD: "bảo mạng"->"bảo đảm", "dành giật thắng lợi"->"giành thắng lợi", "tranh dành"->"tranh giành", "bàng giao"->"bàn giao", "sát nhập"->"sáp nhập", "chuẩn đoán"->"chẩn đoán", "xuất ăn"->"suất ăn", "tham quan bác"->"thăm bác", "điểm yếu" vs "yếu điểm", "tăng thiệt hại"->"gây thiệt hại").
   - Cụm từ phi logic, mâu thuẫn ngữ nghĩa thực tế (VD: "ăn cơm bằng ti vi", "nâng cao hiệu quả mất mát"). Với lỗi phi logic, chọn đúng cụm vô lý làm "original" và đề xuất cụm thay thế hợp lý.
3. Viết hoa quy chuẩn cơ quan/chức danh theo NĐ 30/2020 và dấu câu.

QUY TẮC BẮT BUỘC:
- Chỉ trả về DUY NHẤT JSON hợp lệ:
  {"issues": [{"original": "cụm sai nguyên văn", "replacement": "cụm sửa đúng", "category": "SPELLING|SEMANTIC|CONFUSABLE|CAPITALIZATION|PUNCTUATION", "reason": "giải thích súc tích <= 20 từ bằng tiếng Việt"}]}
- "original" phải KHỚP CHÍNH XÁC 100% từng ký tự trong văn bản đầu vào.
- "replacement" phải khác "original", chỉ thay đúng phần cần sửa, giữ ngữ pháp trôi chảy và không gộp thừa từ phía sau.
- KHÔNG bắt bẻ các biến thể viết cùng đúng như "ti vi"/"tivi", "kỹ"/"kĩ", "quy"/"qui", từ vay mượn thông dụng ("Zalo", "website", "email").
- TUYỆT ĐỐI KHÔNG biến cụm tên cơ quan ở giữa câu văn (VD: "Ủy ban nhân dân xã...", "Chính phủ...", "Đảng ủy...") thành CHỮ IN HOA TOÀN BỘ.
- TUYỆT ĐỐI KHÔNG sửa các tiêu ngữ chuẩn ("Cộng hòa xã hội chủ nghĩa Việt Nam", "Độc lập - Tự do - Hạnh phúc", "Đảng Cộng sản Việt Nam"), dòng tiêu đề viết IN HOA toàn bộ ("ỦY BAN NHÂN DÂN", "BÁO CÁO"), ngoặc "[...]", chú thích "[^1]", số hiệu văn bản ("30/2020/NĐ-CP"), ngày tháng, tên riêng hợp lệ hoặc câu văn đã chuẩn xác.
- Nếu văn bản hoàn toàn chuẩn xác về chính tả và ngữ nghĩa, trả về {"issues": []}."""


def _next_candidate_models() -> list[str]:
    """Return models ordered from next round-robin slot, keeping non-cooldown models first."""
    global _CURSOR
    models = settings.GROQ_MODELS or [
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
    ]
    now = time.monotonic()
    with _ROTATION_LOCK:
        start = _CURSOR % len(models)
        _CURSOR = (_CURSOR + 1) % len(models)
        ordered = models[start:] + models[:start]
        ready = [m for m in ordered if _COOLDOWN_UNTIL.get(m, 0.0) <= now]
        cooling = [m for m in ordered if _COOLDOWN_UNTIL.get(m, 0.0) > now]
    return ready + cooling


def _mark_cooldown(model: str, seconds: float = 45.0) -> None:
    with _ROTATION_LOCK:
        _COOLDOWN_UNTIL[model] = time.monotonic() + seconds


def _build_payload(model_id: str, segment: str) -> dict[str, Any]:
    """Tune generation parameters per Groq model family so reasoning tokens never starve JSON output."""
    payload: dict[str, Any] = {
        "model": model_id,
        "temperature": 0.0,
        "messages": [
            {"role": "system", "content": _SYSTEM_PROMPT},
            {"role": "user", "content": segment},
        ],
    }
    low = model_id.lower()
    if "gpt-oss" in low:
        payload["reasoning_effort"] = "low"
        payload["max_tokens"] = 2200
    elif "qwen" in low:
        # Qwen3.8 on Groq defaults to non-thinking when reasoning_effort is omitted, within 1000 OTPM limit.
        payload["max_tokens"] = 550
    else:
        payload["max_tokens"] = 1200
    return payload


def _extract_json_issues(raw_content: str) -> Optional[list[dict[str, Any]]]:
    """Parse {"issues": [...]}; return None on empty/truncated/corrupt output so rotation can try next model."""
    if not raw_content or not raw_content.strip():
        return None
    cleaned = re.sub(r"<think>.*?</think>", "", raw_content, flags=re.DOTALL).strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE).strip()

    start_brace = cleaned.find("{")
    end_brace = cleaned.rfind("}")
    if start_brace == -1 or end_brace == -1 or end_brace <= start_brace:
        return None
    try:
        parsed = json.loads(cleaned[start_brace : end_brace + 1])
    except json.JSONDecodeError:
        return None

    if not isinstance(parsed, dict) or not isinstance(parsed.get("issues"), list):
        return None

    deduped: list[dict[str, Any]] = []
    seen_pairs: set[tuple[str, str]] = set()
    for it in parsed["issues"]:
        if not isinstance(it, dict):
            continue
        orig = str(it.get("original") or "").strip()
        repl = str(it.get("replacement") or "").strip()
        if not orig or not repl or orig == repl:
            continue
        pair = (orig, repl)
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        deduped.append(it)
    return deduped


def _get_cached(key: str) -> Optional[list[dict[str, Any]]]:
    now = time.monotonic()
    with _ROTATION_LOCK:
        entry = _RESPONSE_CACHE.get(key)
        if not entry:
            return None
        expires_at, val = entry
        if expires_at <= now:
            _RESPONSE_CACHE.pop(key, None)
            return None
        _RESPONSE_CACHE.move_to_end(key)
        return val


def _set_cached(key: str, val: list[dict[str, Any]]) -> None:
    with _ROTATION_LOCK:
        _RESPONSE_CACHE[key] = (time.monotonic() + _CACHE_TTL_SEC, val)
        _RESPONSE_CACHE.move_to_end(key)
        while len(_RESPONSE_CACHE) > _CACHE_MAX_SIZE:
            _RESPONSE_CACHE.popitem(last=False)


def query_groq_spell_issues(text: str) -> list[dict[str, Any]]:
    """Call Groq with multi-model rotation + TTL cache to detect spelling & semantic issues."""
    api_key = settings.GROQ_API_KEY
    if not api_key or not text or not text.strip():
        return []

    segment = text[:6000]
    cache_key = hashlib.sha256(segment.encode("utf-8")).hexdigest()
    cached = _get_cached(cache_key)
    if cached is not None:
        return cached

    models = _next_candidate_models()

    for model_id in models:
        payload = _build_payload(model_id, segment)
        req = urllib.request.Request(
            _GROQ_CHAT_URL,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "3DoHub/2.0",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=16) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                choice = body.get("choices", [{}])[0]
                if choice.get("finish_reason") == "length":
                    _mark_cooldown(model_id, seconds=15.0)
                    continue
                content = choice.get("message", {}).get("content", "")
                parsed = _extract_json_issues(content)
                if parsed is None:
                    _mark_cooldown(model_id, seconds=15.0)
                    continue
                _set_cached(cache_key, parsed)
                return parsed
        except urllib.error.HTTPError as exc:
            _mark_cooldown(model_id, seconds=45.0 if exc.code == 429 else 20.0)
            continue
        except Exception:
            _mark_cooldown(model_id, seconds=15.0)
            continue

    return []
