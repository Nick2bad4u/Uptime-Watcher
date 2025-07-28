# Function: isValidUrl()

> **isValidUrl**(`value`): `value is string`

Defined in: [shared/utils/typeGuards.ts:246](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L246)

Determines if a value is a valid URL string.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is string`

True if `value` is a string representing a valid URL; otherwise, false.

## Example

```ts
if (isValidUrl(str)) {
  // str is a valid URL string
}
```
