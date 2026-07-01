# Agents Guide For Documentation

## Scope

This file applies to `docs/**` except where a nested `AGENTS.md` provides more
specific guidance, such as `docs/docusaurus/**`.

## Documentation Standards

- Keep documentation accurate to the current codebase. Verify APIs, commands,
  paths, configuration keys, and feature behavior before documenting them.
- Prefer concise, task-oriented prose. Do not pad docs with generic best
  practices that do not apply to Uptime Watcher.
- Use the current project name, repository paths, and script names. Do not leave
  copied references to unrelated ESLint plugin repositories or old templates.
- Write examples that compile or match the documented command surface.
- Use TSDoc guidance from `docs/TSDoc/` when documenting public TypeScript APIs
  or architectural boundaries.
- Keep screenshots, diagrams, and static assets connected to real product
  behavior. Avoid decorative assets that do not help the reader.

## Content Areas

- `docs/Architecture/` should describe current renderer, Electron, IPC,
  database, event bus, logging, and security boundaries.
- `docs/Guides/` should focus on user and maintainer workflows with exact
  commands and expected outcomes.
- `docs/Testing/` should reflect the actual Vitest, Playwright, fast-check, and
  coverage setup.
- `docs/TSDoc/` should stay aligned with the project's documentation style for
  exported APIs and non-obvious implementation contracts.
- `docs/docusaurus/` is the documentation website workspace and has additional
  local rules.

## Generated And Downloaded Content

- Do not hand-edit generated TypeDoc output. Change source comments or TypeDoc
  config, then regenerate.
- Do not hand-edit generated ESLint inspector or Storybook static output.
- For downloaded reference docs, update the corresponding
  `docs:download:*` script or source URL rather than manually patching stale
  output.
- If generated docs create broken links, fix the source, config, sidebar, or
  generator. Do not add placeholder pages to hide the failure.

## Links And Markdown

- Use relative links for files inside the repository and absolute HTTPS links
  for external references.
- Keep headings stable when they are used as link targets.
- Prefer fenced code blocks with language identifiers.
- Do not introduce raw HTML unless the surrounding file already uses it for a
  specific presentation need.

## Verification

- Run `npm run docs:check` for Markdown/frontmatter changes.
- Run `npm run docs:check-links` when links, headings, generated docs, or site
  navigation change.
- Run `npm run docs:typedoc` when TSDoc, TypeDoc config, or API docs are
  affected.
- Run Docusaurus checks from the root, such as `npm run check:docusaurus` or
  `npm run docusaurus:build`, when site config, MDX, routing, sidebars, or
  Docusaurus components change.
