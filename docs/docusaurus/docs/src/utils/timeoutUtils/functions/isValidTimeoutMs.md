# Function: isValidTimeoutMs()

> **isValidTimeoutMs**(`timeoutMs`): `boolean`

Defined in: [src/utils/timeoutUtils.ts:138](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L138)

Validates timeout value in milliseconds.

## Parameters

### timeoutMs

`number`

Timeout value in milliseconds

## Returns

`boolean`

True if the timeout is valid, false otherwise

## Remarks

Checks if a timeout value is within acceptable system bounds. Used for
backend validation before storing or using timeout values.

## Example

```typescript
const isValid = isValidTimeoutMs(5000); // true for 5 seconds
const isTooShort = isValidTimeoutMs(100); // false if below minimum
```
