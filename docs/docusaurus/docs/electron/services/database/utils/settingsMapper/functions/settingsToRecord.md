# Function: settingsToRecord()

> **settingsToRecord**(`settings`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Defined in: [electron/services/database/utils/settingsMapper.ts:190](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/settingsMapper.ts#L190)

Convert SettingRow array to a Record object mapping keys to values.

## Parameters

### settings

[`SettingRow`](../interfaces/SettingRow.md)[]

Array of SettingRow objects

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `string`\>

Record mapping keys to values

## Remarks

**Validation**: Uses type-specific validation to ensure data integrity
without awkward type casting.

**Duplicate Key Handling**: If multiple settings have the same key, the last
occurrence will be used. This follows JavaScript object property assignment
semantics.

**Type Safety**: Uses proper SettingRow validation instead of casting to
generic Record type for better type safety.
