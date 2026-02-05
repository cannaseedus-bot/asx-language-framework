from __future__ import annotations

import colorsys
import struct
from array import array
from pathlib import Path
from typing import Iterable, List

MAGIC = b"SVGTENSR"
HEADER_SIZE = 32


def build_header(rows: int, cols: int, atom_count: int) -> bytes:
    header = struct.pack(
        "<8sHHHHQQ",
        MAGIC,
        1,
        HEADER_SIZE,
        rows,
        cols,
        atom_count,
        HEADER_SIZE,
    )
    return header.ljust(HEADER_SIZE, b"\x00")


def pack_svg_tensor(
    *,
    tokens: List[int],
    atom_size: int,
    rows: int,
    cols: int,
    output_file: Path,
) -> None:
    if rows * cols != atom_size:
        raise ValueError("rows * cols must equal atom_size")
    atom_count = len(tokens) // atom_size
    header = build_header(rows, cols, atom_count)
    payload = array("H", (int(t) & 0xFFFF for t in tokens))
    output_file.write_bytes(header + payload.tobytes())


def token_color(token_id: int) -> str:
    hue = (token_id % 360) / 360.0
    r, g, b = colorsys.hsv_to_rgb(hue, 0.4, 0.9)
    return f"#{int(r*255):02x}{int(g*255):02x}{int(b*255):02x}"


def render_atom_svg(
    *,
    tokens: Iterable[int],
    rows: int,
    cols: int,
    cell_size: int = 8,
) -> str:
    width = cols * cell_size
    height = rows * cell_size
    rects = []
    for idx, token in enumerate(tokens):
        r = idx // cols
        c = idx % cols
        x = c * cell_size
        y = r * cell_size
        rects.append(
            f"<rect x=\"{x}\" y=\"{y}\" width=\"{cell_size}\" height=\"{cell_size}\" fill=\"{token_color(token)}\" />"
        )
    rects_str = "".join(rects)
    return (
        f"<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{width}\" height=\"{height}\">"
        f"{rects_str}</svg>"
    )
