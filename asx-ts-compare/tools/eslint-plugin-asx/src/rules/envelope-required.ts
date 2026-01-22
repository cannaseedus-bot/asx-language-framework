import { ESLintUtils } from "@typescript-eslint/utils";
import { loadSiblingAsx } from "../util/loadEnvelope.js";

export default ESLintUtils.RuleCreator(
  () => "https://asx.spec/envelope-required"
)({
  name: "envelope-required",
  meta: {
    type: "problem",
    docs: {
      description: "Require a sibling .asx envelope for TS/JS modules",
      recommended: "error"
    },
    schema: [],
    messages: {
      missing: "Missing ASX envelope (.asx) for this module"
    }
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    if (filename === "<input>" || !/\.(ts|js)x?$/.test(filename)) return {};

    const env = loadSiblingAsx(filename);
    if (!env) {
      context.report({
        loc: { line: 1, column: 0 },
        messageId: "missing"
      });
    }

    return {};
  }
});
