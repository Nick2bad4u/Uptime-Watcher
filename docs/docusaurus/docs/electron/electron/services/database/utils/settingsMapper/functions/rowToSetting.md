# Function: rowToSetting()

> **rowToSetting**(`row`): [`SettingRow`](../interfaces/SettingRow.md)

Defined in: [electron/services/database/utils/settingsMapper.ts:60](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/settingsMapper.ts#L60)

Convert a database row to a SettingRow object.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Raw database row

## Returns

[`SettingRow`](../interfaces/SettingRow.md)

Mapped SettingRow object

## Throws

Error When row has invalid key

## Remarks

Handles type conversion and ensures consistent data transformation
across all settings-related database operations. Uses precise type checking
instead of loose falsy checks for better type safety.
