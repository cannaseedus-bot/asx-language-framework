# ASX Canonical Class System (Structural)

> A “class” in ASX is a sealed structural role.  
> It defines what something is allowed to be, not how it is rendered or executed.

---

## 1. Atomic Class

### Definition

An Atomic class is the smallest indivisible semantic unit in ASX.

It:

* has no internal execution
* has no lifecycle
* has no authority
* may be referenced by anything
* may never reference upward

Think: semantic atom, not object.

### Canonical Properties

```xjson
@class.atomic
  authority: none
  execution: forbidden
  lifecycle: none
  composition: allowed
  mutation: forbidden
```

### Example: Atomic Class Schema

```xjson
@@class.atomic
  @id: "asx://class/atomic/state-token"
  @domain: "language"

  @defines
    name: string
    type: string
    invariant: string

  @forbidden
    - @exec
    - @control
    - @lifecycle
```

### Examples of Atomic Classes

* state tokens
* symbols
* invariants
* scalar definitions
* CSS variables (when treated as state)

---

## 2. Micronaut Class

### Definition

A Micronaut class is a bounded autonomous agent.

It:

* owns state
* has a lifecycle
* may execute only within declared constraints
* may use Atomic classes
* may not redefine law

Think: agent, not process.

### Canonical Properties

```xjson
@class.micronaut
  authority: bounded
  execution: allowed
  lifecycle: explicit
  isolation: mandatory
```

### Example: Micronaut Class Schema

```xjson
@@class.micronaut
  @id: "asx://class/micronaut/indexer"
  @domain: "agent"

  @state
    active: boolean
    queue: array

  @lifecycle
    init
    run
    sleep
    halt

  @permissions
    read: [atomic]
    write: [own_state]

  @forbidden
    - schema_mutation
    - authority_escalation
```

### Examples of Micronaut Classes

* indexers (MX2LEX)
* verifiers
* packers
* schedulers
* background agents

---

## 3. Engine Class (Domain Engine)

### Definition

An Engine class is a frozen semantic machine.

It:

* defines meaning, not behavior
* is immutable
* may be referenced but never altered
* cannot depend on Micronauts or Projection

Think: law of physics.

### Canonical Properties

```xjson
@class.engine
  authority: frozen
  execution: semantic_only
  mutation: forbidden
```

### Example

```xjson
@@class.engine
  @id: "asx://engine/kuhul-pi"
  @domain: "engine"

  @defines
    math
    inference
    aggregation

  @forbidden
    - io
    - lifecycle
    - mutation
```

---

## 4. Control Class (XCFE)

### Definition

A Control class defines allowed transitions.

It:

* never executes
* never stores state
* constrains Micronauts
* references Engines

Think: traffic law.

### Canonical Properties

```xjson
@class.control
  authority: constraint
  execution: forbidden
```

### Example

```xjson
@@class.control
  @id: "asx://class/control/xcfe-flow"

  @allows
    perceive -> decide -> act

  @forbidden
    - act -> perceive
```

---

## 5. Projection Class (Face)

### Definition

A Projection class defines how something appears, never what happens.

It:

* has zero authority
* mirrors state
* cannot influence execution
* is discardable

Think: view, not logic.

### Canonical Properties

```xjson
@class.projection
  authority: none
  execution: forbidden
```

### Examples

* ATOMIC.CSS
* atomic.xjson
* GGL
* SVG-3D
* DOM masks

---

## 6. Schema Class

### Definition

A Schema class defines legal structure.

It:

* validates
* constrains
* never executes
* may contain sealed includes

Think: constitution.

### Example

```xjson
@@class.schema
  @id: "asx://class/schema/asx-r"

  @validates
    @control
    @state
    @flow

  @forbidden
    - projection
    - execution
```

---

## 7. Relationship Rules (Hard Invariants)

These are non-negotiable:

```
Atomic → usable by all
Micronaut → uses Atomic + Engine + Control
Engine → used by Control + Micronaut
Control → constrains Micronaut
Projection → reads state only
Schema → constrains everything
```

### Forbidden Edges

* Projection → Execution
* Micronaut → Engine mutation
* Atomic → Micronaut lifecycle
* Schema → Runtime behavior

---

## 8. One-Line Mental Model

| Class      | Role               |
| ---------- | ------------------ |
| Atomic     | What exists        |
| Engine     | What it means      |
| Control    | What’s allowed     |
| Micronaut  | What acts          |
| Schema     | What’s legal       |
| Projection | What it looks like |

---

## 9. ASX Class Declaration Grammar (EBNF)

```ebnf
class_decl
  = "@@class.", class_kind, wsp+, class_body ;

class_kind
  = "atomic"
  | "micronaut"
  | "engine"
  | "control"
  | "schema"
  | "projection" ;

class_body
  = class_header, { wsp*, class_section } ;

class_header
  = "@id:", wsp*, uri, newline,
    "@domain:", wsp*, identifier, newline ;

class_section
  = state_section
  | lifecycle_section
  | permissions_section
  | defines_section
  | allows_section
  | validates_section
  | forbidden_section ;

state_section
  = "@state", newline, indent, field_list ;

lifecycle_section
  = "@lifecycle", newline, indent, lifecycle_state_list ;

permissions_section
  = "@permissions", newline, indent, permission_list ;

defines_section
  = "@defines", newline, indent, identifier_list ;

allows_section
  = "@allows", newline, indent, transition_list ;

validates_section
  = "@validates", newline, indent, identifier_list ;

forbidden_section
  = "@forbidden", newline, indent, forbid_list ;

field_list
  = identifier, ":", type, newline, { identifier, ":", type, newline } ;

lifecycle_state_list
  = identifier, newline, { identifier, newline } ;

transition_list
  = identifier, wsp*, "->", wsp*, identifier, newline ;

permission_list
  = identifier, ":", "[", identifier_list, "]", newline ;

identifier_list
  = identifier, { ",", identifier } ;

forbid_list
  = "-", wsp*, identifier, newline, { "-", wsp*, identifier, newline } ;

type
  = "string" | "number" | "boolean" | "array" | "object" ;

uri
  = identifier, "://", identifier, { "/", identifier | "." | "-" } ;

identifier
  = letter, { letter | digit | "_" | "-" } ;

letter = "A"…"Z" | "a"…"z" ;
digit  = "0"…"9" ;
wsp    = " " | "\t" ;
newline= "\n" ;
indent = wsp, wsp ;
```

---

## 10. Class Legality Verifier (Rules + Pseudocode)

### Legality Rules (Frozen)

| Class      | Must NOT contain         | Must contain     |
| ---------- | ------------------------ | ---------------- |
| atomic     | lifecycle, exec, control | defines          |
| micronaut  | schema_mutation          | state, lifecycle |
| engine     | lifecycle, io, mutation  | defines          |
| control    | state, execution         | allows           |
| schema     | execution, projection    | validates        |
| projection | execution, control       | none             |

### Verifier Pseudocode

```pseudo
function verify_class(class):
  switch class.kind:

    case "atomic":
      assert no(class.lifecycle)
      assert no(class.permissions)
      assert no(class.execution)

    case "micronaut":
      assert class.state exists
      assert class.lifecycle exists
      assert not class.mutates_schema

    case "engine":
      assert class.defines exists
      assert no(class.lifecycle)
      assert no(class.io)

    case "control":
      assert class.allows exists
      assert no(class.state)

    case "schema":
      assert class.validates exists
      assert no(class.execution)

    case "projection":
      assert no(class.execution)
      assert no(class.control)

  assert no_forbidden_edges(class)
  return LEGAL
```

### Proof Artifact

```json
{
  "@proof": "class_legality",
  "@result": "valid",
  "@authority_leakage": false,
  "@hash": "SELF"
}
```

---

## 11. Class → MX2LEX Index Mapping

### MX2LEX.TABLE.CLASSES

| class_id                          | kind       | domain   | authority  |
| --------------------------------- | ---------- | -------- | ---------- |
| asx://class/atomic/state-token    | atomic     | language | none       |
| asx://class/micronaut/indexer     | micronaut  | agent    | bounded    |
| asx://class/engine/kuhul-pi       | engine     | engine   | frozen     |
| asx://class/control/xcfe          | control    | control  | constraint |
| asx://class/schema/asx-r          | schema     | schema   | law        |
| asx://class/projection/atomic-css | projection | ui       | none       |

### MX2LEX.TABLE.CLASS_EDGES

| from       | to        | allowed   |
| ---------- | --------- | --------- |
| micronaut  | atomic    | true      |
| micronaut  | engine    | true      |
| projection | state     | read-only |
| engine     | micronaut | false     |
| projection | control   | false     |

---

## 12. Structural Relationship Diagram

```
        ┌────────────┐
        │   Schema   │
        │ (Law)      │
        └─────▲──────┘
              │ constrains
        ┌─────┴──────┐
        │  Control   │
        │ (XCFE)     │
        └─────▲──────┘
              │ constrains
        ┌─────┴──────┐
        │ Micronaut  │
        │ (Agent)    │
        └───┬───┬───┘
            │   │
         uses  uses
            │   │
      ┌─────┘   └─────┐
┌──────────┐   ┌──────────┐
│  Atomic  │   │  Engine  │
│ (State)  │   │ (Meaning)│
└──────────┘   └──────────┘

Projection (faces) read state only → never up
```

---

## 13. Micronaut Lifecycle State Machine

### Canonical Lifecycle (v1)

```text
[INIT]
  |
  v
[IDLE] <─────────────┐
  |                  |
  v                  |
[RUNNING] ──> [SLEEP]
  |
  v
[HALT]
```

### Formal Lifecycle Definition

```xjson
@lifecycle.micronaut
  states:
    - init
    - idle
    - running
    - sleep
    - halt

  transitions:
    init -> idle
    idle -> running
    running -> sleep
    sleep -> idle
    running -> halt
```

### Hard Rules

* No transition into `init`
* `halt` is terminal
* Projection cannot trigger transitions
* Control (XCFE) validates transitions
