# Function: safeStringify()

> **safeStringify**(`value`): `string`

Defined in: [shared/utils/stringConversion.ts:51](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/stringConversion.ts#L51)

Safely converts any value to a string, handling all JavaScript types with
meaningful and predictable output.

## Parameters

### value

`unknown`

The value to convert to a string. Can be any JavaScript type.

## Returns

`string`

The string representation of the input value.

## Remarks

This function provides comprehensive string conversion logic:
- Returns an empty string for `null` or `undefined`.
- Returns the value as-is if it is already a string.
- Converts numbers and booleans using `String()`.
- For objects, attempts to use [safeJsonStringifyWithFallback](../../jsonSafety/functions/safeJsonStringifyWithFallback.md) for serialization.
  If serialization fails (e.g., circular references), returns a descriptive placeholder.
- For functions, returns the string `"[Function]"`.
- For symbols, returns the result of `Symbol.prototype.toString()`.
- For all other types, returns `"[Unknown Type]"`.

This approach guarantees that the result is always a string and never the
ambiguous '[object Object]'. It is suitable for logging, UI display, and
database storage where type safety and clarity are required.

## Example

```typescript
safeStringify(null); // ""
safeStringify("hello"); // "hello"
safeStringify(42); // "42"
safeStringify({ a: 1 }); // '{"a":1}'
safeStringify(() => {}); // "[Function]"
safeStringify(Symbol("test")); // "Symbol(test)"
const circular: any = {}; circular.self = circular;
safeStringify(circular); // "[Complex Object]"
```

## See

[safeJsonStringifyWithFallback](../../jsonSafety/functions/safeJsonStringifyWithFallback.md)
