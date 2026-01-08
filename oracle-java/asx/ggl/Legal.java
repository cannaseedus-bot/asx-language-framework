package asx.ggl;

import java.util.Map;

public final class Legal {
  private Legal() {}

  public static void check(Object astObj, Object grammarAbi) {
    if (!(astObj instanceof Map)) {
      throw new RuntimeException("missing AST");
    }
    Map<?, ?> ast = (Map<?, ?>) astObj;
    String expected = "ggl.program.v1";
    if (grammarAbi instanceof Map) {
      Object candidate = ((Map<?, ?>) grammarAbi).get("ast_type");
      if (candidate instanceof String) {
        expected = (String) candidate;
      }
    }
    Object type = ast.get("type");
    if (!expected.equals(type)) {
      throw new RuntimeException("expected ast type " + expected);
    }
    Object body = ast.get("body");
    if (!(body instanceof String) || ((String) body).trim().isEmpty()) {
      throw new RuntimeException("GGL body missing or empty");
    }
    if (grammarAbi instanceof Map) {
      Object max = ((Map<?, ?>) grammarAbi).get("max_length");
      if (max instanceof Number && ((String) body).length() > ((Number) max).intValue()) {
        throw new RuntimeException("GGL body length exceeds " + max);
      }
    }
  }
}
