import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extensionRoot,
  createPactiaGrammar,
  tokenizeFile,
  collectScopes,
  findTokenByExactText,
} from "./lib/textmate.mjs";
import { resolveFixturePaths } from "./lib/fixtures.mjs";

const maxStackDepth = 20;

const requiredScopesPerFile = {
  kernel: [
    "entity.name.tag.clause.pactia",
    "entity.name.tag.modifier.pactia",
    "entity.name.function.macro.pactia",
    "keyword.declaration.pactia",
    "keyword.other.assignment.pactia",
    "string.unquoted.prose.pactia",
    "string.quoted.double.pactia",
    "constant.numeric.pactia",
    "keyword.control.http.pactia",
    "entity.name.type.pactia",
    "meta.object.key.pactia",
  ],
  package: [
    "keyword.declaration.pactia",
    "punctuation.definition.def-sigil.pactia",
    "entity.name.tag.def.pactia",
    "constant.language.placement.pactia",
    "entity.name.function.macro.pactia",
    "comment.line.double-slash.pactia",
    "string.unquoted.prose.pactia",
  ],
  context: [
    "keyword.declaration.pactia",
    "entity.name.context.pactia",
    "keyword.other.assignment.pactia",
    "string.quoted.double.pactia",
    "string.unquoted.prose.pactia",
    "variable.other.constant.pactia",
    "entity.name.type.pactia",
  ],
  fragment: [
    "keyword.declaration.pactia",
    "entity.name.tag.clause.pactia",
    "entity.name.tag.modifier.pactia",
    "punctuation.definition.modifier.pactia",
    "entity.name.type.pactia",
    "support.type.primitive.pactia",
    "meta.object.key.pactia",
  ],
};

const clauseTagLine =
  /^(\s*)@([a-z][a-z0-9_]*)(?:\s+([\w.-]+))?\s*(\{\s*\}\s*|\{\s*)$/;
const packageImportLine = /^\s*import\s+(@|\{|\*)/;
const proseLine = /^\s*>\s+/;
const defLine = /^\s*(?:export\s+)?def\s+(@@|@|#)/;
const legacyMacroLine = /#\[/;
const macroInvokeLine = /^\s*#[\w-]+/;
const modifierTagLine = /^\s*@@\w+/;

function fixtureKind(fixtureId) {
  if (fixtureId === "package") {
    return "package";
  }
  if (fixtureId === "context") {
    return "context";
  }
  if (fixtureId === "fragment") {
    return "fragment";
  }
  return "kernel";
}

function checkClauseTagLine(grammar, line, lineNumber, fileLabel) {
  const match = line.match(clauseTagLine);
  if (!match || packageImportLine.test(line)) {
    return 0;
  }

  const tagName = match[2];
  const target = match[3];
  const context = `${fileLabel}:${lineNumber} ${JSON.stringify(line)}`;
  let failed = 0;

  const tagToken = findTokenByExactText(grammar, line, tagName);
  if (!tagToken?.scopes.includes("entity.name.tag.clause.pactia")) {
    console.error(
      `FAIL: ${context} — tag ${tagName} missing entity.name.tag.clause.pactia`,
    );
    failed += 1;
  }

  if (target) {
    const targetToken = findTokenByExactText(grammar, line, target);
    if (!targetToken?.scopes.includes("entity.name.tag.target.pactia")) {
      console.error(
        `FAIL: ${context} — target ${target} missing entity.name.tag.target.pactia`,
      );
      failed += 1;
    }
    if (targetToken?.scopes.includes("entity.name.tag.clause.pactia")) {
      console.error(
        `FAIL: ${context} — target ${target} must not have clause tag scope`,
      );
      failed += 1;
    }
  }

  return failed;
}

function checkMacroLine(grammar, line, lineNumber, fileLabel) {
  let failed = 0;

  if (legacyMacroLine.test(line)) {
    const macroMatch = line.match(/#\[([\w]+)/);
    if (macroMatch) {
      const macroToken = findTokenByExactText(grammar, line, macroMatch[1]);
      if (!macroToken?.scopes.includes("entity.name.function.macro.pactia")) {
        console.error(
          `FAIL: ${fileLabel}:${lineNumber} — legacy macro ${macroMatch[1]} missing entity.name.function.macro.pactia`,
        );
        failed += 1;
      }
    }
    return failed;
  }

  if (!macroInvokeLine.test(line)) {
    return failed;
  }

  const macroMatch = line.match(/^(\s*)#([\w-]+)/);
  if (!macroMatch) {
    return failed;
  }

  const macroToken = findTokenByExactText(grammar, line, macroMatch[2]);
  if (!macroToken?.scopes.includes("entity.name.function.macro.pactia")) {
    console.error(
      `FAIL: ${fileLabel}:${lineNumber} — macro ${macroMatch[2]} missing entity.name.function.macro.pactia`,
    );
    failed += 1;
  }

  return failed;
}

function checkModifierTagLine(grammar, line, lineNumber, fileLabel) {
  const match = line.match(/^\s*@@([\w]+)/);
  if (!match || !modifierTagLine.test(line)) {
    return 0;
  }

  const modifierName = match[1];
  const context = `${fileLabel}:${lineNumber} ${JSON.stringify(line)}`;
  let failed = 0;

  const sigilToken = findTokenByExactText(grammar, line, "@@");
  if (!sigilToken?.scopes.includes("punctuation.definition.modifier.pactia")) {
    console.error(
      `FAIL: ${context} — @@ missing punctuation.definition.modifier.pactia`,
    );
    failed += 1;
  }

  const modifierToken = findTokenByExactText(grammar, line, modifierName);
  if (!modifierToken?.scopes.includes("entity.name.tag.modifier.pactia")) {
    console.error(
      `FAIL: ${context} — modifier ${modifierName} missing entity.name.tag.modifier.pactia`,
    );
    failed += 1;
  }

  if (modifierToken?.scopes.includes("entity.name.tag.clause.pactia")) {
    console.error(
      `FAIL: ${context} — modifier ${modifierName} must not use clause tag scope`,
    );
    failed += 1;
  }

  return failed;
}

export async function runFixtureTests() {
  const grammar = await createPactiaGrammar();
  let failed = 0;

  for (const { id, filePath } of resolveFixturePaths()) {
    const rel = path.relative(extensionRoot, filePath);
    const result = tokenizeFile(grammar, filePath);
    const scopes = collectScopes(result.lineResults);
    const kind = fixtureKind(id);

    console.log(
      `${rel}: ${result.lineCount} lines, max depth ${result.maxDepth}, final depth ${result.finalDepth}`,
    );

    if (result.finalDepth !== 1) {
      console.error(
        `FAIL: ${rel} — expected final stack depth 1, got ${result.finalDepth}`,
      );
      failed += 1;
    }

    if (result.maxDepth > maxStackDepth) {
      console.error(
        `FAIL: ${rel} — max stack depth ${result.maxDepth} exceeds ${maxStackDepth}`,
      );
      failed += 1;
    }

    for (const requiredScope of requiredScopesPerFile[kind]) {
      if (!scopes.has(requiredScope)) {
        console.error(`FAIL: ${rel} — missing scope ${requiredScope}`);
        failed += 1;
      }
    }

    for (const { lineNumber, line } of result.lineResults) {
      failed += checkClauseTagLine(grammar, line, lineNumber, rel);

      if (defLine.test(line)) {
        const defToken = findTokenByExactText(grammar, line, "def");
        if (!defToken?.scopes.includes("keyword.declaration.pactia")) {
          console.error(
            `FAIL: ${rel}:${lineNumber} — def missing keyword.declaration.pactia`,
          );
          failed += 1;
        }

        const sigilMatch = line.match(/def\s+(@@|@|#)/);
        if (sigilMatch) {
          const sigilToken = findTokenByExactText(grammar, line, sigilMatch[1]);
          if (
            !sigilToken?.scopes.includes("punctuation.definition.def-sigil.pactia")
          ) {
            console.error(
              `FAIL: ${rel}:${lineNumber} — sigil ${sigilMatch[1]} missing punctuation.definition.def-sigil.pactia`,
            );
            failed += 1;
          }
        }
      }

      failed += checkMacroLine(grammar, line, lineNumber, rel);
      failed += checkModifierTagLine(grammar, line, lineNumber, rel);

      if (proseLine.test(line)) {
        const hasProse = result.lineResults
          .find((entry) => entry.lineNumber === lineNumber)
          ?.tokens.some((token) =>
            token.scopes.includes("string.unquoted.prose.pactia"),
          );
        if (!hasProse) {
          console.error(
            `FAIL: ${rel}:${lineNumber} — prose line missing string.unquoted.prose.pactia`,
          );
          failed += 1;
        }
      }

      if (packageImportLine.test(line)) {
        const packageMatch = line.match(/@([\w-]+\/[\w-]+)/);
        if (packageMatch) {
          const packageToken = findTokenByExactText(
            grammar,
            line,
            packageMatch[1],
          );
          if (!packageToken?.scopes.includes("entity.name.tag.package.pactia")) {
            console.error(
              `FAIL: ${rel}:${lineNumber} — package ${packageMatch[1]} missing entity.name.tag.package.pactia`,
            );
            failed += 1;
          }
          if (packageToken?.scopes.includes("entity.name.tag.clause.pactia")) {
            console.error(
              `FAIL: ${rel}:${lineNumber} — package must not use clause tag scope`,
            );
            failed += 1;
          }
        }
      }
    }
  }

  console.log(`fixture scans: ${failed} failed`);
  return failed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runFixtureTests()
    .then((failed) => process.exit(failed > 0 ? 1 : 0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
