import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { loadSiblingAsx, findImportRule, isImportDenied } from "../util/loadEnvelope.js";

function extractTrailingHash(node: TSESTree.Node, sourceText: string): string | null {
  const end = node.range?.[1];
  if (end == null) return null;
  const slice = sourceText.slice(end, Math.min(sourceText.length, end + 200));
  const m = slice.match(/asx-hash:(sha256:[a-f0-9]{64})/i);
  return m ? m[1].toLowerCase() : null;
}

export default ESLintUtils.RuleCreator(
  () => "https://asx.spec/import-hash-bound"
)({
  name: "import-hash-bound",
  meta: {
    type: "problem",
    docs: { description: "Require hash-bound imports to include matching hash hint", recommended: "error" },
    schema: [],
    messages: {
      denied: "Import '{{spec}}' is denied by .asx",
      missingHash: "Import '{{spec}}' must include hash hint asx-hash:{{hash}}",
      wrongHash: "Import '{{spec}}' has hash '{{seen}}' but .asx requires '{{need}}'"
    }
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    if (filename === "<input>" || !/\.(ts|js)x?$/.test(filename)) return {};
    const env = loadSiblingAsx(filename);
    if (!env) return {};

    const src = context.getSourceCode().getText();

    function check(spec: string, node: TSESTree.Node) {
      if (isImportDenied(env, spec)) {
        context.report({ node, messageId: "denied", data: { spec } });
        return;
      }
      const rule = findImportRule(env, spec);
      if (!rule?.hash) return;

      const seen = extractTrailingHash(node, src);
      const need = rule.hash.toLowerCase();
      if (!seen) {
        context.report({ node, messageId: "missingHash", data: { spec, hash: need } });
        return;
      }
      if (seen !== need) {
        context.report({ node, messageId: "wrongHash", data: { spec, seen, need } });
      }
    }

    return {
      ImportDeclaration(node) {
        const spec = (node.source as { value?: string })?.value;
        if (typeof spec === "string") check(spec, node);
      }
    };
  }
});
