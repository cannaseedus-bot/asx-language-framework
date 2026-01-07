## ASX Codex Index (`asx://codex/asx.v1`)

This codex is the authoritative registry for the ASX language family. It maps each frozen schema domain, the owning authority, and its current version lock. Every entry stands alone with its own legality envelope and verifier rules.

### Registry map

| Domain | Schema URI | Authority notes | Version lock | Purpose |
| --- | --- | --- | --- | --- |
| ASX-R Envelope Law | `asx://asx-r/envelope.v1` | Runtime envelope; binds XCFE ordering and proof hooks | `v1` | Defines legal program envelopes and execution legality gates |
| ASX-R AST Program | `asx://asx-r/ast.program.v1` | Closed AST; no dynamic eval; deterministic node registry | `v1` | Structural AST shape for XJSON programs |
| XCFE Control Flow | `asx://asx-r/xcfe.control.v1` | Phase ordering `@Pop → @Wo → @Sek → @Ch'en`; no bypass | `v1` | Execution control law and transition invariants |
| Proof Ledger | `asx://asx-r/proof.v1` | SELF hash binding; replayable; no drift | `v1` | Proof, session, and replay legality |
| SCXQ2 Engine | `asx://scxq2/engine.v3` | Deterministic packing; compression + cipher | `v3` | Compression/cipher engine schemas |
| K’uhul Execution Semantics | `asx://kuhul/core.v1` | Runtime semantics for node execution | `v1` | Defines operational semantics for the executor |
| KPI Bindings | `asx://kpi/syscall.v1` | Syscall registry + AST node registry bindings | `v1` | Host bridge for system calls and lowering targets |
| KQL / IDB API | `asx://data/kql.query.v2` | Bounded queries; side-effect constraints | `v2` | Query semantics and datastore bridge |
| MX2DB Schema | `asx://data/mx2db.schema.v1` | Persistence layout; ledger coupling | `v1` | MX2DB structural contract |
| ASX-RAM | `asx://data/asx-ram.v1` | In-memory tape/runtime state | `v1` | Live state and caching surfaces |
| Domain Engine: Geometry | `asx://engine/geometry.g2l.v1` | Frozen geometric primitives + transforms | `v1` | Geometry computation plane |
| Domain Engine: Metrics (MFA-1) | `asx://engine/metrics.mfa.v1` | Metric tensor + evaluators | `v1` | Metrics and measurements plane |
| Domain Engine: Temporal | `asx://engine/temporal.v1` | ⟁Yax⟁ → ⟁Xul⟁ lifecycle; clock law | `v1` | Temporal evolution and persistence |
| Projection Face: Atomic | `asx://projection/atomic.xjson.v1` | Non-authoritative; view-only | `v1` | Atomic face for UI projection |
| Projection Face: GGL | `asx://projection/ggl.schema.v1` | Non-authoritative; view-only | `v1` | Glyph/geometry projection |
| Projection Face: SVG-3D | `asx://projection/svg-3d.schema.v1` | Non-authoritative; view-only | `v1` | 3D SVG projection face |

### Guard rails

- Projection schemas are **non-authoritative** and must never be used as execution inputs.
- Closed AST legality and XCFE phase ordering are enforced per ASX-R; no dynamic eval or phase skipping is permitted.
- Each domain maintains independent freeze boundaries; replacing one domain must not mutate others.

### Change control

- Any update to a domain schema MUST increment its version lock and update this index.
- Authority notes must capture who/what issues the frozen specification and the verifier expectations.
- Cross-domain coupling (e.g., SCXQ2 packing invoked from geometry.g2l) must cite the interface contract rather than embedding foreign schemas.
