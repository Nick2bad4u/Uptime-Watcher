# Interface: AppSettings

Defined in: [src/stores/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L17)

Application settings interface.
Manages user preferences and application configuration.

## Properties

### autoStart

> **autoStart**: `boolean`

Defined in: [src/stores/types.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L19)

Auto-start monitoring when the application launches

***

### historyLimit

> **historyLimit**: `number`

Defined in: [src/stores/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L21)

Maximum number of history records to keep per monitor

***

### minimizeToTray

> **minimizeToTray**: `boolean`

Defined in: [src/stores/types.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L23)

Minimize to system tray instead of closing the application

***

### notifications

> **notifications**: `boolean`

Defined in: [src/stores/types.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L25)

Enable desktop notifications for status changes

***

### soundAlerts

> **soundAlerts**: `boolean`

Defined in: [src/stores/types.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L27)

Enable sound alerts for status changes

***

### theme

> **theme**: [`ThemeName`](../../../theme/types/type-aliases/ThemeName.md)

Defined in: [src/stores/types.ts:29](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/types.ts#L29)

Current theme name (light, dark, etc.)
