# Function: safeObjectIteration()

> **safeObjectIteration**(`obj`, `callback`, `context`): `void`

Defined in: [shared/utils/objectSafety.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/utils/objectSafety.ts#L68)

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

void
