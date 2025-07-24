# Function: rowsToSettings()

> **rowsToSettings**(`rows`): [`SettingRow`](../interfaces/SettingRow.md)[]

Defined in: [electron/services/database/utils/settingsMapper.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/settingsMapper.ts#L41)

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
