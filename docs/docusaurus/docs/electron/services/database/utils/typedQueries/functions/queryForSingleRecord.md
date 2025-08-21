# Function: queryForSingleRecord()

> **queryForSingleRecord**(`db`, `sql`, `params?`): `undefined` \| [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/typedQueries.ts:131](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/typedQueries.ts#L131)

Type-safe wrapper for database queries that return a single record or
undefined.

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

`undefined` \| [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Single record or undefined

## Remarks

This function centralizes the type assertion for single-record queries.
Callers should cast the result to the expected type.
