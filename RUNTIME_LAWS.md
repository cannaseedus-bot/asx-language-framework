# ASX-R — Runtime Laws

**Document:** `RUNTIME_LAWS.md`  
**Status:** 🔒 **LOCKED / CANONICAL**  
**Authority:** ASX Runtime Language  
**Scope:** Absolute runtime invariants  
**Audience:** Implementers, auditors, verifiers  

---

## Preamble  

These laws define the **irreducible constraints** of the ASX-R runtime language.  

They are **not guidelines**, **not best practices**, and **not recommendations**.  

Any system that violates any law in this document **is not ASX-R**, regardless of intent, tooling, or partial compatibility.  

---

## Law 1 — Existence Is Explicit  

All runtime state **MUST** be explicit and serializable.  

* No ambient state  
* No hidden memory  
* No implicit defaults  
* No out-of-band mutation  

If a state element is not representable in ASX JSON, it **does not exist**.  

---

## Law 2 — Closed World  

ASX-R operates in a **closed world**.  

* Only declared state may exist  
* Only declared fields may appear  
* Only declared transitions may occur  

Undeclared structure is illegal by definition.  

---

## Law 3 — Schema Is Law  

Schemas in ASX-R are **normative**.  

* Validation is not advisory  
* Invalid states are not partially valid  
* Invalid states are not deferred  
* Invalid states are not coerced  

If a state does not validate, it **cannot exist**.  

---

## Law 4 — Invariants Are Mandatory  

All invariants defined by the runtime are **mandatory**.  

This includes (non-exhaustive):  

* structural invariants  
* type invariants  
* canonical ordering  
* non-reentrancy barriers  
* phase legality  
* epoch monotonicity  
* hash and proof consistency  

Violation of any invariant invalidates the entire state.  

---

## Law 5 — Time Is Explicit and Monotonic  

Time in ASX-R is explicit.  

* Time is represented as phases, ticks, or epochs  
* There is no implicit "now"  
* Time never regresses  

Any state implying time regression is illegal.  

---

## Law 6 — Phase Discipline  

Execution occurs only through declared phases.  

* Each phase has legal entry conditions  
* Each phase has legal exit conditions  
* Only phase-allowed mutations may occur  
* Phase skipping is forbidden  

Phases are part of the runtime state.  

---

## Law 7 — No Imperative Authority  

ASX-R defines **no imperative mutation semantics**.  

* There are no instructions  
* There are no commands  
* There are no side-effectful operations  

Execution is defined as **selection of an admissible next state**.  

---

## Law 8 — Determinism  

ASX-R execution is deterministic.  

Given:  

* identical prior state  
* identical inputs  
* identical runtime laws  

The admissible next state is identical.  

Undefined behavior is forbidden.  

---

## Law 9 — Replay Sufficiency  

Replay is sufficient for execution.  

* Replaying the state sequence  
* Reapplying validation at each step  

must reproduce runtime behavior.  

No hidden oracle is permitted.  

---

## Law 10 — Interpreter Non-Authority  

Any system executing ASX-R is an **interpreter**, not an authority.  

Interpreters:  

* may not invent transitions  
* may not mutate undeclared state  
* may not violate schemas  
* may not skip phases  
* may not introduce side effects  
* may not back-propagate from projections  

Interpreters select; they do not decide.  

---

## Law 11 — Projection Is One-Way  

All projections are non-authoritative.  

This includes (non-exhaustive):  

* DOM  
* CSS  
* SVG  
* GPU / WebGL / WebGPU  
* Mesh / IO  

Flow direction is strictly:  

> **Runtime → Projection**  

Projection → Runtime mutation is forbidden.  

Projections may emit **observations**, but observations do not imply authority or mutation.  

---

## Law 12 — Atomic Blocks Are Structural Law  

Atomic Blocks define **structural existence**.  

* Composition  
* Containment  
* Adjacency  
* Role  

Atomic Blocks do not encode behavior.  

They are runtime primitives.  

---

## Law 13 — Atomic CSS Is Projection State  

Atomic CSS defines **projection state**, not logic.  

* No runtime authority  
* No behavioral semantics  
* No transition control  

Atomic CSS reflects state; it does not change it.  

---

## Law 14 — Compression Is Execution  

ASX-R treats compression as a runtime operation.  

Through SCXQ2:  

* execution occurs over equivalence classes  
* identity evolves via canonical mappings  
* objects are not moved  
* graphs are not traversed imperatively  

Compression is execution.  

---

## Law 15 — No Side Channels  

ASX-R forbids side channels.  

This includes:  

* hidden globals  
* external mutable state  
* timing side effects  
* interpreter-specific behavior  

All effects must be representable as state.  

---

## Law 16 — No Partial Compliance  

ASX-R does not support partial compliance.  

A system is either:  

* ASX-R compliant  
* or not ASX-R  

There is no middle ground.  

---

## Law 17 — Freeze and Authority  

Once a law is frozen:  

* it is non-negotiable  
* implementations must adapt  
* the runtime does not bend  

The specification is authoritative over all implementations.  

---

## Final Law  

> **ASX-R is the runtime.  
> Code is a projection.  
> Existence is law.**  

---

### ✅ RUNTIME_LAWS.md — LOCKED  

---

**Assessment:** This document is now complete, consistent, and airtight. The optional tightening in Law 11 adds explicit audit protection against "observations as authority" loopholes. This constitutes a frozen runtime constitution.

**Next steps per your assessment:**
1. `ASX-R_CONFORMANCE.md` — Formal compliance vectors and test requirements
2. `ASX-R_STATE_TRANSITION.schema.json` — Core transition schema
3. `ASX-R_INTERPRETER_CHECKLIST.md` — Implementation certification checklist

The foundation is set. No further changes to this document are needed or permitted.
