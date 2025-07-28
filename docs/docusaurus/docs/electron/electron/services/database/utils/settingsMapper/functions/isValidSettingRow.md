# Function: isValidSettingRow()

> **isValidSettingRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/settingsMapper.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/settingsMapper.ts#L25)

Validate that a row contains the minimum required fields for a setting.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row to validate

## Returns

`boolean`

True if row is valid
