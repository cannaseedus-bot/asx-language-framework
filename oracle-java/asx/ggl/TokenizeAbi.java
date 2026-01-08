package asx.ggl;

import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

public final class TokenizeAbi {
  private TokenizeAbi() {}

  public static final class Err {
    public final String code;
    public final String msg;

    public Err(String code, String msg) {
      this.code = code;
      this.msg = msg;
    }
  }

  public static Err check(String text, Object tokenizerAbi) {
    if (!(tokenizerAbi instanceof Map)) {
      return null;
    }
    Map<?, ?> abi = (Map<?, ?>) tokenizerAbi;
    List<?> allowedRanges = (List<?>) abi.get("allowed_unicode_ranges");
    List<?> disallowedRanges = (List<?>) abi.get("disallowed_unicode_ranges");
    Pattern allowedRegex = abi.get("allowed_char_regex") instanceof String
      ? Pattern.compile((String) abi.get("allowed_char_regex"))
      : null;
    Pattern disallowedRegex = abi.get("disallowed_char_regex") instanceof String
      ? Pattern.compile((String) abi.get("disallowed_char_regex"))
      : null;

    for (int i = 0; i < text.length(); i++) {
      char ch = text.charAt(i);
      int cp = text.codePointAt(i);
      if (disallowedRanges != null && inRanges(cp, disallowedRanges)) {
        return new Err("E_TOK_DISALLOWED_CHAR", "disallowed character U+" + String.format("%04X", cp));
      }
      if (allowedRanges != null && !inRanges(cp, allowedRanges)) {
        return new Err("E_TOK_OUT_OF_RANGE", "character U+" + String.format("%04X", cp) + " outside allowed ranges");
      }
      if (allowedRegex != null && !allowedRegex.matcher(String.valueOf(ch)).matches()) {
        return new Err("E_TOK_REGEX_MISMATCH", "character U+" + String.format("%04X", cp) + " failed allowed regex");
      }
      if (disallowedRegex != null && disallowedRegex.matcher(String.valueOf(ch)).find()) {
        return new Err("E_TOK_DISALLOWED_REGEX", "character U+" + String.format("%04X", cp) + " matched disallowed regex");
      }
    }
    return null;
  }

  private static boolean inRanges(int cp, List<?> ranges) {
    for (Object entry : ranges) {
      if (entry instanceof List) {
        List<?> pair = (List<?>) entry;
        if (pair.size() >= 2 && pair.get(0) instanceof Number && pair.get(1) instanceof Number) {
          int start = ((Number) pair.get(0)).intValue();
          int end = ((Number) pair.get(1)).intValue();
          if (cp >= start && cp <= end) {
            return true;
          }
        }
      }
    }
    return false;
  }
}
