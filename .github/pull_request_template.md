## Summary

<!-- What changed and why? Link related issues: Fixes #123 -->

## Type of change

- [ ] Grammar / TextMate scope fix
- [ ] New kernel or package syntax support
- [ ] Fixture sync from spec
- [ ] Extension metadata (version, README, install script)
- [ ] Tests / CI only
- [ ] Breaking change (scope names, language id, file association)

## Spec coupling

- [ ] Aligns with [editor-support.md](https://github.com/pactia-lang/spec/blob/main/docs/editor-support.md)
- [ ] Driven by a spec PR (link below)
- [ ] Vendored fixtures updated under `testdata/fixtures/`

**Spec PR / section (if any):**

## Test plan

- [ ] `npm test` passes locally
- [ ] `npm run test:grammar` — grammar rules for changed constructs
- [ ] `npm run test:scopes` — scope names match contract
- [ ] `npm run test:fixtures` — fixture balance + scope scan
- [ ] `npm run test:markdown` — ` ```pactia ` fences in `.md`
- [ ] Reloaded window in Cursor/VS Code; `.pactia` language mode is **Pactia**
- [ ] Bumped `package.json` version if publishing a new `.vsix`

**Files / constructs checked:**

```bash
# e.g. npm run test:grammar
# open testdata/fixtures/kernel/fleet-management-v2.pactia
```

## Visual check (if grammar colors changed)

<!-- Optional: note which tokens/scopes changed, or attach a before/after screenshot -->

N/A

## Breaking changes

<!-- Scope renames, removed language features, install path changes. Write "None" if not applicable. -->

None
