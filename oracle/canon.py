from __future__ import annotations

import json
from typing import Any


def canon_json_bytes_v1(obj: Any) -> bytes:
    """Canonical JSON bytes per asx://canon/json.bytes.v1.

    Uses sorted keys, UTF-8 encoding, and compact separators.
    """
    payload = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return payload.encode("utf-8")
