use regex::Regex;
use serde_json::Value;
use std::collections::{HashMap, HashSet};

use crate::report::VerificationReport;
use crate::schemas::{rules_for_kind, set_from};

pub mod report;
pub mod schemas;

#[derive(Debug, Clone)]
pub struct VerifierConfig {
    pub strict_no_authority_leakage: bool,
}

impl Default for VerifierConfig {
    fn default() -> Self {
        Self {
            strict_no_authority_leakage: true,
        }
    }
}

fn authority_leakage_detectors() -> (HashSet<&'static str>, Vec<Regex>) {
    let forbidden_keys: HashSet<&'static str> = [
        "exec",
        "eval",
        "system",
        "shell",
        "spawn",
        "fork",
        "network",
        "socket",
        "websocket",
        "http",
        "https",
        "io",
        "filesystem",
        "file",
        "read_file",
        "write_file",
        "import",
        "require",
        "module",
        "dynamic_import",
        "process",
        "child_process",
        "@system",
        "@exec",
        "@eval",
        "@import",
        "root",
        "sudo",
        "capabilities",
        "permissions",
    ]
    .into_iter()
    .collect();

    let forbidden_value_patterns = vec![
        Regex::new(r"(?i)\bfile://").unwrap(),
        Regex::new(r"(?i)\bssh://").unwrap(),
        Regex::new(r"(?i)\bgit\+ssh://").unwrap(),
        Regex::new(r"(?i)\bdata:").unwrap(),
        Regex::new(r"(?i)\bjavascript:").unwrap(),
        Regex::new(r"(?i)\bwasm\b").unwrap(),
        Regex::new(r"(?i)\bimport\s*\(").unwrap(),
        Regex::new(r"(?i)\beval\s*\(").unwrap(),
        Regex::new(r"(?i)\bexec\s*\(").unwrap(),
    ];

    (forbidden_keys, forbidden_value_patterns)
}

fn json_path_push(path: &str, seg: &str) -> String {
    if path.is_empty() {
        seg.to_string()
    } else {
        format!("{path}.{seg}")
    }
}

fn scan_for_authority_leakage(
    v: &Value,
    path: &str,
    kind: &str,
    cfg: &VerifierConfig,
    report: &mut VerificationReport,
) {
    if !cfg.strict_no_authority_leakage {
        return;
    }

    let (forbidden_keys, forbidden_value_patterns) = authority_leakage_detectors();

    match v {
        Value::Object(map) => {
            for (k, child) in map.iter() {
                let is_allowed_exception = kind == "micronaut.class" && k == "capabilities";
                if forbidden_keys.contains(k.as_str()) && !is_allowed_exception {
                    report.fail(
                        "AUTH_LEAK_KEY",
                        &json_path_push(path, k),
                        "Forbidden key indicates potential authority leakage.",
                    );
                }

                scan_for_authority_leakage(child, &json_path_push(path, k), kind, cfg, report);
            }
        }
        Value::Array(arr) => {
            for (i, child) in arr.iter().enumerate() {
                scan_for_authority_leakage(child, &format!("{path}[{i}]"), kind, cfg, report);
            }
        }
        Value::String(s) => {
            for re in forbidden_value_patterns.iter() {
                if re.is_match(s) {
                    report.fail(
                        "AUTH_LEAK_VALUE",
                        path,
                        "Forbidden value pattern indicates potential authority leakage.",
                    );
                    break;
                }
            }
        }
        _ => {}
    }
}

fn require_string(v: &Value, path: &str, report: &mut VerificationReport) -> Option<String> {
    match v {
        Value::String(s) => Some(s.clone()),
        _ => {
            report.fail("TYPE", path, "Expected string.");
            None
        }
    }
}

fn require_object(
    v: &Value,
    path: &str,
    report: &mut VerificationReport,
) -> Option<&serde_json::Map<String, Value>> {
    match v {
        Value::Object(m) => Some(m),
        _ => {
            report.fail("TYPE", path, "Expected object.");
            None
        }
    }
}

fn ensure_required_keys(
    obj: &serde_json::Map<String, Value>,
    required: &[&str],
    report: &mut VerificationReport,
) {
    for k in required {
        if !obj.contains_key(*k) {
            report.fail("MISSING", k, "Missing required top-level key.");
        }
    }
}

fn ensure_allowed_keys(
    obj: &serde_json::Map<String, Value>,
    allowed: &HashSet<&str>,
    report: &mut VerificationReport,
) {
    for k in obj.keys() {
        if !allowed.contains(k.as_str()) {
            report.fail("EXTRA", k, "Unknown/forbidden top-level key for this class kind.");
        }
    }
}

fn verify_micronaut_capabilities(v: &Value, report: &mut VerificationReport) {
    let caps = match require_object(v, "capabilities", report) {
        Some(m) => m,
        None => return,
    };

    let must_false_paths: &[(&str, &str)] = &[
        ("io", "read"),
        ("io", "write"),
        ("network", "outbound"),
        ("network", "inbound"),
        ("process", "spawn"),
    ];

    for (section, key) in must_false_paths {
        let sec = caps.get(*section);
        if sec.is_none() {
            report.fail(
                "MISSING",
                &format!("capabilities.{section}"),
                "Missing capabilities section.",
            );
            continue;
        }
        let sec_obj = match require_object(sec.unwrap(), &format!("capabilities.{section}"), report) {
            Some(m) => m,
            None => continue,
        };
        let val = sec_obj.get(*key);
        if val.is_none() {
            report.fail(
                "MISSING",
                &format!("capabilities.{section}.{key}"),
                "Missing capability flag.",
            );
            continue;
        }
        match val.unwrap() {
            Value::Bool(false) => {}
            _ => report.fail(
                "CAPS",
                &format!("capabilities.{section}.{key}"),
                "Capability must be false (bounded).",
            ),
        }
    }
}

fn verify_meta_bounded(meta: &Value, report: &mut VerificationReport) {
    let m = match require_object(meta, "meta", report) {
        Some(m) => m,
        None => return,
    };
    if let Some(auth) = m.get("authority") {
        match auth {
            Value::String(s) if s == "bounded" => {}
            _ => report.fail("AUTH", "meta.authority", "meta.authority must be 'bounded'."),
        }
    } else {
        report.fail("MISSING", "meta.authority", "Missing meta.authority.");
    }
}

fn validate_id_patterns(kind: &str, id: &str) -> bool {
    match kind {
        "atomic.class" => Regex::new(r"^asx://class/atomic/[a-z0-9._-]+$")
            .unwrap()
            .is_match(id),
        "micronaut.class" => Regex::new(r"^asx://class/micronaut/[a-z0-9._-]+$")
            .unwrap()
            .is_match(id),
        "engine.class" => Regex::new(r"^asx://class/engine/[a-z0-9._-]+$")
            .unwrap()
            .is_match(id),
        "control.class" => Regex::new(r"^asx://class/control/[a-z0-9._-]+$")
            .unwrap()
            .is_match(id),
        "schema.class" => Regex::new(r"^asx://class/schema/[a-z0-9._-]+$")
            .unwrap()
            .is_match(id),
        "projection.class" => Regex::new(r"^asx://class/projection/[a-z0-9._-]+$")
            .unwrap()
            .is_match(id),
        _ => false,
    }
}

pub fn verify_class_instance(v: &Value, cfg: VerifierConfig) -> VerificationReport {
    let mut report = VerificationReport::new();

    let top = match require_object(v, "", &mut report) {
        Some(m) => m,
        None => return report,
    };

    let kind = match top.get("kind") {
        Some(k) => match require_string(k, "kind", &mut report) {
            Some(s) => s,
            None => return report,
        },
        None => {
            report.fail("MISSING", "kind", "Missing kind.");
            return report;
        }
    };
    report.kind = Some(kind.clone());

    let rules = match rules_for_kind(&kind) {
        Some(r) => r,
        None => {
            report.fail("KIND", "kind", "Unknown class kind.");
            return report;
        }
    };

    ensure_required_keys(top, rules.required_top, &mut report);
    ensure_allowed_keys(top, &set_from(rules.allowed_top), &mut report);

    if let Some(idv) = top.get("id") {
        if let Some(id) = require_string(idv, "id", &mut report) {
            report.id = Some(id.clone());
            if !validate_id_patterns(&kind, &id) {
                report.fail("ID", "id", "id does not match required pattern for this kind.");
            }
        }
    }
    if let Some(ver) = top.get("version") {
        if let Some(vs) = require_string(ver, "version", &mut report) {
            report.version = Some(vs);
        }
    }
    if let Some(meta) = top.get("meta") {
        verify_meta_bounded(meta, &mut report);
    }

    if kind == "micronaut.class" {
        if let Some(caps) = top.get("capabilities") {
            verify_micronaut_capabilities(caps, &mut report);
        }
    }

    scan_for_authority_leakage(v, "", &kind, &cfg, &mut report);

    report
}

pub fn verify_documents(v: &Value, cfg: VerifierConfig) -> Vec<VerificationReport> {
    match v {
        Value::Array(arr) => arr
            .iter()
            .map(|x| verify_class_instance(x, cfg.clone()))
            .collect(),
        _ => vec![verify_class_instance(v, cfg)],
    }
}

pub fn summarize(reports: &[VerificationReport]) -> HashMap<&'static str, Value> {
    let ok = reports.iter().all(|r| r.ok);
    let out = serde_json::json!({
        "kind": "asx.verifier.report.v1",
        "ok": ok,
        "count": reports.len(),
        "reports": reports
    });
    let mut m = HashMap::new();
    m.insert("report", out);
    m
}
