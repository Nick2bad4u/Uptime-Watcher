# Function: deleteAllHistory()

> **deleteAllHistory**(`db`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:130](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/historyManipulation.ts#L130)

**`Internal`**

Clear all history from the database.

## Parameters

### db

`Database`

Database connection instance

## Returns

`void`

## Throws

Error When database deletion fails

## Remarks

**WARNING**: This operation is destructive and irreversible.

**Transaction Context**: Designed to be called from repository methods
that manage transaction context. Always used within HistoryRepository.deleteAllInternal().
