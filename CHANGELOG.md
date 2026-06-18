# Changelog

All notable extension changes are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Changed

- **Import & export syntax:** highlight `import` (replaces `use`), `export`, and import tokens `from` / `as`.
- Grammar supports `export define tag` / `export define macro` in package fixtures.
- Vendored fixtures synced with [spec](https://github.com/pactia-lang/spec) import/export changes.

## [1.0.2] - 2026-06-17

### Added

- TextMate grammar for `.pactia` and ` ```pactia ` Markdown fences.
- Nine kernel keywords, clause tags, macros, registry authoring blocks, package imports.
- CI test suite: extension manifest, scope cases, fixture scans, markdown injection.

[Unreleased]: https://github.com/pactia-lang/vscode-pactia/compare/v1.0.2...HEAD
[1.0.2]: https://github.com/pactia-lang/vscode-pactia/releases/tag/v1.0.2
