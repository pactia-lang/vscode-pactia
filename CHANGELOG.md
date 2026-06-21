# Changelog

All notable extension changes are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

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

[Unreleased]: https://github.com/pactia-lang/vscode-pactia/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/pactia-lang/vscode-pactia/releases/tag/v1.2.0
[1.0.2]: https://github.com/pactia-lang/vscode-pactia/releases/tag/v1.0.2
