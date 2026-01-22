#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";
import Parser from "tree-sitter";
import ASXClass from "../grammar/tree-sitter-asx-class/bindings/node/index.js";

function stableStringify(x) {
  if (x === null || typeof x !== "object") return JSON.stringify(x);
  if (Array.isArray(x)) return "[" + x.map(stableStringify).join(",") + "]";
  const keys = Object.keys(x).sort();
  return "{" + keys.map(k => JSON.stringify(k) + ":" + stableStringify(x[k])).join(",") + "}";
}

function stripQuotes(s) {
  if (typeof s !== "string") return s;
  if (s.startsWith('"') && s.endsWith('"')) return JSON.parse(s);
  return s;
}

function nodeText(src, node) {
  return src.slice(node.startIndex, node.endIndex);
}

function parseValue(src, node) {
  const t = node.type;
  const raw = nodeText(src, node);

  if (t === "string") return JSON.parse(raw);
  if (t === "number") return Number(raw);
  if (t === "boolean") return raw === "true";
  if (t === "array") {
    const vals = [];
    for (const ch of node.namedChildren) vals.push(parseValue(src, ch));
    return vals;
  }
  if (t === "object") {
    const obj = {};
    const kids = node.namedChildren;
    for (let i = 0; i < kids.length; i++) {
      const a = kids[i];
      const b = kids[i + 1];
      if (a?.type === "identifier" && b && b.type !== "identifier") {
        obj[nodeText(src, a)] = parseValue(src, b);
        i++;
      }
    }
    return obj;
  }

  if (t === "identifier") return raw;

  return stripQuotes(raw);
}

function extractClass(src, tree) {
  const root = tree.rootNode;
  const decl = root.namedChildren.find(n => n.type === "class_decl");
  if (!decl) throw new Error("No class_decl found");

  const kindNode = decl.namedChildren.find(n => n.type === "class_kind");
  const nameNode = decl.namedChildren.find(n => n.type === "identifier");
  const kind = nodeText(src, kindNode);
  const name = nodeText(src, nameNode);

  const out = {
    kind: `${kind}.class`,
    id: `asx://class/${kind}/${name}`,
    version: "1.0.0",
    meta: {},
    lifecycle: null,
    exports: { interfaces: [] },
    vectors: {},
    renderer: {},
    invariants: [],
    includes: []
  };

  for (const sec of decl.namedChildren) {
    if (!sec) continue;

    if (sec.type === "meta_section") {
      for (const mf of sec.namedChildren) {
        if (mf.type !== "meta_field") continue;
        const key = nodeText(src, mf.namedChildren[0]);
        const val = parseValue(src, mf.namedChildren[1]);
        out.meta[key] = val;
      }
    }

    if (sec.type === "lifecycle_section") {
      const arrs = sec.namedChildren.filter(n => n.type === "array");
      const states = arrs[0] ? parseValue(src, arrs[0]) : [];
      const transitions = arrs[1] ? parseValue(src, arrs[1]) : [];
      const norm = (transitions || []).map(t => {
        if (typeof t === "object" && t && t.from && t.to) return { from: t.from, to: t.to };
        if (typeof t === "string" && t.includes("->")) {
          const [from, to] = t.split("->");
          return { from: from.trim(), to: to.trim() };
        }
        return t;
      });
      out.lifecycle = { states, transitions: norm };
    }

    if (sec.type === "exports_section") {
      const ids = sec.namedChildren
        .filter(n => n.type === "identifier")
        .map(n => nodeText(src, n));
      out.exports.interfaces = ids;
    }

    if (sec.type === "vectors_section") {
      for (const vf of sec.namedChildren) {
        if (vf.type !== "vector_field") continue;
        const key = nodeText(src, vf.namedChildren[0]);
        const arr = parseValue(src, vf.namedChildren[1]);
        out.vectors[key] = arr;
      }
    }

    if (sec.type === "renderer_section") {
      for (const rf of sec.namedChildren) {
        if (rf.type !== "renderer_field") continue;
        const key = nodeText(src, rf.namedChildren[0]);
        const val = parseValue(src, rf.namedChildren[1]);
        out.renderer[key] = val;
      }
    }

    if (sec.type === "invariants_section") {
      const strs = sec.namedChildren
        .filter(n => n.type === "string")
        .map(n => JSON.parse(nodeText(src, n)));
      out.invariants = strs;
    }

    if (sec.type === "includes_section") {
      const arr = sec.namedChildren.find(n => n.type === "array");
      out.includes = arr ? parseValue(src, arr) : [];
    }
  }

  if (!Object.keys(out.meta).length) delete out.meta;
  if (!out.lifecycle) delete out.lifecycle;
  if (!Object.keys(out.vectors).length) delete out.vectors;
  if (!Object.keys(out.renderer).length) delete out.renderer;
  if (!out.invariants.length) delete out.invariants;
  if (!out.includes.length) delete out.includes;

  const canon = stableStringify(out);
  const hash = crypto.createHash("sha256").update(canon).digest("hex");
  out.hash = hash;

  return out;
}

const inDir = process.argv[2] || "./codex/class/dsl";
const outDir = process.argv[3] || "./codex/class/instances";

fs.mkdirSync(outDir, { recursive: true });

const parser = new Parser();
parser.setLanguage(ASXClass);

const files = fs.readdirSync(inDir).filter(f => f.endsWith(".class")).sort();
for (const f of files) {
  const p = path.join(inDir, f);
  const src = fs.readFileSync(p, "utf8");
  const tree = parser.parse(src);
  const json = extractClass(src, tree);

  const outPath = path.join(outDir, `${json.hash}.json`);
  fs.writeFileSync(outPath, stableStringify(json) + "\n", "utf8");
  console.log(`OK ${f} -> ${outPath}`);
}
