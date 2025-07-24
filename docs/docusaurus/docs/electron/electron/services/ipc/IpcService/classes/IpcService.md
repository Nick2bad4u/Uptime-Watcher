# Class: IpcService

Defined in: [electron/services/ipc/IpcService.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/ipc/IpcService.ts#L28)

Inter-Process Communication service for Electron main-renderer communication.

## Remarks

Manages all IPC handlers between the main process and renderer processes,
organized by functional domains (sites, monitoring, data, system).
Provides a secure interface for the frontend to interact with backend services.

## Constructors

### Constructor

> **new IpcService**(`uptimeOrchestrator`, `autoUpdaterService`): `IpcService`

Defined in: [electron/services/ipc/IpcService.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/ipc/IpcService.ts#L39)

Create a new IPC service instance.

#### Parameters

##### uptimeOrchestrator

[`UptimeOrchestrator`](../../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

Core orchestrator for monitoring operations

##### autoUpdaterService

[`AutoUpdaterService`](../../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

Service for handling application updates

#### Returns

`IpcService`

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [electron/services/ipc/IpcService.ts:55](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/ipc/IpcService.ts#L55)

Clean up all IPC listeners.

#### Returns

`void`

#### Remarks

Removes all registered IPC handlers and event listeners to prevent memory leaks.
This includes:
- IPC handlers registered via ipcMain.handle (removed via removeHandler)
- Event listeners registered via ipcMain.on (removed via removeAllListeners)

Should be called during application shutdown.

***

### setupHandlers()

> **setupHandlers**(): `void`

Defined in: [electron/services/ipc/IpcService.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/ipc/IpcService.ts#L76)

Initialize all IPC handlers organized by functional domain.

#### Returns

`void`

#### Remarks

Sets up handlers for:
- Site management (CRUD operations)
- Monitoring control (start/stop operations)
- Data management (import/export/backup)
- System operations (updates, quit)
