# Function: safeJsonParse()

> **safeJsonParse**\<`T`\>(`json`, `validator`): [`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`T`\>

Defined in: [shared/utils/jsonSafety.ts:36](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/jsonSafety.ts#L36)

Safely parse JSON string with type validation.

## Type Parameters

### T

`T`

## Parameters

### json

`string`

JSON string to parse

### validator

(`data`) => `data is T`

Type guard function to validate the parsed data

## Returns

[`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`T`\>

Safe result object with parsed data or error

## Example

```typescript
const result = safeJsonParse(jsonString, (data): data is User => {
    return typeof data === "object" && data !== null &&
           typeof data.id === "string" && typeof data.name === "string";
});

if (result.success) {
    console.log(result.data.name); // Type-safe access
} else {
    console.error(result.error);
}
```
