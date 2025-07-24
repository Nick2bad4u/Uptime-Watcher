# Function: rowsToSettings()

> **rowsToSettings**(`rows`): [`SettingRow`](../interfaces/SettingRow.md)[]

Defined in: [electron/services/database/utils/settingsMapper.ts:41](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/settingsMapper.ts#L41)

Convert multiple database rows to SettingRow objects.

## Parameters

### rows

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>[]

Array of raw database rows

## Returns

[`SettingRow`](../interfaces/SettingRow.md)[]

Array of mapped SettingRow objects

## Remarks

Filters out invalid rows using isValidSettingRow before mapping to prevent
creation of settings with empty keys or invalid data.
