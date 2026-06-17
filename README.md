# Pactia — Cursor / VS Code extension

Syntax highlighting for `.pactia` files and ` ```pactia ` fences in Markdown — [Pactia spec 1.0](https://github.com/pactia-lang/spec).

Spec: [language-spec](https://github.com/pactia-lang/spec/blob/main/docs/language-spec.md) | [editor-support](https://github.com/pactia-lang/spec/blob/main/docs/editor-support.md) | [registry](https://github.com/pactia-lang/spec/blob/main/docs/registry.md)

## Install

```bash
git clone https://github.com/pactia-lang/vscode-pactia.git
cd vscode-pactia
./scripts/install-extension.sh
```

Targets Cursor and VS Code when present. Options: `--cursor` or `--vscode` only.

In a [pactia-lang](https://github.com/pactia-lang) monorepo checkout, run `./vscode-pactia/scripts/install-extension.sh` from the repo root instead.

Then **Developer: Reload Window** — language mode must be **Pactia** on `.pactia` files. In Markdown, open a ` ```pactia ` fence to confirm highlighting.

## Development

```bash
cd vscode-pactia
npm install
npm test                 # full suite (extension, scopes, fixtures, markdown)
npm run test:scopes      # declarative scope contract cases
npm run test:fixtures    # scan spec/examples fixtures for balance + scopes
npm run package          # pactia-<version>.vsix
npm run install:extension
```

## Markdown fences

With the extension installed, ` ```pactia ` blocks in `.md` files get full Pactia highlighting (including `spec/docs/`). Use the **`pactia`** fence tag — not `rust` or plain `text`.

````markdown
```pactia
pactia 1.0

product MyApp {
  > Agent rules and product context.
}
```
````

GitHub.com does not highlight `pactia` fences until [Linguist](https://github.com/github-linguist/linguist) adds the language; local preview relies on this extension.

Grammar tests use vendored copies under `testdata/fixtures/` (synced from [pactia-lang/spec](https://github.com/pactia-lang/spec) fixtures). In a monorepo layout, tests fall back to `../spec` and `../examples` when present.

- `testdata/fixtures/kernel/fleet-management-v2.pactia` — kernel product reference
- `testdata/fixtures/packages/fintech-rules-index.pactia` — package `define tag` / `define macro`
- `testdata/fixtures/single-file/fleet-management-v2.pactia` — single-file layout

## Token colors (built-in)

Default colors for `.pactia` files (dark themes):

| Element | Color | Scope |
| --- | --- | --- |
| **Clause tags** `@actor`, `@api` | Yellow, bold (`@` + tag name) | `entity.name.tag.clause.pactia` |
| **Tag targets** `customers`, `Vehicle` | Theme default | `entity.name.tag.target.pactia` |
| **Macros** `#[list]` | Theme default (Rust-like) | `entity.name.function.macro.pactia` |
| **Prose** `>` lines | Purple, italic | `string.unquoted.prose.pactia` |
| **Prose** `>` prefix | Green | `punctuation.definition.prose.quote.pactia` |
| **Kernel keywords** (9) | Blue | `keyword.declaration.pactia` |
| **Registry headers** `scope`, `body`, `lowers`, `expands` | Blue | `keyword.declaration.registry.pactia` |
| **Imports** `use`, `as`, `self` | Blue | `keyword.control.import.pactia` |
| **HTTP** `GET`/`POST` | Yellow | `keyword.control.http.pactia` |
| **Braces** `{` `}` | Gold | `punctuation.section.*.pactia` |

Reload after updating (`Developer: Reload Window`). Confirm language mode is **Pactia** in the status bar.

## Grammar coverage (spec 1.0)

| Construct | Examples |
| --- | --- |
| **Nine kernel keywords** | `pactia`, `product`, `module`, `service`, `data`, `use`, `import`, `define`, `yaml` |
| **Three line kinds** | `@tag { }`, `#[macro]`, `> prose` |
| **Clause tags** | `@entity Vehicle { }`, `@api list { }`, `@actor customers { }` |
| **Modifier flags** | `@pk`, `@public`, `@pii`, `@optional` |
| **Modifier shorthand** | `@returns VehicleDto`, `@status 201`, `@emit vehicle.created` |
| **Macros** | `#[list]`, `#[database]`, `#[rate_limit(1000, rpm)]`, `#[alias::macro]` |
| **Package imports** | `use @scope/name;`, `use @pkg::{a, b};`, `use @pkg as alias;`, `use @pkg::*;` |
| **Qualified symbols** | `@alias::tag { }`, `#[alias::macro]` |
| **define template** | `define template fleet_list(path, Dto) { }` |
| **define tag / macro** | `scope`, `body { }`, `lowers { }`, `expands { }` |
| **Inline objects** | `{ service: FleetService, metric: error_rate }` |

## Not highlighted as kernel keywords

- `template`, `macro`, `tag` — registry sub-keywords after `define` only
- `scope`, `body`, `lowers`, `expands`, `category` — package registry block headers only
- Macro names (`list`, `owner`, …) — `entity.name.function.macro`, not keywords
- `on`, `when`, `then` in prose — plain text unless inside structured tag fields

## Keeping grammar in sync

1. Update [pactia-lang/spec](https://github.com/pactia-lang/spec) docs and fixtures
2. Refresh `testdata/fixtures/` copies when spec fixtures change
3. Edit `syntaxes/pactia.tmLanguage.json` (and `pactia.markdown.tmLanguage.json` if fence behavior changes)
3. Run `npm test`
4. Run `npm run install:extension` and reload window

## Roadmap

| Version | Feature |
| --- | --- |
| 1.0.2 | Clause tag colors, single-line `@stack`, comprehensive grammar tests |
| 1.0.1 | Markdown ` ```pactia ` fence injection |
| 1.0 | Spec 1.0 grammar — registry blocks, qualified imports, package authoring |
| 1.x | Snippets for `service`, `@api`, `@test` |
| 2.0 | LSP — tag/macro completion from workspace registry |
