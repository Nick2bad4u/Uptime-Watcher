# Class: IpcService

Defined in: [electron/services/ipc/IpcService.ts:33](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/IpcService.ts#L33)

Inter-Process Communication (IPC) service for Electron main-renderer communication.

## Remarks

Manages all IPC handlers between the main process and renderer processes, organized by functional domains (sites, monitoring, data, system, state sync). Provides a secure interface for the frontend to interact with backend services. All handler registration and cleanup is managed through this service.

## Example

```typescript
const ipcService = new IpcService(uptimeOrchestrator, autoUpdaterService);
ipcService.setupHandlers();
// ...
ipcService.cleanup();
```

## Constructors

### Constructor

> **new IpcService**(`uptimeOrchestrator`, `autoUpdaterService`): `IpcService`

Defined in: [electron/services/ipc/IpcService.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/IpcService.ts#L66)

Constructs a new IpcService instance.

#### Parameters

##### uptimeOrchestrator

[`UptimeOrchestrator`](../../../../UptimeOrchestrator/classes/UptimeOrchestrator.md)

The core orchestrator for monitoring operations.

##### autoUpdaterService

[`AutoUpdaterService`](../../../updater/AutoUpdaterService/classes/AutoUpdaterService.md)

The service for handling application updates.

#### Returns

`IpcService`

#### Remarks

Initializes the IPC service with required orchestrator and updater dependencies. This does not register any handlers until [setupHandlers](#setuphandlers) is called.

#### Example

```typescript
const ipcService = new IpcService(uptimeOrchestrator, autoUpdaterService);
```

## Methods

### cleanup()

> **cleanup**(): `void`

Defined in: [electron/services/ipc/IpcService.ts:84](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/IpcService.ts#L84)

Removes all registered IPC handlers and event listeners.

#### Returns

`void`

#### Remarks

Should be called during application shutdown to prevent memory leaks. Removes handlers registered via `ipcMain.handle` and listeners via `ipcMain.on` for all registered channels.

#### Example

```typescript
ipcService.cleanup();
```

***

### setupHandlers()

> **setupHandlers**(): `void`

Defined in: [electron/services/ipc/IpcService.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ipc/IpcService.ts#L106)

Initializes all IPC handlers for the main process.

#### Returns

`void`

#### Remarks

Sets up handlers for site management, monitoring control, monitor type registry, data management, system operations, and state synchronization. Should be called once during application startup.

#### Example

```typescript
ipcService.setupHandlers();
```
