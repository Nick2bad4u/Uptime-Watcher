# Interface: SettingsStore

Defined in: [src/stores/settings/types.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/settings/types.ts#L12)

Settings store interface.
Manages user preferences and application configuration.

## Properties

### initializeSettings()

> **initializeSettings**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/settings/types.ts#L14)

Initialize settings from backend

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

***

### resetSettings()

> **resetSettings**: () => `void`

Defined in: [src/stores/settings/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/settings/types.ts#L17)

Reset all settings to default values

#### Returns

`void`

***

### settings

> **settings**: [`AppSettings`](../../../types/interfaces/AppSettings.md)

Defined in: [src/stores/settings/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/settings/types.ts#L21)

Application settings

***

### updateHistoryLimitValue()

> **updateHistoryLimitValue**: (`limit`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/settings/types.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/settings/types.ts#L24)

Update history limit with backend sync

#### Parameters

##### limit

`number`

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

***

### updateSettings()

> **updateSettings**: (`settings`) => `void`

Defined in: [src/stores/settings/types.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/src/stores/settings/types.ts#L28)

Update multiple settings at once

#### Parameters

##### settings

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`AppSettings`](../../../types/interfaces/AppSettings.md)\>

#### Returns

`void`
