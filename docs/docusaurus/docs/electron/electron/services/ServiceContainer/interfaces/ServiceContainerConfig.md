# Interface: ServiceContainerConfig

Defined in: [electron/services/ServiceContainer.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L44)

Configuration interface for service container behavior.

## Remarks

Controls various aspects of service initialization and behavior.
All properties are optional with sensible defaults.

## Properties

### enableDebugLogging?

> `optional` **enableDebugLogging**: `boolean`

Defined in: [electron/services/ServiceContainer.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L59)

Enable debug logging for service initialization and lifecycle events.

#### Default Value

```ts
false
```

#### Remarks

When enabled, logs detailed information about:
- Service creation and dependency injection
- Initialization order and timing
- Manager setup and event forwarding
- Error contexts and recovery attempts

Useful for debugging service dependency issues and startup problems.

***

### notificationConfig?

> `optional` **notificationConfig**: `object`

Defined in: [electron/services/ServiceContainer.ts:72](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/ServiceContainer.ts#L72)

Custom notification service configuration.

#### showDownAlerts

> **showDownAlerts**: `boolean`

Enable notifications when monitors go down

#### showUpAlerts

> **showUpAlerts**: `boolean`

Enable notifications when monitors come back up

#### Default Value

`` showDownAlerts: true, showUpAlerts: true ``

#### Remarks

Controls system notification behavior for monitor status changes.
Can be modified at runtime via NotificationService.updateConfig().

#### See

[NotificationService](../../notifications/NotificationService/classes/NotificationService.md) for runtime configuration updates
