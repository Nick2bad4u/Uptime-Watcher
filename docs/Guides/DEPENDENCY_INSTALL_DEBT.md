---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Dependency Install Debt"
summary: "Tracks known npm peer dependency blockers that currently require forced installs in Uptime Watcher."
created: "2026-06-30"
last_reviewed: "2026-06-30"
doc_category: "guide"
author: "Nick2bad4u"
tags:
 - "dependencies"
 - "npm"
 - "eslint"
 - "maintenance"
---

# Dependency Install Debt

This repository currently keeps `force=true` in `.npmrc` because the ESLint 10
tooling graph still contains packages whose published peer ranges do not accept
ESLint 10.

Use this command to re-check whether a normal install can resolve:

```powershell
npm run deps:check:no-force
```

That script runs:

```powershell
npm install --force=false --dry-run --no-audit --no-fund
```

## Current blockers

| Package                             | Current version | Required peer range | Repo version | Status                                                                |
| ----------------------------------- | --------------- | ------------------- | ------------ | --------------------------------------------------------------------- |
| `@rushstack/eslint-plugin-security` | `0.14.2`        | ESLint 6 through 9  | `10.3.0`     | No newer npm release exists; keep forced installs and re-check later. |

The plugin remains wired into `eslint.config.mjs` through
`@rushstack/security/no-unsafe-regexp`, so removing it would reduce security
lint signal rather than simply cleaning unused metadata.

## Cleared blockers

| Package                                    | Resolution                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `@arthurgeron/eslint-plugin-react-usememo` | Removed because all of its rules were disabled and the latest release still peers only `eslint@^9.0.0`. |

## Exit criteria

Remove `.npmrc` `force=true` and replace workflow installs with non-forced
installs only after all of the following are true:

1. `npm run deps:check:no-force` exits zero.
2. `npm install --force=false --no-audit --no-fund` completes without lockfile
   churn beyond expected npm metadata updates.
3. `npm run lint` confirms any dependency replacement still preserves lint
   signal.
4. CI install steps that currently use `--force` are updated in the same change.
