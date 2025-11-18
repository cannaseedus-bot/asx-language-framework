export type BlockRenderer = (block: any) => string;

const registry = new Map<string, BlockRenderer>();

export function registerBlock(type: string, renderer: BlockRenderer) {
  registry.set(type, renderer);
}

export function renderBlockToHtml(block: any): string {
  const type = block["@block"];
  const renderer = registry.get(type);
  if (!renderer) {
    return `<pre>${escapeHtml(JSON.stringify(block, null, 2))}</pre>`;
  }
  return renderer(block);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Register a couple of basic blocks
registerBlock("text", (block) => {
  return `<span>${escapeHtml(block.value ?? "")}</span>`;
});

registerBlock("panel", (block) => {
  const children = Array.isArray(block.children) ? block.children : [];
  const inner = children.map(renderBlockToHtml).join("");
  return `<div class="asx-panel">${inner}</div>`;
});
