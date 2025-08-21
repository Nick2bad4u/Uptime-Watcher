# Interface: NotificationConfig

Defined in: [electron/services/notifications/NotificationService.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/notifications/NotificationService.ts#L24)

Configuration options for the notification service.

## Remarks

Controls which types of monitor status change notifications are displayed to
the user. Both settings can be independently enabled or disabled.

## Properties

### showDownAlerts

> **showDownAlerts**: `boolean`

Defined in: [electron/services/notifications/NotificationService.ts:26](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/notifications/NotificationService.ts#L26)

Whether to show notifications when monitors go down

***

### showUpAlerts

> **showUpAlerts**: `boolean`

Defined in: [electron/services/notifications/NotificationService.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/notifications/NotificationService.ts#L28)

Whether to show notifications when monitors come back up
