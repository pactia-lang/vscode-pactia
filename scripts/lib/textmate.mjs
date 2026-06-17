import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vscodeOniguruma from "vscode-oniguruma";
import vscodeTextmate from "vscode-textmate";

const here = path.dirname(fileURLToPath(import.meta.url));
export const extensionRoot = path.resolve(here, "../..");

const wasmPath = path.join(
  extensionRoot,
  "node_modules/vscode-oniguruma/release/onig.wasm",
);

let wasmReady = false;

export async function loadTextMate() {
  if (!fs.existsSync(wasmPath)) {
    throw new Error("Run: npm install (in vscode-pactia/)");
  }
  if (!wasmReady) {
    const wasm = fs.readFileSync(wasmPath);
    await vscodeOniguruma.loadWASM(wasm.buffer);
    wasmReady = true;
  }
}

export function readGrammarJson(fileName) {
  return JSON.parse(
    fs.readFileSync(path.join(extensionRoot, "syntaxes", fileName), "utf8"),
  );
}

export async function createPactiaGrammar() {
  await loadTextMate();
  const registry = new vscodeTextmate.Registry({
    onigLib: vscodeOniguruma,
    loadGrammar: async () => readGrammarJson("pactia.tmLanguage.json"),
  });
  const grammar = await registry.loadGrammar("source.pactia");
  if (!grammar) {
    throw new Error("Failed to load source.pactia grammar");
  }
  return grammar;
}

export async function createMarkdownGrammarWithInjection() {
  await loadTextMate();
  const pactiaGrammar = readGrammarJson("pactia.tmLanguage.json");
  const injectionGrammar = readGrammarJson("pactia.markdown.tmLanguage.json");

  const registry = new vscodeTextmate.Registry({
    onigLib: vscodeOniguruma,
    loadGrammar: async (scopeName) => {
      if (scopeName === "source.pactia") {
        return pactiaGrammar;
      }
      if (scopeName === "text.html.markdown") {
        return {
          scopeName: "text.html.markdown",
          patterns: [{ include: "source.pactia" }],
        };
      }
      return null;
    },
  });

  registry.addGrammar(injectionGrammar);
  registry.addGrammar(pactiaGrammar);

  const grammar = await registry.loadGrammarWithEmbeddedLanguages(
    "text.html.markdown",
    new Map([["meta.embedded.block.pactia", "pactia"]]),
  );
  if (!grammar) {
    throw new Error("Failed to load markdown grammar with pactia injection");
  }
  return grammar;
}

export function normalizeScopes(scopes) {
  if (Array.isArray(scopes)) {
    return scopes;
  }
  return String(scopes)
    .split(",")
    .map((scope) => scope.trim())
    .filter(Boolean);
}

export function tokenizeLine(grammar, line, ruleStack = null) {
  return grammar.tokenizeLine(line, ruleStack);
}

export function tokensForLine(grammar, line, ruleStack = null) {
  const result = tokenizeLine(grammar, line, ruleStack);
  const tokens = [];
  for (let index = 0; index < result.tokens.length; index += 1) {
    const start = result.tokens[index].startIndex;
    const end =
      index + 1 < result.tokens.length
        ? result.tokens[index + 1].startIndex
        : line.length;
    tokens.push({
      text: line.slice(start, end),
      scopes: normalizeScopes(result.tokens[index].scopes),
      start,
      end,
    });
  }
  return { tokens, ruleStack: result.ruleStack };
}

export function findTokens(grammar, line, predicate, ruleStack = null) {
  const { tokens } = tokensForLine(grammar, line, ruleStack);
  return tokens.filter(predicate);
}

export function findTokenByExactText(grammar, line, text, ruleStack = null) {
  const matches = findTokens(
    grammar,
    line,
    (token) => token.text === text,
    ruleStack,
  );
  return matches[0] ?? null;
}

export function stackDepth(stack) {
  let depth = 0;
  let node = stack;
  while (node && typeof node.depth === "number") {
    depth += 1;
    node = node.parent;
  }
  return depth;
}

export function tokenizeFile(grammar, filePath) {
  const lines = fs.readFileSync(filePath, "utf8").split("\n");
  let ruleStack = null;
  let maxDepth = 0;
  const lineResults = [];

  for (let lineNumber = 1; lineNumber <= lines.length; lineNumber += 1) {
    const line = lines[lineNumber - 1];
    const { tokens, ruleStack: nextStack } = tokensForLine(
      grammar,
      line,
      ruleStack,
    );
    ruleStack = nextStack;
    maxDepth = Math.max(maxDepth, stackDepth(ruleStack));
    lineResults.push({ lineNumber, line, tokens, ruleStack });
  }

  return {
    filePath,
    lineCount: lines.length,
    maxDepth,
    finalDepth: stackDepth(ruleStack),
    lineResults,
  };
}

export function collectScopes(lineResults) {
  const scopes = new Set();
  for (const { tokens } of lineResults) {
    for (const token of tokens) {
      for (const scope of token.scopes) {
        scopes.add(scope);
      }
    }
  }
  return scopes;
}
