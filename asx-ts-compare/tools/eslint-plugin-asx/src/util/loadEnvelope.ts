import fs from "node:fs";

export type AsxEnvelope = {
  "@meta"?: { version?: string; hash?: string };
  "@effects"?: {
    net?: string[];
    dom?: string[];
    fs?: string[];
    io?: string[];
    time?: string[];
    random?: string[];
    pure?: string[];
  };
  "@imports"?: {
    allow?: Array<{
      spec: string;
      hash?: string;
      kind?: "npm" | "local" | "url";
      effects?: Partial<NonNullable<AsxEnvelope["@effects"]>>;
    }>;
    deny?: Array<{ spec: string; mode?: "exact" | "prefix" }>;
    transitive?: {
      deny_effects?: Array<keyof NonNullable<AsxEnvelope["@effects"]>>;
      deny_caps?: string[];
      max_depth?: number;
    };
  };
  "@capabilities"?: {
    forbids?: string[];
    requires?: string[];
  };
};

export function loadSiblingAsx(filename: string): AsxEnvelope | null {
  const asxPath = filename.replace(/\.(ts|js)x?$/i, ".asx");
  if (!fs.existsSync(asxPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(asxPath, "utf8"));
  } catch {
    return null;
  }
}

export function effectDeclared(
  env: AsxEnvelope,
  domain: keyof NonNullable<AsxEnvelope["@effects"]>,
  atom: string
): boolean {
  const arr = env["@effects"]?.[domain];
  return Array.isArray(arr) && arr.includes(atom);
}

export function isForbidden(env: AsxEnvelope, atom: string): boolean {
  return env["@capabilities"]?.forbids?.includes(atom) ?? false;
}

export function findImportRule(env: AsxEnvelope, spec: string) {
  const rules = env["@imports"]?.allow ?? [];
  return rules.find((r) => r.spec === spec) ?? null;
}

export function isImportDenied(env: AsxEnvelope, spec: string): boolean {
  const deny = env["@imports"]?.deny ?? [];
  for (const r of deny) {
    const mode = r.mode ?? "exact";
    if (mode === "exact" && r.spec === spec) return true;
    if (mode === "prefix" && spec.startsWith(r.spec)) return true;
  }
  return false;
}
