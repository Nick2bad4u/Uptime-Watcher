# Function: hasProperties()

> **hasProperties**\<`K`\>(`value`, `properties`): `value is Record`K, unknown``

Defined in: [shared/utils/typeGuards.ts:27](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L27)

Determines if an object contains all specified properties.

## Type Parameters

### K

`K` *extends* `PropertyKey`

The type of property keys to check for.

## Parameters

### value

`unknown`

The value to check.

### properties

readonly `K`[]

An array of property keys that must be present on the value.

## Returns

`value is Record`K, unknown``

True if `value` is an object containing all specified properties; otherwise, false.

## Example

```ts
if (hasProperties(obj, ['foo', 'bar'])) {
  // obj has both 'foo' and 'bar' properties
}
```
