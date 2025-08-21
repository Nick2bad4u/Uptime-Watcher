# Function: isDate()

> **isDate**(`value`): `value is Date`

Defined in: [shared/utils/typeGuards.ts:160](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/typeGuards.ts#L160)

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
