# Function: createSelectChangeHandler()

> **createSelectChangeHandler**\<`T`\>(`setValue`, `converter?`): (`event`) => `void`

Defined in: [src/components/shared/formUtils.ts:93](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/components/shared/formUtils.ts#L93)

Creates a standardized handler for select changes

## Type Parameters

### T

`T`

## Parameters

### setValue

(`value`) => `void`

State setter function

### converter?

(`value`) => `T`

Optional value converter function

## Returns

Select change handler

> (`event`): `void`

### Parameters

#### event

[`ChangeEvent`](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/80449050d0e5e84f44ffa3fd3dc5651e4747e589/types/react/index.d.ts#L2018)\<[`HTMLSelectElement`](https://developer.mozilla.org/docs/Web/API/HTMLSelectElement)\>

### Returns

`void`

## Example

```tsx
const handleTimeoutChange = createSelectChangeHandler(
    setTimeout,
    (value) => parseInt(value, 10)
);
```
