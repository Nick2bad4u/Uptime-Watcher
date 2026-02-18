---
name: "Electron-Folder-Guidelines"
description: "Guidance for the Electron main-process code under electron/."
applyTo: "electron/**"
---

# Electron (electron/) Guidelines

- Treat `electron/` as **main-process backend only**:
  - No React, no DOM access, no renderer-only APIs.
  - All renderer communication must go through the typed IPC layer and preload bridge.
- Respect the orchestrator architecture:
  - Use `UptimeOrchestrator` as the central coordinator between managers (`DatabaseManager`, `SiteManager`, `MonitorManager`).
  - Prefer emitting and handling **typed events** via `TypedEventBus` instead of ad-hoc callbacks.
- Structure overview:
  - `electron/services/` hosts application, IPC, database, monitoring, notifications, updater, and window services. New services must register with `ServiceContainer` so startup/teardown remains consistent.
  - `electron/managers/` contains domain-specific managers (sites, monitors, database, updates) that encapsulate orchestration logic around repositories and services; keep business rules here rather than in raw services.
  - `electron/coordinators/` translate low-level service events into higher-level application workflows.
  - `electron/events/` contains `TypedEventBus`, event contracts, and middleware—extend these rather than creating bespoke emitters.
  - `electron/preload/` exposes typed bridges to the renderer. Keep preload modules minimal and validated against schemas in `@shared/validation`.
- Database and repositories:
  - All SQLite access goes through `DatabaseService` and repository classes under `electron/services/database/`.
  - Do not open raw `node-sqlite3-wasm` connections in new files.
- IPC service:
  - Register new IPC endpoints in `electron/services/ipc/IpcService.ts` using the existing handler patterns and shared channel constants.
  - Validate incoming data with shared validators (`@shared/validation`) and IPC-specific validators in `electron/services/ipc/validators.ts`.
  - Return typed payloads.
- Error handling & logging:
  - Use the shared error helpers (`ensureError`, `withErrorHandling`) and the structured logger utilities under `electron/utils/logger`.
  - Include operation names and identifiers in log metadata.
- Lifecycle:
  - Ensure new services or managers are wired through `ServiceContainer` for consistent initialization and teardown, and register IPC handlers during the container boot sequence.
