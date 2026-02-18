---
name: "Docs-Folder-Guidelines"
description: "Guidance for architecture and guides under docs/."
applyTo: "docs/**"
---

# Documentation (docs/) Guidelines

- Treat `docs/` as the **canonical reference** for architecture and behaviour:
  - Keep ADRs, architecture overviews, and patterns synchronized with actual implementations.
  - When code changes invalidate docs, update the docs in the same PR.
- Structure alignment:
  - Follow the existing directory layout: `Architecture/`, `Guides/`, `Testing/`, `TSDoc/`, etc.
  - `docs/docusaurus/` contains the source code for the documentation website.
  - Use frontmatter schemas referenced in existing files; do not invent new ad-hoc metadata.
- Tooling:
  - Validate documentation with the provided scripts—`npm run docs:check` runs remark linting, link validation, and frontmatter schema checks via `scripts/validate-doc-frontmatter.mjs`.
  - Keep frontmatter in sync with `config/schemas/doc-frontmatter.schema.json`; every markdown document should declare accurate `last_reviewed` dates when content changes.
- Style and tone:
  - Prefer concise, direct explanations with examples taken from real code.
  - Use diagrams (e.g., Mermaid) only when they add clarity.
- Cross-linking:
  - Link to concrete modules (`src/...`, `electron/...`, `shared/...`) instead of duplicating large code snippets.
