# Function: isArray()

> **isArray**\<`T`\>(`value`, `itemValidator?`): `value is T[]`

Defined in: [shared/utils/typeGuards.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeGuards.ts#L111)

Determines if a value is an array, optionally validating each item.

## Type Parameters

### T

`T` = `unknown`

The type of array items, inferred by the optional validator.

## Parameters

### value

`unknown`

The value to check.

### itemValidator?

(`item`) => `item is T`

Optional type guard to validate each item in the
  array.

## Returns

`value is T[]`

True if `value` is an array (and all items pass `itemValidator`, if
  provided); otherwise, false.

## Example

```ts
if (isArray(arr, isString)) {
    // arr is string[]
}
```
