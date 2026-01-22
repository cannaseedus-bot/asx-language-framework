import crypto from "crypto";

export function packClass(json) {
  const out = [];

  out.push(`@D ${json.kind}`);
  out.push(`@D ${json.id}`);
  out.push(`@F ${json.version}`);

  if (json.meta) {
    for (const [k, v] of Object.entries(json.meta)) {
      out.push(`@F ${k}=${v}`);
    }
  }

  if (json.lifecycle?.states) {
    json.lifecycle.states.forEach(state => out.push(`@L ${state}`));
  }

  if (json.lifecycle?.transitions) {
    json.lifecycle.transitions.forEach(transition => {
      out.push(`@E ${transition.from}->${transition.to}`);
    });
  }

  return {
    scx: out.join("\n"),
    hash: crypto
      .createHash("sha256")
      .update(JSON.stringify(json))
      .digest("hex")
  };
}
