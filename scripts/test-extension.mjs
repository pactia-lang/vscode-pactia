import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extensionRoot } from "./lib/textmate.mjs";

const packageJsonPath = path.join(extensionRoot, "package.json");
const languageConfigPath = path.join(extensionRoot, "language-configuration.json");

const requiredGrammarFiles = [
  "syntaxes/pactia.tmLanguage.json",
  "syntaxes/pactia.markdown.tmLanguage.json",
];

const requiredColorScopes = [
  "entity.name.tag.clause.pactia",
  "keyword.declaration.pactia",
  "keyword.other.assignment.pactia",
  "string.unquoted.prose.pactia",
];

function fail(message) {
  console.error(`FAIL: ${message}`);
  return 1;
}

export function runExtensionTests() {
  let failed = 0;

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

  if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
    failed += fail("package.json version must be semver");
  }

  const iconPath = packageJson.icon
    ? path.join(extensionRoot, packageJson.icon.replace(/^\.\//, ""))
    : undefined;
  if (!iconPath || !fs.existsSync(iconPath)) {
    failed += fail("package.json icon must point to an existing PNG");
  }

  const grammars = packageJson.contributes?.grammars ?? [];
  if (grammars.length !== 2) {
    failed += fail("expected two contributed grammars");
  }

  for (const grammar of grammars) {
    const grammarPath = path.join(extensionRoot, grammar.path.replace(/^\.\//, ""));
    if (!fs.existsSync(grammarPath)) {
      failed += fail(`missing grammar file ${grammar.path}`);
      continue;
    }

    const grammarJson = JSON.parse(fs.readFileSync(grammarPath, "utf8"));
    if (!grammarJson.scopeName) {
      failed += fail(`${grammar.path} must define scopeName`);
    }
    if (!grammarJson.patterns && !grammarJson.repository) {
      failed += fail(`${grammar.path} must define patterns or repository`);
    }
  }

  const injection = grammars.find((grammar) => grammar.injectTo);
  if (!injection?.injectTo?.includes("text.html.markdown")) {
    failed += fail("markdown injection grammar must inject into text.html.markdown");
  }
  if (injection?.embeddedLanguages?.["meta.embedded.block.pactia"] !== "pactia") {
    failed += fail("markdown injection must embed pactia language");
  }

  const pactiaLanguage = packageJson.contributes?.languages?.find(
    (language) => language.id === "pactia",
  );
  if (!pactiaLanguage?.extensions?.includes(".pactia")) {
    failed += fail("pactia language must register .pactia extension");
  }

  const colorRules =
    packageJson.contributes?.configurationDefaults?.[
      "editor.tokenColorCustomizations"
    ]?.["[*]"]?.textMateRules ?? [];

  if (colorRules.length === 0) {
    failed += fail("[*] token color customizations are missing");
  }

  const configuredScopes = new Set(
    colorRules.flatMap((rule) => rule.scope ?? []),
  );
  for (const scope of requiredColorScopes) {
    if (!configuredScopes.has(scope)) {
      failed += fail(`missing [*] color rule for ${scope}`);
    }
  }

  if (!fs.existsSync(languageConfigPath)) {
    failed += fail("missing language-configuration.json");
  } else {
    const languageConfig = JSON.parse(fs.readFileSync(languageConfigPath, "utf8"));
    if (!languageConfig.comments) {
      failed += fail("language-configuration.json must define comments");
    }
  }

  for (const relativePath of requiredGrammarFiles) {
    if (!fs.existsSync(path.join(extensionRoot, relativePath))) {
      failed += fail(`missing required file ${relativePath}`);
    }
  }

  console.log(`extension manifest: ${failed} failed`);
  return failed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  process.exit(runExtensionTests() > 0 ? 1 : 0);
}
