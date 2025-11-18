import { RuntimeContext } from "./types";
import { runXCFE } from "./xcfe";

/**
 * evaluateNode walks a XJSON structure and applies semantics for:
 * - XCFE control flow: @if/@then/@else
 * - ASX Blocks: @block
 * - Plain JSON data: returned as-is
 */
export function evaluateNode(node: any, ctx: RuntimeContext): any {
  if (Array.isArray(node)) {
    return node.map(n => evaluateNode(n, ctx));
  }

  if (node === null || typeof node !== "object") {
    return node;
  }

  if (node["@if"] !== undefined) {
    return runXCFE(node, ctx);
  }

  if (node["@block"]) {
    // Pass block straight to render hook; return rendered result if any.
    if (ctx.hooks.renderBlock) {
      ctx.hooks.renderBlock(node);
    }
    return node;
  }

  // Recurse into plain objects
  const result: any = {};
  for (const [k, v] of Object.entries(node)) {
    result[k] = evaluateNode(v, ctx);
  }
  return result;
}
