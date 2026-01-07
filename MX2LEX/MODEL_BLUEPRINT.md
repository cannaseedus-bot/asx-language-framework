# Model Blueprint — Qwen as Reference

Use this guide to build a model pack using the Qwen file layout as the blueprint. The goal is **comparative architecture**, not model favoritism: Qwen sits in the “model core” slot so you can swap alternative models (DeepSeek, Janus, etc.) without touching the rest of the stack.

## Reference pack layout (Qwen)

```
model-pack/
├── added_tokens.json        # optional special tokens beyond vocab
├── chat_template.jinja      # prompt surface for chat-formatting
├── config.json              # transformer architecture & hyperparameters
├── generation_config.json   # decoding defaults (temperature, top_p, etc.)
├── merges.txt               # BPE merge rules
├── model.safetensors        # weights (reference model core)
├── special_tokens_map.json  # mapping for BOS/EOS/PAD/UNK, etc.
├── tokenizer.json           # consolidated tokenizer definition (often BPE)
├── tokenizer_config.json    # tokenizer behavior and preprocessing flags
└── vocab.json               # token -> id map
```

> **Key rule:** Only the `model.safetensors` (weights) should define the model core. Everything else (tokenizer, prompts, grammar layer, MX2LEX legality) stays fixed unless you are explicitly measuring a change.

## How to build an alternate model using this blueprint

1. **Start with the full Qwen pack** in `model-pack/` as your baseline.
2. **Lock non-model layers**:
   - MX2LEX vocab/lex/grammar remain unchanged.
   - Grammar legality checks stay on by default.
   - Chat template, tokenizer, and special-token policy stay fixed for the baseline run.
3. **Swap a single dimension at a time**:
   - **Weights-only swap:** replace `model.safetensors` with the new model’s weights while keeping tokenizer and prompt surface identical. Measure legality, determinism, and semantic drift.
   - **Tokenizer swap:** change `vocab.json`/`merges.txt`/`tokenizer.json` (and `tokenizer_config.json` if required) while keeping weights fixed, then measure tokenization and legality changes.
   - **Prompt-surface swap:** adjust `chat_template.jinja` only, keeping weights and tokenizer constant, to isolate formatting effects.
4. **Replay fixed inputs** with the same seeds and MX2LEX grammar gate to compare outputs deterministically.
5. **Record deltas**: legality rate, control compliance, span stability, and hash consistency.

## Minimal checks before declaring a swap “valid”

- **Tokenizer determinism:** identical input yields identical token IDs across runs.
- **Grammar legality:** MX2LEX legality pass/fail rate matches or exceeds the Qwen baseline for the same prompts.
- **Hash stability:** replay hashes are stable for identical inputs after the swap.
- **Prompt compliance:** chat template produces structurally identical surfaces (unless that is the dimension you are testing).

## When to touch each file

- `model.safetensors`: only when changing the model core (weights).
- `vocab.json`, `merges.txt`, `tokenizer.json`, `tokenizer_config.json`: when testing an alternative tokenizer; keep them in sync.
- `added_tokens.json`, `special_tokens_map.json`: when adding or remapping special tokens—update grammar expectations accordingly.
- `chat_template.jinja`: when experimenting with different prompt surfaces (e.g., instruction vs chat style). Keep MX2LEX grammar rules aligned with any structural changes you introduce.
- `generation_config.json`: set decoding defaults; treat as policy, not architecture. Keep fixed during comparisons unless decoding strategy is the variable under test.
- `config.json`: describes architecture; should correspond to the weights. Change only when weights change.

## Integration with MX2LEX

- MX2LEX stays outside execution: it provides deterministic tokenization, legality checks, and replay hashes.
- For every swap, run the MX2LEX legality gate first; reject outputs that violate grammar before any downstream use.
- Use MX2LEX hashes to anchor replay and diff compression when comparing models.

## Quick start recipe

1. Copy the Qwen pack into `model-pack/`.
2. Run baseline evaluations through MX2LEX legality.
3. Replace `model.safetensors` with your alternate model’s weights.
4. Re-run the same inputs; log legality/hashes.
5. If needed, iterate on tokenizer or prompt template, one at a time, repeating the legality + replay checks.

Keep it **boring, deterministic, and measured**—that’s the point of the blueprint.
