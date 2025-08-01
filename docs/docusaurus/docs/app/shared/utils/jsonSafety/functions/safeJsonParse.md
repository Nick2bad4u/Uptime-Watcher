# Function: safeJsonParse()

> **safeJsonParse**\<`T`\>(`json`, `validator`): [`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`T`\>

Defined in: [shared/utils/jsonSafety.ts:38](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/jsonSafety.ts#L38)

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

## Throws

Never throws - all errors are captured and returned in the result object

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
