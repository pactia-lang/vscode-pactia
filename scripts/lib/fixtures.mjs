import fs from "node:fs";
import path from "node:path";
import { extensionRoot } from "./textmate.mjs";

const fixtureCandidates = [
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
    id: "single-file",
    paths: [
      "testdata/fixtures/single-file/fleet-management-v2.pactia",
      "../examples/single-file/fleet-management-v2.pactia",
    ],
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
