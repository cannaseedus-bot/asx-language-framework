# ASX Authority Theorems — Parametric Diagram

```plantuml
@startuml
' SysML Parametric Diagram (PlantUML-flavored)
skinparam componentStyle rectangle

package "Authority Theorems — Parametrics" {

  rectangle "ibd: RuntimeInstance" as RI {
    artifact "G: authority_graph" as G
    artifact "Effects: declared_effect_set" as Eff
    artifact "Writes: observed_writes" as W
    artifact "CapsReq: required_caps" as CR
    artifact "CapsGrant: granted_caps" as CG

    artifact "H_run1: committed_hash" as H1
    artifact "H_run2: committed_hash" as H2

    artifact "H_base: committed_hash" as Hb
    artifact "H_proj: committed_hash" as Hp

    artifact "ForbiddenTargets" as FT
    artifact "ProjectionNode" as PN
    artifact "WitnessPath" as WP
  }

  rectangle "constraint <<C1>>
NoLeakageReachability" as C1 {
    note right
    ReachForbidden = ( no_path(G, source=ProjectionNode, targets=ForbiddenTargets) )
    WitnessPath = null iff ReachForbidden
    end note
  }

  rectangle "constraint <<C2>>
DeterminismHashEquality" as C2 {
    note right
    Determinism = (H_run1 == H_run2)
    end note
  }

  rectangle "constraint <<C3>>
CapabilityConfinement" as C3 {
    note right
    WritesContained = (Writes ⊆ Effects)
    CapsSatisfied   = (CapsReq ⊆ CapsGrant)
    CapabilityOK    = WritesContained ∧ CapsSatisfied
    end note
  }

  rectangle "constraint <<C4>>
NoninterferenceProjection" as C4 {
    note right
    Noninterference = (H_base == H_proj)
    end note
  }

  rectangle "constraint <<C5>>
ConsensusConvergence" as C5 {
    note right
    If all replicas share (Schema, Control, Engine) and ordered Inputs,
    then ∀i,j: H_i(height h) == H_j(height h)
    Practical check: quorum_hash_set size == 1
    end note
  }

  G  --> C1
  PN --> C1
  FT --> C1
  WP --> C1

  H1 --> C2
  H2 --> C2

  W   --> C3
  Eff --> C3
  CR  --> C3
  CG  --> C3

  Hb  --> C4
  Hp  --> C4

  rectangle "constraint <<T>>
AuthorityTheoremsSatisfied" as T {
    note right
    NoLeakage = C1.ReachForbidden
    Determinism = C2.Determinism ∧ C3.CapabilityOK
    Noninterference = C1.ReachForbidden ∧ C4.Noninterference
    end note
  }

  C1 --> T
  C2 --> T
  C3 --> T
  C4 --> T
  C5 --> T
}

@enduml
```
