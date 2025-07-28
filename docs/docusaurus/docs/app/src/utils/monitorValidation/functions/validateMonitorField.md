# Function: validateMonitorField()

> **validateMonitorField**(`type`, `fieldName`, `value`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Defined in: [src/utils/monitorValidation.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/monitorValidation.ts#L131)

Validate individual monitor field with improved error filtering.

## Parameters

### type

Monitor type

`"http"` | `"port"`

### fieldName

`string`

Field name to validate

### value

`unknown`

Field value

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`string`[]\>

Promise resolving to validation errors (empty if valid)
