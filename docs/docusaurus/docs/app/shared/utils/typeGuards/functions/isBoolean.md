# Function: isBoolean()

> **isBoolean**(`value`): `value is boolean`

Defined in: [shared/utils/typeGuards.ts:94](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L94)

Determines if a value is a boolean.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is boolean`

True if `value` is a boolean; otherwise, false.

## Example

```ts
if (isBoolean(flag)) {
  // flag is boolean
}
```
