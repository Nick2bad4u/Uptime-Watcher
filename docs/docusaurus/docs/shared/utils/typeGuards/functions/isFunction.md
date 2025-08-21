# Function: isFunction()

> **isFunction**(`value`): `value is (args: unknown[]) => unknown`

Defined in: [shared/utils/typeGuards.ts:202](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeGuards.ts#L202)

Determines if a value is a function.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is (args: unknown[]) => unknown`

True if `value` is a function; otherwise, false.

## Example

```ts
if (isFunction(fn)) {
    // fn is (...args: unknown[]) => unknown
}
```
