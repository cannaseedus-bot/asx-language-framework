## Orthogonal “Ultimate Examples”

These examples are vertical, legally complete slices. Each stays minimal, non-overlapping, and honors ASX-R guard rails (closed AST, XCFE ordering, no dynamic eval).

### Geometry + Metrics
- **Schemas exercised:** `asx://engine/geometry.g2l.v1`, `asx://engine/metrics.mfa.v1`, `asx://scxq2/engine.v3`, `asx://asx-r/proof.v1`
- **Intent:** Show deterministic SCXQ2 packing of geometry + metric payloads with proof/replay.
- **Legality notes:** XCFE `@Pop → @Wo → @Sek → @Ch'en` enforced; SCXQ2 pack/unpack deterministic; proof SELF hash bound to replay log.
- **Non-goals:** No projection faces; no KPI syscalls.

### KPI Syscall + Lowering
- **Schemas exercised:** `asx://kpi/syscall.v1`, `asx://kpi/ast.node_registry.v1`, `asx://asx-r/envelope.v1`, `asx://asx-r/xcfe.control.v1`, `asx://asx-r/proof.v1`
- **Intent:** Demonstrate syscall registry bindings, AST node registry, and lowering pipeline with proof/replay.
- **Legality notes:** Closed AST only; syscall set is bounded and declared; lowering uses registry, not ad-hoc evaluation.
- **Non-goals:** No projection faces; no temporal engine.

### Temporal Persistence
- **Schemas exercised:** `asx://engine/temporal.v1`, session/ledger/tape bindings, `asx://data/mx2db.schema.v1`, `asx://asx-r/proof.v1`
- **Intent:** Cover ⟁Yax⟁ → ⟁Xul⟁ lifecycle with persistence, replay, and proof binding.
- **Legality notes:** Temporal transitions are clocked and recorded; MX2DB writes are ledgered; replay must re-derive the same SELF hash.
- **Non-goals:** No KPI syscalls; no projection faces.

### Projection-only (Non-authoritative)
- **Schemas exercised:** `asx://projection/ggl.schema.v1`, `asx://projection/atomic.xjson.v1`, `asx://projection/svg-3d.schema.v1`
- **Intent:** Demonstrate projection law without execution authority.
- **Legality notes:** These faces are **non-authoritative**; they cannot be treated as execution inputs. Any binding to execution paths must pass through authoritative ASX-R envelopes.
- **Non-goals:** No SCXQ2 packing; no proof ledger; no KPI syscalls.
