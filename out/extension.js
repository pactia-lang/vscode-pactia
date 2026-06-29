"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const IMPORT_LINE = /^\s*import\s+.+;/gm;
const TAG_USAGE = /(?<![@#\w])@([A-Za-z_][\w]*)/g;
const MODIFIER_USAGE = /@@([A-Za-z_][\w]*)/g;
const MACRO_USAGE = /(?<![\w@])#([A-Za-z_][\w]*)/g;
function extractImportedSymbols(source) {
    const symbols = new Set();
    let match = IMPORT_LINE.exec(source);
    while (match) {
        const line = match[0];
        const bareMatch = /^import\s+(@\S+)\s*;/.exec(line);
        if (bareMatch) {
            symbols.add("*" + bareMatch[1]);
        }
        const partialMatch = /\{\s*([^}]+)\s*\}\s+from\s+(@\S+)/.exec(line);
        if (partialMatch) {
            for (const part of partialMatch[1].split(",").map((s) => s.trim()).filter(Boolean)) {
                symbols.add(part);
            }
        }
        match = IMPORT_LINE.exec(source);
    }
    return symbols;
}
function checkFile(source) {
    const diagnostics = [];
    const sourceWithoutImports = source.replace(IMPORT_LINE, "");
    const sourceWithoutDefs = sourceWithoutImports.replace(/^\s*export\s+def\s+[@#@][\w]*/gm, "");
    const imports = extractImportedSymbols(source);
    const hasWildcard = [...imports].some((s) => s.startsWith("*"));
    const lines = sourceWithoutDefs.split("\n");
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx += 1) {
        const line = lines[lineIdx];
        let tagMatch = TAG_USAGE.exec(line);
        while (tagMatch) {
            const symbol = `@${tagMatch[1]}`;
            if (!hasWildcard && !imports.has(symbol)) {
                const bareName = tagMatch[1];
                if (!imports.has(bareName)) {
                    diagnostics.push({
                        message: `Symbol '${symbol}' is used but not imported — add 'import { ${symbol} } from @package'`,
                        range: new vscode.Range(lineIdx, tagMatch.index, lineIdx, tagMatch.index + symbol.length),
                        severity: vscode.DiagnosticSeverity.Error,
                        source: "pactia (IMPORT_MISSING)",
                    });
                }
            }
            tagMatch = TAG_USAGE.exec(line);
        }
        let modMatch = MODIFIER_USAGE.exec(line);
        while (modMatch) {
            const symbol = `@@${modMatch[1]}`;
            if (!hasWildcard && !imports.has(symbol)) {
                diagnostics.push({
                    message: `Symbol '${symbol}' is used but not imported — add 'import { ${symbol} } from @package'`,
                    range: new vscode.Range(lineIdx, modMatch.index, lineIdx, modMatch.index + symbol.length),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: "pactia (IMPORT_MISSING)",
                });
            }
            modMatch = MODIFIER_USAGE.exec(line);
        }
        let macroMatch = MACRO_USAGE.exec(line);
        while (macroMatch) {
            const symbol = `#${macroMatch[1]}`;
            if (!hasWildcard && !imports.has(symbol)) {
                diagnostics.push({
                    message: `Symbol '${symbol}' is used but not imported — add 'import { ${symbol} } from @package'`,
                    range: new vscode.Range(lineIdx, macroMatch.index, lineIdx, macroMatch.index + symbol.length),
                    severity: vscode.DiagnosticSeverity.Error,
                    source: "pactia (IMPORT_MISSING)",
                });
            }
            macroMatch = MACRO_USAGE.exec(line);
        }
    }
    return diagnostics;
}
function activate(context) {
    const diagnosticCollection = vscode.languages.createDiagnosticCollection("pactia");
    async function refreshDiagnostics(document) {
        if (document.languageId !== "pactia")
            return;
        const source = document.getText();
        diagnosticCollection.set(document.uri, checkFile(source));
    }
    // Check on open/change
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(refreshDiagnostics), vscode.workspace.onDidChangeTextDocument((e) => refreshDiagnostics(e.document)), vscode.workspace.onDidSaveTextDocument(refreshDiagnostics));
    // Check already-open files
    for (const doc of vscode.workspace.textDocuments) {
        refreshDiagnostics(doc);
    }
    context.subscriptions.push(diagnosticCollection);
    // Quick fix: add missing import
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider("pactia", {
        provideCodeActions(document, range, context, _token) {
            const actions = [];
            for (const diag of context.diagnostics) {
                if (diag.source?.includes("IMPORT_MISSING")) {
                    const symbolMatch = /Symbol '(@@?|#)(\w+)'/.exec(diag.message);
                    if (!symbolMatch)
                        continue;
                    const fullSymbol = symbolMatch[1] + symbolMatch[2];
                    const fix = new vscode.CodeAction(`Add import { ${fullSymbol} } from @package`, vscode.CodeActionKind.QuickFix);
                    fix.diagnostics = [diag];
                    fix.edit = new vscode.WorkspaceEdit();
                    // Find position after last existing import line, or after version line
                    const text = document.getText();
                    const importLines = [...text.matchAll(/^\s*import\s+.+;/gm)];
                    let insertLine;
                    if (importLines.length > 0) {
                        const lastImport = importLines[importLines.length - 1];
                        const lastImportEnd = text.indexOf("\n", lastImport.index + lastImport[0].length);
                        const beforeInsert = text.slice(0, lastImportEnd);
                        insertLine = beforeInsert.split("\n").length;
                    }
                    else {
                        // After version line (pactia 1.0)
                        const versionMatch = /^pactia\s+\d+/m.exec(text);
                        if (versionMatch) {
                            const versionEnd = text.indexOf("\n", versionMatch.index + versionMatch[0].length);
                            insertLine = text.slice(0, versionEnd).split("\n").length;
                        }
                        else {
                            insertLine = 0;
                        }
                    }
                    fix.edit.insert(document.uri, new vscode.Position(insertLine, 0), `import { ${fullSymbol} } from @package;\n`);
                    fix.isPreferred = true;
                    actions.push(fix);
                }
            }
            return actions;
        },
    }));
}
function deactivate() { }
//# sourceMappingURL=extension.js.map