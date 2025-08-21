# Function: queryForRecords()

> **queryForRecords**\<`T`\>(`db`, `sql`, `params?`): `T`[]

Defined in: [electron/services/database/utils/typedQueries.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/typedQueries.ts#L110)

Type-safe wrapper for database queries that return arrays of records.

## Type Parameters

### T

`T` *extends* [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\> = [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

## Parameters

### db

`Database`

Database instance

### sql

`string`

SQL query string

### params?

[`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

Query parameters

## Returns

`T`[]

Array of records

## Remarks

This function centralizes the type assertion for multi-record queries. Use
this when you know the SQL structure and expected return type.
