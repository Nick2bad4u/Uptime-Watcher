# Function: settingsToRecord()

> **settingsToRecord**(`settings`): `Record`\<`string`, `string`\>

Defined in: [electron/services/database/utils/settingsMapper.ts:138](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/settingsMapper.ts#L138)

Convert SettingRow array to a Record object mapping keys to values.

## Parameters

### settings

[`SettingRow`](../interfaces/SettingRow.md)[]

Array of SettingRow objects

## Returns

`Record`\<`string`, `string`\>

Record mapping keys to values

## Remarks

**Validation**: Uses type-specific validation to ensure data integrity
without awkward type casting.

**Duplicate Key Handling**: If multiple settings have the same key,
the last occurrence will be used. This follows JavaScript object
property assignment semantics.

**Type Safety**: Uses proper SettingRow validation instead of casting
to generic Record type for better type safety.
