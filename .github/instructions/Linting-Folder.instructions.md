---
name: "Linting-Folder-Guidelines"
description: "Guidance for ESLint configuration, internal lint tooling, and custom rules under config/linting/."
applyTo: "config/linting/**"
---

# Linting (config/linting/) Guidelines

## Purpose

Everything under `config/linting/` exists to enforce repository conventions safely and consistently.

- Prefer **clear, maintainable rules** over clever rules.
- Avoid rules that rely on fragile heuristics or unstable AST shapes.
- Keep plugin code **self-contained** so it can be extracted/published later.

## Custom ESLint plugin: uptime-watcher

### Structure

- Plugin implementation: `config/linting/plugins/uptime-watcher/plugin.mjs`
- Stable wrapper (repo import path): `config/linting/plugins/uptime-watcher.mjs`
- Rules: `config/linting/plugins/uptime-watcher/rules/*.mjs`
- Shared rule helpers: `config/linting/plugins/uptime-watcher/_internal/*`
- RuleTester suites: `config/linting/plugins/uptime-watcher/test/**/*.test.ts`
- Per-rule docs: `config/linting/plugins/uptime-watcher/docs/rules/<rule-id>.md`

### Rule IDs

- Rule IDs must be **kebab-case**.
- The fully-qualified ESLint rule key is always:

```text
uptime-watcher/<rule-id>
```

### Adding or changing a rule

When adding a new rule:

1. Create `rules/<rule-id>.mjs`.
2. Register it in `plugin.mjs` under `rules: { "<rule-id>": rule }`.
3. Add a RuleTester suite in `test/`.
4. Add docs at `docs/rules/<rule-id>.md` and ensure `meta.docs.url` points to it.

### Internal helpers

If multiple rules need the same logic (e.g., repo-root detection, path normalization), prefer adding a helper in `_internal/`.

## Type-aware linting and TS configs

- The plugin has a dedicated TS project: `config/linting/plugins/uptime-watcher/tsconfig.eslint.json`.
- ESLint is configured to include this project for type-aware rules.

If you add new TS/TSX tests or tooling files under the plugin folder, ensure they are included by this tsconfig.

## Testing

- RuleTester suites are run via the dedicated Vitest project `vitest.linting.config.ts`.
- Keep RuleTester tests deterministic and filesystem-independent where possible.

## Documentation conventions

- Rule docs live beside the plugin under `docs/rules/`.
- Keep rule docs minimal but complete:
  - Summary
  - Options (or “no options”)
  - Examples (when useful)

## Notes on third-party tooling shims

- Type-only shims under `config/testing/types/` exist to keep `check:js` stable.
- They are intentionally excluded from ESLint and should remain minimal.
