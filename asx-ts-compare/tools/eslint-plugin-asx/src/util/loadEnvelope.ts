import fs from "node:fs";

export type AsxEnvelope = {
  "@effects"?: {
    net?: string[];
    dom?: string[];
    fs?: string[];
    io?: string[];
    time?: string[];
    random?: string[];
    pure?: string[];
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
