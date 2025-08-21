# Function: safeJsonStringifyWithFallback()

> **safeJsonStringifyWithFallback**(`value`, `fallback`, `space?`): `string`

Defined in: [shared/utils/jsonSafety.ts:247](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/jsonSafety.ts#L247)

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

## Example

```typescript
const jsonString = safeJsonStringifyWithFallback(data, "{}");
```

## Throws

Never throws - stringification errors result in fallback value being
  returned
