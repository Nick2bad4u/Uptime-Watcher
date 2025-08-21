# Function: isValidTimeoutSeconds()

> **isValidTimeoutSeconds**(`timeoutSeconds`): `boolean`

Defined in: [src/utils/timeoutUtils.ts:163](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L163)

Validates timeout value in seconds.

## Parameters

### timeoutSeconds

`number`

Timeout value in seconds

## Returns

`boolean`

True if the timeout is valid, false otherwise

## Remarks

Checks if a timeout value is within acceptable user-facing bounds. Used for
UI validation before converting to milliseconds for storage.

## Example

```typescript
const isValid = isValidTimeoutSeconds(30); // true for 30 seconds
const isTooLong = isValidTimeoutSeconds(1000); // false if above maximum
```
