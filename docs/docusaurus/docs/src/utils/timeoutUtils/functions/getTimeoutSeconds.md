# Function: getTimeoutSeconds()

> **getTimeoutSeconds**(`monitorTimeout?`): `number`

Defined in: [src/utils/timeoutUtils.ts:114](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/timeoutUtils.ts#L114)

Gets timeout in seconds from monitor configuration with default fallback.

## Parameters

### monitorTimeout?

`number`

Monitor timeout in milliseconds (optional)

## Returns

`number`

Timeout in seconds

## Remarks

Provides a safe way to extract timeout values from monitor configurations.
Always returns a valid timeout value, using the system default when monitor
timeout is not specified.

## Example

```typescript
const timeout1 = getTimeoutSeconds(); // Returns default timeout
const timeout2 = getTimeoutSeconds(5000); // Returns 5 seconds
```
