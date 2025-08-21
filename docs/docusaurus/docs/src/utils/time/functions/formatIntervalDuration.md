# Function: formatIntervalDuration()

> **formatIntervalDuration**(`milliseconds`): `string`

Defined in: [src/utils/time.ts:102](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/time.ts#L102)

Formats time duration for monitoring intervals in a concise format.

## Parameters

### milliseconds

`number`

Time duration in milliseconds

## Returns

`string`

Concise formatted time string

## Remarks

Used for displaying check intervals in monitoring contexts where space is
limited. Automatically selects the most appropriate unit (seconds, minutes,
or hours) and rounds to whole numbers for simplicity.

## Example

```typescript
formatIntervalDuration(30000); // "30s"
formatIntervalDuration(300000); // "5m"
formatIntervalDuration(3600000); // "1h"
```
