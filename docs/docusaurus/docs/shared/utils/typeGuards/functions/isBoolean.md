# Function: isBoolean()

> **isBoolean**(`value`): `value is boolean`

Defined in: [shared/utils/typeGuards.ts:141](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeGuards.ts#L141)

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
