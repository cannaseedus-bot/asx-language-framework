use std::{env, fs, process};

use asx_class_legality_verifier::{summarize, verify_documents, VerifierConfig};
use serde_json::Value;

fn read_json(path: &str) -> Result<Value, String> {
    let bytes = fs::read(path).map_err(|e| format!("read failed: {e}"))?;
    serde_json::from_slice(&bytes).map_err(|e| format!("json parse failed: {e}"))
}

fn main() {
    let args: Vec<String> = env::args().collect();
    if args.len() < 2 {
        eprintln!(
            "usage: asx_class_legality_verifier <file1.json> [file2.json ...] [--non-strict]"
        );
        process::exit(2);
    }

    let mut strict = true;
    let mut files: Vec<String> = vec![];

    for a in args.iter().skip(1) {
        if a == "--non-strict" {
            strict = false;
        } else {
            files.push(a.clone());
        }
    }

    if files.is_empty() {
        eprintln!("no input files");
        process::exit(2);
    }

    let cfg = VerifierConfig {
        strict_no_authority_leakage: strict,
    };

    let mut all_reports = vec![];
    for f in files.iter() {
        let v = match read_json(f) {
            Ok(v) => v,
            Err(e) => {
                eprintln!("error in {f}: {e}");
                process::exit(2);
            }
        };
        let reps = verify_documents(&v, cfg.clone());
        all_reports.extend(reps);
    }

    let summary = summarize(&all_reports);
    let report_val = summary.get("report").unwrap();
    println!("{}", serde_json::to_string_pretty(report_val).unwrap());

    let ok = report_val
        .get("ok")
        .and_then(|b| b.as_bool())
        .unwrap_or(false);
    process::exit(if ok { 0 } else { 1 });
}
