# Function: validateMonitorField()

> **validateMonitorField**(`type`, `fieldName`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Defined in: [src/utils/monitorValidation.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/monitorValidation.ts#L141)

Validate individual monitor field with improved error filtering.

## Parameters

### type

Monitor type

`"http"` | `"port"` | `"ping"` | `"dns"`

### fieldName

`string`

Field name to validate

### value

`unknown`

Field value

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to validation errors (empty if valid)
