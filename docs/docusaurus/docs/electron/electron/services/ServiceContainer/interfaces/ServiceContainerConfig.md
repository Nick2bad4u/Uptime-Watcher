# Interface: ServiceContainerConfig

Defined in: [electron/services/ServiceContainer.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ServiceContainer.ts#L44)

Configuration options for [ServiceContainer](../classes/ServiceContainer.md).

## Remarks

Controls service initialization and runtime behavior.

## Properties

### enableDebugLogging?

> `optional` **enableDebugLogging**: `boolean`

Defined in: [electron/services/ServiceContainer.ts:54](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ServiceContainer.ts#L54)

Enables debug logging for service initialization and lifecycle events.

#### Remarks

When enabled, logs detailed information about service creation, dependency injection,
initialization order, timing, manager setup, event forwarding, and error contexts.

#### Default Value

```ts
false
```

***

### notificationConfig?

> `optional` **notificationConfig**: `object`

Defined in: [electron/services/ServiceContainer.ts:67](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/ServiceContainer.ts#L67)

Custom notification service configuration.

#### showDownAlerts

> **showDownAlerts**: `boolean`

Enables notifications when monitors go down.

#### showUpAlerts

> **showUpAlerts**: `boolean`

Enables notifications when monitors come back up.

#### Remarks

Controls system notification behavior for monitor status changes.
Can be modified at runtime via [NotificationService.updateConfig](../../notifications/NotificationService/classes/NotificationService.md#updateconfig).

#### Default Value

`` showDownAlerts: true, showUpAlerts: true ``

#### See

[NotificationService](../../notifications/NotificationService/classes/NotificationService.md)
