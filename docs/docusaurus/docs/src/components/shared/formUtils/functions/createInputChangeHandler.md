# Function: createInputChangeHandler()

> **createInputChangeHandler**\<`T`\>(`setValue`, `validator?`): (`event`) => `void`

Defined in: [src/components/shared/formUtils.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/shared/formUtils.ts#L63)

Creates a standardized handler for input changes with validation

## Type Parameters

### T

`T`

## Parameters

### setValue

(`value`) => `void`

State setter function

### validator?

(`value`) => `boolean`

Optional validation function

## Returns

Input change handler

> (`event`): `void`

### Parameters

#### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLInputElement`](https://developer.mozilla.org/docs/Web/API/HTMLInputElement)\>

### Returns

`void`

## Example

```tsx
const handleNameChange = createInputChangeHandler(
    setName,
    (value) => value.length > 0
);
```
