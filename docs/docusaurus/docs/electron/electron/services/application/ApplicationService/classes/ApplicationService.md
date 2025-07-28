# Class: ApplicationService

Defined in: [electron/services/application/ApplicationService.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/application/ApplicationService.ts#L24)

Main application service that orchestrates all other services and coordinates application lifecycle.

## Remarks

Uses dependency injection through [ServiceContainer](../../../ServiceContainer/classes/ServiceContainer.md) to manage all services and their dependencies. Provides proper initialization order, event handler setup, and cleanup. Handles Electron app events and orchestrates service startup and shutdown.

## Constructors

### Constructor

> **new ApplicationService**(): `ApplicationService`

Defined in: [electron/services/application/ApplicationService.ts:45](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/application/ApplicationService.ts#L45)

Constructs the ApplicationService and sets up the service container.

#### Returns

`ApplicationService`

#### Remarks

Creates a [ServiceContainer](../../../ServiceContainer/classes/ServiceContainer.md) instance with appropriate debug settings and sets up application-level event handlers. This constructor should be called once during application startup.

#### Example

```typescript
const appService = new ApplicationService();
```

## Methods

### cleanup()

> **cleanup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/application/ApplicationService.ts:70](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/application/ApplicationService.ts#L70)

Cleans up resources before application shutdown.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when cleanup is complete.

#### Remarks

Performs ordered shutdown of all services including IPC cleanup, monitoring stoppage, and window closure. Follows project error handling standards by re-throwing errors after logging for upstream handling.

#### Throws

Re-throws any errors encountered during cleanup for upstream handling.

#### Example

```typescript
await appService.cleanup();
```
