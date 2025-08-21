# Function: queryForIds()

> **queryForIds**(`db`, `sql`, `params?`): [`IdOnlyResult`](../interfaces/IdOnlyResult.md)[]

Defined in: [electron/services/database/utils/typedQueries.ts:89](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/typedQueries.ts#L89)

Type-safe wrapper for database queries that return arrays of records with ID
fields.

## Parameters

### db

`Database`

Database instance

### sql

`string`

SQL query string that selects id fields

### params?

[`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

Query parameters

## Returns

[`IdOnlyResult`](../interfaces/IdOnlyResult.md)[]

Array of objects with id: number

## Remarks

This function centralizes the type assertion for queries that select ID
fields. It's safe because we control the SQL and know it returns numeric
IDs.
