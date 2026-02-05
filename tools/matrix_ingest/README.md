# MATRIX Ingest Tools

Minimal, deterministic tooling for building MATRIX-ATOM artifacts.

## Quick start

```bash
python tools/matrix_ingest/binary_pack.py \
  --input datasets \
  --tokenizer tools/matrix_ingest/pi_symbol_map.sample.json \
  --output matrix_atoms.bin
```

## Tools

- `pi_tokenizer.py` - π-LM symbol map loader + deterministic tokenizer.
- `binary_pack.py` - pack text/JSON/HTML into MATRIX-ATOM v1.
- `svg_tensor.py` - optional SVG-Tensor projection helpers.
- `gguf_ingest.py` - extract GGUF tokenizer metadata into π symbol maps.

## Sample symbol map

```json
{
  "version": 1,
  "vocab_size": 65536,
  "unk_id": 0,
  "pad_id": 0,
  "byte_fallback": true,
  "byte_base_id": 256,
  "normalization": "nfkc",
  "symbols": [
    {"id": 1, "text": "a"},
    {"id": 2, "text": "b"}
  ]
}
```
