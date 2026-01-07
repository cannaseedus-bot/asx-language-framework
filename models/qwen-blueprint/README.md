# Qwen-Based Model Blueprint

This folder is a **Qwen-style model scaffold** for experiments where MX2LEX (or any grammar/legality layer) must keep everything fixed except the model weights and tokenizer surface. It mirrors the reference files shown in the Qwen model layout and provides **tiny, non-production placeholders** so you can: 

1. Verify downstream tooling and packaging.
2. Swap in real Qwen-derived assets (or alternates such as DeepSeek/Janus) without changing paths.
3. Compare model behavior while holding tokenizer, grammar gates, and orchestration constant.

> The contents here are intentionally minimal and deterministic. Replace them with real artifacts before any inference or benchmarking.

---

## Files and how to replace them

| File | Purpose | Replace with |
| --- | --- | --- |
| `config.json` | Core model hyperparameters and architecture metadata. | Real `config.json` from your chosen model. |
| `generation_config.json` | Default decoding parameters (max length, temperature, etc.). | The model's actual generation config. |
| `tokenizer_config.json` | Tokenizer behavior metadata (normalization, casing). | The tokenizer config shipped with the model. |
| `tokenizer.json` | Tokenizer model (vocab + merges). | The full tokenizer JSON from the model release. |
| `vocab.json` | Vocabulary mapping used by the BPE tokenizer. | The model's true `vocab.json`. |
| `merges.txt` | BPE merge rules. | The model's true `merges.txt`. |
| `special_tokens_map.json` | Mapping for BOS/EOS/UNK/PAD/etc. | The model's true `special_tokens_map.json`. |
| `added_tokens.json` | Any supplemental tokens beyond the base vocab. | The model's true `added_tokens.json`. |
| `model.safetensors` | Model weights. | The real `.safetensors` weights for Qwen (or alternate model). |

> **Note:** `model.safetensors` is **not** included; place the real weights here to activate the scaffold.

---

## Minimal placeholder behavior

The JSON and text files shipped here are small, deterministic stand-ins that:
- keep directory structure and filenames stable;
- allow CI/pipelines to validate packaging and hashing;
- make it obvious where to drop in real assets.

They are **not** runnable for serious workloads. Swap them out before use.

---

## Swapping models while keeping the stack constant

1. Start with this folder wired into your runtime (paths stable).
2. Drop in **real Qwen assets** to establish the baseline.
3. To compare DeepSeek/Janus (or any alternate model):
   - Replace only the files in this folder with that model's tokenizer + weights.
   - Keep MX2LEX / grammar / orchestration layers unchanged.
4. Replay identical prompts and legality constraints to measure deltas.

This preserves the **“model core slot”** discipline: everything above/below stays fixed while you swap the model itself.

---

## Optional hash/replay notes

- Hash the files in this folder (excluding the placeholder `model.safetensors` reference) to track provenance.
- MX2LEX legality checks remain deterministic regardless of which model you drop in here, as long as tokenizer semantics are updated accordingly.
