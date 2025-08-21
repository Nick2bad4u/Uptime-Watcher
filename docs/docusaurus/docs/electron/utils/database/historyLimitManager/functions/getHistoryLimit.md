# Function: getHistoryLimit()

> **getHistoryLimit**(`getHistoryLimitFn`): `number`

Defined in: [electron/utils/database/historyLimitManager.ts:68](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/database/historyLimitManager.ts#L68)

Get the current history limit.

Simple getter function that provides access to the history limit. This
indirection enables dependency injection and testability.

## Parameters

### getHistoryLimitFn

() => `number`

Function to retrieve the current history limit

## Returns

`number`

The current history limit
