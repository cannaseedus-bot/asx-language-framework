# ASX Authority Requirements (SysML + Proof Skeleton)

## SysML Requirements Diagram (PlantUML)

```plantuml
@startuml
' SysML Requirements Diagram (PlantUML-style)
skinparam componentStyle rectangle

package "ASX Authority Requirements" {

  requirement R0 {
    id = "R0"
    text = "Phase Order: execution must follow fixed phases (Load→Validate→Authorize→Plan→Execute→Commit→Project)."
  }

  requirement R1 {
    id = "R1"
    text = "No Authority Leakage: Projection cannot mutate Atomic/Control, and cannot trigger Micronaut execution."
  }

  requirement R2 {
    id = "R2"
    text = "Determinism: Given same (Schema, Control, Atomic0, Inputs), the committed Atomic1 is identical."
  }

  requirement R3 {
    id = "R3"
    text = "Noninterference: Changes in Projection-only inputs (theme/layout/view state) cannot change Atomic1."
  }

  requirement R4 {
    id = "R4"
    text = "Capability Confinement: All state writes must be declared effects and authorized by Control."
  }

  requirement R5 {
    id = "R5"
    text = "Engine Purity: Engine evaluation is side-effect free (no IO/network/fs authority)."
  }

  requirement R6 {
    id = "R6"
    text = "Consensus Safety: Honest replicas applying same ordered inputs must converge on the same state hash."
  }

  requirement R7 {
    id = "R7"
    text = "Consensus Liveness (bounded): Under partial synchrony and quorum conditions, commit eventually occurs."
  }

  R1 -[deriveReqt]-> R3
  R0 -[deriveReqt]-> R2
  R5 -[deriveReqt]-> R2
  R4 -[deriveReqt]-> R2
  R1 -[deriveReqt]-> R4

  R2 -[deriveReqt]-> R6
  R0 -[deriveReqt]-> R6
  R4 -[deriveReqt]-> R6

  artifact "Verifier: Authority Graph Check" as V1
  artifact "Verifier: Determinism Replay Check" as V2
  artifact "Verifier: Noninterference Differential Check" as V3
  artifact "Verifier: Effect Set + Capability Proof" as V4
  artifact "Verifier: Engine Purity Scan" as V5

  V1 -[verify]-> R1
  V2 -[verify]-> R2
  V3 -[verify]-> R3
  V4 -[verify]-> R4
  V5 -[verify]-> R5

  artifact "Verifier: Consensus Convergence (Hash Agreement)" as V6
  V6 -[verify]-> R6
}

@enduml
```

## Consensus IBD (message channels + ownership)

```plantuml
@startuml
' Consensus Internal Block Diagram (IBD-ish)
skinparam componentStyle rectangle

rectangle "Replica Node i (ASX Runtime Boundary)" {

  [Schema] as S
  [Control] as C
  [Engine] as E
  [Atomic] as A
  [Micronaut:Consensus] as M
  [Projection] as P

  S --> M : validate(tx,msg)
  C --> M : authorize(role,caps)
  E --> M : eval(step)
  A --> M : read(state)
  M --> A : write(delta) [declared+authorized]
  A --> P : snapshot(state)
  S --> P : view schema
}

cloud "Consensus Network" as NET

NET <--> M : CH1 Gossip(tx)
CH2 Proposal(block)
CH3 Vote/Attestation
CH4 CommitCert
CH5 StateSync(ckpt)
CH6 Evidence/Slashing

note right of NET
Channel ownership rules:
- Send/Recv endpoints: Micronaut only
- Permission: Control issues net.capability
- Schema: defines message types + invariants
- Atomic: never directly publishes (only via Micronaut commits)
- Projection: never directly subscribes (only reads Atomic snapshots)
end note

M --> A : apply_checkpoint(ckpt)
[authorized + schema-validated]

@enduml
```

## Proof object schema (verifier output)

```json
{
  "@type": "asx.proof.authority.v1",
  "@id": "proof://authority/<hash>",
  "@spec": {
    "schema_id": "codex://schema/core/v1",
    "control_id": "codex://control/core/v1",
    "engine_id": "codex://engine/core/v1"
  },
  "@inputs": {
    "graph_hash": "<sha256>",
    "phase_order_hash": "<sha256>",
    "effect_set_hash": "<sha256>",
    "replay_seed": "<sha256>",
    "projection_delta_hash": "<sha256>"
  },
  "@claims": {
    "no_authority_leakage": true,
    "determinism": true,
    "noninterference": true,
    "capability_confinement": true,
    "engine_purity": true,
    "consensus_convergence": "conditional"
  },
  "@lemmas": [
    {
      "id": "L1_graph_nonreachability",
      "ok": true,
      "evidence": {
        "forbidden_targets": ["Control.write", "Atomic.write", "Micronaut.execute"],
        "source": "Projection",
        "witness_path": null
      }
    },
    {
      "id": "L2_phase_total_order",
      "ok": true,
      "evidence": {
        "order": ["Load", "Validate", "Authorize", "Plan", "Execute", "Commit", "Project"],
        "violations": []
      }
    },
    {
      "id": "L3_engine_pure",
      "ok": true,
      "evidence": {
        "forbidden_edges": ["io.*", "net.*", "fs.*", "clock.*"],
        "found": []
      }
    },
    {
      "id": "L4_effects_declared_and_authorized",
      "ok": true,
      "evidence": {
        "writes": ["Atomic.delta.*"],
        "caps_required": ["atomic.write", "net.send", "net.recv"],
        "caps_granted": ["atomic.write", "net.send", "net.recv"],
        "denials": []
      }
    },
    {
      "id": "L5_replay_determinism",
      "ok": true,
      "evidence": {
        "runs": [
          { "run": 1, "state_hash": "<h1>" },
          { "run": 2, "state_hash": "<h1>" }
        ]
      }
    },
    {
      "id": "L6_projection_noninterference",
      "ok": true,
      "evidence": {
        "baseline_state_hash": "<hA>",
        "variant_state_hash": "<hA>",
        "projection_variant": "theme/layout/view-only"
      }
    }
  ],
  "@theorems": [
    { "id": "T1_no_leakage", "from": ["L1_graph_nonreachability"], "ok": true },
    { "id": "T2_determinism", "from": ["L2_phase_total_order", "L3_engine_pure", "L4_effects_declared_and_authorized", "L5_replay_determinism"], "ok": true },
    { "id": "T3_noninterference", "from": ["L1_graph_nonreachability", "L6_projection_noninterference"], "ok": true }
  ],
  "@meta": {
    "verifier": "mx2lex-class-verifier",
    "verifier_version": "1.0.0",
    "timestamp": 0,
    "notes": []
  },
  "@hash": "SELF"
}
```

## Paper-style proof skeleton

### Definitions

- **D1 (System graph)**: A labeled directed graph G = (V, E), V = {Schema, Control, Engine, Atomic, Micronaut, Projection}. Each edge is (u, ℓ, v) with ℓ ∈ {read, write, authorize, validate, call, net.send, net.recv, ...}.
- **D2 (Authority targets)**: T_write = {Atomic.write, Control.write}, T_exec = {Micronaut.execute}.
- **D3 (Reachability predicate)**: Reach(G, a, b) holds if there exists a path from node a to node b following edges whose labels are not pure observation (allowlist-defined).
- **D4 (Transition function)**: A1 = δ(S, C, A0, I), where I are external inputs (messages/tx) and δ is induced by fixed phase order and Engine evaluation.
- **D5 (Projection-only variation)**: A variation π is Projection-only if it changes only Projection inputs/state (theme, layout, view filters) and does not alter (S, C, E, A0, I).

### Lemmas (verifier checks)

- **L1 (Graph nonreachability / no leakage)**: ¬Reach(G, Projection, t) for all t ∈ (T_write ∪ T_exec). Evidence: no path or witness path.
- **L2 (Phase total order)**: Runtime executes phases in a total order with no cycles or interleavings that affect δ. Evidence: extracted order + violation set.
- **L3 (Engine purity)**: Engine has no edges labeled with IO/network/fs/clock authority. Evidence: scan results.
- **L4 (Capability confinement)**: Every write edge M → A is contained in declared effect set W, and each effect requires a capability granted by Control. Evidence: write-set and caps_required vs caps_granted.
- **L5 (Replay determinism)**: Two executions with identical (S, C, E, A0, I) produce identical committed hash H(A1). Evidence: run hashes match.
- **L6 (Projection noninterference)**: For any Projection-only variation π, committed H(A1) is unchanged. Evidence: baseline vs variant hash.

### Theorems

- **T1 (No Authority Leakage)** from L1.
- **T2 (Determinism)** from L2 ∧ L3 ∧ L4 ∧ L5.
- **T3 (Noninterference)** from L1 ∧ L6.

### Consensus corollary

- **C1 (Convergence under same ordered inputs)**: If all honest replicas share (S, C, E) and process the same ordered I, they commit the same H(A_h) at each height h.
