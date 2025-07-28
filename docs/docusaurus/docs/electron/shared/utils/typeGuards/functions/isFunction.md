# Function: isFunction()

> **isFunction**(`value`): `value is (args: unknown[]) => unknown`

Defined in: [shared/utils/typeGuards.ts:148](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L148)

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
