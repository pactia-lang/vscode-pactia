# Pactia — VS Code / Cursor Extension

Syntax highlighting for **Pactia 1.2** — the intent language for the AI era. Write `.pactia` files and ` ```pactia ` Markdown fences with full TextMate grammar support.

[![Visual Studio Marketplace](https://img.shields.io/visual-studio-marketplace/v/pactia-lang.pactia?label=VS%20Marketplace&color=blue)](https://marketplace.visualstudio.com/items?itemName=pactia-lang.pactia)
[![License: MIT](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

---

## Features

### Full Pactia 1.2 Syntax

Every language construct is highlighted with distinct, readable colors:

| Sigil | Kind | Example |
|-------|------|---------|
| `@` | Host tag | `@entity Order { id: uuid }` |
| `@@` | Modifier tag | `@@output VehicleDto` |
| `#` | Macro | `#list`, `#rust-stack` |
| `>` / `>>` | Prose | `> Never commit secrets.` |

### Keywords & Blocks

`product`, `module`, `service`, `model`, `context`, `import`, `export`, `def`, `in`

### Workspace Attach Syntax

`module(orders) { service(OrderService) { model(orders_model) } }`

### Fragment Exports

`export module`, `export service`, `export model`, `export context`

### Context Blocks

`context api_notes { path: "docs/api.md" }` — with `export context` and `context()` attach

### Markdown Fences

````markdown
```pactia
pactia 1.0

product MyApp {
  > Agent rules and product context.
}
```
````

### Built-in Theme Colors (Dark)

| Element | Color | Scope |
|---------|-------|-------|
| Tags `@api`, `@entity` | Yellow, bold | `entity.name.tag.clause.pactia` |
| Modifiers `@@output`, `@@pk` | Yellow, bold | `entity.name.tag.modifier.pactia` |
| Macros `#list`, `#create` | Gold, bold | `entity.name.function.macro.pactia` |
| Keywords `product`, `def`, `in` | Blue | `keyword.declaration.pactia` |
| Prose `>` lines | Purple, italic | `string.unquoted.prose.pactia` |
| Prose prefix `>` | Green | `punctuation.definition.prose.quote.pactia` |
| Braces `{` `}` | Gold | `punctuation.section.*.pactia` |
| HTTP `GET` / `POST` | Yellow | `keyword.control.http.pactia` |
| `context` names | Gold | `entity.name.context.pactia` |

---

## Quick Start

### Install from Marketplace

**Extensions** → search **Pactia** → Install, or:

```bash
code --install-extension pactia-lang.pactia
```

Open any `.pactia` file — language mode should show **Pactia** in the status bar.

### From Source

```bash
git clone https://github.com/pactia-lang/vscode-pactia.git
cd vscode-pactia
./scripts/install-extension.sh
```

Supports Cursor and VS Code. Use `--cursor` or `--vscode` to target one editor.

**Developer: Reload Window** after install.

---

## Pactia Language (1.2)

Pactia is an **AI-native intent language**. You write what must stay true about your product — entities, APIs, roles, policy, prose — and the compiler lowers it to JSON IR for AI coding agents.

- **Specification:** [pactia-lang/spec](https://github.com/pactia-lang/spec)
- **Compiler:** [pactia-lang/pactiac](https://github.com/pactia-lang/pactiac)
- **Package Manager:** [pactia-lang/pactia](https://github.com/pactia-lang/pactia)
- **Packages:** [kernel](https://github.com/pactia-lang/kernel), [pactia-io](https://github.com/pactia-lang/pactia-io)

```pactia
pactia 1.0

import @pactia/kernel;
import @pactia/rust-stack;

product Relay {
  > B2B order relay between suppliers and retailers.
  > List endpoints use cursor pagination (default 20, max 100).
  > Never commit secrets. Map errors to our standard envelope.

  #rust-stack

  module orders {
    service OrderService {
      @auth Customer
      @@output OrderListResponse
      @api list_orders {
        method: GET,
        path: "/api/v1/orders",
      }

      @auth Customer
      @@output CreateOrderResponse
      @api create_order {
        method: POST,
        path: "/api/v1/orders",
      }
    }
  }
}
```

---

## Development

```bash
npm install
npm test                 # full suite: extension, scopes, fixtures, markdown
npm run test:scopes      # 100 declarative scope contract cases
npm run test:fixtures    # fixture balance + scope scan
npm run test:markdown     # ```pactia fence injection
npm run package           # pactia-<version>.vsix
```

## Changelog

See [CHANGELOG.md](CHANGELOG.md).

## License

MIT — see [LICENSE](LICENSE).
