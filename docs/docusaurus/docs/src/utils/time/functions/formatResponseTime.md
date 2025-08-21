# Function: formatResponseTime()

> **formatResponseTime**(`time?`): `string`

Defined in: [src/utils/time.ts:201](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/time.ts#L201)

Formats response time in a human-readable format with automatic unit
selection.

## Parameters

### time?

`number`

Response time in milliseconds (optional)

## Returns

`string`

Formatted time string or fallback message

## Remarks

Automatically chooses between milliseconds and seconds based on the magnitude
of the response time. Provides a fallback message for undefined or null
values. Optimized for displaying network response times in monitoring
interfaces.

## Example

```typescript
formatResponseTime(234); // "234ms"
formatResponseTime(1230); // "1.23s"
formatResponseTime(0); // "0ms"
formatResponseTime(null); // "N/A" (or configured fallback)
```
