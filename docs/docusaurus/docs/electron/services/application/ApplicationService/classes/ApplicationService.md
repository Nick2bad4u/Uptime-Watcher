# Class: ApplicationService

Defined in: [electron/services/application/ApplicationService.ts:58](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/application/ApplicationService.ts#L58)

## Constructors

### Constructor

> **new ApplicationService**(): `ApplicationService`

Defined in: [electron/services/application/ApplicationService.ts:222](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/application/ApplicationService.ts#L222)

Constructs the ApplicationService and sets up the service
container.

#### Returns

`ApplicationService`

#### Remarks

Creates a [ServiceContainer](../../../ServiceContainer/classes/ServiceContainer.md) instance with appropriate debug
settings and sets up application-level event handlers. This constructor
should be called once during application startup.

#### Example

```typescript
const appService = new ApplicationService();
```

## Methods

### cleanup()

> **cleanup**(): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/services/application/ApplicationService.ts:128](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/application/ApplicationService.ts#L128)

Cleans up resources before application shutdown.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

A promise that resolves when cleanup is complete.

#### Remarks

Performs ordered shutdown of all services including IPC cleanup,
monitoring stoppage, and window closure. Follows project error handling
standards by re-throwing errors after logging for upstream handling.

#### Example

```typescript
await appService.cleanup();
```

#### Throws

Re-throws any errors encountered during cleanup for upstream
  handling.
