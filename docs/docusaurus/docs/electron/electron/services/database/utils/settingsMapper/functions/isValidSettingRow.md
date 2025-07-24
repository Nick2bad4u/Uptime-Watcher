# Function: isValidSettingRow()

> **isValidSettingRow**(`row`): `boolean`

Defined in: [electron/services/database/utils/settingsMapper.ts:25](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/settingsMapper.ts#L25)

Validate that a row contains the minimum required fields for a setting.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Database row to validate

## Returns

`boolean`

True if row is valid
