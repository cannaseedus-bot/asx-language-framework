# MATRIX Ingest Spec v1 (Binary-First)

> Status: draft-v1
> Scope: binary ingest for MATRIX / ATOMIC-DOM pipelines

## 0. Goals

- **Binary-first** ingest: text is normalized and tokenized once, offline.
- **Fixed-width atoms**: predictable, aligned reads for deterministic pipelines.
- **Stateless reads**: mmap/seek access without parsing in the hot loop.
- **Interoperable ingest**: π-LM, GGUF, SVG-Tensor, and future geometry engines.

---

## 1. Canonical Ingest Pipeline

```
[ HTML | JSON | MD | GGUF ]
        ↓
   CLEAN + NORMALIZE
        ↓
     TOKENIZE (π symbol map)
        ↓
   PACK → ATOMS (fixed width)
        ↓
  mmap / seek / stream
        ↓
   π-LM / Geometry / Embedding
```

### Key invariants

- Parsing is **never** performed inside runtime hot loops.
- Atoms are **fixed-width** and aligned.
- All ingest artifacts are **versioned + hashable**.

---

## 2. Atom File Format (MATRIX-ATOM v1)

### 2.1 Header (64 bytes, little-endian)

| Offset | Size | Field | Type | Notes |
| ------ | ---- | ----- | ---- | ----- |
| 0x00 | 8 | magic | bytes | `MTRXATOM` |
| 0x08 | 2 | version | u16 | v1 = `1` |
| 0x0A | 2 | header_bytes | u16 | always `64` for v1 |
| 0x0C | 1 | dtype_id | u8 | `1=uint16`, `2=uint32` |
| 0x0D | 1 | flags | u8 | bit0=svg_tensor, bit1=index |
| 0x0E | 2 | reserved | u16 | zero |
| 0x10 | 4 | vocab_size | u32 | total vocab size |
| 0x14 | 4 | atom_size | u32 | tokens per atom |
| 0x18 | 8 | atom_count | u64 | `token_count / atom_size` |
| 0x20 | 8 | token_count | u64 | total tokens |
| 0x28 | 8 | data_offset | u64 | byte offset of token payload |
| 0x30 | 4 | header_crc32 | u32 | CRC32 over header (with this field zeroed) |
| 0x34 | 4 | payload_crc32 | u32 | CRC32 over token payload |
| 0x38 | 8 | reserved | bytes | zero padding |

### 2.2 Payload

- Token payload is a flat, **little-endian** array of `uint16` or `uint32` IDs.
- The payload begins at `data_offset` (64 for v1).
- **Padding**: token count is padded to `atom_size` with `pad_id`.

---

## 3. π-LM Tokenizer Integration

### 3.1 Symbol Map (pi_symbol_map.json)

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

### 3.2 Tokenization rules

- **Normalize** text with `normalization` (NFKC recommended).
- **Exact match** against `symbols` map.
- **Unknown** falls back to `byte_fallback` (UTF-8 bytes) or `unk_id`.
- Token IDs must stay within `[0, vocab_size)`.

### 3.3 Deterministic pipeline

- Tokenization is **pure and deterministic**: same input → same tokens.
- Runtime uses only **token IDs** from MATRIX-ATOM files.

---

## 4. SVG-Tensor Packing (Projection Layer)

SVG-Tensor is a deterministic projection of atoms into fixed 2D grids for
visualization and geometry alignment. SVG-Tensor **does not** replace the binary
payload—it is a **parallel projection** that can be generated offline.

### 4.1 Grid layout

- Each atom becomes a `rows × cols` grid with `rows * cols = atom_size`.
- Tokens are stored **row-major** (top-left to bottom-right).
- The grid definition is stored in a `.svgt` header.

### 4.2 SVG-Tensor header (32 bytes)

| Offset | Size | Field | Type | Notes |
| ------ | ---- | ----- | ---- | ----- |
| 0x00 | 8 | magic | bytes | `SVGTENSR` |
| 0x08 | 2 | version | u16 | v1 = `1` |
| 0x0A | 2 | header_bytes | u16 | always `32` |
| 0x0C | 2 | rows | u16 | grid rows |
| 0x0E | 2 | cols | u16 | grid cols |
| 0x10 | 8 | atom_count | u64 | atom count |
| 0x18 | 8 | data_offset | u64 | header size for v1 |

### 4.3 SVG projection

- SVG can be generated from the grid at render time.
- Tokens map to colors deterministically (e.g., hash → RGB).
- SVG-Tensor payload stores **uint16** token IDs in row-major order.

---

## 5. GGUF Ingestion (Tokenizer + Embeddings)

### 5.1 Metadata sources

When a GGUF file is ingested, the following metadata keys are relevant:

- `tokenizer.ggml.tokens` (string array)
- `tokenizer.ggml.scores` (float array)
- `tokenizer.ggml.token_type` (int array)
- `tokenizer.ggml.bos_token_id` / `eos_token_id` / `unk_token_id`

### 5.2 Conversion flow

1. Read GGUF metadata section.
2. Build `pi_symbol_map.json` from `tokenizer.ggml.tokens`.
3. Persist embedding tensors separately (outside MATRIX-ATOM).

### 5.3 Determinism

- GGUF ingestion must be **pure** and hashable.
- Token IDs must match GGUF ordering exactly.

---

## 6. MATRIX Ingest Artifact Set

A complete ingest pack is a folder with:

```
/ingest_pack
  matrix_atoms.bin         # MATRIX-ATOM v1
  pi_symbol_map.json       # tokenizer symbol map
  atoms.svgt               # optional SVG-Tensor projection
  ingest_manifest.json     # hash + metadata
```

### 6.1 Manifest (ingest_manifest.json)

```json
{
  "version": 1,
  "source": "datasets/",
  "tokenizer": "pi_symbol_map.json",
  "atom_file": "matrix_atoms.bin",
  "atom_size": 256,
  "dtype": "uint16",
  "hash": "sha256:..."
}
```

---

## 7. Compliance Checklist

- [ ] Atom header matches v1 format.
- [ ] Token payload is padded to `atom_size`.
- [ ] Tokenizer map is versioned and hashable.
- [ ] Optional SVG-Tensor projection uses deterministic grid layout.
- [ ] GGUF ingest uses exact token ordering.

---

## 8. Reference Implementation

See:

- `tools/matrix_ingest/binary_pack.py`
- `tools/matrix_ingest/pi_tokenizer.py`
- `tools/matrix_ingest/svg_tensor.py`
- `tools/matrix_ingest/gguf_ingest.py`
