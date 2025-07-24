# Function: debounce()

> **debounce**\<`T`\>(`function_`, `wait`): (...`arguments_`) => `void`

Defined in: [src/stores/utils.ts:99](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/src/stores/utils.ts#L99)

Debounce utility for store actions with automatic cleanup.

## Type Parameters

### T

`T` *extends* `unknown`[]

## Parameters

### function\_

(...`arguments_`) => `void`

Function to debounce

### wait

`number`

Wait time in milliseconds before executing

## Returns

Debounced version of the input function

> (...`arguments_`): `void`

### Parameters

#### arguments\_

...`T`

### Returns

`void`

## Remarks

This utility prevents rapid successive calls to expensive operations like
API requests or state updates. It uses a Map to track timeouts per unique
argument combination, allowing different argument sets to be debounced independently.

## Example

```typescript
const debouncedSave = debounce(saveSettings, 500);
debouncedSave(newSettings); // Will only execute after 500ms of no new calls
```
