# Function: isDate()

> **isDate**(`value`): `value is Date`

Defined in: [shared/utils/typeGuards.ts:111](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/typeGuards.ts#L111)

Determines if a value is a valid `Date` instance.

## Parameters

### value

`unknown`

The value to check.

## Returns

`value is Date`

True if `value` is a valid `Date` object; otherwise, false.

## Example

```ts
if (isDate(dateCandidate)) {
  // dateCandidate is a Date
}
```
