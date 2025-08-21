# Function: formatRelativeTimestamp()

> **formatRelativeTimestamp**(`timestamp`): `string`

Defined in: [src/utils/time.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/time.ts#L133)

Formats timestamp in a human-readable relative format.

## Parameters

### timestamp

`number`

Unix timestamp in milliseconds

## Returns

`string`

Relative time description

## Remarks

Shows how long ago the timestamp occurred relative to the current time.
Provides appropriate granularity based on the time difference: days for old
events, hours and minutes for recent events, and "Just now" for very recent
events.

## Example

```typescript
formatRelativeTimestamp(Date.now() - 120000); // "2 minutes ago"
formatRelativeTimestamp(Date.now() - 86400000); // "1 day ago"
formatRelativeTimestamp(Date.now() - 10000); // "Just now"
```
