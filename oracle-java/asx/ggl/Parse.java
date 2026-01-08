package asx.ggl;

import java.util.HashMap;
import java.util.Map;

public final class Parse {
  private Parse() {}

  public static Object parseToAst(String text, Object grammarAbi) {
    if (text == null || text.trim().isEmpty()) {
      throw new RuntimeException("empty GGL payload");
    }
    String astType = "ggl.program.v1";
    if (grammarAbi instanceof Map) {
      Object candidate = ((Map<?, ?>) grammarAbi).get("ast_type");
      if (candidate instanceof String) {
        astType = (String) candidate;
      }
    }
    Map<String, Object> ast = new HashMap<>();
    ast.put("type", astType);
    ast.put("body", text);
    return ast;
  }
}
