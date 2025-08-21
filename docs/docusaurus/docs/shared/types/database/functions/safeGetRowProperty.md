# Function: safeGetRowProperty()

> **safeGetRowProperty**\<`T`\>(`row`, `property`, `defaultValue`): `T`

Defined in: [shared/types/database.ts:348](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/database.ts#L348)

Safely retrieves a property value from a database row object.

## Type Parameters

### T

`T`

The expected type of the property value.

## Parameters

### row

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

The database row object.

### property

`string`

The property name to access.

### defaultValue

`T`

The value to return if the property is missing or
  undefined.

## Returns

`T`

The property value if present; otherwise, the default value.

## Remarks

Returns the value of the specified property if it exists and is not
undefined; otherwise, returns the provided default value.

## Example

```typescript
const name = safeGetRowProperty(row, "name", "Unknown");
```
