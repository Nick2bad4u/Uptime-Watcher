# Function: insertWithReturning()

> **insertWithReturning**(`db`, `sql`, `params?`): [`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Defined in: [electron/services/database/utils/typedQueries.ts:42](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/typedQueries.ts#L42)

Type-safe wrapper for INSERT queries with RETURNING clause.

## Parameters

### db

`Database`

Database instance

### sql

`string`

INSERT SQL with RETURNING clause

### params?

[`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

Query parameters

## Returns

[`Record`](https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeys-type)\<`string`, `unknown`\>

Inserted record with generated fields

## Remarks

This function handles INSERT...RETURNING queries which return the inserted
record. Commonly used for getting auto-generated IDs. Callers should cast the
result to the expected type.
