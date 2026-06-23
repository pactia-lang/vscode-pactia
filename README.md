# Pactia — Cursor / VS Code extension

Syntax highlighting for `.pactia` files and ` ```pactia ` fences in Markdown — [Pactia spec 1.2](https://github.com/pactia-lang/spec).

Spec: [language-spec](https://github.com/pactia-lang/spec/blob/main/docs/language-spec.md) | [editor-support](https://github.com/pactia-lang/spec/blob/main/docs/editor-support.md) | [registry](https://github.com/pactia-lang/spec/blob/main/docs/registry.md) | [CHANGELOG](CHANGELOG.md)

## Install

**Visual Studio Marketplace:** [Pactia — `pactia-lang.pactia`](https://marketplace.visualstudio.com/items?itemName=pactia-lang.pactia)

Install from the marketplace in VS Code or Cursor (**Extensions** → search **Pactia**), or:

```bash
code --install-extension pactia-lang.pactia
```

### From source (development)

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

Grammar tests use vendored copies under `testdata/fixtures/`, with fallbacks to [pactiac test/fixtures](https://github.com/pactia-lang/pactiac/tree/main/test/fixtures) in a monorepo layout.

- `testdata/fixtures/context/context-example.pactia` — `context` blocks, export, attach, alias
- `testdata/fixtures/kernel/fleet-management-v2.pactia` — kernel product reference (synced from pactiac `relay.pactia`)
- `testdata/fixtures/packages/fintech-rules-index.pactia` — package `export def @` / `export def #`
- `testdata/fixtures/single-file/fleet-management-v2.pactia` — single-file layout

## Token colors (built-in)

Default colors for `.pactia` files (dark themes):

| Element | Color | Scope |
| --- | --- | --- |
| **Clause tags** `@actor`, `@api` | Yellow, bold (`@` + tag name) | `entity.name.tag.clause.pactia` |
| **Modifier tags** `@@output`, `@@pk` | Yellow, bold (`@@` + name) | `entity.name.tag.modifier.pactia` |
| **Tag targets** `customers`, `Vehicle` | Theme default | `entity.name.tag.target.pactia` |
| **Macros** `#list`, `#[list]` (legacy) | Theme default (Rust-like) | `entity.name.function.macro.pactia` |
| **Prose** `>` lines | Purple, italic | `string.unquoted.prose.pactia` |
| **Prose** `>` prefix | Green | `punctuation.definition.prose.quote.pactia` |
| **Kernel keywords** | Blue | `keyword.declaration.pactia` |
| **Def sigils / imports** `@`, `@@`, `#`, `from` | Blue | `punctuation.definition.def-sigil.pactia`, `keyword.control.import.pactia` |
| **Placement / def spec** `in service`, `modifier,` | Gold | `constant.language.placement.pactia`, `constant.language.def-spec.pactia` |
| **HTTP** `GET`/`POST` | Yellow | `keyword.control.http.pactia` |
| **Braces** `{` `}` | Gold | `punctuation.section.*.pactia` |

Reload after updating (`Developer: Reload Window`). Confirm language mode is **Pactia** in the status bar.

## Grammar coverage (spec 1.2)

| Construct | Examples |
| --- | --- |
| **Kernel keywords** | `pactia`, `product`, `module`, `service`, `model`, `context`, `import`, `export`, `def`, `in` |
| **Three line kinds** | `@tag { }`, `@@modifier`, `#macro`, `> prose` |
| **Clause tags** | `@entity Vehicle { }`, `@api list { }`, `@auth Customer` |
| **Modifier tags** | `@@output VehicleDto`, `@@pk`, `@@nullable` (standalone field lines and inline) |
| **Modifier flags** | `@pk`, `@public`, `@pii`, `@optional` |
| **Modifier shorthand** | `@output VehicleDto`, `@status 201`, `@emit vehicle.created` |
| **Macros** | `#list`, `#rate_limit(1000, rpm)`, legacy `#[list]` |
| **Package imports** | `import @scope/name;`, `import { @api, @@output, #database } from @pkg;` |
| **Attach syntax** | `module(catalog) { service(CatalogService) { model(catalog_model) } }`, `context(api_notes)` |
| **Context blocks** | `context api_notes { path: "docs/api.md" }`, `export context …`, `def alias = context api_notes { }` |
| **export def** | `export def @name in service { }`, `export def @@name in field { }`, `export def #name in service { }` |
| **Module constants** | `def max_page = 100` |
| **Prose / interpolation** | `> line`, `>> block >>`, `${max_page}` |
| **Inline objects** | `{ service: FleetService, metric: error_rate }` |

## Not highlighted as kernel keywords

- Macro/tag/modifier names (`list`, `output`, `auth`, …) — scoped as tag/macro entities, not keywords
- `on`, `when`, `then` in prose — plain text unless inside structured tag fields

## Keeping grammar in sync

1. Update [pactia-lang/spec](https://github.com/pactia-lang/spec) docs and fixtures
2. Refresh `testdata/fixtures/` when pactiac canonical fixtures change
3. Edit `syntaxes/pactia.tmLanguage.json` (and `pactia.markdown.tmLanguage.json` if fence behavior changes)
3. Run `npm test`
4. Run `npm run install:extension` and reload window

## Roadmap

| Version | Feature |
| --- | --- |
| 1.3.0 | `context` keyword — blocks, export, attach, module alias |
| 1.2.0 | Spec 1.2 grammar — `def @`/`@@`/`#`, attach syntax, partial imports, `#macro` invoke |
| 1.0.2 | Clause tag colors, single-line `@stack`, comprehensive grammar tests |
| 1.0.1 | Markdown ` ```pactia ` fence injection |
| 1.0 | Spec 1.0 grammar — registry blocks, qualified imports, package authoring |
| 1.x | Snippets for `service`, `@api`, `@test` |
| 2.0 | LSP — tag/macro completion from workspace registry |
