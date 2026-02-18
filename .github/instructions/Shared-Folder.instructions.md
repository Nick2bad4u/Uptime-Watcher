---
name: "Shared-Folder-Guidelines"
description: "Guidance for shared cross-process types and utilities under shared/."
applyTo: "shared/**"
---

# Shared (shared/) Guidelines

- Treat `shared/` as the **single source of truth for contracts**:
  - Define domain models, IPC contracts, event payloads, and validation schemas here.
  - Renderer (`src/`) and main (`electron/`) should import from `@shared/...` instead of duplicating shapes.
- Key subdirectories:
  - `shared/types/` → canonical domain types (events, monitors, state sync, configuration).
  - `shared/ipc/` → channel names and renderer-facing event definitions.
  - `shared/validation/` → Zod schemas and validators kept alongside their type counterparts.
  - `shared/utils/` → cross-environment helpers such as `errorHandling`, never depending on Node/Electron APIs.
  - `shared/constants/` → shared enums and literal values consumed by both layers.
- Environment-agnostic code only:
  - No direct references to DOM, Electron, or Node-specific globals.
  - Functions must be pure or easily testable in isolation.
- Types & schemas:
  - Prefer precise TypeScript types, discriminated unions, and branded IDs for domain concepts.
  - Keep validation logic and schemas close to the types they validate.
- Reuse and composition:
  - Factor out common helpers (e.g., error normalization, type guards) that are used in both layers.
  - Avoid adding large, one-off utilities that should instead live in `src/` or `electron/`.
- Testing:
  - Shared tests belong under `shared/test/` and should not rely on renderer or Electron behaviour; use fast-check arbitraries close to the domain under test.
