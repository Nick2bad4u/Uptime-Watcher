# Class: ApplicationService

Defined in: [electron/services/application/ApplicationService.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/application/ApplicationService.ts#L15)

Main application service that orchestrates all other services.
Handles application lifecycle and service coordination.

## Remarks

Uses dependency injection through ServiceContainer to manage all services
and their dependencies. Provides proper initialization order and cleanup.

## Constructors

### Constructor

> **new ApplicationService**(): `ApplicationService`

Defined in: [electron/services/application/ApplicationService.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/application/ApplicationService.ts#L26)

Initialize the ApplicationService and set up the service container.

#### Returns

`ApplicationService`

#### Remarks

Creates a ServiceContainer instance with appropriate debug settings
and sets up application-level event handlers. This constructor should
be called once during application startup.

## Methods

### cleanup()

> **cleanup**(): `Promise`\<`void`\>

Defined in: [electron/services/application/ApplicationService.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/application/ApplicationService.ts#L47)

Cleanup resources before application shutdown.

#### Returns

`Promise`\<`void`\>

#### Remarks

Performs ordered shutdown of all services including IPC cleanup,
monitoring stoppage, and window closure. Follows project error handling
standards by re-throwing errors after logging for upstream handling.

#### Throws

Re-throws any errors encountered during cleanup for upstream handling
