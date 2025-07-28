# Function: safeJsonStringifyWithFallback()

> **safeJsonStringifyWithFallback**(`value`, `fallback`, `space?`): `string`

Defined in: [shared/utils/jsonSafety.ts:193](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/jsonSafety.ts#L193)

Safely stringify value with fallback.

## Parameters

### value

`unknown`

Value to stringify

### fallback

`string`

Fallback string if stringification fails

### space?

Space parameter for JSON.stringify (for formatting)

`string` | `number`

## Returns

`string`

JSON string if successful, fallback if failed

## Throws

Never throws - stringification errors result in fallback value being returned

## Example

```typescript
const jsonString = safeJsonStringifyWithFallback(data, "{}");
```
