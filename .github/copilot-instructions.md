# Uptime Watcher Copilot Instructions

## Repository expectations

- Prefer fixing root causes over patching symptoms.
- Do not disable lint rules just to make checks pass.
- When editing TypeScript, preserve strict typing and improve type safety where practical.
- Prefer shared utilities over duplicating logic across `src`, `electron`, `shared`, and `benchmarks`.

## Validation expectations

- Prefer the repo fixer pipelines before manual formatting work:
  - `npm run lint:fix:quiet`
  - `npm run lint:all:fix:quiet`
- Run the relevant typecheck commands after meaningful changes.
- For UI or Electron changes, validate with the appropriate targeted tests before broad reruns.

## Project-specific notes

- This is an Electron + React + TypeScript monorepo-style app with distinct `src`, `electron`, and `shared` areas.
- Benchmark and test utilities should avoid weak randomness when lint rules require secure randomness.
- Documentation and workflow files are linted aggressively; keep GitHub workflow metadata explicit and complete.
