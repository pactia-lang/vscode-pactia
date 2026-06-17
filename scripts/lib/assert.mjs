export class TestFailure extends Error {
  constructor(message) {
    super(message);
    this.name = "TestFailure";
  }
}

export function assert(condition, message) {
  if (!condition) {
    throw new TestFailure(message);
  }
}

export function assertIncludes(scopes, expectedScope, context) {
  assert(
    scopes.includes(expectedScope),
    `${context}: expected scope ${expectedScope}, got [${scopes.join(", ")}]`,
  );
}

export function assertExcludes(scopes, forbiddenScope, context) {
  assert(
    !scopes.includes(forbiddenScope),
    `${context}: scope must not include ${forbiddenScope}, got [${scopes.join(", ")}]`,
  );
}

export function assertSomeIncludes(tokens, expectedScope, context) {
  const matched = tokens.some((token) => token.scopes.includes(expectedScope));
  assert(
    matched,
    `${context}: no token includes scope ${expectedScope}`,
  );
}

export function assertNoBareSourceOnlyTokens(line, tokens, context) {
  for (const token of tokens) {
    if (!token.text.trim()) {
      continue;
    }
    const meaningfulScopes = token.scopes.filter(
      (scope) => scope !== "source.pactia",
    );
    assert(
      meaningfulScopes.length > 0,
      `${context}: unscoped token ${JSON.stringify(token.text)} on line ${JSON.stringify(line)}`,
    );
  }
}
