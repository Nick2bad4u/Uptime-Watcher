# Function: safeJsonParseArray()

> **safeJsonParseArray**\<`T`\>(`json`, `elementValidator`): [`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`T`[]\>

Defined in: [shared/utils/jsonSafety.ts:78](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/jsonSafety.ts#L78)

Parse JSON array with element validation.

## Type Parameters

### T

`T`

## Parameters

### json

`string`

JSON string to parse

### elementValidator

(`item`) => `item is T`

Type guard for array elements

## Returns

[`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`T`[]\>

Safe result object with validated array or error

## Throws

Never throws - all errors are captured and returned in the result object

## Example

```typescript
const result = safeJsonParseArray(
    jsonString,
    (item): item is User => typeof item === "object" && item !== null
);
```
