# Function: timeoutSecondsToMs()

> **timeoutSecondsToMs**(`timeoutSeconds`): `number`

Defined in: [src/utils/timeoutUtils.ts:190](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L190)

Converts timeout from seconds to milliseconds for backend storage.

## Parameters

### timeoutSeconds

`number`

Timeout value in seconds (accepts fractional values)

## Returns

`number`

Timeout value in milliseconds (may be fractional)

## Remarks

Performs direct multiplication without rounding to preserve precision.
Fractional seconds are preserved as fractional milliseconds. For whole
millisecond values, ensure input is whole seconds.

## Example

```typescript
const ms = timeoutSecondsToMs(5); // Returns 5000
const precise = timeoutSecondsToMs(5.5); // Returns 5500
const fractional = timeoutSecondsToMs(0.1); // Returns 100
```
