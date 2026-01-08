function charInRanges(ch, ranges) {
  const cp = ch.codePointAt(0);
  return ranges.some(([start, end]) => cp >= start && cp <= end);
}

export function abiTokenizeOk(text, tokenizerAbi) {
  const allowedRanges = tokenizerAbi?.allowed_unicode_ranges;
  const disallowedRanges = tokenizerAbi?.disallowed_unicode_ranges;
  const allowedRegex = tokenizerAbi?.allowed_char_regex
    ? new RegExp(tokenizerAbi.allowed_char_regex)
    : null;
  const disallowedRegex = tokenizerAbi?.disallowed_char_regex
    ? new RegExp(tokenizerAbi.disallowed_char_regex)
    : null;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (disallowedRanges && charInRanges(ch, disallowedRanges)) {
      return { code: "E_TOK_DISALLOWED_CHAR", msg: `disallowed U+${ch.codePointAt(0).toString(16).padStart(4, "0")}` };
    }
    if (allowedRanges && !charInRanges(ch, allowedRanges)) {
      return { code: "E_TOK_OUT_OF_RANGE", msg: `U+${ch.codePointAt(0).toString(16).padStart(4, "0")} outside allowed ranges` };
    }
    if (allowedRegex && !allowedRegex.test(ch)) {
      return { code: "E_TOK_REGEX_MISMATCH", msg: `U+${ch.codePointAt(0).toString(16).padStart(4, "0")} failed allowed regex` };
    }
    if (disallowedRegex && disallowedRegex.test(ch)) {
      return { code: "E_TOK_DISALLOWED_REGEX", msg: `U+${ch.codePointAt(0).toString(16).padStart(4, "0")} matched disallowed regex` };
    }
  }

  return null;
}
