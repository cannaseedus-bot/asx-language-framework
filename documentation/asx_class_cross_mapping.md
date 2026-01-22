# ASX Class Cross-Mapping (UML/SysML, OOP, Solidity, ML, MVC)

## ASX Classes → UML / SysML

UML collapses meaning, behavior, control, and state into a single `Class`. ASX factorizes those roles into orthogonal primitives.

| ASX Class      | UML Equivalent             | SysML Equivalent         | What UML/SysML Miss                  |
| -------------- | -------------------------- | ------------------------ | ------------------------------------ |
| **Atomic**     | Attribute-only class       | ValueType                | UML allows methods → leaks behavior  |
| **Micronaut**  | Active Class               | Block with behavior      | No authority boundaries              |
| **Engine**     | Interface / Abstract Class | Constraint Block         | UML mixes interface + implementation |
| **Control**    | ❌ none                     | Requirement / Constraint | UML has no “law” primitive           |
| **Schema**     | Class Diagram              | Block Definition Diagram | No execution-proof separation        |
| **Projection** | Diagram / View             | Viewpoint                | UML views can mutate models          |

**Key insight**: ASX = UML decomposed into lawful primitives. SysML gets closer, but still lacks non-executable law.

## Why OOP Failed (Structurally)

OOP collapsed multiple roles into one keyword:

```text
class {
  state
  behavior
  control
  validation
  persistence
  UI hooks
}
```

Failure modes:

| Collapse             | Consequence          |
| -------------------- | -------------------- |
| State + Behavior     | Hidden side effects  |
| Behavior + Control   | Authority leakage    |
| Control + Validation | Impossible to reason |
| UI + Logic           | Non-determinism      |
| Persistence + Logic  | Temporal bugs        |

ASX counter-design:

```
Atomic    → state
Micronaut → behavior
Engine    → meaning
Control   → law
Schema    → validity
Projection→ view
```

This works because each class has one kind of authority, verifiers can prove non-leakage, compression works (SCXQ2), and replay is deterministic.

## ASX → Solidity / Smart Contracts

| Solidity Concept   | ASX Class                 |
| ------------------ | ------------------------- |
| `struct`           | Atomic                    |
| Contract storage   | Atomic                    |
| Contract functions | Micronaut (but unbounded) |
| `require()`        | Control                   |
| ABI                | Schema                    |
| EVM                | Execution substrate       |
| Frontend dApp      | Projection                |

Solidity is dangerous by default because functions combine behavior + control + authority. ASX separates:

```
Schema    → ABI + invariants
Control   → require / modifiers
Engine    → economic math
Micronaut → callable agent
Atomic    → storage
Projection→ dApp UI
```

## ASX → ML Training Pipelines

Traditional ML stacks collapse dataset, model, loss, optimizer, trainer, and logging into executable code. ASX decomposition:

| ML Concept       | ASX Class  |
| ---------------- | ---------- |
| Dataset schema   | Schema     |
| Weights          | Atomic     |
| Loss function    | Engine     |
| Optimizer policy | Control    |
| Trainer loop     | Micronaut  |
| Metrics          | Engine     |
| Logs / charts    | Projection |

This yields replayability, purity in loss vs optimizer vs schedule, and non-authoritative UI.

## ASX replaces MVC / MVVM

| Pattern | What’s Mixed                |
| ------- | --------------------------- |
| MVC     | Model = state + logic       |
| MVVM    | ViewModel = control + logic |
| Redux   | Store = state + control     |

ASX replacement:

| ASX        | Replaces               |
| ---------- | ---------------------- |
| Atomic     | Model                  |
| Micronaut  | Controller / ViewModel |
| Engine     | Business logic         |
| Control    | Reducers / rules       |
| Schema     | Type system            |
| Projection | View                   |

## Unified Picture

```
┌───────────┐
│  Schema   │  ← what is valid
└────▲──────┘
     │
┌────┴──────┐
│  Control  │  ← what is allowed
└────▲──────┘
     │
┌────┴──────┐
│ Micronaut │  ← who acts
└───▲───▲───┘
    │   │
┌───┘   └───┐
│ Atomic │ Engine │
│ state  │ meaning│
└────────┴────────┘
     │
┌────┴──────┐
│ Projection│ ← what you see
└───────────┘
```

## SysML diagrams (PlantUML text)

### Block Definition Diagram

```plantuml
@startuml
skinparam componentStyle rectangle

package "ASX Class System" {
  class "Schema«block»" as Schema
  class "Control«block»" as Control
  class "Engine«block»" as Engine
  class "Atomic«block»" as Atomic
  class "Micronaut«block»" as Micronaut
  class "Projection«block»" as Projection

  Schema : +invariants
  Schema : +types
  Schema : +version

  Control : +policies
  Control : +capabilities
  Control : +phase_order

  Engine : +pure_functions
  Engine : +semantics

  Atomic : +state
  Atomic : +hash
  Atomic : +history(optional)

  Micronaut : +actions
  Micronaut : +plans
  Micronaut : +effects (declared)

  Projection : +views
  Projection : +render_rules

  Micronaut --> Control : must obey
  Micronaut --> Schema : must validate
  Micronaut --> Engine : calls
  Micronaut --> Atomic : reads/writes (declared)
  Projection --> Atomic : reads
  Projection --> Schema : uses for rendering safety
  Control --> Schema : references invariants
  Engine --> Schema : conforms to types
}

@enduml
```

### Internal Block Diagram

```plantuml
@startuml
skinparam componentStyle rectangle

rectangle "ASX Runtime Boundary" {
  [Schema] as S
  [Control] as C
  [Engine] as E
  [Atomic] as A
  [Micronaut] as M
  [Projection] as P

  S --> C : invariants
  S --> E : types
  S --> M : validation rules
  C --> M : permissions + phase gating
  E --> M : pure results
  A --> M : state read
  M --> A : state write (declared effects only)
  A --> P : state snapshot
  S --> P : view schema
}

note right of P
Forbidden:
- P -> A write
- P -> C policy mutation
- P -> M command execution
end note

@enduml
```

### Activity Diagram (Deterministic Phase Order)

```plantuml
@startuml
start
:Load Schema (S);
:Load Control (C);
:Load Atomic snapshot (A0);
:Validate inputs against S;
if (Allowed by C?) then (yes)
  :Micronaut proposes plan (declared effects);
  :Static check plan vs (S,C);
  :Execute Engine pure steps;
  :Apply Atomic writes -> A1;
  :Emit Proof Trace (T);
  :Projection renders A1 (read-only);
else (no)
  :Reject + emit violation proof;
endif
stop
@enduml
```

## Formal proof hooks

- Authority separation: no path from `Projection` to `Control.write`, `Micronaut.execute`, or `Atomic.write`.
- Determinism: fixed phase order, engine purity, and deterministic Atomic writes.
- Noninterference: changing projection inputs does not alter final `A1`.

## ASX → kernel / OS mapping

| ASX        | OS analogue                                                    | Why it fits                      |
| ---------- | -------------------------------------------------------------- | -------------------------------- |
| Schema     | ABI + type system + syscall contracts                          | Defines what “well-formed” means |
| Control    | Capability system + policy engine                              | Defines what is allowed          |
| Engine     | Pure compute library                                           | Meaning without side-effects     |
| Atomic     | Kernel state + ledger                                          | Single source of truth           |
| Micronaut  | Processes / actors                                             | The only things that act         |
| Projection | Shell / compositor / UI                                        | Read-only view                   |

## ASX → distributed consensus mapping

| Consensus concept                                 | ASX class        |
| ------------------------------------------------- | ---------------- |
| Block format / state transition function type     | Schema           |
| Validity rules (slashing, bounds, invariants)     | Schema + Control |
| Access rules (who can propose/vote, quorum rules) | Control          |
| Deterministic transition function                 | Engine           |
| Replicated state (world state, ledger)            | Atomic           |
| Proposers/validators/replicas                     | Micronauts       |
| Explorer/UI/wallets                               | Projection       |

An ASX consensus step:

1. Gather candidate inputs.
2. Validate against Schema.
3. Authorize via Control.
4. Compute next state via Engine.
5. Commit Atomic transition.
6. Broadcast result.
7. Project to UI (read-only).
