import fs from "node:fs";
import path from "node:path";
import { extensionRoot } from "./textmate.mjs";

const fixtureCandidates = [
  {
    id: "fragment",
    paths: [
      "testdata/fixtures/fragments/billing.model.pactia",
      "../examples/marketplace/fragments/billing.model.pactia",
    ],
  },
  {
    id: "context",
    paths: ["testdata/fixtures/context/context-example.pactia"],
  },
  {
    id: "kernel",
    paths: [
      "testdata/fixtures/kernel/fleet-management-v2.pactia",
      "../pactiac/test/fixtures/kernel/relay.pactia",
    ],
  },
  {
    id: "package",
    paths: [
      "testdata/fixtures/packages/fintech-rules-index.pactia",
      "../pactiac/test/fixtures/packages/fintech-rules-index.pactia",
    ],
  },
  {
    id: "edge-malformed",
    paths: ["testdata/fixtures/edge-cases/malformed-syntax.pactia"],
  },
  {
    id: "edge-deep-nest",
    paths: ["testdata/fixtures/edge-cases/deeply-nested.pactia"],
  },
];

export function resolveFixturePaths() {
  const resolved = [];

  for (const fixture of fixtureCandidates) {
    const filePath = fixture.paths
      .map((relativePath) => path.resolve(extensionRoot, relativePath))
      .find((candidate) => fs.existsSync(candidate));

    if (!filePath) {
      throw new Error(
        `Missing fixture for ${fixture.id}. Expected one of: ${fixture.paths.join(", ")}`,
      );
    }

    resolved.push({ id: fixture.id, filePath });
  }

  return resolved;
}
