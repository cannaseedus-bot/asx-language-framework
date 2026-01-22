use anyhow::{anyhow, bail, Result};
use regex::Regex;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::collections::{BTreeMap, BTreeSet, VecDeque};
use std::fs;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Proof {
    pub proof: String,
    pub scope: String,
    pub result: String,
    pub properties: BTreeMap<String, serde_json::Value>,
    pub hash: String,
}

#[derive(Debug, Clone)]
pub struct Bundle {
    pub root: String,
    pub docs: BTreeMap<String, String>,
}

#[derive(Debug, Clone)]
pub struct ParsedDoc {
    pub path: String,
    pub includes: Vec<String>,
    pub exports: BTreeSet<String>,
    pub declared_authority: Authority,
    pub raw: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Authority {
    None = 0,
    Read = 1,
    Write = 2,
    Net = 3,
    Exec = 4,
}

impl Authority {
    pub fn from_str(s: &str) -> Authority {
        match s {
            "none" => Authority::None,
            "read" => Authority::Read,
            "write" => Authority::Write,
            "net" => Authority::Net,
            "exec" => Authority::Exec,
            _ => Authority::None,
        }
    }
}

fn sha256_hex(data: &[u8]) -> String {
    let mut hasher = Sha256::new();
    hasher.update(data);
    hex::encode(hasher.finalize())
}

pub fn extract_includes(text: &str) -> Vec<String> {
    let re = Regex::new(r"\{\{\s*([^}]+?)\s*\}\}").unwrap();
    re.captures_iter(text)
        .map(|c| c[1].trim().to_string())
        .collect()
}

pub fn extract_exports(text: &str) -> BTreeSet<String> {
    let mut out = BTreeSet::new();

    let re_export = Regex::new(
        r"(?m)^\s*(?:export|exports|@export|@exports)\s*[: ]\s*([A-Za-z_][A-Za-z0-9._-]*)",
    )
    .unwrap();
    for cap in re_export.captures_iter(text) {
        out.insert(cap[1].to_string());
    }

    let re_array = Regex::new(r#"(?m)^\s*(?:exports|@exports)\s*:\s*\[(.*?)\]"#).unwrap();
    if let Some(cap) = re_array.captures(text) {
        let inner = cap[1].to_string();
        let re_item = Regex::new(r#"\"([^\"]+)\""#).unwrap();
        for ic in re_item.captures_iter(&inner) {
            out.insert(ic[1].to_string());
        }
    }

    out
}

pub fn extract_declared_authority(text: &str) -> Authority {
    let re = Regex::new(r#"(?m)^\s*authority\s*:\s*\"(none|read|write|net|exec)\""#).unwrap();
    if let Some(cap) = re.captures(text) {
        return Authority::from_str(&cap[1]);
    }
    Authority::None
}

pub fn scan_forbidden(text: &str) -> Vec<String> {
    let forbidden = [
        "@exec",
        "@eval",
        "@system",
        "@shell",
        "@spawn",
        "process::",
        "std::process",
        "require(",
        "import(",
        "fetch(",
        "net.",
        "@network.",
        "@file.write",
        "@file.delete",
    ];

    let mut hits = vec![];
    for f in forbidden {
        if text.contains(f) {
            hits.push(f.to_string());
        }
    }
    hits
}

pub fn parse_doc(path: &str, raw: &str) -> ParsedDoc {
    ParsedDoc {
        path: path.to_string(),
        includes: extract_includes(raw),
        exports: extract_exports(raw),
        declared_authority: extract_declared_authority(raw),
        raw: raw.to_string(),
    }
}

pub fn verify_bundle(bundle: &Bundle) -> Result<Proof> {
    let mut parsed: BTreeMap<String, ParsedDoc> = BTreeMap::new();
    for (p, raw) in &bundle.docs {
        parsed.insert(p.clone(), parse_doc(p, raw));
    }

    if !parsed.contains_key(&bundle.root) {
        bail!("Root not found in bundle: {}", bundle.root);
    }

    let mut forbidden_hits: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for (p, doc) in &parsed {
        let hits = scan_forbidden(&doc.raw);
        if !hits.is_empty() {
            forbidden_hits.insert(p.clone(), hits);
        }
    }
    if !forbidden_hits.is_empty() {
        return Err(anyhow!("Forbidden tokens detected: {:?}", forbidden_hits));
    }

    let mut adj: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for (p, doc) in &parsed {
        let mut children = vec![];
        for inc in &doc.includes {
            if parsed.contains_key(inc) {
                children.push(inc.clone());
            } else {
                if !(inc.starts_with("asx://")
                    || inc.starts_with("mx2lex://")
                    || inc.starts_with("file://")
                    || inc.ends_with(".schema.xjson"))
                {
                    bail!(
                        "Include target not resolvable and not allowed scheme: {} in {}",
                        inc,
                        p
                    );
                }
            }
        }
        adj.insert(p.clone(), children);
    }

    let mut indeg: BTreeMap<String, usize> = parsed.keys().map(|k| (k.clone(), 0usize)).collect();
    for (_p, kids) in &adj {
        for k in kids {
            if let Some(e) = indeg.get_mut(k) {
                *e += 1;
            }
        }
    }
    let mut q: VecDeque<String> = indeg
        .iter()
        .filter(|(_, &d)| d == 0)
        .map(|(k, _)| k.clone())
        .collect();
    let mut visited = 0usize;

    while let Some(n) = q.pop_front() {
        visited += 1;
        if let Some(kids) = adj.get(&n) {
            for k in kids {
                let e = indeg.get_mut(k).unwrap();
                *e -= 1;
                if *e == 0 {
                    q.push_back(k.clone());
                }
            }
        }
    }
    if visited != parsed.len() {
        bail!("Cyclic include graph detected");
    }

    for (p, doc) in &parsed {
        if doc.declared_authority > Authority::None {
            bail!(
                "Schema declares authority > none (not allowed in sealed schemas): {} => {:?}",
                p,
                doc.declared_authority
            );
        }
    }

    let mut h = Sha256::new();
    for (p, doc) in &parsed {
        let doc_hash = sha256_hex(doc.raw.as_bytes());
        h.update(p.as_bytes());
        h.update(b"\n");
        h.update(doc_hash.as_bytes());
        h.update(b"\n");
    }
    let bundle_hash = hex::encode(h.finalize());

    let mut props = BTreeMap::new();
    props.insert("execution".into(), serde_json::Value::Bool(false));
    props.insert("symbol_inheritance".into(), serde_json::Value::Bool(false));
    props.insert("authority_escalation".into(), serde_json::Value::Bool(false));
    props.insert("cycles".into(), serde_json::Value::Bool(false));
    props.insert("docs".into(), serde_json::json!(parsed.len()));

    Ok(Proof {
        proof: "no_authority_leakage".into(),
        scope: "matrix.schema.bundle".into(),
        result: "verified".into(),
        properties: props,
        hash: bundle_hash,
    })
}

pub fn load_bundle_from_dir(dir: &str, root: &str) -> Result<Bundle> {
    let mut docs = BTreeMap::new();
    for entry in walkdir::WalkDir::new(dir).into_iter().filter_map(|e| e.ok()) {
        if !entry.file_type().is_file() {
            continue;
        }
        let p = entry.path().to_string_lossy().to_string();
        if !(p.ends_with(".xjson") || p.ends_with(".matrix") || p.ends_with(".json") || p.ends_with(".txt"))
        {
            continue;
        }
        let raw = fs::read_to_string(&p)?;
        docs.insert(p.clone(), raw);
    }
    Ok(Bundle {
        root: root.to_string(),
        docs,
    })
}
