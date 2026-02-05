from __future__ import annotations

import json
import unicodedata
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List


@dataclass(frozen=True)
class SymbolMap:
    version: int
    vocab_size: int
    unk_id: int
    pad_id: int
    byte_fallback: bool
    byte_base_id: int
    normalization: str
    symbols: Dict[str, int]


class PiTokenizer:
    def __init__(self, symbol_map: SymbolMap) -> None:
        self._map = symbol_map

    @classmethod
    def from_file(cls, path: Path) -> "PiTokenizer":
        raw = json.loads(path.read_text(encoding="utf-8"))
        symbols = {entry["text"]: entry["id"] for entry in raw.get("symbols", [])}
        symbol_map = SymbolMap(
            version=int(raw.get("version", 1)),
            vocab_size=int(raw["vocab_size"]),
            unk_id=int(raw.get("unk_id", 0)),
            pad_id=int(raw.get("pad_id", raw.get("unk_id", 0))),
            byte_fallback=bool(raw.get("byte_fallback", False)),
            byte_base_id=int(raw.get("byte_base_id", 0)),
            normalization=str(raw.get("normalization", "nfkc")),
            symbols=symbols,
        )
        cls._validate(symbol_map)
        return cls(symbol_map)

    @staticmethod
    def _validate(symbol_map: SymbolMap) -> None:
        if symbol_map.vocab_size <= 0:
            raise ValueError("vocab_size must be positive")
        if symbol_map.unk_id < 0 or symbol_map.unk_id >= symbol_map.vocab_size:
            raise ValueError("unk_id out of range")
        if symbol_map.pad_id < 0 or symbol_map.pad_id >= symbol_map.vocab_size:
            raise ValueError("pad_id out of range")
        if symbol_map.byte_fallback:
            if symbol_map.byte_base_id < 0:
                raise ValueError("byte_base_id must be non-negative")
            if symbol_map.byte_base_id + 255 >= symbol_map.vocab_size:
                raise ValueError("byte_base_id + 255 exceeds vocab_size")
        for text, token_id in symbol_map.symbols.items():
            if token_id < 0 or token_id >= symbol_map.vocab_size:
                raise ValueError(f"token id out of range for symbol: {text}")

    def tokenize(self, text: str) -> List[int]:
        normalized = unicodedata.normalize(self._map.normalization, text)
        tokens: List[int] = []
        for ch in normalized:
            token_id = self._map.symbols.get(ch)
            if token_id is not None:
                tokens.append(token_id)
                continue
            if self._map.byte_fallback:
                for byte in ch.encode("utf-8"):
                    tokens.append(self._map.byte_base_id + byte)
            else:
                tokens.append(self._map.unk_id)
        return tokens

    def pad_id(self) -> int:
        return self._map.pad_id

    def vocab_size(self) -> int:
        return self._map.vocab_size

    def iter_symbols(self) -> Iterable[str]:
        return self._map.symbols.keys()


def load_tokenizer(path: str) -> PiTokenizer:
    return PiTokenizer.from_file(Path(path))
