# Function: setHistoryLimit()

> **setHistoryLimit**(`params`): [`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

Defined in: [electron/utils/database/historyLimitManager.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/utils/database/historyLimitManager.ts#L74)

Set the history retention limit and prune older history entries if needed.

Limit behavior:
- 0 or negative: Disables history retention (unlimited)
- 1-9: Will be increased to minimum of 10
- 10+: Used as specified

## Parameters

### params

`SetHistoryLimitParams`

Parameters for setting history limit

## Returns

[`Promise`](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Promise)\<`void`\>

## Throws

Error when database operations fail
