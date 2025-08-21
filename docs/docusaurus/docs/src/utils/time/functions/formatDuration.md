# Function: formatDuration()

> **formatDuration**(`ms`): `string`

Defined in: [src/utils/time.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/time.ts#L46)

Formats duration in a human-readable format with appropriate time units.

## Parameters

### ms

`number`

Duration in milliseconds

## Returns

`string`

Formatted duration string

## Remarks

Automatically selects the most appropriate time units for readability. Shows
hours and minutes for longer durations, minutes and seconds for medium
durations, and seconds only for short durations.

## Example

```typescript
formatDuration(7200000); // "2h 0m"
formatDuration(135000); // "2m 15s"
formatDuration(45000); // "45s"
```
