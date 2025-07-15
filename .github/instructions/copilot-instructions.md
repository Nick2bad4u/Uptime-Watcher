---
applyTo: "**"
---

# Uptime Watcher – AI Agent Instructions

## Architecture Overview

- **Frontend**: React + TypeScript + Zustand + TailwindCSS + Vite
- **Backend**: Electron main process (Node.js) + SQLite
- **IPC**: All backend/renderer communication via secure contextBridge (`window.electronAPI`)
- **State Management**: Domain-specific Zustand stores; no global state
- **Testing**: Vitest for both frontend and backend; see `electron/test/` and `src/test/`
- **Database**: All operations use repository pattern and are wrapped in transactions via `executeTransaction()`
- **Event System**: TypedEventBus with middleware, correlation IDs, and domain event contracts

## Key Patterns & Conventions

- **Repository Pattern**: All DB access via repositories (`electron/services/database/*Repository.ts`). Mutation methods are always async and use transactions.
- **Service Layer**: Managers (e.g., `SiteManager`, `MonitorManager`, `DatabaseManager`) orchestrate business logic and event flows.
- **Event-Driven Updates**: UI and backend communicate via events; status updates, site/monitor changes, and settings propagate through event bus and IPC.
- **Error Handling**: Use `withErrorHandling` and centralized logger. Always re-throw errors after logging.
- **Testing**: All new logic must be covered by Vitest tests. Use mocks for Electron APIs and database.
- **Frontend State**: All UI updates flow through React state and Zustand stores. Never mutate state directly; always use store actions.
- **IPC Handlers**: Add new IPC handlers in `electron/services/ipc/IpcService.ts` and expose them via preload (`electron/preload.ts`).
- **Type Safety**: Strict TypeScript config; update interfaces in `electron/utils/database/interfaces.ts` and `src/types.ts` for new data structures.
- **Barrel Exports**: Use barrel files (`index.ts`) for service and utility exports to maintain clean import paths.
- **Testing Setup**: See `electron/test/setup.ts` for global mocks and test environment config.

## Import/Export Standards (CRITICAL)

- **Barrel Export Usage**: ALL imports must use barrel exports (`index.ts`) files when available. Never import directly from subdirectories.
- **Frontend Barrel Structure**: `src/` has barrel exports for: `utils/`, `hooks/`, `components/`, `stores/`, `services/`, `theme/`
- **Backend Barrel Structure**: `electron/` has barrel exports for: `services/`, `utils/`, `managers/`, `events/`
- **Monitor Utilities**: All monitor-related utilities are exported from `src/utils/` barrel: `monitorTitleFormatters`, `monitorTypeHelper`, `monitorUiHelpers`, `monitorValidation`
- **Import Consistency**: Use `import { X } from "../utils"` instead of `import { X } from "../utils/specificFile"`
- **Type Re-exports**: Common types are re-exported through barrel files to avoid deep imports

## Code Quality Standards

- **Nested Ternary**: Extract complex nested ternary expressions into helper functions for better readability
- **Error Handling**: Always use `safeStringifyError` for error conversion in database operations
- **Empty Directories**: Remove empty directories to keep codebase clean (no empty `managers/`, `dist/`, or test directories)
- **Barrel Export Completeness**: Ensure all utilities/services are exported from their respective barrel files
- **Import Deduplication**: Merge duplicate imports from the same module into single import statements

## Developer Workflows

- **Build Frontend**: `npm run build` (Vite)
- **Build Electron**: `npm run electron` or `npm run electron-dev` (see `README.md`)
- **Run Tests**: `npm run test` (frontend), `npm run test:electron` (backend)
- **Debugging**: Use VS Code launch configs and Electron dev tools. Debug IPC via event logs and correlation IDs.
- **Database Migrations**: Schema is managed in `electron/services/database/utils/databaseSchema.ts`. All changes must be reflected in repository interfaces and tests.
- **Event Contracts**: Define new event types in `electron/events/eventTypes.ts`. Use `TypedEventBus` for type-safe event handling.
- **Testing**: Do NOT change source code to fit invalid tests. Only change source to fix bugs you can CONFIRM. Never implement behavior just to satisfy a test. Use `electron/test/` for backend tests and `src/test/` for frontend tests.

## Integration Points

- **Electron/React**: All backend calls go through `window.electronAPI` (see `electron/preload.ts`).
- **Event Bus**: TypedEventBus is the backbone for cross-component communication. Middleware can be added for logging, metrics, or error handling.
- **Operational Hooks**: Backend uses operational hooks (`useTransaction`, `useRetry`, `useValidation`) for standardized transaction, retry, and validation logic.
- **Testing**: All service, manager, and IPC logic must be covered by integration tests in `electron/test/`.

## Examples

- **Repository Transaction**:
  ```typescript
  await this.databaseService.executeTransaction(async (db) => {
   // ...mutation logic
  });
  ```
- **Event Emission**:
  ```typescript
  await this.eventEmitter.emitTyped("site:added", { identifier, ... });
  ```
- **IPC Handler**:
  ```typescript
  ipcMain.handle("add-site", async (_, data) => {
   /* ... */
  });
  ```
- **Frontend Store Update**:
  ```typescript
  useSitesState.getState().addSite(newSite);
  ```
- **Proper Import Usage**:
  ```typescript
  // Good: Use barrel export
  import { validateMonitorData, getMonitorTypeConfig } from "../utils";
  
  // Bad: Direct import from subdirectory
  import { validateMonitorData } from "../utils/monitorValidation";
  ```

## References

- `README.md` – Build/test/dev commands, architecture summary
- `electron/services/` – Service layer and business logic
- `electron/events/TypedEventBus.ts` – Event bus implementation
- `electron/preload.ts` – IPC exposure to renderer
- `electron/test/` – Backend test suite and mocks
- `src/stores/` – Zustand store implementations
- `src/types.ts` – Frontend types
- `electron/utils/database/interfaces.ts` – Backend types/interfaces

---

**If any section is unclear or missing, please provide feedback so instructions can be improved.**
