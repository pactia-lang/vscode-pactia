import { fileURLToPath } from "node:url";
import { runScopeTests } from "./test-scopes.mjs";
import { runFixtureTests } from "./test-fixtures.mjs";
import { runMarkdownTests } from "./test-markdown.mjs";
import { runExtensionTests } from "./test-extension.mjs";

const suites = [
  { name: "extension", run: async () => runExtensionTests() },
  { name: "scopes", run: async () => runScopeTests() },
  { name: "fixtures", run: async () => runFixtureTests() },
  { name: "markdown", run: async () => runMarkdownTests() },
];

async function main() {
  let totalFailed = 0;

  for (const suite of suites) {
    console.log(`\n== ${suite.name} ==`);
    const failed = await suite.run();
    totalFailed += failed;
    if (failed === 0) {
      console.log(`${suite.name}: OK`);
    }
  }

  console.log(`\n== summary ==`);
  if (totalFailed > 0) {
    console.error(`FAILED: ${totalFailed} checks`);
    process.exit(1);
  }

  console.log("ALL TESTS PASSED");
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
