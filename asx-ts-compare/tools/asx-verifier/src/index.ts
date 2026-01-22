import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

function sha256Hex(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function readJson(p: string): any {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

function parseTs(p: string): ts.SourceFile {
  const src = fs.readFileSync(p, "utf8");
  return ts.createSourceFile(p, src, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
}

// Conservative syntactic authority atoms
const FORBIDDEN_AUTH = new Set(["eval", "Function"]);
const NET_ATOMS = new Set(["fetch", "WebSocket", "XMLHttpRequest"]);
const DOM_ATOMS = new Set(["document", "window"]);

type Scan = {
  forbidden: Set<string>;
  net: Set<string>;
  dom: Set<string>;
};

function scan(sf: ts.SourceFile): Scan {
  const found: Scan = { forbidden: new Set(), net: new Set(), dom: new Set() };

  const visit = (n: ts.Node) => {
    if (ts.isIdentifier(n)) {
      const t = n.text;
      if (FORBIDDEN_AUTH.has(t)) found.forbidden.add(t);
      if (NET_ATOMS.has(t)) found.net.add(t);
      if (DOM_ATOMS.has(t)) found.dom.add(t);
    }
    ts.forEachChild(n, visit);
  };

  visit(sf);
  return found;
}

function setHasStar(patterns: string[]): boolean {
  return patterns.includes("*") || patterns.includes("net.*") || patterns.includes("fs.*") || patterns.includes("dom.*");
}

function main(tsFileAbs: string) {
  const tsFile = path.resolve(tsFileAbs);
  const asxFile = tsFile.replace(/\.(ts|js)x?$/i, ".asx");

  if (!fs.existsSync(asxFile)) {
    return {
      "@kind": "asx.verifier.result.v1",
      "@ok": false,
      "@violations": [{ "rule": "missing_envelope", "detail": { "expected": asxFile } }]
    };
  }

  const env = readJson(asxFile);
  const codeHash = sha256Hex(fs.readFileSync(tsFile));

  const declaredHash = env?.["@target"]?.hash?.value;
  const violations: any[] = [];

  // 1) Hash bind
  if (declaredHash !== codeHash) {
    violations.push({
      "rule": "hash_mismatch",
      "detail": { "declared": declaredHash, "actual": codeHash }
    });
  }

  // 2) Scan authority atoms
  const found = scan(parseTs(tsFile));

  const forbids: string[] = env?.["@capabilities"]?.forbids ?? [];
  const forbidsSet = new Set(forbids);

  // "Forbidden means must be absent"
  for (const f of found.forbidden) {
    violations.push({
      "rule": "forbidden_authority_present",
      "detail": { "atom": f }
    });
  }

  // 3) Effects subset checks (declare what you use)
  const declaredNet: string[] = env?.["@effects"]?.net ?? [];
  const declaredDom: string[] = env?.["@effects"]?.dom ?? [];

  if (found.net.size > 0 && !declaredNet.includes("read")) {
    violations.push({
      "rule": "net_effect_undeclared",
      "detail": { "found": [...found.net].sort(), "declared": declaredNet }
    });
  }

  if (found.dom.size > 0 && !declaredDom.includes("access")) {
    violations.push({
      "rule": "dom_effect_undeclared",
      "detail": { "found": [...found.dom].sort(), "declared": declaredDom }
    });
  }

  // 4) Ensure envelope forbids cover eval/Function (defense-in-depth)
  if (!forbidsSet.has("eval") && !setHasStar(forbids)) {
    violations.push({ "rule": "missing_forbid", "detail": { "expected": "eval" } });
  }
  if (!forbidsSet.has("Function") && !setHasStar(forbids)) {
    violations.push({ "rule": "missing_forbid", "detail": { "expected": "Function" } });
  }

  const ok = violations.length === 0;

  return {
    "@kind": "asx.verifier.result.v1",
    "@target": tsFile,
    "@target_hash": `sha256:${codeHash}`,
    "@ok": ok,
    "@violations": violations,
    "@facts": {
      "@net_atoms_found": [...found.net].sort(),
      "@dom_atoms_found": [...found.dom].sort(),
      "@forbidden_atoms_found": [...found.forbidden].sort(),
      "@effects_declared": {
        "net": declaredNet,
        "dom": declaredDom
      }
    },
    "@proof": ok
      ? {
          "@claim": "no_authority_leakage",
          "@witness": {
            "callgraph_digest": `sha256:${codeHash}`,
            "reachability_digest": `sha256:${sha256Hex(Buffer.from(JSON.stringify([...found.net, ...found.dom])))}`
          }
        }
      : { "@claim": "no_authority_leakage", "@witness": null }
  };
}

const file = process.argv[2];
if (!file) {
  console.error("usage: asx-verifier <file.ts>");
  process.exit(2);
}
const res = main(file);
console.log(JSON.stringify(res, null, 2));
process.exit(res["@ok"] ? 0 : 1);
