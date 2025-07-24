# Function: safeStringify()

> **safeStringify**(`value`): `string`

Defined in: [shared/utils/stringConversion.ts:39](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/utils/stringConversion.ts#L39)

Safely convert a value to string, handling complex objects appropriately.

## Parameters

### value

`unknown`

Value to convert to string

## Returns

`string`

String representation of the value

## Remarks

This function provides safe string conversion that:
- Returns empty string for null/undefined values
- Preserves strings as-is
- Converts numbers and booleans using String()
- Uses JSON.stringify for objects when possible
- For objects that can't be JSON serialized, uses custom toString() if available
- Provides meaningful fallbacks for functions, symbols, and other types
- Never returns '[object Object]' - uses descriptive placeholders instead

This approach completely avoids the '[object Object]' issue by providing
meaningful string representations for all value types.

## Example

```typescript
safeStringify(null) // ""
safeStringify("hello") // "hello"
safeStringify(42) // "42"
safeStringify({a: 1}) // '{"a":1}'
safeStringify(() => {}) // "[Function]"
safeStringify(Symbol("test")) // "Symbol(test)"
const circular = {}; circular.self = circular;
safeStringify(circular) // "[Object]" (for circular references)
```
