import * as fs from "node:fs";
import * as path from "node:path";
import crypto from "node:crypto";
import ts from "typescript";

type Sha256Hex = string;

function sha256Hex(buf: Buffer): Sha256Hex {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function stableSortObject(x: any): any {
  if (Array.isArray(x)) return x.map(stableSortObject);
  if (x && typeof x === "object") {
    const out: any = {};
    for (const k of Object.keys(x).sort()) out[k] = stableSortObject(x[k]);
    return out;
  }
  return x;
}

function canonicalJson(obj: any): string {
  return JSON.stringify(stableSortObject(obj), null, 2) + "\n";
}

function parseTs(filePath: string) {
  const src = fs.readFileSync(filePath, "utf8");
  const sf = ts.createSourceFile(filePath, src, ts.ScriptTarget.ES2022, true, ts.ScriptKind.TS);
  return { src, sf };
}

function extractImportsExports(sf: ts.SourceFile) {
  const imports: string[] = [];
  const exports: { name: string; kind: string }[] = [];

  sf.forEachChild((node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      imports.push(node.moduleSpecifier.text);
    }

    const isExported = !!node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword);
    if (!isExported) return;

    if (ts.isFunctionDeclaration(node) && node.name) exports.push({ name: node.name.text, kind: "function" });
    if (ts.isClassDeclaration(node) && node.name) exports.push({ name: node.name.text, kind: "class" });

    if (ts.isVariableStatement(node)) {
      for (const decl of node.declarationList.declarations) {
        if (ts.isIdentifier(decl.name)) exports.push({ name: decl.name.text, kind: "const" });
      }
    }

    if (ts.isTypeAliasDeclaration(node)) exports.push({ name: node.name.text, kind: "type" });
    if (ts.isInterfaceDeclaration(node)) exports.push({ name: node.name.text, kind: "interface" });
  });

  imports.sort();
  exports.sort((a, b) => (a.name + ":" + a.kind).localeCompare(b.name + ":" + b.kind));
  return { imports, exports };
}

function detectEffects(sf: ts.SourceFile) {
  // Conservative syntactic upper-bound detector
  const seen = new Set<string>();

  const visit = (n: ts.Node) => {
    if (ts.isIdentifier(n)) {
      const t = n.text;
      if (t === "fetch" || t === "WebSocket" || t === "XMLHttpRequest") seen.add("net.read");
      if (t === "document" || t === "window") seen.add("dom.access");
      if (t === "Date" || t === "performance") seen.add("time.read");
      if (t === "crypto" || t === "Math") seen.add("random.maybe"); // refine later
      if (t === "eval" || t === "Function") seen.add("authority.eval");
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);

  const out = {
    pure: [] as string[],
    io: [] as string[],
    fs: [] as string[],
    net: [] as string[],
    time: [] as string[],
    random: [] as string[],
    dom: [] as string[]
  };

  if (seen.has("net.read")) out.net.push("read");
  if (seen.has("dom.access")) out.dom.push("access");
  if (seen.has("time.read")) out.time.push("read");
  if (seen.has("random.maybe")) out.random.push("maybe"); // marker

  for (const k of Object.keys(out) as (keyof typeof out)[]) out[k].sort();
  return { out, hasEval: seen.has("authority.eval") };
}

function envelopeFor(tsFile: string) {
  const abs = path.resolve(tsFile);
  const buf = fs.readFileSync(abs);
  const fileHash = sha256Hex(buf);

  const { sf } = parseTs(abs);
  const { imports, exports } = extractImportsExports(sf);
  const { out: effects, hasEval } = detectEffects(sf);

  const baseName = path.basename(tsFile).replace(/\.(ts|js)x?$/i, "");

  const env: any = {
    "@kind": "asx.envelope.esm.v1",
    "@id": `asx://module/${baseName}`,
    "@version": "1.0.0",
    "@target": {
      "path": "./" + path.basename(tsFile),
      "module_kind": "esm",
      "hash": { "algo": "sha256", "value": fileHash }
    },
    "@imports": imports.map((s) => ({
      "specifier": s,
      "kind": s.startsWith(".") ? "relative" : "npm"
    })),
    "@exports": exports,
    "@schema": {
      "includes": [
        "./codex/class/atomic.schema.xjson",
        "./codex/class/micronaut.schema.xjson"
      ]
    },
    "@effects": effects,
    "@capabilities": {
      "requires": [],
      "forbids": ["fs.write", "net.open", "eval", "Function"]
    },
    "@determinism": { "mode": "deterministic", "allowed_nondet": [] },
    "@prove": {
      "verifier": "asx-class-legal.v1",
      "constraints": [
        { "rule": "no_authority_leakage", "severity": "error" },
        { "rule": "import_hash_bound", "severity": "warn" }
      ]
    }
  };

  // If code references eval/Function at all, make it fail-fast by keeping forbids (verifier will reject)
  if (hasEval) {
    env["@mx2lex"] = { "note": "authority.eval detected; verifier will reject unless removed" };
  }

  return canonicalJson(env);
}

function main(args: string[]) {
  if (!args.length) {
    console.error("usage: asx-envelope-gen <file1.ts> <file2.ts> ...");
    process.exit(2);
  }

  for (const f of args) {
    const out = envelopeFor(f);
    const outPath = f.replace(/\.(ts|js)x?$/i, ".asx");
    fs.writeFileSync(outPath, out, "utf8");
    console.log("wrote", outPath);
  }
}

main(process.argv.slice(2));
