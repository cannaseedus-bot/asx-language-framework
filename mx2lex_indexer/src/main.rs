use anyhow::{bail, Result};
use serde_json::json;
use std::collections::{BTreeMap, BTreeSet};
use std::fs;

fn extract_includes(text: &str) -> Vec<String> {
    let re = regex::Regex::new(r"\{\{\s*([^}]+?)\s*\}\}").unwrap();
    re.captures_iter(text)
        .map(|c| c[1].trim().to_string())
        .collect()
}

fn extract_exports(text: &str) -> BTreeSet<String> {
    let mut out = BTreeSet::new();
    let re_export = regex::Regex::new(
        r"(?m)^\s*(?:export|exports|@export|@exports)\s*[: ]\s*([A-Za-z_][A-Za-z0-9._-]*)",
    )
    .unwrap();
    for cap in re_export.captures_iter(text) {
        out.insert(cap[1].to_string());
    }
    let re_array = regex::Regex::new(r#"(?m)^\s*(?:exports|@exports)\s*:\s*\[(.*?)\]"#).unwrap();
    if let Some(cap) = re_array.captures(text) {
        let inner = cap[1].to_string();
        let re_item = regex::Regex::new(r#"\"([^\"]+)\""#).unwrap();
        for ic in re_item.captures_iter(&inner) {
            out.insert(ic[1].to_string());
        }
    }
    out
}

fn sha256_hex(data: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    hex::encode(Sha256::digest(data))
}

fn domain_hint(path: &str) -> &'static str {
    let p = path.to_lowercase();
    if p.contains("xcfe") {
        "language"
    } else if p.contains("asx") || p.contains("xjson") {
        "language"
    } else if p.contains("pi") || p.contains("kuhul") {
        "engines"
    } else if p.contains("atomic") || p.contains("ggl") || p.contains("svg") {
        "projection"
    } else {
        "unknown"
    }
}

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 4 {
        eprintln!("Usage: mx2lex_indexer <bundle_json> <out_jsonl> <root_path>");
        eprintln!("bundle_json format: {\"docs\": {\"path\": \"raw...\"}}");
        std::process::exit(2);
    }

    let bundle_json = fs::read_to_string(&args[1])?;
    let v: serde_json::Value = serde_json::from_str(&bundle_json)?;
    let docs = v
        .get("docs")
        .and_then(|d| d.as_object())
        .ok_or_else(|| anyhow::anyhow!("missing docs"))?;

    let mut out = String::new();

    for (path, rawv) in docs {
        let raw = rawv
            .as_str()
            .ok_or_else(|| anyhow::anyhow!("doc raw not string"))?;
        let hash = sha256_hex(raw.as_bytes());
        let dom = domain_hint(path);

        out.push_str(
            &json!({
                "table": "mx2lex.schemas",
                "schema_id": path,
                "domain": dom,
                "status": "sealed",
                "hash": hash,
                "sealed": true
            })
            .to_string(),
        );
        out.push('\n');

        let exports = extract_exports(raw);
        for sym in exports {
            out.push_str(
                &json!({
                    "table": "mx2lex.symbols",
                    "symbol": sym,
                    "schema_id": path,
                    "type": "export",
                    "visibility": "explicit"
                })
                .to_string(),
            );
            out.push('\n');
        }

        let incs = extract_includes(raw);
        for inc in incs {
            out.push_str(
                &json!({
                    "table": "mx2lex.includes",
                    "parent": path,
                    "child": inc,
                    "mode": "sealed"
                })
                .to_string(),
            );
            out.push('\n');
        }
    }

    let mut dm: BTreeMap<&str, Vec<&str>> = BTreeMap::new();
    for (path, _rawv) in docs {
        dm.entry(domain_hint(path)).or_default().push(path.as_str());
    }
    for (dom, schemas) in dm {
        out.push_str(
            &json!({
                "table": "mx2lex.domain_map",
                "domain": dom,
                "schemas": schemas
            })
            .to_string(),
        );
        out.push('\n');
    }

    fs::write(&args[2], out)?;
    println!("wrote {}", &args[2]);

    let root = &args[3];
    if !docs.contains_key(root) {
        bail!("root_path not found in docs: {}", root);
    }
    Ok(())
}
