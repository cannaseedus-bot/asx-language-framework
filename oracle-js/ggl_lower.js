export class LowerError extends Error {
  constructor(code, msg) {
    super(msg);
    this.code = code;
  }
}

export function lowerAstToSceneXjson(ast, grammarAbi) {
  if (!ast?.body || typeof ast.body !== "string") {
    throw new LowerError("E_LOWER_BODY", "missing GGL body for lowering");
  }
  const scene = {
    "@type": grammarAbi?.lowered_type || "scene.ir.v1",
    ggl: ast.body,
  };
  if (grammarAbi?.lowering_contract_id) {
    scene["@lowering"] = grammarAbi.lowering_contract_id;
  }
  return scene;
}
