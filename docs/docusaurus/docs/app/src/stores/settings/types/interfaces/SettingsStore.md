# Interface: SettingsStore

Defined in: [src/stores/settings/types.ts:23](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L23)

Settings store interface for managing application configuration.

## Remarks

Manages user preferences and application configuration with backend synchronization.
Provides methods for initializing, updating, and resetting application settings.

## Properties

### initializeSettings()

> **initializeSettings**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L25)

Initialize settings from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

***

### resetSettings()

> **resetSettings**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:37](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L37)

Reset all settings to default values with backend synchronization

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Promise resolving to operation result

#### Remarks

This method performs both local and backend reset operations.
Backend synchronization ensures settings are persisted across
application restarts and synchronized with other instances.

***

### settings

> **settings**: [`AppSettings`](../../../types/interfaces/AppSettings.md)

Defined in: [src/stores/settings/types.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L41)

Application settings

***

### syncFromBackend()

> **syncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:44](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L44)

Force synchronize settings from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

***

### updateHistoryLimitValue()

> **updateHistoryLimitValue**: (`limit`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/settings/types.ts:47](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L47)

Update history limit with backend sync

#### Parameters

##### limit

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### updateSettings()

> **updateSettings**: (`settings`) => `void`

Defined in: [src/stores/settings/types.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/stores/settings/types.ts#L50)

Update multiple settings at once

#### Parameters

##### settings

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`AppSettings`](../../../types/interfaces/AppSettings.md)\>

#### Returns

`void`
