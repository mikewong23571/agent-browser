# agent-browser

Browser automation CLI for AI agents.

[![npm](https://img.shields.io/npm/v/agent-browser)](https://www.npmjs.com/package/agent-browser)
[![npm downloads](https://img.shields.io/npm/dm/agent-browser)](https://www.npmjs.com/package/agent-browser)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue)](LICENSE)

Snapshot → ref workflow: get a compact accessibility tree with stable refs (`@e1`, `@e2`) and interact directly — fewer tokens than DOM, more reliable than CSS selectors. Native Rust binary, no Playwright, no Node.js at runtime.

- **Ref-based** — `snapshot` returns `@e1`, `@e2`; stable refs replace fragile CSS selectors
- **Token-efficient** — compact text tree uses ~200–400 tokens vs 3000–5000 for full DOM
- **Native Rust** — sub-millisecond CLI overhead, no Node.js required at runtime
- **50+ commands** — navigation, forms, tabs, network, cookies, storage, screenshots, diff
- **Cloud-ready** — Browserless, Browserbase, Browser Use, Kernel via `-p`

## Installation

```bash
# Global (recommended) — installs native Rust binary
npm install -g agent-browser
agent-browser install  # Download Chrome from Chrome for Testing (first time only)

# Project dependency
npm install agent-browser
npx agent-browser install

# macOS via Homebrew
brew install agent-browser
agent-browser install

# Rust
cargo install agent-browser
agent-browser install

# Linux — install system dependencies
agent-browser install --with-deps
```

[Full documentation ↗](docs/src/app/installation/page.mdx)

## Quick Start

The core workflow — `snapshot` gives you refs, refs give you control:

```bash
agent-browser open example.com
agent-browser snapshot -i

# Output shows compact accessibility tree with stable refs:
# - heading "Example Domain" [ref=e1]
# - link "More information..." [ref=e2]     ← use @e2 to click, no CSS needed
# - textbox "Search" [ref=e3]               ← use @e3 to fill

agent-browser click @e2
agent-browser fill @e3 "search term"
agent-browser screenshot page.png
agent-browser close
```

[Full guide ↗](docs/src/app/quick-start/page.mdx)

## Commands

```bash
# Navigation
agent-browser open <url>              # Navigate to URL
agent-browser back / forward / reload

# Interaction
agent-browser click <sel>             # Click element
agent-browser fill <sel> <text>       # Clear and fill input
agent-browser type <sel> <text>       # Type into element
agent-browser press <key>             # Press key (Enter, Tab, Control+a)
agent-browser hover <sel>             # Hover element
agent-browser select <sel> <val>      # Select dropdown option
agent-browser check / uncheck <sel>   # Checkbox
agent-browser scroll <dir> [px]       # Scroll (up/down/left/right)
agent-browser drag <src> <tgt>        # Drag and drop
agent-browser upload <sel> <files>    # Upload files

# Inspection
agent-browser snapshot                # Accessibility tree with refs (best for AI)
agent-browser snapshot -i             # Interactive elements only
agent-browser get text/html/value/attr/title/url <sel>
agent-browser is visible/enabled/checked <sel>
agent-browser screenshot [path]       # Screenshot (--full, --annotate)
agent-browser pdf <path>              # Save as PDF
agent-browser eval <js>               # Run JavaScript

# Semantic locators
agent-browser find role button click --name "Submit"
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "test@test.com"

# Tabs & frames
agent-browser tab / tab new / tab <n> / tab close
agent-browser frame <sel> / frame main

# State & cookies
agent-browser cookies / cookies set / cookies clear
agent-browser storage local / storage session
agent-browser state save/load/list/clear <path>

# Debug
agent-browser console / errors
agent-browser trace start/stop
agent-browser profiler start/stop
agent-browser diff snapshot / diff screenshot --baseline <file>
agent-browser diff url <url1> <url2>
```

[Full reference ↗](docs/src/app/commands/page.mdx)

## Documentation

| | |
|---|---|
| **Getting started** | [Installation](docs/src/app/installation/page.mdx) · [Quick Start](docs/src/app/quick-start/page.mdx) · [Skills](docs/src/app/skills/page.mdx) |
| **Reference** | [Commands](docs/src/app/commands/page.mdx) · [Configuration](docs/src/app/configuration/page.mdx) · [Selectors](docs/src/app/selectors/page.mdx) · [Snapshots](docs/src/app/snapshots/page.mdx) |
| **Sessions & Auth** | [Sessions](docs/src/app/sessions/page.mdx) · [Security](docs/src/app/security/page.mdx) |
| **Features** | [CDP Mode](docs/src/app/cdp-mode/page.mdx) · [Streaming](docs/src/app/streaming/page.mdx) · [Diffing](docs/src/app/diffing/page.mdx) · [Profiler](docs/src/app/profiler/page.mdx) |
| **Engines** | [Chrome](docs/src/app/engines/chrome/page.mdx) · [Lightpanda](docs/src/app/engines/lightpanda/page.mdx) |
| **Integrations** | [iOS Simulator](docs/src/app/ios/page.mdx) · [Browserless](docs/src/app/integrations/browserless/page.mdx) · [Browserbase](docs/src/app/integrations/browserbase/page.mdx) · [Browser Use](docs/src/app/integrations/browser-use/page.mdx) · [Kernel](docs/src/app/integrations/kernel/page.mdx) |

## Options

| Option | Description |
|--------|-------------|
| `--session <name>` | Use isolated session (or `AGENT_BROWSER_SESSION` env) |
| `--session-name <name>` | Auto-save/restore session state (or `AGENT_BROWSER_SESSION_NAME` env) |
| `--profile <path>` | Persistent browser profile directory (or `AGENT_BROWSER_PROFILE` env) |
| `--state <path>` | Load storage state from JSON file (or `AGENT_BROWSER_STATE` env) |
| `--headers <json>` | Set HTTP headers scoped to the URL's origin |
| `--executable-path <path>` | Custom browser executable (or `AGENT_BROWSER_EXECUTABLE_PATH` env) |
| `--extension <path>` | Load browser extension (repeatable; or `AGENT_BROWSER_EXTENSIONS` env) |
| `--args <args>` | Browser launch args, comma or newline separated (or `AGENT_BROWSER_ARGS` env) |
| `--user-agent <ua>` | Custom User-Agent string (or `AGENT_BROWSER_USER_AGENT` env) |
| `--proxy <url>` | Proxy server URL with optional auth (or `AGENT_BROWSER_PROXY` env) |
| `--proxy-bypass <hosts>` | Hosts to bypass proxy (or `AGENT_BROWSER_PROXY_BYPASS` env) |
| `--ignore-https-errors` | Ignore HTTPS certificate errors (useful for self-signed certs) |
| `--allow-file-access` | Allow file:// URLs to access local files (Chromium only) |
| `-p, --provider <name>` | Cloud browser provider (or `AGENT_BROWSER_PROVIDER` env) |
| `--device <name>` | iOS device name, e.g. "iPhone 15 Pro" (or `AGENT_BROWSER_IOS_DEVICE` env) |
| `--json` | JSON output (for agents) |
| `--full, -f` | Full page screenshot |
| `--annotate` | Annotated screenshot with numbered element labels (or `AGENT_BROWSER_ANNOTATE` env) |
| `--screenshot-dir <path>` | Default screenshot output directory (or `AGENT_BROWSER_SCREENSHOT_DIR` env) |
| `--screenshot-quality <n>` | JPEG quality 0-100 (or `AGENT_BROWSER_SCREENSHOT_QUALITY` env) |
| `--screenshot-format <fmt>` | Screenshot format: `png`, `jpeg` (or `AGENT_BROWSER_SCREENSHOT_FORMAT` env) |
| `--headed` | Show browser window (not headless) (or `AGENT_BROWSER_HEADED` env) |
| `--cdp <port\|url>` | Connect via Chrome DevTools Protocol (port or WebSocket URL) |
| `--auto-connect` | Auto-discover and connect to running Chrome (or `AGENT_BROWSER_AUTO_CONNECT` env) |
| `--color-scheme <scheme>` | Color scheme: `dark`, `light`, `no-preference` (or `AGENT_BROWSER_COLOR_SCHEME` env) |
| `--download-path <path>` | Default download directory (or `AGENT_BROWSER_DOWNLOAD_PATH` env) |
| `--content-boundaries` | Wrap page output in boundary markers for LLM safety (or `AGENT_BROWSER_CONTENT_BOUNDARIES` env) |
| `--max-output <chars>` | Truncate page output to N characters (or `AGENT_BROWSER_MAX_OUTPUT` env) |
| `--allowed-domains <list>` | Comma-separated allowed domain patterns (or `AGENT_BROWSER_ALLOWED_DOMAINS` env) |
| `--action-policy <path>` | Path to action policy JSON file (or `AGENT_BROWSER_ACTION_POLICY` env) |
| `--confirm-actions <list>` | Action categories requiring confirmation (or `AGENT_BROWSER_CONFIRM_ACTIONS` env) |
| `--confirm-interactive` | Interactive confirmation prompts; auto-denies if stdin is not a TTY (or `AGENT_BROWSER_CONFIRM_INTERACTIVE` env) |
| `--engine <name>` | Browser engine: `chrome` (default), `lightpanda` (or `AGENT_BROWSER_ENGINE` env) |
| `--config <path>` | Use a custom config file (or `AGENT_BROWSER_CONFIG` env) |
| `--debug` | Debug output |

## Architecture

agent-browser uses a client-daemon architecture:

1. **Rust CLI** — Parses commands, communicates with daemon via IPC
2. **Rust Daemon** — Pure Rust daemon controlling Chrome via Chrome DevTools Protocol (CDP)

The daemon starts automatically on first command and persists between commands. No Node.js required at runtime.

## Platforms

| Platform    | Binary      |
| ----------- | ----------- |
| macOS ARM64 | Native Rust |
| macOS x64   | Native Rust |
| Linux ARM64 | Native Rust |
| Linux x64   | Native Rust |
| Windows x64 | Native Rust |

## License

Apache-2.0
