# Function: rowToSettingValue()

> **rowToSettingValue**(`row`): `undefined` \| `string`

Defined in: [electron/services/database/utils/settingsMapper.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/settingsMapper.ts#L110)

Convert a single database row to a setting value.

## Parameters

### row

Raw database row

`undefined` | `Record`\<`string`, `unknown`\>

## Returns

`undefined` \| `string`

Setting value as string or undefined if not found

## Throws

Error When safeStringify conversion fails for complex objects

## Remarks

**Falsy Value Handling**: Preserves all falsy values except null/undefined.
Empty strings, 0, and false are converted to their string representations.
Only null and undefined values return undefined.

**Error Propagation**: Errors from `safeStringify()` are propagated to caller
for proper error handling. This typically occurs with circular reference objects.

**Edge Cases**:
- Missing `row.value` field returns undefined
- Complex objects are JSON.stringify'd by safeStringify
- Malformed data structures may throw during conversion
