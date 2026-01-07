# MX2LEX

**MX2LEX** is a deterministic lexical–semantic layer for symbolic AI systems.

It sits *below* models, *above* raw text, and *outside* execution.

MX2LEX turns symbols into **meaningful, verifiable units** that can be:
- checked for legality,
- replayed deterministically,
- learned structurally (not statistically),
- and routed safely through larger AI runtimes.

This is **not a chatbot**, **not a neural model**, and **not a parser framework**.

It is a **lexical cognition substrate**.

---

## What MX2LEX Is

MX2LEX answers one question:

> *“What does this symbol sequence mean, and is it allowed?”*

It provides:

- **Immutable vocabularies** (`VOCAB.XJSON`)
- **Semantic lexicons** (`lex.xjson`)
- **Grammar legality** (context + adjacency + transitions)
- **Finite automaton export** (formal structure, no execution)
- **Deterministic tokenization**
- **Replay-proof hashes**
- **Structural learning via @gram**
- **Zero side effects**

MX2LEX does **not**:
- execute code
- call models
- mutate runtime state
- make decisions
- perform inference

It only **describes**, **validates**, and **records** meaning.

---

## Why This Exists

Modern AI systems blur everything:
- tokens ≈ meaning
- execution ≈ reasoning
- probability ≈ truth

MX2LEX enforces separation:

| Layer | Responsibility |
|-----|---------------|
| VOCAB | What symbols exist |
| LEX | What symbols mean |
| GRAMMAR | What sequences are allowed |
| ORACLE | Is this legal |
| GRAM | What patterns recur |
| WEIGHTS | Preferences (not rules) |
| EXECUTION | Someone else’s job |

This makes systems:
- auditable
- replayable
- compressible
- evolvable without chaos

---

## Determinism & Replay

MX2LEX is **fully deterministic**.

Given:
- the same text
- the same vocab
- the same lex
- the same grammar

You will always get:
- the same tokens
- the same spans
- the same legality result
- the same hashes

This enables:
- replay consensus
- diff compression
- cross-node verification
- UI inspectors
- future-proof AI governance

---

## What MX2LEX Is Not Trying To Do (On Purpose)

MX2LEX intentionally avoids:
- full parsing
- AST construction
- semantic execution
- neural embeddings
- probabilistic inference
- auto-correction

Those belong *above* it.

MX2LEX is the **ground truth floor**.

---

## Where This Fits Long-Term

MX2LEX can act as:
- a front-end gate for LLMs
- a verifier for symbolic runtimes
- a grammar oracle for agents
- a learning signal generator
- a replay anchor for distributed AI
- a kernel-safe WASM component

But right now:

> **It is a clean, minimal, finished layer.**

---

## Model blueprint (Qwen as the reference slot)

MX2LEX stays outside model execution, but when you need a reference model to occupy the “model core” slot in the stack, use **Qwen** as the anchor. Keep the tokenizer, prompt surface, grammar layer, and MX2LEX legality checks fixed, then swap in alternative models (DeepSeek, Janus, etc.) one dimension at a time (weights, tokenizer, or prompt template) to measure deltas without moving the rest of the system. See `MODEL_BLUEPRINT.md` for a concrete file-by-file guide based on the Qwen pack layout.

---

## Project Status

- ✔ Vocabulary separation (VOCAB vs LEX)
- ✔ Grammar legality (context + adjacency + transitions)
- ✔ Finite automaton export
- ✔ @gram semantic learning
- ✔ CLI tool
- ✔ Browser-safe WASM tokenizer
- ✔ Replay-safe hashes

**No more features are required to be “complete.”**

Everything else is integration.

---

## Model scaffold for comparisons

To keep the “model core” swappable while MX2LEX, grammar gates, and orchestration stay fixed, a **Qwen-style scaffold** lives in `models/qwen-blueprint/`. It mirrors the reference file layout (config, tokenizer, vocab, merges, generation defaults) with deterministic placeholders. Drop in real Qwen, DeepSeek, or Janus assets there to compare behaviors without changing the surrounding stack.

---

## Philosophy

> *Structure before intelligence.*  
> *Meaning before execution.*  
> *Replay before trust.*

MX2LEX exists so future AI systems don’t lie to themselves.
