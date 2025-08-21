# Function: timeoutMsToSeconds()

> **timeoutMsToSeconds**(`timeoutMs`): `number`

Defined in: [src/utils/timeoutUtils.ts:91](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L91)

Converts timeout from milliseconds to seconds for UI display.

## Parameters

### timeoutMs

`number`

Timeout value in milliseconds

## Returns

`number`

Timeout value in seconds (may include decimal places)

## Remarks

Performs direct division without rounding to preserve precision. For UI
display where whole seconds are preferred, consider using Math.round() or
Math.floor() on the result.

## Example

```typescript
const seconds = timeoutMsToSeconds(5000); // Returns 5
const precise = timeoutMsToSeconds(5500); // Returns 5.5
const rounded = Math.round(timeoutMsToSeconds(5500)); // Returns 6
```
