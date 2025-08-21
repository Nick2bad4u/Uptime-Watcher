# Function: queryForCount()

> **queryForCount**(`db`, `sql`, `params?`): `undefined` \| [`CountResult`](../interfaces/CountResult.md)

Defined in: [electron/services/database/utils/typedQueries.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/typedQueries.ts#L66)

Type-safe wrapper for count queries.

## Parameters

### db

`Database`

Database instance

### sql

`string`

SQL query that returns a count

### params?

[`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

Query parameters

## Returns

`undefined` \| [`CountResult`](../interfaces/CountResult.md)

Count result object

## Remarks

This function handles COUNT() queries which return ``count: number``.
