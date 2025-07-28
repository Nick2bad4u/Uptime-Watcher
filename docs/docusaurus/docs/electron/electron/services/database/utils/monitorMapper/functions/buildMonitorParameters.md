# Function: buildMonitorParameters()

> **buildMonitorParameters**(`siteIdentifier`, `monitor`): [`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

Defined in: [electron/services/database/utils/monitorMapper.ts:76](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/monitorMapper.ts#L76)

Builds a parameter array for inserting or updating a monitor in the database.

## Parameters

### siteIdentifier

`string`

The unique identifier of the site this monitor belongs to.

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor object to convert.

## Returns

[`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

An array of values for SQL parameterized queries.

## Remarks

Converts a monitor object to a row format using the dynamic schema system, then
returns an array of values in the order expected by the SQL statement.
All values are type-safe and nulls are used for missing/undefined fields.

## Throws

Error if mapping or parameter generation fails.

## Example

```typescript
const params = buildMonitorParameters("site-123", monitorObj);
db.run("INSERT INTO monitors (...) VALUES (?, ?, ...)", params);
```

## See

 - [mapMonitorToRow](../../dynamicSchema/functions/mapMonitorToRow.md)
 - [generateSqlParameters](../../dynamicSchema/functions/generateSqlParameters.md)
