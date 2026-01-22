import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { loadSiblingAsx, effectDeclared, isForbidden } from "../util/loadEnvelope.js";

type Msg = "netUndeclared" | "domUndeclared" | "forbidden";

export default ESLintUtils.RuleCreator(
  () => "https://asx.spec/effects-subset"
)({
  name: "effects-subset",
  meta: {
    type: "problem",
    docs: {
      description: "Enforce that observed effects are a subset of declared ASX effects",
      recommended: "error"
    },
    schema: [],
    messages: {
      netUndeclared: "Network effect detected but not declared in .asx (@effects.net)",
      domUndeclared: "DOM effect detected but not declared in .asx (@effects.dom)",
      forbidden: "Forbidden authority '{{atom}}' used but disallowed by .asx"
    }
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    if (filename === "<input>" || !/\.(ts|js)x?$/.test(filename)) return {};

    const env = loadSiblingAsx(filename);
    if (!env) return {}; // envelope-required handles this

    function checkIdentifier(node: TSESTree.Identifier) {
      const t = node.name;

      // Forbidden authority (absolute)
      if (t === "eval" || t === "Function") {
        context.report({
          node,
          messageId: "forbidden",
          data: { atom: t }
        });
        return;
      }

      if (isForbidden(env, t)) {
        context.report({
          node,
          messageId: "forbidden",
          data: { atom: t }
        });
        return;
      }

      // Network
      if (t === "fetch" || t === "WebSocket" || t === "XMLHttpRequest") {
        if (!effectDeclared(env, "net", "read")) {
          context.report({
            node,
            messageId: "netUndeclared"
          });
        }
      }

      // DOM
      if (t === "document" || t === "window") {
        if (!effectDeclared(env, "dom", "access")) {
          context.report({
            node,
            messageId: "domUndeclared"
          });
        }
      }
    }

    return {
      Identifier(node) {
        checkIdentifier(node);
      }
    };
  }
});
