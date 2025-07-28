# Function: timeoutSecondsToMs()

> **timeoutSecondsToMs**(`timeoutSeconds`): `number`

Defined in: [src/utils/timeoutUtils.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/timeoutUtils.ts#L75)

Convert timeout from seconds to milliseconds for backend storage.

## Parameters

### timeoutSeconds

`number`

Timeout in seconds (accepts fractional values)

## Returns

`number`

Timeout in milliseconds (result may be fractional if input has decimal places)

## Remarks

Performs direct multiplication without rounding. Fractional seconds are preserved
as fractional milliseconds. For whole millisecond values, ensure input is whole seconds.
