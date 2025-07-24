# Function: deleteAllHistory()

> **deleteAllHistory**(`db`): `void`

Defined in: [electron/services/database/utils/historyManipulation.ts:125](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/electron/services/database/utils/historyManipulation.ts#L125)

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
