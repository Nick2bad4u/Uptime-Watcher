# Function: safeJsonStringifyWithFallback()

> **safeJsonStringifyWithFallback**(`value`, `fallback`, `space?`): `string`

Defined in: [shared/utils/jsonSafety.ts:183](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/jsonSafety.ts#L183)

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
