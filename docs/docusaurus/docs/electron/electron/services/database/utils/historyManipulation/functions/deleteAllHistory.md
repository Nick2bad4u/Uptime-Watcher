# Function: deleteAllHistory()

> **deleteAllHistory**(`db`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/electron/services/database/utils/historyManipulation.ts#L125)

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
