---
schema: "../../config/schemas/doc-frontmatter.schema.json"
doc_title: "Dependency Install Debt"
summary: "Tracks known npm peer dependency blockers that currently require forced installs in Uptime Watcher."
created: "2026-06-30"
last_reviewed: "2026-07-07"
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
tooling graph still contains a package whose published peer range does not
accept ESLint 10.

Use this command to re-check whether a normal install can resolve:

```powershell
npm run deps:check:no-force
```

That script runs:

```powershell
npm install --force=false --dry-run --no-audit --no-fund
```

## Current blockers

| Package                  | Current version | Required peer range | Repo version | Status                                                                                |
| ------------------------ | --------------- | ------------------- | ------------ | ------------------------------------------------------------------------------------- |
| `eslint-plugin-jsx-a11y` | `6.10.2`        | ESLint 3 through 9  | `10.3.0`     | No newer npm release exists; keep forced installs and re-check before removing force. |

The plugin remains part of the accessibility lint graph through the shared ESLint
config and related React/style accessibility plugins, so removing it would reduce
lint signal rather than simply cleaning unused metadata.

## Cleared blockers

| Package                                    | Resolution                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `@rushstack/eslint-plugin-security`        | Removed because the active `security/*` rule set is supplied by `eslint-plugin-security@4.0.1`.          |
| `@arthurgeron/eslint-plugin-react-usememo` | Removed because all of its rules were disabled and the latest release still peers only `eslint@^9.0.0`. |
| `eslint-find-rules`                        | Removed because it only backed ad hoc rule-discovery scripts and the latest release peers ESLint 8/9.   |
| `eslint-plugin-github`                     | Removed because no local `github/*` rules were configured and the latest release peers ESLint 8/9.      |

## Exit criteria

Remove `.npmrc` `force=true` and replace workflow installs with non-forced
installs only after all of the following are true:

1. `npm run deps:check:no-force` exits zero.
2. `npm install --force=false --no-audit --no-fund` completes without lockfile
   churn beyond expected npm metadata updates.
3. `npm run lint` confirms any dependency replacement still preserves lint
   signal.
4. CI install steps that currently use `--force` are updated in the same change.
