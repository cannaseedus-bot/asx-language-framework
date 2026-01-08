from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict


@dataclass
class ParseError(Exception):
    code: str
    msg: str
    line: int = 0
    col: int = 0

    def __str__(self) -> str:
        return f"{self.code}: {self.msg}"


def parse_ggl_to_ast(text: str, grammar_abi: Dict[str, Any]) -> Dict[str, Any]:
    if not text.strip():
        raise ParseError(code="E_PARSE_EMPTY", msg="empty GGL payload", line=1, col=1)

    ast_type = grammar_abi.get("ast_type", "ggl.program.v1")
    return {
        "type": ast_type,
        "body": text,
    }
