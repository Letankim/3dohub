"""REST API Router for the Legal & Formatting Lookup Module."""

import unicodedata
from typing import Optional
from fastapi import APIRouter, Request
from app.core.response import api_success
from app.modules.doc_lookup.data import REGULATIONS_DATA

router = APIRouter(prefix="/doc-lookup", tags=["Tra Cứu Thể Thức & Văn Bản Quy Phạm"])


def _unaccent(s: str) -> str:
    nfkd = unicodedata.normalize("NFD", s)
    return "".join(c for c in nfkd if unicodedata.category(c) != "Mn").replace("đ", "d").replace("Đ", "D").lower()


@router.get("/regulations")
async def list_regulations(
    request: Request,
    category: Optional[str] = None,
    q: Optional[str] = None,
):
    """Return legal formatting regulations filtered by category and accent-insensitive search query."""
    items = REGULATIONS_DATA
    if category and category.upper() != "ALL":
        cat_up = category.upper()
        items = [r for r in items if r["category"].upper() == cat_up]

    if q and q.strip():
        nq = _unaccent(q.strip())
        filtered = []
        for r in items:
            haystack = _unaccent(
                " ".join([
                    r["title"],
                    r["documentNumber"],
                    r["issuingOrgan"],
                    r["summary"],
                    " ".join(r.get("keywords", [])),
                    " ".join(f["component"] + " " + f["note"] for f in r.get("formatRules", [])),
                ])
            )
            if nq in haystack:
                filtered.append(r)
        items = filtered

    return api_success(
        data=items,
        message="Tra cứu quy chuẩn thể thức văn bản thành công",
        meta={"total": len(items), "category": category or "ALL"},
        request=request,
    )
