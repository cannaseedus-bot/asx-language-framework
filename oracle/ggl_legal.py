from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class LegalityError(Exception):
    code: str
    msg: str
    line: int = 0
    col: int = 0

    def __str__(self) -> str:
        return f"{self.code}: {self.msg}"


def check_legality(ast: Dict[str, Any], grammar_abi: Dict[str, Any]) -> None:
    expected_type = grammar_abi.get("ast_type", "ggl.program.v1")
    if ast.get("type") != expected_type:
        raise LegalityError(
            code="E_LEGAL_AST_TYPE",
            msg=f"expected ast type {expected_type}, got {ast.get('type')}",
        )

    body = ast.get("body")
    if not isinstance(body, str) or not body.strip():
        raise LegalityError(code="E_LEGAL_EMPTY", msg="GGL body missing or empty")

    max_length = grammar_abi.get("max_length")
    if isinstance(max_length, int) and len(body) > max_length:
        raise LegalityError(
            code="E_LEGAL_MAX_LENGTH",
            msg=f"GGL body length {len(body)} exceeds {max_length}",
        )
