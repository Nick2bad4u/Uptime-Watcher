---
name: "Scripts-Folder-Guidelines"
description: "Guidance for Node/ESM tooling scripts under scripts/."
applyTo: "scripts/**"
---

# Tooling Scripts (scripts/) Guidelines

- Scripts are **tooling only**:
  - Do not embed business logic that belongs in `src/`, `electron/`, or `shared/`.
  - Keep them focused on automation (linting, analysis, codegen, CI helpers).
- Runtime and style:
  - Node-targeted scripts should stick to ESM semantics whether they are written in `.mjs`, `.mts`, or `.ts`—mirror the patterns used by existing tooling scripts and ensure they compile under `config/testing/tsconfig.scripts.json` and run via the `tsx`-based npm scripts.
  - Prefer TypeScript (`.ts` / `.mts`) when strong typing or shared domain types from `@shared/*` improves safety; otherwise keep lightweight utilities in `.mjs`.
  - Reuse existing utilities and configuration (path aliases, lint configs, logger helpers) instead of duplicating logic.
  - The repository also contains a handful of PowerShell helpers (`*.ps1`) and an older `generate_prompts.py`; keep cross-platform behaviour in mind and only touch these when absolutely necessary, following the dedicated PowerShell guidelines.
- Safety:
  - Avoid destructive operations by default; require explicit flags or prompts for anything that deletes or overwrites user data.
  - When touching the codebase, rely on supported tools (ESLint, Prettier, TS) rather than ad-hoc regex replacements.
- Performance and DX:
  - Keep scripts fast and idempotent; avoid unnecessary network or file-system churn.
