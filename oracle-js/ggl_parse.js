export class ParseError extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

export function parseGglToAst(text, grammarAbi) {
  if (!text.trim()) {
    throw new ParseError("E_PARSE_EMPTY", "empty GGL payload");
  }
  return {
    type: grammarAbi?.ast_type || "ggl.program.v1",
    body: text,
  };
}
