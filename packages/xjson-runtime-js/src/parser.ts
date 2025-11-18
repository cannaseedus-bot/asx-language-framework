import { RuntimeContext } from "./types";

/**
 * parseXJSON simply wraps JSON.parse for now.
 * In the future it could validate schema or support comments.
 */
export function parseXJSON(source: string): any {
  return JSON.parse(source);
}

export function cloneNode<T>(node: T): T {
  return JSON.parse(JSON.stringify(node));
}

// Tiny expression evaluator for XCFE @if
export function evalExpression(expr: any, ctx: RuntimeContext): any {
  if (expr == null) return null;

  // Variable lookup: { "@var": "user.logged_in" }
  if (typeof expr === "object" && expr["@var"]) {
    const path = String(expr["@var"]).split(".");
    let cur: any = ctx.env;
    for (const k of path) {
      if (cur == null) return undefined;
      cur = cur[k];
    }
    return cur;
  }

  // Literal value
  if (typeof expr !== "object") return expr;

  return expr;
}
