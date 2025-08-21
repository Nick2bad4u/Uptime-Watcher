# Function: formatFullTimestamp()

> **formatFullTimestamp**(`timestamp`): `string`

Defined in: [src/utils/time.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/time.ts#L78)

Formats timestamp as a full localized date/time string.

## Parameters

### timestamp

`number`

Unix timestamp in milliseconds

## Returns

`string`

Localized date/time string

## Remarks

Uses the user's locale settings to format the timestamp according to their
regional preferences. Suitable for displaying detailed timestamp information
in logs or detailed views.

## Example

```typescript
formatFullTimestamp(1640995200000); // "12/31/2021, 4:00:00 PM" (US locale)
```
