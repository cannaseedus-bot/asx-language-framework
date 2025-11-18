import { RuntimeContext } from "./types";
import { evalExpression } from "./parser";
import { evaluateNode } from "./evaluator";

export function runXCFE(node: any, ctx: RuntimeContext): any {
  const cond = evalExpression(node["@if"], ctx);
  const branch = cond ? node["@then"] : node["@else"];
  if (branch === undefined) return null;
  return evaluateNode(branch, ctx);
}
