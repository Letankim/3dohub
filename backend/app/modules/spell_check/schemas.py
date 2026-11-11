"""Pydantic schemas and validators for the Spell Check module."""

from pydantic import BaseModel, Field
from app.core.exceptions import BusinessValidationException


class SpellCheckRequest(BaseModel):
    text: str = Field(default="", max_length=200000)

    def validate_business_rules(self) -> None:
        if len(self.text or "") > 200000:
            raise BusinessValidationException.single_field(
                field="text",
                code="TEXT_TOO_LONG",
                message="Nội dung văn bản tối đa 200.000 ký tự",
                rejected_value=len(self.text),
            )

