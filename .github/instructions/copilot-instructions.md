---
applyTo: "**"
---

# Uptime Watcher – AI Agent Instructions

## Architecture Overview

- **Frontend**: React + TypeScript + Zustand + TailwindCSS + Vite
- **Backend**: Electron main process (Node.js) + SQLite
- **IPC**: All backend/renderer communication via secure contextBridge (`window.electronAPI`)
- **State Management**: Domain-specific Zustand stores; no global state
- **Database**: All operations use repository pattern and are wrapped in transactions via `executeTransaction()`
- **Event System**: TypedEventBus with middleware, correlation IDs, and domain event contracts

## Key Patterns & Conventions

- **Repository Pattern**: All DB access via repositories (`electron/services/database/*Repository.ts`). Mutation methods are always async and use transactions.
- **Service Layer**: Managers (e.g., `SiteManager`, `MonitorManager`, `DatabaseManager`) orchestrate business logic and event flows.
- **Event-Driven Updates**: UI and backend communicate via events; status updates, site/monitor changes, and settings propagate through event bus and IPC.
- **Error Handling**: Use `withErrorHandling` and centralized logger. Always re-throw errors after logging.
- **Frontend State**: All UI updates flow through React state and Zustand stores. Never mutate state directly; always use store actions.
- **IPC Handlers**: Add new IPC handlers in `electron/services/ipc/IpcService.ts` and expose them via preload (`electron/preload.ts`).
- **Type Safety**: Strict TypeScript config; update interfaces in `electron/utils/database/interfaces.ts` and `src/types.ts` for new data structures.

## Code Quality Standards

- **Empty Directories**: Remove empty directories to keep codebase clean (no empty `managers/`, `dist/`, or test directories)
- **Format**: Don't pay attention to small formatting issues like Prettier or Eslint demanding sorting or spacing; focus on code structure and logic
- **Type Safety**: Ensure all new code is type-safe; update types/interfaces as needed, never use `any` or `unknown` or 'null' unless absolutely necessary
- **Documentation**: Use TSDoc for comments and use proper base tags found here: `docs\.github\TSDoc-base-tags.md`

Critcal Instructions:

- ** Always ** READ the code before making changes. Understand the context and flow.
- ** Never ** make changes without understanding the full impact on the system.
- ** Never ** take shortcuts or skip steps in the development process.
- ** Always ** stop and ask for clarification if unsure about any aspect of the code or architecture or how to proceed. NEVER GUESS.
- ** Never ** assume you know how something works without verifying it in the codebase. Never assume names, filenames, etc. are correct without checking.
