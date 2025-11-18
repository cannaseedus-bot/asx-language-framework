export interface SCXOptions {
  pretty?: boolean;
}

function toBase64(str: string): string {
  return Buffer.from(str, "utf8").toString("base64");
}

function fromBase64(b64: string): string {
  return Buffer.from(b64, "base64").toString("utf8");
}

export function scxEncode(data: unknown, _options: SCXOptions = {}): string {
  const json = JSON.stringify(data);
  return toBase64(json);
}

export function scxDecode(payload: string): any {
  const json = fromBase64(payload);
  return JSON.parse(json);
}
