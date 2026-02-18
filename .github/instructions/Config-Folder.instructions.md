---
name: "Config-Folder-Guidelines"
description: "Guidance for configuration and tooling definitions under config/."
applyTo: "config/**"
---

# Configuration (config/) Guidelines

- Treat `config/` as the **supporting configuration hub for tooling**:
  - Secondary and supporting config files for linting, testing, benchmarks, schemas, tools, and types live here. Primary linting configs (`eslint.config.mjs`, `stylelint.config.mjs`) live at the repository root.
  - **Subdirectories**:
    - `config/benchmarks`: Configuration for benchmarking tools.
    - `config/linting`: Secondary linting configs (Markdownlint, Commitlint, ActionLint, YAML lint, Biome, Secretlint, JSCPD, Grype, HTMLHint, Taplo) plus shared rules and plugins referenced by root configs.
    - `config/schemas`: JSON schemas for validation.
    - `config/testing`: TSConfigs for tests and Vitest helpers.
    - `config/tools`: Configuration for other build/dev tools.
    - `config/types`: Shared type definitions for configuration files.
  - Project references under `config/testing/` (for example `tsconfig.test.json`, `tsconfig.scripts.json`) power the `npm run check:*` scripts—keep them consistent with the root `tsconfig.json` and update the npm scripts when adding new projects.
  - Root configs (`eslint.config.mjs`, `stylelint.config.mjs`, `vitest*.config.ts`) may reference supporting files under `config/linting/` or other subdirectories; keep them in sync with the expectations documented in `.github/*.instructions.md`.
- Path and build alignment:
  - When adjusting paths, aliases, or include globs here, verify they stay consistent across TS configs, Vite, Electron, Storybook, and Playwright.
- Minimal duplication:
  - Prefer shared base configs and small overrides; avoid copy/paste between configs.
- Safety:
  - Do not relax lint/type rules to “make errors go away” without fixing root causes.
  - Any rule changes should be justified and reflected in documentation when they affect contributor expectations.
