package asx.canon;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

public final class JsonCanonV1 {
  private JsonCanonV1() {}

  public static byte[] canonBytes(Object obj, JsonAdapter json) throws Exception {
    String canonical = canonString(obj);
    return canonical.getBytes(StandardCharsets.UTF_8);
  }

  private static String canonString(Object obj) {
    if (obj == null) {
      return "null";
    }
    if (obj instanceof String) {
      return "\"" + escape((String) obj) + "\"";
    }
    if (obj instanceof Number || obj instanceof Boolean) {
      return obj.toString();
    }
    if (obj instanceof List) {
      List<?> list = (List<?>) obj;
      List<String> parts = new ArrayList<>();
      for (Object item : list) {
        parts.add(canonString(item));
      }
      return "[" + String.join(",", parts) + "]";
    }
    if (obj instanceof Map) {
      Map<?, ?> map = (Map<?, ?>) obj;
      List<String> keys = new ArrayList<>();
      for (Object key : map.keySet()) {
        keys.add(key.toString());
      }
      keys.sort(Comparator.naturalOrder());
      List<String> parts = new ArrayList<>();
      for (String key : keys) {
        parts.add("\"" + escape(key) + "\":" + canonString(map.get(key)));
      }
      return "{" + String.join(",", parts) + "}";
    }
    return "\"" + escape(obj.toString()) + "\"";
  }

  private static String escape(String value) {
    return value.replace("\\", "\\\\")
      .replace("\"", "\\\"")
      .replace("\n", "\\n")
      .replace("\r", "\\r")
      .replace("\t", "\\t");
  }

  public interface JsonAdapter {}
}
