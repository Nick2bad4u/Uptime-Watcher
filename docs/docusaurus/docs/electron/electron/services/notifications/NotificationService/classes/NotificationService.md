# Class: NotificationService

Defined in: [electron/services/notifications/NotificationService.ts:71](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L71)

Service responsible for handling system notifications for monitor status changes.

## Remarks

Manages desktop notifications for monitor status changes using Electron's
Notification API. Provides configurable settings for different notification
types and handles platform compatibility checks.

**Thread Safety and Concurrency:**
This service is designed to be thread-safe for typical Electron usage patterns:
- Safe to call from main process event handlers
- Safe to call from IPC message handlers
- Safe to call from multiple timer callbacks concurrently
- Configuration updates are applied atomically
- No shared mutable state between notification calls

**Performance Considerations:**
- Monitor lookup uses Array.find() - consider caching for high-frequency usage
- Notification creation is synchronous but display is asynchronous
- Platform support check is cached by Electron

**Error Handling:**
- Invalid monitor IDs are logged and skipped gracefully
- Platform compatibility issues are handled automatically
- Invalid input parameters result in warning logs and early returns

## See

 - [NotificationConfig](../interfaces/NotificationConfig.md) for configuration options
 - [Site](../../../../../shared/types/interfaces/Site.md) for site data structure
 - Monitor for monitor data structure

## Example

```typescript
const notificationService = new NotificationService({
  showDownAlerts: true,
  showUpAlerts: false
});

// Show notification when a monitor goes down
notificationService.notifyMonitorDown(site, monitorId);

// Safe to call from multiple contexts concurrently
Promise.all([
  notificationService.notifyMonitorDown(site1, monitor1),
  notificationService.notifyMonitorUp(site2, monitor2)
]);
```

## Constructors

### Constructor

> **new NotificationService**(`config?`): `NotificationService`

Defined in: [electron/services/notifications/NotificationService.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L83)

Create a new notification service instance.

#### Parameters

##### config?

[`NotificationConfig`](../interfaces/NotificationConfig.md)

Optional configuration for notification behavior

#### Returns

`NotificationService`

#### Remarks

If no configuration is provided, both down and up alerts are enabled by default.
The configuration can be updated later using [NotificationService.updateConfig](#updateconfig).

## Methods

### getConfig()

> **getConfig**(): [`NotificationConfig`](../interfaces/NotificationConfig.md)

Defined in: [electron/services/notifications/NotificationService.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L96)

Get the current notification configuration.

#### Returns

[`NotificationConfig`](../interfaces/NotificationConfig.md)

A copy of the current configuration

#### Remarks

Returns a copy to prevent external modification of the internal configuration.
Use [NotificationService.updateConfig](#updateconfig) to modify settings.

***

### isSupported()

> **isSupported**(): `boolean`

Defined in: [electron/services/notifications/NotificationService.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L110)

Check if system notifications are supported on the current platform.

#### Returns

`boolean`

`true` if notifications are supported, `false` otherwise

#### Remarks

Uses Electron's built-in platform detection to determine notification support.
On unsupported platforms, notification methods will log warnings instead
of attempting to display notifications.

***

### notifyMonitorDown()

> **notifyMonitorDown**(`site`, `monitorId`): `void`

Defined in: [electron/services/notifications/NotificationService.ts:135](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L135)

Show a notification when a monitor goes down.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site containing the monitor that went down

##### monitorId

`string`

ID of the specific monitor that went down

#### Returns

`void`

#### Remarks

Displays a critical urgency notification with site name and monitor type.
Automatically skipped if down alerts are disabled in configuration or
if notifications are not supported on the current platform.

The notification includes:
- Site name for easy identification
- Monitor type (HTTP, port, etc.)
- Critical urgency level to ensure visibility

Error handling:
- Logs warning and skips notification if monitor not found
- Validates input parameters before processing
- Provides detailed error information for debugging

***

### notifyMonitorUp()

> **notifyMonitorUp**(`site`, `monitorId`): `void`

Defined in: [electron/services/notifications/NotificationService.ts:192](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L192)

Show a notification when a monitor comes back up.

#### Parameters

##### site

[`Site`](../../../../../shared/types/interfaces/Site.md)

The site containing the monitor that came back up

##### monitorId

`string`

ID of the specific monitor that was restored

#### Returns

`void`

#### Remarks

Displays a normal urgency notification indicating service restoration.
Automatically skipped if up alerts are disabled in configuration or
if notifications are not supported on the current platform.

The notification includes:
- Site name for easy identification
- Monitor type (HTTP, port, etc.)
- Normal urgency level (less intrusive than down alerts)

Error handling:
- Logs warning and skips notification if monitor not found
- Validates input parameters before processing
- Provides detailed error information for debugging

***

### updateConfig()

> **updateConfig**(`config`): `void`

Defined in: [electron/services/notifications/NotificationService.ts:255](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/notifications/NotificationService.ts#L255)

Update the notification configuration.

#### Parameters

##### config

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`NotificationConfig`](../interfaces/NotificationConfig.md)\>

Partial configuration object with settings to update

#### Returns

`void`

#### Remarks

Allows runtime modification of notification behavior without creating
a new service instance.

**Partial Update Behavior:**
- Only properties specified in the config parameter are updated
- Omitted properties retain their current values
- No properties are reset to default values
- Changes take effect immediately for subsequent notifications

#### Example

```typescript
// Only update showDownAlerts, showUpAlerts remains unchanged
service.updateConfig({ showDownAlerts: false });

// Update both properties
service.updateConfig({
  showDownAlerts: true,
  showUpAlerts: false
});
```
