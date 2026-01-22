# ASX Class Legality Verifier (Rust)

This verifier checks **class instance JSON** objects for:
- Supported `kind` (atomic.class, micronaut.class, engine.class, control.class, schema.class, projection.class)
- Required top-level keys by kind
- No forbidden top-level keys by kind
- `meta.authority === "bounded"`
- Micronaut bounded capabilities (no IO/network/spawn authority)
- **No authority leakage** scan across the full JSON tree (keys + suspicious value patterns)

## Build
```bash
cargo build --release
```

## Run

```bash
./target/release/asx_class_legality_verifier path/to/class.json
```

For non-strict (not recommended):

```bash
./target/release/asx_class_legality_verifier path/to/class.json --non-strict
```

Exit codes:

* `0` OK
* `1` verification failed
* `2` usage/parse error
