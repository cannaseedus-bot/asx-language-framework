// scxq2_ref.js
// Deterministic reference pack/unpack for schema bundles.
// Not encryption, not compression calculus v3 lane-binary — but a stable transport.
//
// Pack format:
// {
//   v: "scxq2-ref-1",
//   dict: ["path1","path2","{{ include }}", ...],
//   docs: [{p: dictIndex, t: "raw text"}],
//   edges: [{a: dictIndexParentPath, b: dictIndexChildTarget}],
//   root: dictIndexRootPath
// }
// Then base64url(JSON)

function b64urlEncode(bytes) {
  const b64 = Buffer.from(bytes).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(s) {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return Buffer.from(b64, "base64");
}

function stableSortKeys(obj) {
  if (Array.isArray(obj)) return obj.map(stableSortKeys);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const k of Object.keys(obj).sort()) out[k] = stableSortKeys(obj[k]);
    return out;
  }
  return obj;
}

function extractIncludes(raw) {
  const re = /\{\{\s*([^}]+?)\s*\}\}/g;
  const out = [];
  let m;
  while ((m = re.exec(raw))) out.push(m[1].trim());
  return out;
}

export function scxq2Pack(bundle) {
  // bundle: { root: "path", docs: { path: rawText } }
  const dictSet = new Set();
  dictSet.add(bundle.root);

  for (const [p, raw] of Object.entries(bundle.docs)) {
    dictSet.add(p);
    for (const inc of extractIncludes(raw)) dictSet.add(inc);
  }

  const dict = Array.from(dictSet).sort();
  const dictIndex = new Map(dict.map((s, i) => [s, i]));

  const docs = Object.entries(bundle.docs)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([p, t]) => ({ p: dictIndex.get(p), t }));

  const edges = [];
  for (const [p, raw] of Object.entries(bundle.docs)) {
    const a = dictIndex.get(p);
    for (const inc of extractIncludes(raw)) {
      edges.push({ a, b: dictIndex.get(inc) });
    }
  }
  edges.sort((x, y) => (x.a - y.a) || (x.b - y.b));

  const packObj = stableSortKeys({
    v: "scxq2-ref-1",
    dict,
    docs,
    edges,
    root: dictIndex.get(bundle.root),
  });

  const jsonBytes = Buffer.from(JSON.stringify(packObj), "utf8");
  return b64urlEncode(jsonBytes);
}

export function scxq2Unpack(packed) {
  const bytes = b64urlDecode(packed);
  const obj = JSON.parse(bytes.toString("utf8"));

  if (obj.v !== "scxq2-ref-1") throw new Error("bad version");

  const dict = obj.dict;
  const docs = {};
  for (const d of obj.docs) docs[dict[d.p]] = d.t;

  return {
    root: dict[obj.root],
    docs,
    dict,
    edges: obj.edges.map(e => ({ parent: dict[e.a], child: dict[e.b] })),
  };
}
