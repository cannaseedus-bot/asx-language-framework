export class LegalityError extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

export function checkLegality(ast, grammarAbi) {
  const expected = grammarAbi?.ast_type || "ggl.program.v1";
  if (ast?.type !== expected) {
    throw new LegalityError("E_LEGAL_AST_TYPE", `expected ast type ${expected}`);
  }
  if (!ast?.body || !ast.body.trim()) {
    throw new LegalityError("E_LEGAL_EMPTY", "GGL body missing or empty");
  }
  const maxLength = grammarAbi?.max_length;
  if (Number.isInteger(maxLength) && ast.body.length > maxLength) {
    throw new LegalityError("E_LEGAL_MAX_LENGTH", `GGL body length ${ast.body.length} exceeds ${maxLength}`);
  }
}
