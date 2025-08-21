# Function: rowsToSettings()

> **rowsToSettings**(`rows`): [`SettingRow`](../interfaces/SettingRow.md)[]

Defined in: [electron/services/database/utils/settingsMapper.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/settingsMapper.ts#L111)

Convert multiple database rows to SettingRow objects.

## Parameters

### rows

[`SettingsRow`](../../../../../../shared/types/database/interfaces/SettingsRow.md)[]

Array of raw database rows

## Returns

[`SettingRow`](../interfaces/SettingRow.md)[]

Array of mapped SettingRow objects

## Remarks

Filters out invalid rows using isValidSettingRow before mapping to prevent
creation of settings with empty keys or invalid data.
