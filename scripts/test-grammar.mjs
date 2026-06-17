import { fileURLToPath } from "node:url";
import { runFixtureTests } from "./test-fixtures.mjs";

export async function runGrammarTests() {
  return runFixtureTests();
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runGrammarTests()
    .then((failed) => process.exit(failed > 0 ? 1 : 0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
