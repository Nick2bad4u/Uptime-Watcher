# Function: safeJsonStringify()

> **safeJsonStringify**(`value`, `space?`): [`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`string`\>

Defined in: [shared/utils/jsonSafety.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/jsonSafety.ts#L155)

Safely stringify any value to JSON.

## Parameters

### value

`unknown`

Value to stringify

### space?

Space parameter for JSON.stringify (for formatting)

`string` | `number`

## Returns

[`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`string`\>

Safe result object with JSON string or error

## Throws

Never throws - all errors are captured and returned in the result object

## Example

```typescript
const result = safeJsonStringify({ name: "John", age: 30 });
if (result.success) {
    console.log(result.data); // {"name":"John","age":30}
}
```
