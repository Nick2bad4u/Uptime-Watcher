# Agents Guide

## Scope

These instructions apply to the whole Uptime Watcher repository. More specific
`AGENTS.md` files in child directories extend these rules for their own area.

## Operating Standards

- Work until the requested task is fully finished or blocked by something that
  cannot be resolved locally. When blocked, state the exact blocker and the
  command or file that proved it.
- Be direct. Do not overstate confidence, hide warnings, or call a task done
  before the relevant checks have run.
- Read the relevant files before editing. Verify names, data flow, and existing
  patterns in code rather than guessing from directory names.
- Preserve user work. Do not revert unrelated changes or reformat untouched
  files just to make a diff look cleaner.
- Use Windows-friendly commands and paths. Prefer PowerShell syntax unless a
  project script deliberately invokes another shell.
- Track non-trivial work with a visible checklist or plan and update it as
  steps complete.
- Use subagents only when parallel work is explicitly requested or clearly
  supported by the active environment. Keep delegated work scoped and review it
  before relying on it.

## Project Map

- `src/` contains the React renderer, Zustand stores, renderer services,
  Tailwind styles, and Vite entry points.
- `electron/` contains the Electron main process, preload bridge,
  orchestrator, coordinators, services, IPC handlers, monitoring logic, and
  database access.
- `shared/` contains cross-process types, IPC contracts, validation schemas,
  type guards, and utility code shared by renderer and main.
- `docs/` contains project documentation, TSDoc guidance, and the nested
  Docusaurus site.
- `playwright/` contains Electron end-to-end tests and helpers.
- `tests/` contains repository-level tooling and strict/property test support.
- `config/`, `scripts/`, `.github/workflows/`, and root config files are part
  of the release surface. Treat changes there as production changes.

## Architecture Rules

- Keep the renderer isolated from Node and Electron internals. Renderer code
  should call `src/services/*` wrappers that use the secure preload
  `contextBridge`.
- Keep IPC contracts typed and validated. Shared payload shapes belong in
  `shared/ipc`, `shared/types`, and `shared/validation`; update both sides when
  a channel contract changes.
- Route main-process behavior through existing services, coordinators,
  managers, and the `TypedEventBus` rather than adding global shared state.
- Keep Zustand stores domain-scoped. Do not introduce broad catch-all stores for
  convenience.
- Use the centralized logger for application diagnostics. Avoid raw
  `console.*` in app code unless an existing local pattern requires it.
- Validate untrusted input with the existing Zod schemas and shared guards at
  process boundaries, persistence boundaries, and import/export boundaries.
- Database mutations must use the existing repository and service layers and
  `DatabaseService.executeTransaction()` where atomic writes are required.
- Respect Electron security defaults: no unnecessary Node integration in the
  renderer, no widened preload surface, no remote module patterns, and no
  unsanitized external navigation or shell execution.

## TypeScript And React Standards

- Prefer precise TypeScript. Avoid `any`; use `unknown` only at real trust
  boundaries and narrow immediately.
- Avoid unnecessary `null` and `undefined` states. Model absence deliberately
  with existing project types and helpers.
- Keep React components focused. Move orchestration into hooks, services, or
  store actions when that matches local patterns.
- Use Testing Library user-facing queries in renderer tests and stable
  `data-testid` values only when semantic queries are not reliable.
- Keep Tailwind and CSS changes consistent with the existing design system.
  Do not introduce unrelated visual redesigns during functional fixes.
- Add or update TSDoc when public APIs, architecture boundaries, or non-obvious
  behavior changes. Keep comments useful rather than narrating obvious code.

## Dependency And Tooling Rules

- Use the Node and npm versions declared by `.node-version`, `.nvmrc`,
  `package.json#engines`, and `packageManager`.
- Prefer existing dependencies and helpers before adding new packages. If a new
  dependency is necessary, verify its current documentation and explain why the
  existing stack is insufficient.
- Keep generated outputs out of manual edits. Change the source or generator
  config, then regenerate.
- For package and config files, preserve sorting and formatting conventions by
  using the repository scripts rather than hand-normalizing unrelated blocks.

## Verification

Choose the smallest reliable check for the change, then broaden when the blast
radius demands it.

- General source changes: `npm run lint`, `npm run type-check:all`, and the
  relevant `npm run test:*` target.
- Renderer changes: `npm run test:frontend`, `npm run type-check:src`, and
  Playwright coverage when UI workflows are affected.
- Electron or database changes: `npm run test:electron`,
  `npm run type-check:electron`, and targeted integration tests when persistence
  or IPC changes.
- Shared contract changes: `npm run test:shared`, `npm run type-check:shared`,
  and `npm run check:ipc` when IPC artifacts are affected.
- Docs changes: `npm run docs:check`, `npm run docs:check-links`, and
  Docusaurus build/type checks when site routing or generated docs are touched.
- Workflow changes: `npm run lint:actions` plus YAML/prettier checks where
  applicable.
- Release readiness: prefer the repository aggregate scripts such as
  `npm run lint:all`, `npm run check-types:all`, `npm run test:all`, and
  `npm run build` as appropriate for the requested scope.

## Reporting Back

- Summarize what changed, what was verified, and what remains unverified.
- Include exact failing commands when checks do not pass.
- Do not present warnings as clean success. If a command exits zero but prints
  actionable warnings, call them out.
