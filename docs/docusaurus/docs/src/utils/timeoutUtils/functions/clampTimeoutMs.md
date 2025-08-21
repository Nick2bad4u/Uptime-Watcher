# Function: clampTimeoutMs()

> **clampTimeoutMs**(`timeoutMs`): `number`

Defined in: [src/utils/timeoutUtils.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L39)

Clamps timeout to valid range in milliseconds.

## Parameters

### timeoutMs

`number`

Timeout value in milliseconds

## Returns

`number`

Clamped timeout value within valid range

## Remarks

Ensures timeout values are within system-defined bounds to prevent extreme
values that could cause performance issues or timeouts that are too short to
be useful.

## Example

```typescript
const clamped = clampTimeoutMs(100); // Returns minimum valid timeout
const large = clampTimeoutMs(999999); // Returns maximum valid timeout
```
