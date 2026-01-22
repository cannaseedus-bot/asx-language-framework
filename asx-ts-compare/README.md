# asx-ts-compare

Two versions of the same tiny app:
- `apps/plain-ts`: plain TypeScript
- `apps/ts-plus-asx`: TypeScript + `.asx` envelopes, MX2LEX index, verifier

Tooling:
- `tools/asx-envelope-gen`: TS → `.asx` envelope generator (deterministic)
- `tools/asx-verifier`: TS + `.asx` legality verifier (no authority leakage + hash binding)
- `tools/mx2lex-index-gen`: walks `codex/class/*.schema.xjson` and rebuilds `mx2lex/classes.index.jsonl` deterministically

## Quick start

```bash
npm i
npm run build

# Run apps
npm run plain
npm run asx

# Generate envelopes in TS+ASX app
npm run gen:asx

# Verify TS+ASX app
npm run verify:asx

# Rebuild MX2LEX class index from schemas
npm run mx2lex:rebuild
```

## Notes

* Envelopes are *upper-bound declarations*. Code must not exceed them.
* Verifier is conservative and syntactic (fast + deterministic). Extend as needed.
