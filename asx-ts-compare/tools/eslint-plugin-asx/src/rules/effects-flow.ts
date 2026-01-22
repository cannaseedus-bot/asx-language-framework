import { ESLintUtils, TSESTree } from "@typescript-eslint/utils";
import { loadSiblingAsx, effectDeclared } from "../util/loadEnvelope.js";

type Eff = "net" | "dom" | "eval";
type FnInfo = { node: TSESTree.Node; calls: Set<string>; effects: Set<Eff> };

function isEffectSource(name: string): Eff | null {
  if (name === "fetch" || name === "WebSocket" || name === "XMLHttpRequest") return "net";
  if (name === "document" || name === "window") return "dom";
  if (name === "eval" || name === "Function") return "eval";
  return null;
}

export default ESLintUtils.RuleCreator(
  () => "https://asx.spec/effects-flow"
)({
  name: "effects-flow",
  meta: {
    type: "problem",
    docs: { description: "Flow-sensitive effect detection via local call graph", recommended: "error" },
    schema: [],
    messages: {
      net: "Flow-detected net effect (direct or transitive) but not declared in .asx (@effects.net)",
      dom: "Flow-detected dom effect (direct or transitive) but not declared in .asx (@effects.dom)",
      eval: "Forbidden dynamic authority detected (eval/Function)"
    }
  },
  defaultOptions: [],
  create(context) {
    const filename = context.getFilename();
    if (filename === "<input>" || !/\.(ts|js)x?$/.test(filename)) return {};
    const env = loadSiblingAsx(filename);
    if (!env) return {};

    const fns = new Map<string, FnInfo>();
    const stack: string[] = [];

    function ensureFn(name: string, node: TSESTree.Node) {
      if (!fns.has(name)) fns.set(name, { node, calls: new Set(), effects: new Set() });
      return fns.get(name)!;
    }

    function curFn(): FnInfo | null {
      const name = stack[stack.length - 1];
      return name ? fns.get(name) ?? null : null;
    }

    function addEffect(e: Eff, node: TSESTree.Node) {
      const fn = curFn();
      if (fn) fn.effects.add(e);
      ensureFn("@@module", node).effects.add(e);
    }

    function propagate() {
      let changed = true;
      let iters = 0;
      while (changed && iters++ < 64) {
        changed = false;
        for (const info of fns.values()) {
          for (const callee of info.calls) {
            const calleeInfo = fns.get(callee);
            if (!calleeInfo) continue;
            for (const e of calleeInfo.effects) {
              if (!info.effects.has(e)) {
                info.effects.add(e);
                changed = true;
              }
            }
          }
        }
      }
    }

    function reportFrom(e: Eff, node: TSESTree.Node) {
      if (e === "eval") {
        context.report({ node, messageId: "eval" });
        return;
      }
      if (e === "net" && !effectDeclared(env, "net", "read")) {
        context.report({ node, messageId: "net" });
      }
      if (e === "dom" && !effectDeclared(env, "dom", "access")) {
        context.report({ node, messageId: "dom" });
      }
    }

    return {
      FunctionDeclaration(node) {
        const name = node.id?.name;
        if (!name) return;
        ensureFn(name, node);
        stack.push(name);
      },
      "FunctionDeclaration:exit"() {
        stack.pop();
      },

      VariableDeclarator(node) {
        if (node.id.type !== "Identifier") return;
        const name = node.id.name;
        const init = node.init;
        if (!init) return;
        if (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression") {
          ensureFn(name, node);
          stack.push(name);
        }
      },
      "VariableDeclarator:exit"(node) {
        const init = (node as TSESTree.VariableDeclarator).init;
        if (init && (init.type === "ArrowFunctionExpression" || init.type === "FunctionExpression")) {
          stack.pop();
        }
      },

      CallExpression(node) {
        if (node.callee.type === "Identifier") {
          const name = node.callee.name;
          const eff = isEffectSource(name);
          if (eff) addEffect(eff, node);

          const fn = curFn();
          if (fn) fn.calls.add(name);
          else ensureFn("@@module", node).calls.add(name);
        }
      },

      "Program:exit"(node) {
        propagate();
        const mod = fns.get("@@module");
        if (!mod) return;
        for (const e of mod.effects) reportFrom(e, node);
      }
    };
  }
});
