use anyhow::Result;
use matrix_verifier::{load_bundle_from_dir, verify_bundle};

fn main() -> Result<()> {
    let args: Vec<String> = std::env::args().collect();
    if args.len() < 3 {
        eprintln!("Usage: matrix_verifier <dir> <root_path>");
        std::process::exit(2);
    }

    let bundle = load_bundle_from_dir(&args[1], &args[2])?;
    let proof = verify_bundle(&bundle)?;
    println!("{}", serde_json::to_string_pretty(&proof)?);

    Ok(())
}
