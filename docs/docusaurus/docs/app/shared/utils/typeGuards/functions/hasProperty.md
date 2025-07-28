# Function: hasProperty()

> **hasProperty**\<`K`\>(`value`, `property`): `value is Record`K, unknown``

Defined in: [shared/utils/typeGuards.ts:49](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L49)

Determines if an object contains a specific property.

## Type Parameters

### K

`K` *extends* `PropertyKey`

The property key to check for.

## Parameters

### value

`unknown`

The value to check.

### property

`K`

The property key that must be present on the value.

## Returns

`value is Record`K, unknown``

True if `value` is an object containing the specified property; otherwise, false.

## Example

```ts
if (hasProperty(obj, 'foo')) {
  // obj has the 'foo' property
}
```
