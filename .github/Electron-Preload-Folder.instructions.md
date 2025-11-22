---
name: "Electron-Preload-Folder-Guidelines"
description: "Security and architecture guidance for the Electron preload bridge under electron/preload/."
applyTo: "electron/preload/**"
---

# Preload Bridge (electron/preload/) Guidelines

- Core responsibilities:
  - The preload layer is the only code allowed to expose APIs from the main process to the renderer. Keep it lean, deterministic, and focused on translating typed IPC channels into safe browser-side helpers.
  - Follow the existing domain split (`domains/`, `core/`, `utils/`):
    - `core/` provides bridge primitives like `createTypedInvoker`, `createEventManager`, and `bridgeFactory`.
    - `domains/` implements feature-specific bridges (settings, sites, monitoring, notifications, state sync) that call into `core/` helpers.
    - `utils/` houses logging and guard helpers used across domains.
- Security requirements:
  - Never expose raw Node.js globals or `ipcRenderer` directly to `window`. All APIs must go through the bridge factory and be validated.
  - Use `contextBridge.exposeInMainWorld` (handled in `electron/preload.ts`) with frozen objects to prevent mutation from the renderer.
  - Validate every payload coming from main: reuse guard utilities from `@shared/validation` / `@shared/types` or add new ones alongside the shared types before accepting data in the renderer.
  - When adding a new IPC channel:
    - Define the channel and payload types in `@shared/types/ipc` (and `@shared/ipc/rendererEvents` if it is an event).
    - Register the handler in `electron/services/ipc/IpcService.ts` (or the relevant service) and ensure it returns the `IpcResponse` shape consumed by the preload bridge.
    - Extend the appropriate preload domain module, using `createTypedInvoker`/`createVoidInvoker`/`createEventManager` to expose the feature.
    - Add Vitest coverage under `electron/test/preload/` (or the matching strict test) verifying that invalid payloads are rejected and channels are verified.
- Logging and diagnostics:
  - Use `preloadLogger` and `preloadDiagnosticsLogger` for logging and guard failures. Avoid `console.*` calls in production code—those can surface in user consoles and leak internals.
  - Conditional diagnostics (for test environments) should rely on the flags already used by `bridgeFactory` (`__UPTIME_ALLOW_IPC_DIAGNOSTICS_FALLBACK__`, `process.env.VITEST`). Do not introduce new globals.
- Performance and hygiene:
  - Keep per-call setup minimal; heavy computations belong in the renderer or main process.
  - Reuse cached bridge instances instead of rebuilding objects on every invocation. Domain modules should export a single factory or singleton that the bootstrap code consumes.
  - Ensure TypeScript strictness: all new modules must compile under `tsconfig.electron.json` and satisfy lint rules (`npm run lint:fix`, `npm run type-check:electron`).
  - Freeze exposed objects and return types when possible to make renderer tampering easier to detect in tests.
