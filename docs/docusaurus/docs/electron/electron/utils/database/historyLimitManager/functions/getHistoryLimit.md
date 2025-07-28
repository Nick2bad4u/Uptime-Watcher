# Function: getHistoryLimit()

> **getHistoryLimit**(`getHistoryLimitFn`): `number`

Defined in: [electron/utils/database/historyLimitManager.ts:59](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/historyLimitManager.ts#L59)

Get the current history limit.

Simple getter function that provides access to the history limit.
This indirection enables dependency injection and testability.

## Parameters

### getHistoryLimitFn

() => `number`

Function to retrieve the current history limit

## Returns

`number`

The current history limit
