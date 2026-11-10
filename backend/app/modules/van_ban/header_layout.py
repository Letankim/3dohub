"""Header table auto-layout: keep organ lines and Quốc hiệu on a single line.

Mirrors the intent of Module1.bas (shift column width until Quốc hiệu is on one
line, then shrink fonts) and extends it to the issuing-organ lines.
"""

import copy
from typing import Any

_PT_PER_MM = 72.0 / 25.4
_CELL_PAD_MM = 6.0  # left+right cell padding + safety margin
_MIN_SIZE = 11.5


def _char_em(ch: str, bold: bool) -> float:
    """Approximate Times New Roman advance width in em."""
    if ch == " ":
        return 0.25
    if ch.isupper() or ch in "ĐÀÁẢÃẠ":
        return 0.72 if bold else 0.69
    if ch.isdigit():
        return 0.5
    if ch in "ilIjtfr.,;:'-!|":
        return 0.30 if not bold else 0.32
    if ch in "mwMW":
        return 0.75
    return 0.46 if not bold else 0.49


def estimate_width_mm(text: str, size_pt: float, bold: bool = False) -> float:
    """Estimated rendered width of `text` in millimetres."""
    em = sum(_char_em(c, bold) for c in text)
    return em * size_pt / _PT_PER_MM


def apply_header_layout(norm_doc: dict[str, Any]) -> None:
    """Adjust header column widths / font sizes so key lines never wrap (in place)."""
    prof = copy.deepcopy(norm_doc["profile"])
    nums = prof["numbers"]
    strs = prof["strings"]
    hdr = norm_doc["header"]
    is_dang = strs["MOTTO_KIND"] == "DANG"

    total = 210.0 - nums["PAGE_LEFT"] - nums["PAGE_RIGHT"]
    organs = hdr.get("organ_lines", [])
    mottos = hdr.get("motto_lines", [])
    if not organs and not mottos:
        norm_doc["profile"] = prof
        return

    org_size = nums["ORGAN_SIZE"]
    if is_dang:
        motto_sizes = [nums["PARTY_MOTTO_SIZE"]]
    else:
        motto_sizes = [nums["QH_SIZE"], nums["TN_SIZE"]]
    scale = 0.0

    def widths(delta: float) -> tuple[float, float]:
        left = 0.0
        for i, org in enumerate(organs):
            bold = i == len(organs) - 1 or len(organs) == 1
            left = max(left, estimate_width_mm(org, org_size - delta, bold))
        right = 0.0
        for i, m in enumerate(mottos[: len(motto_sizes)]):
            right = max(right, estimate_width_mm(m, motto_sizes[i] - delta, True))
        date = hdr.get("date_line", "")
        if date:
            right = max(right, estimate_width_mm(date, nums["DATE_SIZE"] - delta, False) * 0.92)
        return left + _CELL_PAD_MM, right + _CELL_PAD_MM

    while True:
        need_l, need_r = widths(scale)
        if need_l + need_r <= total or org_size - scale <= _MIN_SIZE:
            break
        scale += 0.5

    need_l, need_r = widths(scale)
    if need_l + need_r <= total:
        left_mm = max(need_l, min(nums["HDR_LEFT_MM"], total - need_r))
    else:
        left_mm = need_l * total / (need_l + need_r)
    nums["HDR_LEFT_MM"] = round(left_mm, 1)
    nums["HDR_RIGHT_MM"] = round(total - left_mm, 1)

    if scale > 0:
        nums["ORGAN_SIZE"] = org_size - scale
        nums["DATE_SIZE"] = max(_MIN_SIZE, nums["DATE_SIZE"] - scale)
        for key in ("PARTY_MOTTO_SIZE", "QH_SIZE", "TN_SIZE"):
            nums[key] = max(_MIN_SIZE, nums[key] - scale)
        if is_dang:
            nums["DOC_NUMBER_SIZE"] = max(_MIN_SIZE, nums["DOC_NUMBER_SIZE"] - scale)
    norm_doc["profile"] = prof
