# MX2LEX — Project Plan

This document defines **what we are building**, **what we are not building**, and **when to stop**.

---

## 0. Reality Check

MX2LEX is already a complete system.

Continuing to add features right now would:
- blur its purpose
- collapse layers
- create accidental authority
- turn it into “yet another AI thing”

So the plan is intentionally conservative.

---

## 1. Core Goal (Frozen)

> Build a **deterministic lexical–semantic layer** that:
> - assigns meaning to symbols,
> - validates legality,
> - supports replay,
> - and enables learning *without execution*.

This goal is **already achieved**.

---

## 2. What Is In Scope (Now)

These are **done or considered done**:

- Vocabulary definition (`VOCAB.XJSON`)
- Semantic lexicon (`lex.xjson`)
- Grammar legality (`lex.grammar.v1`)
- Grammar → finite automaton export
- Deterministic tokenization
- Hash-based replay
- LEX-aware @gram learning
- CLI tool (developer use)
- WASM tokenizer (browser kernel safe)

No expansion is needed here.

---

## 3. What Is Explicitly Out of Scope (For Now)

These are **intentionally deferred**:

- AST construction
- Language execution
- Model integration
- Agent reasoning
- Planning systems
- Neural training
- Optimization heuristics
- UI-heavy tooling
- Marketplace / ecosystem concerns

If any of these creep in, MX2LEX stops being trustworthy.

---

## 4. Near-Term Focus (Documentation & Positioning)

The only real work left right now:

### 4.1 Documentation
- README.md (this file)
- Architectural diagrams (optional, later)
- One “how it fits” page for future systems
- Qwen-style model scaffold (`models/qwen-blueprint/`) documented for controlled comparisons

### 4.2 Naming & Framing
Make it clear that:
- MX2LEX is **infrastructure**
- not a product
- not a model
- not a chatbot
- not a framework

This avoids misuse.

---

## 5. Mid-Term (When Bigger Picture Exists)

Only after a larger system *needs* MX2LEX should we consider:

- Binding MX2LEX into an agent runtime
- Using legality signals to gate LLM output
- Feeding @gram patterns into higher-level planners
- Using replay hashes for distributed consensus
- Visual inspectors for debugging cognition

These are **integration tasks**, not core development.

---

## 6. Long-Term Vision (Not Work Items)

MX2LEX could eventually be:

- a standard lexical layer for symbolic AI
- a verifier for AI-generated code or plans
- a replay anchor for autonomous systems
- a governance primitive for AI safety
- a compression-friendly meaning layer

But **none of that is implementation work today**.

---

## 7. Stop Conditions

We stop adding features when:

- MX2LEX remains deterministic
- MX2LEX remains non-executing
- MX2LEX remains layer-pure
- MX2LEX remains explainable in one page

If it can’t be explained simply, it’s wrong.

---

## 8. Final Principle

> MX2LEX should feel *boring*.

Boring means:
- stable
- trusted
- invisible
- relied upon

That’s success.
