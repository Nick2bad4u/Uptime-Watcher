# Function: safeJsonParseArray()

> **safeJsonParseArray**\<`T`\>(`json`, `elementValidator`): [`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`T`[]\>

Defined in: [shared/utils/jsonSafety.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/jsonSafety.ts#L74)

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

## Example

```typescript
const result = safeJsonParseArray(
    jsonString,
    (item): item is User => typeof item === "object" && item !== null
);
```
