# Function: safeJsonStringify()

> **safeJsonStringify**(`value`, `space?`): [`SafeJsonResult`](../interfaces/SafeJsonResult.md)\<`string`\>

Defined in: [shared/utils/jsonSafety.ts:147](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/utils/jsonSafety.ts#L147)

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

## Example

```typescript
const result = safeJsonStringify({ name: "John", age: 30 });
if (result.success) {
    console.log(result.data); // {"name":"John","age":30}
}
```
