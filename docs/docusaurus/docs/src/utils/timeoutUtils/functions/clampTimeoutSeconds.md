# Function: clampTimeoutSeconds()

> **clampTimeoutSeconds**(`timeoutSeconds`): `number`

Defined in: [src/utils/timeoutUtils.ts:64](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L64)

Clamps timeout to valid range in seconds.

## Parameters

### timeoutSeconds

`number`

Timeout value in seconds

## Returns

`number`

Clamped timeout value within valid range

## Remarks

Ensures timeout values are within user-friendly bounds for UI display. Works
with second-based values that are more intuitive for users.

## Example

```typescript
const userInput = clampTimeoutSeconds(0.5); // Returns minimum valid timeout
const reasonable = clampTimeoutSeconds(30); // Returns 30 if within bounds
```
