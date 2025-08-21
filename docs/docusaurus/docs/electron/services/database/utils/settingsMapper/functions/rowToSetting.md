# Function: rowToSetting()

> **rowToSetting**(`row`): [`SettingRow`](../interfaces/SettingRow.md)

Defined in: [electron/services/database/utils/settingsMapper.ts:73](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/settingsMapper.ts#L73)

Convert a database row to a SettingRow object.

## Parameters

### row

[`SettingsRow`](../../../../../../shared/types/database/interfaces/SettingsRow.md)

Raw database row

## Returns

[`SettingRow`](../interfaces/SettingRow.md)

Mapped SettingRow object

## Remarks

Handles type conversion and ensures consistent data transformation across all
settings-related database operations. Uses precise type checking instead of
loose falsy checks for better type safety.

## Throws

Error When row has invalid key
