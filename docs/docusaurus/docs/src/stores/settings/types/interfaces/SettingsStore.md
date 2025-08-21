# Interface: SettingsStore

Defined in: [src/stores/settings/types.ts:32](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L32)

Settings store interface for managing application configuration.

## Remarks

Comprehensive interface for settings management that provides:

- Initialization from backend and local storage
- Real-time settings updates with persistence
- Backend synchronization for critical values
- Reset functionality to restore defaults
- History limit management with validation

All operations include error handling and logging for debugging and user
feedback purposes.

## Properties

### initializeSettings()

> **initializeSettings**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:50](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L50)

Initializes settings from backend and local storage.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `settingsLoaded`: `boolean`; `success`: `boolean`; \`\>

Promise resolving to initialization result with status
  indicators

#### Remarks

Performs comprehensive settings initialization by:

- Loading saved settings from persistent storage
- Synchronizing critical values with backend
- Merging default values for missing settings
- Handling initialization errors gracefully

Should be called during application startup to ensure settings are
properly configured.

***

### resetSettings()

> **resetSettings**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L73)

Resets all settings to default values with backend synchronization.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Promise resolving to reset operation result

#### Remarks

Performs a complete settings reset by:

- Restoring all settings to default values
- Synchronizing reset values with backend
- Updating persistent storage
- Providing user feedback on operation status

This operation cannot be undone and affects all user preferences. Backend
synchronization ensures settings are persisted across application
restarts and synchronized with other instances.

***

### settings

> **settings**: [`AppSettings`](../../../types/interfaces/AppSettings.md)

Defined in: [src/stores/settings/types.ts:83](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L83)

Current application settings configuration.

#### Remarks

Contains all user preferences and application configuration including
theme settings, notification preferences, monitoring parameters, and
other customizable options.

***

### syncFromBackend()

> **syncFromBackend**: () => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Defined in: [src/stores/settings/types.ts:96](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L96)

Forces synchronization of settings from backend storage.

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<\` `message`: `string`; `success`: `boolean`; \`\>

Promise resolving to synchronization result with status
  indicators

#### Remarks

Fetches the latest settings from backend storage and merges them with
current local settings. Used to ensure consistency between frontend state
and backend storage, especially after external configuration changes.

***

### updateHistoryLimitValue()

> **updateHistoryLimitValue**: (`limit`) => [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [src/stores/settings/types.ts:115](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L115)

Updates history retention limit with backend synchronization.

#### Parameters

##### limit

`number`

New history limit value in number of records

#### Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Promise that resolves when update is complete

#### Remarks

Updates the history limit setting with special handling:

- Validates the new limit value
- Synchronizes with backend immediately
- Updates local state and persistent storage

This setting is critical for data management and requires immediate
backend synchronization.

***

### updateSettings()

> **updateSettings**: (`settings`) => `void`

Defined in: [src/stores/settings/types.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/stores/settings/types.ts#L130)

Updates multiple application settings with persistence.

#### Parameters

##### settings

[`Partial`](https://www.typescriptlang.org/docs/handbook/utility-types.html#partialtype)\<[`AppSettings`](../../../types/interfaces/AppSettings.md)\>

Partial settings object with values to update

#### Returns

`void`

#### Remarks

Updates one or more settings values with automatic persistence to local
storage. Changes are merged with existing settings to preserve unmodified
values.

For critical settings that require backend synchronization, use the
specific update methods instead.
