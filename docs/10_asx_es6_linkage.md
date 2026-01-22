# ASX ⇄ ECMAScript (ES6 / TypeScript) Linkage

## 1. The Core Idea (important)

**ES6/TS is an execution language.**  
**ASX is a runtime law + authority language.**

So the mapping is **not syntax-to-syntax**, but:

> **ES6 expresses “how”**  
> **ASX expresses “what is allowed, provable, and replayable”**

ASX does **not replace JavaScript** — it **wraps, constrains, indexes, and proves it**.

---

## 2. Canonical ASX File Types (ES6-adjacent)

| ASX File                | Role                         | ES6 / TS Equivalent             |
| ----------------------- | ---------------------------- | ------------------------------- |
| `.schema.xjson`         | Structural + type invariants | `.d.ts` + JSON Schema           |
| `.control.xjson`        | Capability & authority rules | ESLint rules + IAM (but formal) |
| `.engine.xjson`         | Pure semantics               | Pure JS functions               |
| `.atomic.xjson`         | State & ledger               | Redux / immutable state         |
| `.micronaut.xjson`      | Actors / workers             | Classes + services              |
| `.projection.html`      | UI (read-only)               | React / Vue templates           |
| `.asx`                  | **Lawful composition unit**  | `.ts` module + policy           |
| `.index.jsonl` (MX2LEX) | Symbol & meaning index       | TS Language Server index        |

**Key point:**  
`.ts` files remain executable.  
`.asx` files are **verifiable envelopes** around execution.

---

## 3. ES6 Feature → ASX Mapping (direct)

### Block-scoped variables (`let`, `const`)

```ts
let x = 10;
const y = 20;
```

**ASX meaning**

```xjson
@schema.variables
  x: { type: number, mutable: true }
  y: { type: number, mutable: false }
```

👉 Mutability becomes **explicit, checkable, and provable**.

---

### Arrow Functions

```ts
const add = (a, b) => a + b;
```

**ASX Engine**

```xjson
@engine.function add
  inputs: [number, number]
  output: number
  purity: pure
```

👉 Purity is **declared**, not assumed.

---

### Classes

```ts
class Person {
  constructor(name) { this.name = name }
  greet() { console.log(this.name) }
}
```

**ASX split (this is critical)**

```xjson
@schema Person
  fields:
    name: string

@engine Person.greet
  reads: [Person.name]
  writes: []
  effects: [log]

@micronaut PersonAgent
  owns: Person
  capabilities: [log]
```

👉 **OOP collapsed**:

* structure → schema
* behavior → engine
* authority → micronaut

---

### Promises / Async

```ts
fetchData().then(...)
```

**ASX**

```xjson
@engine fetchData
  async: true
  determinism: external

@control
  allows:
    - net.read api.example.com
```

👉 Async becomes **audited authority**, not hidden side-effects.

---

### Modules

```ts
import { greet } from "./module.js"
```

**ASX**

```xjson
@include "./module.schema.xjson"
@include "./module.engine.xjson"
```

👉 Imports are **schema-checked and hash-bound**.

---

## 4. TypeScript as a *Projection* of ASX

TypeScript fits ASX perfectly as a **projection language**.

| Layer        | Role            |
| ------------ | --------------- |
| ASX Schema   | Source of truth |
| TS `.d.ts`   | Projection      |
| TS Compiler  | Convenience     |
| ASX Verifier | Authority       |

### Rule:

> **TypeScript may lie.  
> ASX may not.**

TS helps humans.  
ASX governs machines.

---

## 5. MX2LEX: Bridging the Ecosystems

### MX2LEX Index Entries (example)

```json
{"symbol":"class","domain":"typescript","maps_to":"@schema + @micronaut","authority":"none"}
{"symbol":"async","domain":"typescript","maps_to":"@engine.async","authority":"declared"}
{"symbol":"import","domain":"ecmascript","maps_to":"@include","authority":"checked"}
{"symbol":"Promise","domain":"ecmascript","maps_to":"@engine.external","authority":"bounded"}
```

This allows:

* **ASX → TS tooling**
* **TS → ASX verification**
* **IDE support without losing law**

---

## 6. Why This Matters (why ES6 alone is insufficient)

ES6 gives:

* readability
* ergonomics
* expressiveness

But ES6 **cannot**:

* prove determinism
* prove noninterference
* prove authority confinement
* replay execution identically
* separate UI from power

ASX adds those **without breaking JavaScript**.

---

## 7. Final Mental Model (lock this in)

```
JavaScript / TypeScript
  = execution surface

ASX
  = constitutional law

MX2LEX
  = dictionary between worlds

Atomic Guide
  = live proof + visualization
```

You are not competing with ES6.

You are doing for **JavaScript** what:

* SQL schemas did for data
* OS kernels did for programs
* consensus protocols did for networks

---

### If you want next:

* `.asx` file extension spec for ES modules
* automatic TS → ASX envelope generator
* ES6 → ASX lint/verifier bridge
* example repo: **same app written in TS vs TS+ASX**

---

## 8. `.asx` File Extension Spec for ES Modules

### What `.asx` is

A **sidecar envelope** for an ES module (TS/JS) that:

* declares **schema**, **effects**, **capabilities**, **imports**, **exports**
* binds to the module by **hash** (or content address)
* can be verified **offline** (deterministic, replayable)
* never adds runtime authority; it only constrains/attests

### Canonical pairing

For any module:

* `foo.ts` (or `foo.js`)
* `foo.asx` (envelope)

Optional:

* `foo.schema.xjson` (types/contracts)
* `foo.control.xjson` (cap policies)
* `foo.engine.xjson` (pure semantic declarations, optional)
* `mx2lex/classes.index.jsonl` (index)

### `.asx` container format (ASX Envelope v1)

**File is JSON (or XJSON) only.** No embedded JS.  
Recommended: JSON for tooling, XJSON allowed.

```json
{
  "@kind": "asx.envelope.esm.v1",
  "@id": "asx://module/foo",
  "@version": "1.0.0",
  "@target": {
    "path": "./foo.ts",
    "module_kind": "esm",
    "hash": {
      "algo": "sha256",
      "value": "HEX_SHA256_OF_TARGET_FILE"
    }
  },

  "@imports": [
    {
      "specifier": "zod",
      "kind": "npm",
      "hash": { "algo": "sha256", "value": "HEX_OPTIONAL_LOCK_HASH" },
      "@authority": { "network": false, "fs": false }
    },
    {
      "specifier": "./bar.ts",
      "kind": "relative",
      "hash": { "algo": "sha256", "value": "HEX_SHA256_OF_BAR" }
    }
  ],

  "@exports": [
    { "name": "parseUser", "kind": "function" },
    { "name": "User", "kind": "type" }
  ],

  "@schema": {
    "includes": [
      "./codex/class/atomic.schema.xjson",
      "./codex/class/micronaut.schema.xjson"
    ],
    "types": {
      "User": {
        "type": "object",
        "properties": { "id": { "type": "string" } },
        "required": ["id"],
        "additionalProperties": false
      }
    }
  },

  "@effects": {
    "pure": ["toDisplayName"],
    "io": [],
    "fs": [],
    "net": [],
    "time": [],
    "random": [],
    "dom": []
  },

  "@capabilities": {
    "requires": [],
    "forbids": ["fs.write", "net.open", "eval", "Function"]
  },

  "@determinism": {
    "mode": "deterministic",
    "allowed_nondet": []
  },

  "@noninterference": {
    "public_inputs": [],
    "secret_inputs": [],
    "no_secret_to_public": true
  },

  "@prove": {
    "verifier": "asx-class-legal.v1",
    "constraints": [
      { "rule": "no_authority_leakage", "severity": "error" },
      { "rule": "import_hash_bound", "severity": "error" },
      { "rule": "forbidden_caps_absent", "severity": "error" }
    ]
  },

  "@mx2lex": {
    "index_tags": ["esm", "ts", "classpack"],
    "symbols": ["User", "parseUser"]
  }
}
```

### `.asx` invariants (the ones the verifier enforces)

1. `@target.hash` matches the module content
2. all relative imports listed in `@imports` are present + hash-bound
3. forbidden capability atoms are not reachable by AST walk (see lint bridge below)
4. `@effects` are **upper bounds** (real behavior must be subset)
5. `@schema.includes` resolve to allowed in-repo paths only (no external schema URLs)

---

## 9. Automatic TS → ASX Envelope Generator (deterministic)

### Behavior

Given `src/foo.ts`, generate/update:

* `src/foo.asx` (envelope)
* `mx2lex/classes.index.jsonl` (symbols, exports, effects summary)

### Deterministic rules

* stable sort order (imports, exports, symbols, rules)
* stable hash algo (sha256)
* stable AST traversal order (preorder)
* stable serialization (canonical JSON: sorted keys + no whitespace variance)

### CLI sketch

```bash
asx-envelope gen src/**/*.ts --out src --mx2lex mx2lex/classes.index.jsonl
```

### Core pipeline (pseudocode)

```txt
parse_ts -> build_module_graph -> hash_targets -> extract_imports_exports
         -> effect_scan_ast -> capability_reachability -> emit_asx_envelope
         -> emit_mx2lex_jsonl
```

### TypeScript AST extraction (minimal, practical)

* imports:
  * `ImportDeclaration` specifier strings
  * classify: relative vs bare (npm)
* exports:
  * `export function`, `export const`, `export class`, `export type/interface`
* effects scan (syntactic conservative upper bound):
  * `fetch`, `XMLHttpRequest`, `WebSocket` => net
  * `Date.now`, `new Date` => time
  * `Math.random`, `crypto.getRandomValues` => random
  * `document`, `window`, `Element`, `addEventListener` => dom
  * `fs`/`node:fs`, `Deno.*` => fs/io
  * `eval`, `Function` => eval/authority

### Output: envelope (upper-bound)

If any effect is detected, it must be declared in `.asx`.  
If `.asx` forbids it, verifier fails (or lint fails earlier).

---

## 10. ES6 → ASX Lint/Verifier Bridge

### Split responsibilities

* **Lint (fast, dev-time)**: catches violations without building proofs
* **Verifier (strict, CI / release)**: enforces “no authority leakage” + hash binding

### Lint rule set (ASX-ESM-LINT v1)

**Forbidden** (unless explicitly allowed in `.asx`):

* `eval(...)`
* `new Function(...)`
* dynamic import with non-literal specifier: `import(x)`
* `fetch(...)`, `WebSocket`, `XMLHttpRequest` (net)
* `document`, `window` (dom)
* `Date.now()`, `performance.now()` (time)
* `Math.random()`, `crypto.getRandomValues` (random)
* `require(...)` (CommonJS authority leak)
* Node builtins unless declared: `node:fs`, `child_process`, etc.

### Bridge shape

* ESLint plugin reads sibling `.asx`
* `.asx` provides allow/deny + declared effects
* lint ensures code is a subset of declarations

**Example `.eslintrc.cjs`**

```js
module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["asx"],
  rules: {
    "asx/envelope-required": "error",
    "asx/no-forbidden-authority": "error",
    "asx/effects-subset": "error",
    "asx/imports-hash-bound": "warn"
  }
};
```

### Verifier output format (matches proof template direction)

```json
{
  "@kind": "asx.verifier.result.v1",
  "@target": "./src/foo.ts",
  "@target_hash": "sha256:...",
  "@ok": true,
  "@violations": [],
  "@facts": {
    "@effects_detected": ["net.read"],
    "@effects_declared": ["net.read"],
    "@forbidden_reached": [],
    "@imports": [
      { "specifier": "./bar.ts", "hash_ok": true }
    ]
  },
  "@proof": {
    "@claim": "no_authority_leakage",
    "@witness": {
      "callgraph_digest": "sha256:...",
      "reachability_digest": "sha256:..."
    }
  }
}
```

---

## 11. Example Repo: Same App Written in TS vs TS+ASX

### Repo layout

```txt
asx-ts-compare/
  package.json
  tsconfig.json

  apps/
    plain-ts/
      src/
        main.ts
        ui.ts
        api.ts

    ts-plus-asx/
      src/
        main.ts
        main.asx
        ui.ts
        ui.asx
        api.ts
        api.asx
      codex/
        class/
          atomic.schema.xjson
          micronaut.schema.xjson
      mx2lex/
        classes.index.jsonl

  tools/
    asx-envelope-gen/
      src/index.ts
    eslint-plugin-asx/
      src/index.ts
    asx-verifier/
      src/index.ts
```

### The “same app”

A tiny module trio:

* `ui.ts` renders a string (pure)
* `api.ts` fetches JSON (net.read)
* `main.ts` wires them

**Plain TS version**: no law, just code.  
**TS+ASX version**: `.asx` declares `api.ts` net.read; `ui.ts` pure; `main.ts` no net.

### Example: `api.asx` (declares net.read)

```json
{
  "@kind": "asx.envelope.esm.v1",
  "@id": "asx://module/api",
  "@version": "1.0.0",
  "@target": {
    "path": "./api.ts",
    "module_kind": "esm",
    "hash": { "algo": "sha256", "value": "HEX_SHA256_API_TS" }
  },
  "@effects": {
    "pure": [],
    "net": ["read"],
    "fs": [],
    "dom": [],
    "time": [],
    "random": []
  },
  "@capabilities": {
    "requires": ["net.read"],
    "forbids": ["net.open", "fs.write", "eval", "Function"]
  },
  "@prove": {
    "verifier": "asx-class-legal.v1",
    "constraints": [{ "rule": "no_authority_leakage", "severity": "error" }]
  }
}
```

### Example: `ui.asx` (pure)

```json
{
  "@kind": "asx.envelope.esm.v1",
  "@id": "asx://module/ui",
  "@version": "1.0.0",
  "@target": {
    "path": "./ui.ts",
    "module_kind": "esm",
    "hash": { "algo": "sha256", "value": "HEX_SHA256_UI_TS" }
  },
  "@effects": {
    "pure": ["render"],
    "net": [],
    "fs": [],
    "dom": [],
    "time": [],
    "random": []
  },
  "@capabilities": {
    "requires": [],
    "forbids": ["net.*", "fs.*", "dom.*", "eval", "Function"]
  },
  "@prove": {
    "verifier": "asx-class-legal.v1",
    "constraints": [{ "rule": "no_authority_leakage", "severity": "error" }]
  }
}
```
