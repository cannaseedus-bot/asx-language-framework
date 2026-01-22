; ============================================================
; Atomic Guide — MATRIX / SysML-ish clauses highlighting
; queries/highlights.scm
; ============================================================

; ----------------------------
; Requirements blocks
; ----------------------------

(requirement_block
  (requirement_keyword) @keyword.requirement
  (requirement_id) @constant.requirement.id
  (string) @string.requirement.text)

((identifier) @keyword.requirement
  (#match? @keyword.requirement "^(requirement|req)$"))

(requirement_relation
  (relation_keyword) @keyword.relation
  (requirement_id) @constant.requirement.id)

((identifier) @keyword.relation
  (#match? @keyword.relation "^(deriveReqt|trace|satisfy|verify)$"))

; ----------------------------
; Verify links / artifacts
; ----------------------------

(verify_link
  (verify_keyword) @keyword.verify
  (artifact_ref) @type.artifact
  (requirement_ref) @constant.requirement.id)

(artifact_decl
  (artifact_keyword) @keyword.artifact
  (artifact_name) @type.artifact)

((identifier) @keyword.verify
  (#match? @keyword.verify "^(verify|verified|verifier)$"))

; ----------------------------
; Channel ownership clauses (consensus IBD)
; ----------------------------

(channel_block
  (channel_keyword) @keyword.channel
  (channel_name) @constant.channel
  (channel_payload)? @string.channel.payload)

(channel_ownership_clause
  (ownership_keyword) @keyword.ownership
  (owner_ref) @variable.owner
  (channel_ref) @constant.channel)

((identifier) @keyword.ownership
  (#match? @keyword.ownership "^(owns|owner|ownership|owned_by)$"))

((identifier) @keyword.net
  (#match? @keyword.net "^(net\.send|net\.recv|send|recv|gossip|proposal|vote|commit|statesync|evidence)$"))

; ----------------------------
; Capability / effects clauses
; ----------------------------

(capability_clause
  (cap_keyword) @keyword.capability
  (cap_name) @constant.capability)

(effect_clause
  (effect_keyword) @keyword.effect
  (effect_name) @constant.effect)

((identifier) @keyword.capability
  (#match? @keyword.capability "^(capability|caps|cap)$"))

((identifier) @keyword.effect
  (#match? @keyword.effect "^(effect|effects|writes|declared_effects)$"))

; ----------------------------
; Hash + determinism invariants
; ----------------------------

(hash_clause
  (hash_keyword) @keyword.hash
  (hash_value) @constant.hash)

((identifier) @keyword.hash
  (#match? @keyword.hash "^(hash|sha256|state_hash|committed_hash)$"))

((operator) @operator
  (#match? @operator "^(==|!=|<=|>=|⊆|∈)$"))
