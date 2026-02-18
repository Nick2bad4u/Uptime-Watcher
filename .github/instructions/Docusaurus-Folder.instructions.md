---
name: "Docusaurus-Typedoc-Folder-Guidelines"
description: "Guidance for the Docusaurus + TypeDoc documentation app under docs/docusaurus/."
applyTo: "docs/docusaurus/**"
---

# Docusaurus + TypeDoc (docs/docusaurus/) Guidelines

- Treat `docs/docusaurus/` as the **standalone documentation app**:
  - Docusaurus configuration, theme, and pages live here.
  - TypeDoc integration is configured via `docs/docusaurus/typedoc.config.json` and related TS configs (for example `tsconfig.typedoc.json`).
- Website and build setup:
  - Inside `docs/docusaurus/`, you can use the local scripts described in `docs/docusaurus/README.md` (`yarn start`, `yarn build`, `yarn deploy`). The same commands are available via npm (`npm run start`, `npm run build`, `npm run deploy`) for contributors who do not use Yarn.
  - From the repository root, prefer the `docusaurus:*` and `docs:*` npm scripts (e.g., `npm run docusaurus:start`, `npm run docusaurus:build`, `npm run docs:build`, `npm run docs:deploy`) so that TypeDoc and other generated assets are updated before the Docusaurus build.
- Source of truth:
  - API and type documentation must be generated from the real code in `src/`, `electron/`, and `shared/` via the TypeDoc scripts.
  - Do not hand-edit generated TypeDoc output under `docs/docusaurus`; adjust source code or TypeDoc config instead.
- ESLint Config Inspector integration:
  - The ESLint configuration inspector is built via the `build:eslint-inspector` script, which runs `scripts/build-eslint-inspector.mjs` and outputs a static app into `docs/docusaurus/static/eslint-inspector`.
  - Do not modify the generated files in `static/eslint-inspector` by hand; rerun `npm run build:eslint-inspector` (or `npm run docs:build` / `npm run docusaurus:build`) after changing ESLint configuration.
  - Refer to `docs/docusaurus/src/pages/ESLINT-INSPECTOR-DEPLOYMENT-SUMMARY.md` for deployment and usage details.
- Configuration alignment:
  - Keep Docusaurus `docusaurus.config.ts` and TypeScript configs (`tsconfig.typedoc.json`, etc.) in sync with root TS/Vite/Electron settings and path aliases.
- Content:
  - Prefer linking to existing architecture docs under `docs/Architecture/` and guides under `docs/Guides/` rather than duplicating long explanations.
  - Keep examples and snippets up to date with current code.
