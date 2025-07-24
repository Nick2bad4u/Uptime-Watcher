# Interface: SettingsStore

Defined in: [src/stores/settings/types.ts:12](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/settings/types.ts#L12)

Settings store interface.
Manages user preferences and application configuration.

## Properties

### initializeSettings()

> **initializeSettings**: () => `Promise`\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:14](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/settings/types.ts#L14)

Initialize settings from backend

#### Returns

`Promise`\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

***

### resetSettings()

> **resetSettings**: () => `void`

Defined in: [src/stores/settings/types.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/settings/types.ts#L17)

Reset all settings to default values

#### Returns

`void`

***

### settings

> **settings**: [`AppSettings`](../../../types/interfaces/AppSettings.md)

Defined in: [src/stores/settings/types.ts:21](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/settings/types.ts#L21)

Application settings

***

### updateHistoryLimitValue()

> **updateHistoryLimitValue**: (`limit`) => `Promise`\<`void`\>

Defined in: [src/stores/settings/types.ts:24](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/settings/types.ts#L24)

Update history limit with backend sync

#### Parameters

##### limit

`number`

#### Returns

`Promise`\<`void`\>

***

### updateSettings()

> **updateSettings**: (`settings`) => `void`

Defined in: [src/stores/settings/types.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/src/stores/settings/types.ts#L28)

Update multiple settings at once

#### Parameters

##### settings

`Partial`\<[`AppSettings`](../../../types/interfaces/AppSettings.md)\>

#### Returns

`void`
