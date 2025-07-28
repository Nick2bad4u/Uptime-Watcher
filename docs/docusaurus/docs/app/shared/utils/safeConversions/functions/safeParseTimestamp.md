# Function: safeParseTimestamp()

> **safeParseTimestamp**(`value`, `defaultValue?`): `number`

Defined in: [shared/utils/safeConversions.ts:262](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/safeConversions.ts#L262)

Safely converts a value to a timestamp with fallback.

## Parameters

### value

`unknown`

Value to convert to timestamp

### defaultValue?

`number`

Fallback value if conversion fails (default: current time)

## Returns

`number`

Valid timestamp in milliseconds, or the default value

## Remarks

Validates that the timestamp is positive and not unreasonably far in the future
(allows up to 1 day ahead to account for clock skew). Uses current time as
default when no defaultValue is provided. Useful for validating timestamps
from external sources.

## Example

```typescript
safeParseTimestamp("1640995200000") // Valid timestamp
safeParseTimestamp("0") // Current time (invalid)
safeParseTimestamp("-1000") // Current time (negative)
const future = Date.now() + 86400000 * 2; // 2 days ahead
safeParseTimestamp(future.toString()) // Current time (too far in future)
```
