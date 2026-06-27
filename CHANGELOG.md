# Changelog

All notable extension changes are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

## [1.4.0] - 2026-06-27

### Removed

- **Legacy `#[name]` bracket macro patterns** — removed from grammar and test fixtures. Use `#name` / `#name(args)` per Pactia 1.2.

### Changed

- README rewritten for Visual Studio Marketplace presentation.

## [1.3.4] - 2026-06-25

### Fixed

- **Partial import lists:** every symbol in `import { @api, @@output, #macro, name } from …` is highlighted — not only the first entry on the line.
- **Import paths:** `from @pactia/kernel` and `from ./fragments/foo.pactia` paths are scoped consistently; extension keywords like `entity` and `module` no longer steal color inside file paths.

## [1.3.3] - 2026-06-25

### Fixed

- **Module/service prose constants:** `def name = > prose` now highlights the `>` marker and prose body (e.g. `def checkout_policy = > Idempotent create…`).
- **Numeric and string constants:** `def name = 100` and `def name = "…"` value tokens are scoped correctly.

### Changed

- README: Visual Studio Marketplace install link and `code --install-extension` instructions.

## [1.3.2] - 2026-06-22

### Fixed

- **Single-line tag blocks with a target:** `@security fleet { > prose }` and `@actor admins { … }` now highlight tag names and inline `> prose` on one line.
- **`@@` modifier colors:** `@@pk`, `@@output`, and related sigils use the same yellow/bold styling as `@` tags and `#` macros in all themes.
- **Theme token colors:** apply Pactia color rules under `[*]` instead of the invalid `[pactia]` theme key.

### Changed

- Updated marketplace icon asset.

## [1.3.1] - 2026-06-22

### Added

- Marketplace icon (`images/icon.png`).

## [1.3.0] - 2026-06-21

### Added

- **`context` keyword:** `context name { }`, `export context name { }`, attach `context(symbol)`, and module alias `def alias = context name { }`.
- **Field modifier lines:** `@@pk`, `@@nullable` on their own lines inside `@entity` blocks; `export model` fragment blocks.
- Scope tests and fixtures for `context` and `billing.model` fragments.

## [1.2.0] - 2026-06-21

### Changed

- **Pactia 1.2 grammar:** unified `def @` / `def @@` / `def #` with `in` placement replaces `define tag` / `define macro`, `scope`, `body`, `lowers`, and `expands`.
- Macro invoke form: `#name` and `#name(args)` are primary; `#[name]` highlighted as deprecated legacy syntax.
- Keywords: `def`, `in`, `from`; removed `define`, `yaml`.
- Vendored fixtures synced with [pactiac](https://github.com/pactia-lang/pactiac) canonical `relay.pactia` and `fintech-rules-index.pactia`.

### Added

- **`@@` modifier tags** at use site and in `export def @@name in … { }` declarations.
- **Attach syntax:** `module(name) { service(Name) { model(modelName) } }`.
- **Partial imports:** `import { @api, @@output, #database } from @pkg;`.
- **Host-tag prefix shorthand:** `@auth Customer`, `@auth(Admin)`.
- Module constants: **`def name = value`**.
- Multiline prose: **`>> … >>`**.
- Compile-time interpolation: **`${identifier}`** in prose and strings.
- Prefix shorthand: **`@output`**, **`@input`** (with existing `@auth`, `@returns`, …).

## [1.0.2] - 2026-06-17

### Added

- TextMate grammar for `.pactia` and ` ```pactia ` Markdown fences.
- Nine kernel keywords, clause tags, macros, registry authoring blocks, package imports.
- CI test suite: extension manifest, scope cases, fixture scans, markdown injection.

[Unreleased]: https://github.com/pactia-lang/vscode-pactia/compare/v1.3.1...HEAD
[1.3.1]: https://github.com/pactia-lang/vscode-pactia/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/pactia-lang/vscode-pactia/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/pactia-lang/vscode-pactia/releases/tag/v1.2.0
[1.0.2]: https://github.com/pactia-lang/vscode-pactia/releases/tag/v1.0.2
