#!/usr/bin/env node
import fs from "fs";
import crypto from "crypto";

function loadJSONL(p) {
  const lines = fs.readFileSync(p, "utf8").split("\n").filter(Boolean);
  return lines.map(l => JSON.parse(l));
}

function byIdMap(rows) {
  const m = new Map();
  for (const r of rows) m.set(r.id, r);
  return m;
}

function stable(obj) {
  const keys = Object.keys(obj).sort();
  const out = {};
  for (const k of keys) out[k] = obj[k];
  return out;
}

function digestRow(r) {
  const pick = {
    id: r.id,
    kind: r.kind,
    version: r.version,
    name: r.name,
    schema_path: r.schema_path,
    instance_path: r.instance_path,
    hash: r.hash
  };
  return crypto.createHash("sha256").update(JSON.stringify(stable(pick))).digest("hex");
}

const A = process.argv[2];
const B = process.argv[3];
if (!A || !B) {
  console.error("Usage: mx2lex_diff.mjs <old.index.jsonl> <new.index.jsonl>");
  process.exit(1);
}

const oldRows = loadJSONL(A).sort((x,y)=>x.id.localeCompare(y.id));
const newRows = loadJSONL(B).sort((x,y)=>x.id.localeCompare(y.id));

const oldM = byIdMap(oldRows);
const newM = byIdMap(newRows);

const added = [];
const removed = [];
const changed = [];

for (const r of newRows) {
  if (!oldM.has(r.id)) added.push(r);
}

for (const r of oldRows) {
  if (!newM.has(r.id)) removed.push(r);
}

for (const r of newRows) {
  const o = oldM.get(r.id);
  if (!o) continue;
  if (digestRow(o) !== digestRow(r)) {
    changed.push({ id: r.id, from: o, to: r });
  }
}

const migration_plan = changed.map(c => ({
  op: "update",
  id: c.id,
  from_hash: c.from.hash,
  to_hash: c.to.hash,
  notes: (c.from.kind !== c.to.kind) ? "kind_changed" : "content_changed"
})).sort((a,b)=>a.id.localeCompare(b.id));

const report = { added, removed, changed, migration_plan };
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
