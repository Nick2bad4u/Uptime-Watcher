# Function: safeGetFormProperty()

> **safeGetFormProperty**\<`T`\>(`data`, `property`, `defaultValue`): `T`

Defined in: [src/types/monitorFormData.ts:136](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/types/monitorFormData.ts#L136)

Safely get a property from dynamic form data.

## Type Parameters

### T

`T`

## Parameters

### data

[`DynamicFormData`](../interfaces/DynamicFormData.md)

Form data object

### property

`string`

Property name to access

### defaultValue

`T`

Default value if property is undefined

## Returns

`T`

Property value or default
