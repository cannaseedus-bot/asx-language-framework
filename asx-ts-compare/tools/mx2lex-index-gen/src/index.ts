import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";

function sha256Hex(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function listFilesRec(dir: string): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) walk(p);
      else out.push(p);
    }
  };
  walk(dir);
  return out;
}

function stableJsonlLine(obj: any): string {
  // Deterministic key order
  const sortKeys = (x: any): any => {
    if (Array.isArray(x)) return x.map(sortKeys);
    if (x && typeof x === "object") {
      const o: any = {};
      for (const k of Object.keys(x).sort()) o[k] = sortKeys(x[k]);
      return o;
    }
    return x;
  };
  return JSON.stringify(sortKeys(obj));
}

function main(schemaDir: string, outJsonl: string) {
  const absSchemaDir = path.resolve(schemaDir);
  const files = listFilesRec(absSchemaDir)
    .filter((p) => p.endsWith(".schema.xjson"))
    .sort((a, b) => a.localeCompare(b));

  const lines: string[] = [];

  for (const f of files) {
    const raw = fs.readFileSync(f, "utf8");
    const h = sha256Hex(Buffer.from(raw, "utf8"));
    const j = JSON.parse(raw);

    const id = j["@id"] ?? `asx://codex/class/${path.basename(f)}`;
    const name = j["@name"] ?? path.basename(f).replace(/\.schema\.xjson$/, "");
    const ver = j["@version"] ?? "0.0.0";

    // Path anchored from repo root-ish (best-effort)
    const relPathGuess = path.relative(process.cwd(), f).replace(/\\/g, "/");

    const rec = {
      "@kind": "mx2lex.class.index.v1",
      "@id": id,
      "@name": name,
      "@version": ver,
      "@sha256": h,
      "@path": relPathGuess
    };

    lines.push(stableJsonlLine(rec));
  }

  fs.mkdirSync(path.dirname(outJsonl), { recursive: true });
  fs.writeFileSync(outJsonl, lines.join("\n") + "\n", "utf8");
  console.log(`wrote ${outJsonl} (${lines.length} records)`);
}

const [schemaDir, outJsonl] = process.argv.slice(2);
if (!schemaDir || !outJsonl) {
  console.error("usage: mx2lex-index-gen <schemaDir> <outJsonl>");
  process.exit(2);
}
main(schemaDir, outJsonl);
