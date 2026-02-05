from __future__ import annotations

import argparse
import json
import struct
import zlib
from pathlib import Path
from typing import Iterable, List

import numpy as np

from pi_tokenizer import PiTokenizer

ALLOWED_SUFFIXES = {".txt", ".md", ".html", ".json"}
MAGIC = b"MTRXATOM"
HEADER_SIZE = 64

DTYPE_ID = {
    np.uint16: 1,
    np.uint32: 2,
}


def load_and_clean(path: Path) -> str:
    text = path.read_text(encoding="utf-8", errors="ignore")
    if path.suffix == ".json":
        try:
            data = json.loads(text)
        except json.JSONDecodeError:
            data = None
        if data is not None:
            text = json.dumps(data, separators=(",", ":"))
    text = text.replace("<", " ").replace(">", " ")
    return text


def gather_files(input_dir: Path) -> Iterable[Path]:
    for path in input_dir.rglob("*"):
        if path.suffix.lower() in ALLOWED_SUFFIXES:
            yield path


def pad_tokens(tokens: List[int], atom_size: int, pad_id: int) -> None:
    pad = (-len(tokens)) % atom_size
    if pad:
        tokens.extend([pad_id] * pad)


def build_header(
    *,
    dtype: np.dtype,
    vocab_size: int,
    atom_size: int,
    token_count: int,
    payload_crc32: int,
) -> bytes:
    atom_count = token_count // atom_size
    dtype_id = DTYPE_ID[dtype.type]
    flags = 0
    header_base = struct.pack(
        "<8sHHBBHIIQQQ",
        MAGIC,
        1,
        HEADER_SIZE,
        dtype_id,
        flags,
        0,
        vocab_size,
        atom_size,
        atom_count,
        token_count,
        HEADER_SIZE,
    )
    header_without_crc = header_base + struct.pack("<II", 0, 0) + b"\x00" * 8
    header_crc = zlib.crc32(header_without_crc)
    header = header_base + struct.pack("<II", header_crc, payload_crc32) + b"\x00" * 8
    return header


def pack_directory(
    input_dir: Path,
    tokenizer: PiTokenizer,
    output_file: Path,
    atom_size: int,
    dtype: np.dtype,
) -> None:
    tokens: List[int] = []
    for path in gather_files(input_dir):
        text = load_and_clean(path)
        tokens.extend(tokenizer.tokenize(text))
    pad_tokens(tokens, atom_size, tokenizer.pad_id())

    arr = np.array(tokens, dtype=dtype)
    payload_crc32 = zlib.crc32(arr.tobytes())
    header = build_header(
        dtype=arr.dtype,
        vocab_size=tokenizer.vocab_size(),
        atom_size=atom_size,
        token_count=len(arr),
        payload_crc32=payload_crc32,
    )

    output_file.write_bytes(header + arr.tobytes())
    atom_count = len(arr) // atom_size
    print(f"[OK] Packed {len(arr)} tokens")
    print(f"[OK] Atoms: {atom_count}")
    print(f"[OK] Output: {output_file}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Pack text into MATRIX-ATOM v1")
    parser.add_argument("--input", required=True, type=Path, help="Input directory")
    parser.add_argument("--tokenizer", required=True, type=Path, help="pi_symbol_map.json path")
    parser.add_argument("--output", required=True, type=Path, help="Output .bin")
    parser.add_argument("--atom-size", type=int, default=256, help="Tokens per atom")
    parser.add_argument("--dtype", choices=["uint16", "uint32"], default="uint16")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    dtype = np.uint16 if args.dtype == "uint16" else np.uint32
    tokenizer = PiTokenizer.from_file(args.tokenizer)
    pack_directory(
        input_dir=args.input,
        tokenizer=tokenizer,
        output_file=args.output,
        atom_size=args.atom_size,
        dtype=np.dtype(dtype),
    )


if __name__ == "__main__":
    main()
