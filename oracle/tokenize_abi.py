from __future__ import annotations

import re
from typing import Any, Dict, Iterable, Optional, Tuple


def _line_col(text: str, idx: int) -> Tuple[int, int]:
    line = text.count("\n", 0, idx) + 1
    col = idx - text.rfind("\n", 0, idx)
    return line, col


def _char_in_ranges(ch: str, ranges: Iterable[Tuple[int, int]]) -> bool:
    cp = ord(ch)
    for start, end in ranges:
        if start <= cp <= end:
            return True
    return False


def abi_tokenize_ok(text: str, tokenizer_abi: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    allowed_ranges = tokenizer_abi.get("allowed_unicode_ranges")
    disallowed_ranges = tokenizer_abi.get("disallowed_unicode_ranges")
    allowed_regex = tokenizer_abi.get("allowed_char_regex")
    disallowed_regex = tokenizer_abi.get("disallowed_char_regex")

    allowed_pattern = re.compile(allowed_regex) if allowed_regex else None
    disallowed_pattern = re.compile(disallowed_regex) if disallowed_regex else None

    for idx, ch in enumerate(text):
        if disallowed_ranges and _char_in_ranges(ch, disallowed_ranges):
            line, col = _line_col(text, idx)
            return {
                "code": "E_TOK_DISALLOWED_CHAR",
                "msg": f"disallowed character U+{ord(ch):04X}",
                "line": line,
                "col": col,
            }
        if allowed_ranges and not _char_in_ranges(ch, allowed_ranges):
            line, col = _line_col(text, idx)
            return {
                "code": "E_TOK_OUT_OF_RANGE",
                "msg": f"character U+{ord(ch):04X} outside allowed ranges",
                "line": line,
                "col": col,
            }
        if allowed_pattern and not allowed_pattern.fullmatch(ch):
            line, col = _line_col(text, idx)
            return {
                "code": "E_TOK_REGEX_MISMATCH",
                "msg": f"character U+{ord(ch):04X} failed allowed regex",
                "line": line,
                "col": col,
            }
        if disallowed_pattern and disallowed_pattern.search(ch):
            line, col = _line_col(text, idx)
            return {
                "code": "E_TOK_DISALLOWED_REGEX",
                "msg": f"character U+{ord(ch):04X} matched disallowed regex",
                "line": line,
                "col": col,
            }

    return None
