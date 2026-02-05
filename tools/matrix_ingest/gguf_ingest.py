from __future__ import annotations

import argparse
import json
import struct
from pathlib import Path
from typing import Any, BinaryIO, Dict, List, Tuple

GGUF_MAGIC = b"GGUF"

VALUE_UINT8 = 0
VALUE_INT8 = 1
VALUE_UINT16 = 2
VALUE_INT16 = 3
VALUE_UINT32 = 4
VALUE_INT32 = 5
VALUE_FLOAT32 = 6
VALUE_BOOL = 7
VALUE_STRING = 8
VALUE_ARRAY = 9


def read_exact(handle: BinaryIO, size: int) -> bytes:
    data = handle.read(size)
    if len(data) != size:
        raise ValueError("Unexpected EOF")
    return data


def read_u32(handle: BinaryIO) -> int:
    return struct.unpack("<I", read_exact(handle, 4))[0]


def read_u64(handle: BinaryIO) -> int:
    return struct.unpack("<Q", read_exact(handle, 8))[0]


def read_i32(handle: BinaryIO) -> int:
    return struct.unpack("<i", read_exact(handle, 4))[0]


def read_string(handle: BinaryIO) -> str:
    length = read_u32(handle)
    data = read_exact(handle, length)
    return data.decode("utf-8")


def read_value(handle: BinaryIO, value_type: int) -> Any:
    if value_type == VALUE_UINT8:
        return struct.unpack("<B", read_exact(handle, 1))[0]
    if value_type == VALUE_INT8:
        return struct.unpack("<b", read_exact(handle, 1))[0]
    if value_type == VALUE_UINT16:
        return struct.unpack("<H", read_exact(handle, 2))[0]
    if value_type == VALUE_INT16:
        return struct.unpack("<h", read_exact(handle, 2))[0]
    if value_type == VALUE_UINT32:
        return read_u32(handle)
    if value_type == VALUE_INT32:
        return read_i32(handle)
    if value_type == VALUE_FLOAT32:
        return struct.unpack("<f", read_exact(handle, 4))[0]
    if value_type == VALUE_BOOL:
        return struct.unpack("<?", read_exact(handle, 1))[0]
    if value_type == VALUE_STRING:
        return read_string(handle)
    if value_type == VALUE_ARRAY:
        elem_type = read_u32(handle)
        count = read_u64(handle)
        return [read_value(handle, elem_type) for _ in range(count)]
    raise ValueError(f"Unsupported GGUF value type: {value_type}")


def read_metadata(handle: BinaryIO, kv_count: int) -> Dict[str, Any]:
    metadata: Dict[str, Any] = {}
    for _ in range(kv_count):
        key = read_string(handle)
        value_type = read_u32(handle)
        metadata[key] = read_value(handle, value_type)
    return metadata


def read_header(handle: BinaryIO) -> Tuple[int, int, int]:
    magic = read_exact(handle, 4)
    if magic != GGUF_MAGIC:
        raise ValueError("Not a GGUF file")
    version = read_u32(handle)
    tensor_count = read_u64(handle)
    kv_count = read_u64(handle)
    return version, tensor_count, kv_count


def extract_tokenizer_metadata(path: Path) -> Dict[str, Any]:
    with path.open("rb") as handle:
        version, tensor_count, kv_count = read_header(handle)
        metadata = read_metadata(handle, kv_count)
    metadata["__gguf_version"] = version
    metadata["__tensor_count"] = tensor_count
    return metadata


def build_symbol_map(metadata: Dict[str, Any]) -> Dict[str, Any]:
    tokens = metadata.get("tokenizer.ggml.tokens")
    if not isinstance(tokens, list):
        raise ValueError("Missing tokenizer.ggml.tokens in GGUF metadata")
    symbols = [{"id": idx, "text": token} for idx, token in enumerate(tokens)]
    vocab_size = len(symbols)
    unk_id = metadata.get("tokenizer.ggml.unk_token_id", 0)
    pad_id = metadata.get("tokenizer.ggml.pad_token_id", unk_id)
    return {
        "version": 1,
        "vocab_size": vocab_size,
        "unk_id": int(unk_id),
        "pad_id": int(pad_id),
        "byte_fallback": False,
        "byte_base_id": 0,
        "normalization": "nfkc",
        "symbols": symbols,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Extract GGUF tokenizer metadata")
    parser.add_argument("--gguf", required=True, type=Path, help="GGUF model file")
    parser.add_argument("--output", required=True, type=Path, help="Output pi_symbol_map.json")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    metadata = extract_tokenizer_metadata(args.gguf)
    symbol_map = build_symbol_map(metadata)
    args.output.write_text(json.dumps(symbol_map, indent=2), encoding="utf-8")
    print(f"[OK] Wrote {args.output}")


if __name__ == "__main__":
    main()
