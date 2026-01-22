use std::collections::HashSet;

#[derive(Clone, Debug)]
pub struct ClassRuleSet {
    pub kind: &'static str,
    pub required_top: &'static [&'static str],
    pub allowed_top: &'static [&'static str],
}

pub fn rules_for_kind(kind: &str) -> Option<ClassRuleSet> {
    match kind {
        "atomic.class" => Some(ClassRuleSet {
            kind: "atomic.class",
            required_top: &["kind", "id", "version", "meta", "atoms", "bindings", "invariants"],
            allowed_top: &[
                "kind", "id", "version", "meta", "atoms", "bindings", "invariants", "projection",
            ],
        }),
        "micronaut.class" => Some(ClassRuleSet {
            kind: "micronaut.class",
            required_top: &["kind", "id", "version", "meta", "lifecycle", "capabilities", "invariants"],
            allowed_top: &[
                "kind", "id", "version", "meta", "lifecycle", "capabilities", "invariants",
            ],
        }),
        "engine.class" => Some(ClassRuleSet {
            kind: "engine.class",
            required_top: &["kind", "id", "version", "meta", "exports", "invariants"],
            allowed_top: &["kind", "id", "version", "meta", "exports", "invariants"],
        }),
        "control.class" => Some(ClassRuleSet {
            kind: "control.class",
            required_top: &["kind", "id", "version", "meta", "vectors", "invariants"],
            allowed_top: &["kind", "id", "version", "meta", "vectors", "invariants"],
        }),
        "schema.class" => Some(ClassRuleSet {
            kind: "schema.class",
            required_top: &["kind", "id", "version", "meta", "includes", "invariants"],
            allowed_top: &["kind", "id", "version", "meta", "includes", "invariants"],
        }),
        "projection.class" => Some(ClassRuleSet {
            kind: "projection.class",
            required_top: &["kind", "id", "version", "meta", "renderer", "invariants"],
            allowed_top: &["kind", "id", "version", "meta", "renderer", "invariants"],
        }),
        _ => None,
    }
}

pub fn set_from(slice: &[&'static str]) -> HashSet<&'static str> {
    slice.iter().copied().collect()
}
