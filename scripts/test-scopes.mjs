import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extensionRoot, createPactiaGrammar, findTokenByExactText } from "./lib/textmate.mjs";

const casesPath = path.join(extensionRoot, "testdata/scope-cases.json");

export async function runScopeTests() {
  const grammar = await createPactiaGrammar();
  const { cases } = JSON.parse(fs.readFileSync(casesPath, "utf8"));
  let failed = 0;

  for (const testCase of cases) {
    const token = findTokenByExactText(grammar, testCase.line, testCase.token);
    const context = `${testCase.id} (${JSON.stringify(testCase.token)})`;

    if (!token) {
      console.error(`FAIL: ${context} — token not found on ${JSON.stringify(testCase.line)}`);
      failed += 1;
      continue;
    }

    let caseFailed = false;
    for (const scope of testCase.include ?? []) {
      if (!token.scopes.includes(scope)) {
        console.error(
          `FAIL: ${context} — missing ${scope}, got [${token.scopes.join(", ")}]`,
        );
        caseFailed = true;
      }
    }
    for (const scope of testCase.exclude ?? []) {
      if (token.scopes.includes(scope)) {
        console.error(
          `FAIL: ${context} — must not include ${scope}, got [${token.scopes.join(", ")}]`,
        );
        caseFailed = true;
      }
    }

    if (caseFailed) {
      failed += 1;
    }
  }

  console.log(`scope cases: ${cases.length} checked, ${failed} failed`);
  return failed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runScopeTests()
    .then((failed) => process.exit(failed > 0 ? 1 : 0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
