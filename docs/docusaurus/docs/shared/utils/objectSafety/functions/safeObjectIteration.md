# Function: safeObjectIteration()

> **safeObjectIteration**(`obj`, `callback`, `context`): `void`

Defined in: [shared/utils/objectSafety.ts:75](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/utils/objectSafety.ts#L75)

Safely iterate over object entries with type safety and error handling.

## Parameters

### obj

`unknown`

Object to iterate over (can be unknown)

### callback

(`key`, `value`) => `void`

Function to call for each entry

### context

`string` = `"Safe object iteration"`

Optional context for error logging

## Returns

`void`

Void
