import { parseXJSON } from "./parser";
import { evaluateNode } from "./evaluator";
import { RuntimeContext, RuntimeEnv, RuntimeHooks } from "./types";

export interface XJSONRuntimeOptions {
  env?: RuntimeEnv;
  hooks?: RuntimeHooks;
}

export function runXJSON(source: string, options: XJSONRuntimeOptions = {}): any {
  const ast = parseXJSON(source);
  const ctx: RuntimeContext = {
    env: options.env || {},
    hooks: options.hooks || {}
  };
  return evaluateNode(ast, ctx);
}

export { parseXJSON, evaluateNode };
export { default as filesystemHandlers } from "./filesystem-handlers";
