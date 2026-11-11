"""Backend-only Groq LLM Client with automatic Model Rotation & Rate-Limit Resilience.
Never exposes model names, keys, or prompts outside the backend process.
"""

import json
import re
import threading
import time
import urllib.error
import urllib.request
from typing import Any
from app.core.config import settings

_GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions"

_ROTATION_LOCK = threading.Lock()
_CURSOR = 0
_COOLDOWN_UNTIL: dict[str, float] = {}

_SYSTEM_PROMPT = """Bạn là chuyên gia ngôn ngữ và văn thư hành chính Việt Nam (tuân thủ Nghị định 30/2020/NĐ-CP và Hướng dẫn 05-HD/VPTW).
Nhiệm vụ: Kiểm tra chính tả, lỗi gõ phím Telex/VNI, từ dễ nhầm lẫn (s/x, ch/tr, hỏi/ngã, bàn giao/bàng giao, sáp nhập/sát nhập...), lỗi lặp từ, viết hoa sai quy chuẩn và lỗi dấu câu trong văn bản tiếng Việt.

QUY TẮC BẮT BUỘC:
1. Chỉ trả về DUY NHẤT JSON hợp lệ có cấu trúc:
{"issues": [{"original": "cụm chữ sai nguyên văn", "replacement": "cụm chữ đúng", "category": "SPELLING|CONFUSABLE|CAPITALIZATION|PUNCTUATION", "reason": "giải thích ngắn gọn bằng tiếng Việt"}]}
2. "original" BẮT BUỘC phải khớp chính xác 100% từng ký tự xuất hiện trong văn bản đầu vào (không tự chế hay viết sai khác).
3. "replacement" phải khác với "original" và chỉ thay đúng phần cần sửa, KHÔNG gộp thêm từ kế tiếp vào "replacement".
4. TUYỆT ĐỐI KHÔNG báo lỗi với:
   - Cụm đã viết đúng chuẩn như "Cộng hòa xã hội chủ nghĩa Việt Nam", "Độc lập - Tự do - Hạnh phúc", "Đảng Cộng sản Việt Nam".
   - Các dòng tiêu đề/tên cơ quan viết IN HOA toàn bộ theo thể thức hành chính (VD: "ỦY BAN NHÂN DÂN", "BÁO CÁO", "QUYẾT ĐỊNH").
   - Chỗ trống trong ngoặc "[...]", chú thích "[^1]", mã số văn bản ("30/2020/NĐ-CP", "05-HD/VPTW"), ngày tháng, tên riêng người/địa danh hợp lệ.
5. Nếu văn bản hoàn toàn đúng, trả về {"issues": []}."""


def _next_candidate_models() -> list[str]:
    """Return models ordered from next round-robin slot, skipping active cooldowns when possible."""
    global _CURSOR
    models = settings.GROQ_MODELS or [
        "openai/gpt-oss-120b",
        "qwen/qwen3.8-27b",
        "openai/gpt-oss-20b",
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


def _extract_json_issues(raw_content: str) -> list[dict[str, Any]]:
    """Safely parse {"issues": [...]} even if wrapped in code fences or <think> tags."""
    if not raw_content:
        return []
    cleaned = re.sub(r"<think>.*?</think>", "", raw_content, flags=re.DOTALL).strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE).strip()

    start_brace = cleaned.find("{")
    end_brace = cleaned.rfind("}")
    if start_brace == -1 or end_brace == -1 or end_brace <= start_brace:
        return []
    try:
        parsed = json.loads(cleaned[start_brace : end_brace + 1])
    except json.JSONDecodeError:
        return []

    raw_issues = parsed.get("issues") if isinstance(parsed, dict) else None
    if not isinstance(raw_issues, list):
        return []
    return [it for it in raw_issues if isinstance(it, dict)]


def query_groq_spell_issues(text: str) -> list[dict[str, Any]]:
    """Call Groq with automatic multi-model rotation to detect contextual spelling issues."""
    api_key = settings.GROQ_API_KEY
    if not api_key or not text or not text.strip():
        return []

    # Truncate overly long input cleanly to keep prompt responsive under context/rate limits
    segment = text[:6000]
    models = _next_candidate_models()

    for model_id in models:
        payload = {
            "model": model_id,
            "temperature": 0.0,
            "max_tokens": 750,
            "messages": [
                {"role": "system", "content": _SYSTEM_PROMPT},
                {"role": "user", "content": segment},
            ],
        }
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
            with urllib.request.urlopen(req, timeout=14) as resp:
                body = json.loads(resp.read().decode("utf-8"))
                content = (
                    body.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
                )
                return _extract_json_issues(content)
        except urllib.error.HTTPError as exc:
            if exc.code in (429, 500, 502, 503, 504):
                _mark_cooldown(model_id, seconds=45.0 if exc.code == 429 else 15.0)
            else:
                _mark_cooldown(model_id, seconds=30.0)
            continue
        except Exception:
            _mark_cooldown(model_id, seconds=15.0)
            continue

    return []

