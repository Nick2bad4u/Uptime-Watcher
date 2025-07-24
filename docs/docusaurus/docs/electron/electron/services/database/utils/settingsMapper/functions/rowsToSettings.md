# Function: rowsToSettings()

> **rowsToSettings**(`rows`): [`SettingRow`](../interfaces/SettingRow.md)[]

Defined in: [electron/services/database/utils/settingsMapper.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/electron/services/database/utils/settingsMapper.ts#L41)

Convert multiple database rows to SettingRow objects.

## Parameters

### rows

`Record`\<`string`, `unknown`\>[]

Array of raw database rows

## Returns

[`SettingRow`](../interfaces/SettingRow.md)[]

Array of mapped SettingRow objects

## Remarks

Filters out invalid rows using isValidSettingRow before mapping to prevent
creation of settings with empty keys or invalid data.
