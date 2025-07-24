# Interface: NotificationConfig

Defined in: [electron/services/notifications/NotificationService.ts:15](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/notifications/NotificationService.ts#L15)

Configuration options for the notification service.

## Remarks

Controls which types of monitor status change notifications are displayed
to the user. Both settings can be independently enabled or disabled.

## Properties

### showDownAlerts

> **showDownAlerts**: `boolean`

Defined in: [electron/services/notifications/NotificationService.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/notifications/NotificationService.ts#L17)

Whether to show notifications when monitors go down

***

### showUpAlerts

> **showUpAlerts**: `boolean`

Defined in: [electron/services/notifications/NotificationService.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/notifications/NotificationService.ts#L19)

Whether to show notifications when monitors come back up
