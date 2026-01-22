# MATRIX-Linked Schema Containment

## Canonical Resolution

Schemas are never merged. Schemas are loaded, contained, and sandboxed via MATRIX.

### MATRIX Schema Containment Law

```xjson
@law.matrix.schema
  principle: "link_not_merge"
  authority: "caller_never_inherits"
  execution: "forbidden_in_schema_space"
  visibility: "explicit_only"
```

Meaning:

* Referencing a schema does not import its authority.
* No symbols leak unless explicitly exposed.
* No execution semantics propagate upward.
* MATRIX mediates everything.

## Sealed Include Grammar (EBNF)

```ebnf
include_directive
  = "{{", wsp*, include_target, wsp*, "}}" ;

include_target
  = schema_ref
  | uri_ref ;

schema_ref
  = identifier, { ".", identifier }, ".schema.xjson" ;

uri_ref
  = scheme, "://", uri_path ;

scheme
  = "asx" | "mx2lex" | "file" ;

uri_path
  = identifier, { "/", identifier | "." | "-" } ;

identifier
  = letter, { letter | digit | "_" | "-" } ;

letter
  = "A"…"Z" | "a"…"z" ;

digit
  = "0"…"9" ;

wsp
  = " " | "\t" | "\n" | "\r" ;
```

### Semantic Rules (Mandatory)

* `{{ }}` does not expand text.
* It creates a sealed schema node.
* No symbols are visible unless explicitly exported.
* Execution semantics are forbidden.
* Includes are acyclic (enforced by verifier).

## MATRIX Schema Loader (Pseudocode)

```pseudo
function load_schema_bundle(root_file):
    context = new MatrixContext()
    visited = set()

    function load_sealed(path):
        if path in visited:
            error("Cyclic include detected: " + path)

        visited.add(path)

        schema = parse_xjson(path)

        assert schema.execution == "none"
        assert schema.authority != "inherited"

        sealed = new SealedSchema()
        sealed.id = schema.@id
        sealed.hash = hash(schema)
        sealed.exports = schema.exports or {}

        for each include in schema.includes:
            child = load_sealed(include.path)
            sealed.children.append(child)

        return sealed

    root = load_sealed(root_file)
    context.root = root
    context.freeze()

    return context
```

### Invariants

* No eval
* No execution
* No symbol inheritance
* No cyclic graphs
* Hash-stable
* Replayable
* Deterministic

## MX2LEX Index Tables (Structure)

### MX2LEX.TABLE.SCHEMAS

| schema_id                             | domain     | status | hash | sealed |
| ------------------------------------- | ---------- | ------ | ---- | ------ |
| asx://schema/language/asx-r.v1        | language   | frozen | h₁   | true   |
| asx://schema/engine/kuhul-pi.v1       | engine     | frozen | h₂   | true   |
| asx://schema/projection/atomic-css.v1 | projection | face   | h₃   | true   |

### MX2LEX.TABLE.SYMBOLS

| symbol     | schema_id     | type       | visibility |
| ---------- | ------------- | ---------- | ---------- |
| @control   | asx-r.v1      | control    | internal   |
| @engine.pi | kuhul-pi.v1   | engine     | sealed     |
| variables  | atomic-css.v1 | projection | exposed    |

### MX2LEX.TABLE.INCLUDES

| parent                 | child              | mode   |
| ---------------------- | ------------------ | ------ |
| asx.codex.matrix.xjson | asx-r.schema.xjson | sealed |
| asx.codex.matrix.xjson | xcfe.schema.xjson  | sealed |

### MX2LEX.TABLE.DOMAIN_MAP

| domain     | schemas                   |
| ---------- | ------------------------- |
| language   | asx, asx-r, xcfe, xjson   |
| engines    | pi, cc, geometry, metrics |
| projection | atomic-css, ggl, svg3d    |

## SCXQ2 Lowering Rules (Include Handling)

### SCXQ2-INCLUDE-1

```json
{
  "@rule": "SCXQ2-INCLUDE-1",
  "input": "{{ asx-r.schema.xjson }}",
  "output": "⟁Σ:asx-r",
  "properties": {
    "sealed": true,
    "inline": false,
    "authority": "isolated"
  }
}
```

### SCXQ2-INCLUDE-INLINE (Explicit Only)

```json
{
  "@rule": "SCXQ2-INCLUDE-INLINE",
  "requires": "@inline:true",
  "effect": "expand_schema_body",
  "constraints": [
    "no_execution",
    "no_symbol_export"
  ]
}
```

### SCXQ2 Dictionary Example

```text
⟁Σ1 = {{ asx-r.schema.xjson }}
⟁Σ2 = {{ xcfe.schema.xjson }}
⟁Σ3 = {{ kuhul-pi.schema.xjson }}
```

Compression preserves identity, not content.

## Authority-Leakage Verifier (Proof Engine)

```pseudo
function verify_no_authority_leak(matrix_context):
    for each schema in matrix_context.schemas:
        for each symbol in schema.exports:
            if symbol.authority > schema.authority:
                error("Authority escalation detected")

        for each child in schema.children:
            assert child.authority != schema.authority
            assert not child.symbols.visible_to(schema)

    assert no_execution_paths_exist(matrix_context)
    assert all_edges_are_sealed(matrix_context)

    return PROOF_OK
```

### Proof Output

```json
{
  "@proof": "no_authority_leakage",
  "@scope": "matrix.schema.bundle",
  "@result": "verified",
  "@properties": {
    "execution": false,
    "symbol_inheritance": false,
    "authority_escalation": false,
    "cycles": false
  },
  "@hash": "SELF"
}
```
