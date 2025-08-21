# Class: IpcService

Defined in: [electron/services/ipc/IpcService.ts:422](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/IpcService.ts#L422)

Inter-Process Communication (IPC) service for Electron main-renderer
communication.

## Remarks

Manages all IPC handlers between the main process and renderer processes,
organized by functional domains including sites, monitoring, data management,
system operations, and state synchronization. Provides a secure interface for
the frontend to interact with backend services through Electron's
contextBridge API. All handler registration and cleanup is centrally managed
through this service to prevent memory leaks and ensure proper teardown.

The service organizes handlers into logical groups:

- Site management: CRUD operations for monitoring sites
- Monitoring control: Start/stop/status operations for monitors
- Monitor types: Configuration and metadata for different monitor types
- Data management: Database operations and data export/import
- System operations: Application updates, settings, logging
- State synchronization: Real-time updates between processes

## Examples

```typescript
const ipcService = new IpcService(
    uptimeOrchestrator,
    autoUpdaterService
);
ipcService.setupHandlers();

// Later during shutdown:
ipcService.cleanup();
```

```typescript
class MainProcess {
    private ipcService: IpcService;

    constructor(
        orchestrator: UptimeOrchestrator,
        updater: AutoUpdaterService
    ) {
        this.ipcService = new IpcService(orchestrator, updater);
    }

    async start(): Promise<void> {
        this.ipcService.setupHandlers();
    }

    async stop(): Promise<void> {
        this.ipcService.cleanup();
    }
}
```

## Constructors

### Constructor

> **new IpcService**(`uptimeOrchestrator`, `autoUpdaterService`): `IpcService`

Defined in: [electron/services/ipc/IpcService.ts:469](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/IpcService.ts#L469)

Constructs a new IpcService instance.

#### Parameters

##### uptimeOrchestrator

[`UptimeOrchestrator`](../../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

The core orchestrator for monitoring
  operations

##### autoUpdaterService

[`AutoUpdaterService`](../../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

The service for handling application updates

#### Returns

`IpcService`

#### Remarks

Initializes the IPC service with required orchestrator and updater
dependencies. The constructor only stores references to dependencies - no
handlers are registered until [setupHandlers](#setuphandlers) is explicitly called.
This allows for proper initialization order during application startup.

#### Example

```typescript
const ipcService = new IpcService(
    uptimeOrchestrator,
    autoUpdaterService
);
// No handlers registered yet - call setupHandlers() when ready
```

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [electron/services/ipc/IpcService.ts:493](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/IpcService.ts#L493)

Removes all registered IPC handlers and event listeners.

#### Returns

`void`

#### Remarks

Should be called during application shutdown to prevent memory leaks.
Removes handlers registered via `ipcMain.handle` and listeners via
`ipcMain.on` for all registered channels.

#### Example

```typescript
ipcService.cleanup();
```

***

### setupHandlers()

> **setupHandlers**(): `void`

Defined in: [electron/services/ipc/IpcService.ts:534](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/ipc/IpcService.ts#L534)

Initializes all IPC handlers for the main process.

#### Returns

`void`

#### Remarks

Sets up handlers for all functional domains including site management,
monitoring control, monitor type registry, data management, system
operations, and state synchronization. This method should be called
exactly once during application startup after all dependencies are
initialized.

The setup process registers handlers in the following order:

1. Site management handlers
2. Monitoring control handlers
3. Monitor type configuration handlers
4. Data management handlers
5. System operation handlers
6. State synchronization handlers

#### Example

```typescript
// During application startup
ipcService.setupHandlers();
logger.info("IPC handlers registered successfully");
```

#### Throws

Error when handlers are already registered or dependencies are
  not available
