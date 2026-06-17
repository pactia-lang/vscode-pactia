import { fileURLToPath } from "node:url";
import {
  createMarkdownGrammarWithInjection,
  tokensForLine,
} from "./lib/textmate.mjs";

const markdownFence = `Paragraph before.

\`\`\`pactia
pactia 1.0

product MyApp {
  > Never commit secrets.
  @stack rust-anb { }
  @api list_vehicles {
    method: GET,
    path: "/api/v1/vehicles",
  }
}
\`\`\`

Paragraph after.
`;

const requiredScopes = [
  "keyword.declaration.pactia",
  "entity.name.tag.clause.pactia",
  "entity.name.tag.target.pactia",
  "string.unquoted.prose.pactia",
  "keyword.control.http.pactia",
  "keyword.other.assignment.pactia",
];

export async function runMarkdownTests() {
  const grammar = await createMarkdownGrammarWithInjection();
  const lines = markdownFence.split("\n");
  let ruleStack = null;
  const pactiaScopes = new Set();
  let failed = 0;
  let sawStackTag = false;

  for (const line of lines) {
    const result = tokensForLine(grammar, line, ruleStack);
    ruleStack = result.ruleStack;

    if (line.includes("@stack")) {
      const stackToken = result.tokens.find((token) => token.text === "stack");
      if (stackToken?.scopes.includes("entity.name.tag.clause.pactia")) {
        sawStackTag = true;
      }
    }

    for (const token of result.tokens) {
      for (const scope of token.scopes) {
        if (scope.includes("pactia")) {
          pactiaScopes.add(scope);
        }
      }
    }
  }

  const missing = requiredScopes.filter((scope) => !pactiaScopes.has(scope));
  console.log("pactia scopes in fence:", [...pactiaScopes].sort().join(", "));

  if (missing.length > 0) {
    console.error(`FAIL: missing scopes in markdown fence: ${missing.join(", ")}`);
    failed += missing.length;
  }

  if (!sawStackTag) {
    console.error("FAIL: markdown fence lost clause tag scope on @stack");
    failed += 1;
  }

  if (pactiaScopes.size < 8) {
    console.error("FAIL: markdown fence produced too few pactia scopes");
    failed += 1;
  }

  console.log(`markdown injection: ${failed} failed`);
  return failed;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runMarkdownTests()
    .then((failed) => process.exit(failed > 0 ? 1 : 0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
