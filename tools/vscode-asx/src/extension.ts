import * as vscode from "vscode";
import * as fs from "node:fs";
import * as path from "node:path";

type Envelope = Record<string, unknown> | null;

function loadAsx(file: string): Envelope {
  const asx = file.replace(/\.(ts|js)x?$/i, ".asx");
  if (!fs.existsSync(asx)) return null;
  try {
    return JSON.parse(fs.readFileSync(asx, "utf8"));
  } catch {
    return null;
  }
}

function declared(env: Envelope, domain: string, atom: string): boolean {
  const effects = (env as { "@effects"?: Record<string, unknown> } | null)?.["@effects"];
  const arr = effects?.[domain];
  return Array.isArray(arr) && arr.includes(atom);
}

function diag(range: vscode.Range, msg: string, sev: vscode.DiagnosticSeverity) {
  return new vscode.Diagnostic(range, msg, sev);
}

export function activate(ctx: vscode.ExtensionContext) {
  const collection = vscode.languages.createDiagnosticCollection("asx");
  ctx.subscriptions.push(collection);

  function lintDoc(doc: vscode.TextDocument) {
    const enabled = vscode.workspace.getConfiguration("asx").get<boolean>("enable", true);
    if (!enabled) return;

    const file = doc.fileName;
    if (!/\.(ts|js)x?$/.test(file)) return;

    const env = loadAsx(file);
    const diags: vscode.Diagnostic[] = [];
    if (!env) {
      diags.push(
        diag(
          new vscode.Range(0, 0, 0, 1),
          "Missing ASX envelope (.asx) for this module",
          vscode.DiagnosticSeverity.Error
        )
      );
      collection.set(doc.uri, diags);
      return;
    }

    const text = doc.getText();

    if (/\bfetch\b|\bWebSocket\b|\bXMLHttpRequest\b/.test(text) && !declared(env, "net", "read")) {
      diags.push(
        diag(
          new vscode.Range(0, 0, 0, 1),
          "Network effect detected but not declared (@effects.net includes 'read')",
          vscode.DiagnosticSeverity.Error
        )
      );
    }
    if (/\bdocument\b|\bwindow\b/.test(text) && !declared(env, "dom", "access")) {
      diags.push(
        diag(
          new vscode.Range(0, 0, 0, 1),
          "DOM access detected but not declared (@effects.dom includes 'access')",
          vscode.DiagnosticSeverity.Error
        )
      );
    }
    if (/\beval\b|\bFunction\b/.test(text)) {
      diags.push(
        diag(
          new vscode.Range(0, 0, 0, 1),
          "Forbidden dynamic authority (eval/Function) used",
          vscode.DiagnosticSeverity.Error
        )
      );
    }

    collection.set(doc.uri, diags);
  }

  ctx.subscriptions.push(vscode.workspace.onDidOpenTextDocument(lintDoc));
  ctx.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => lintDoc(e.document)));
  vscode.workspace.textDocuments.forEach(lintDoc);
}

export function deactivate() {}
