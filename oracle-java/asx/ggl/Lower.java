package asx.ggl;

import java.util.HashMap;
import java.util.Map;

public final class Lower {
  private Lower() {}

  public static Object lower(Object astObj, Object grammarAbi) {
    if (!(astObj instanceof Map)) {
      throw new RuntimeException("missing AST");
    }
    Map<?, ?> ast = (Map<?, ?>) astObj;
    Object body = ast.get("body");
    if (!(body instanceof String)) {
      throw new RuntimeException("missing GGL body for lowering");
    }
    Map<String, Object> scene = new HashMap<>();
    String loweredType = "scene.ir.v1";
    if (grammarAbi instanceof Map) {
      Object candidate = ((Map<?, ?>) grammarAbi).get("lowered_type");
      if (candidate instanceof String) {
        loweredType = (String) candidate;
      }
    }
    scene.put("@type", loweredType);
    scene.put("ggl", body);
    if (grammarAbi instanceof Map) {
      Object contract = ((Map<?, ?>) grammarAbi).get("lowering_contract_id");
      if (contract instanceof String) {
        scene.put("@lowering", contract);
      }
    }
    return scene;
  }
}
