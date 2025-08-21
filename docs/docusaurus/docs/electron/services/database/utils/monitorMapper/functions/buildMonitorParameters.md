# Function: buildMonitorParameters()

> **buildMonitorParameters**(`siteIdentifier`, `monitor`): [`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

Defined in: [electron/services/database/utils/monitorMapper.ts:179](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/monitorMapper.ts#L179)

Builds a parameter array for inserting or updating a monitor in the database.

## Parameters

### siteIdentifier

`string`

The unique identifier of the site this monitor
  belongs to.

### monitor

[`Monitor`](../../../../../../shared/types/interfaces/Monitor.md)

The monitor object to convert.

## Returns

[`DbValue`](../../valueConverters/type-aliases/DbValue.md)[]

An array of values for SQL parameterized queries.

## Remarks

Converts a monitor object to a row format using the dynamic schema system,
then returns an array of values in the order expected by the SQL statement.
All values are type-safe and nulls are used for missing/undefined fields.

## Example

```typescript
const params = buildMonitorParameters("site-123", monitorObj);
db.run("INSERT INTO monitors (...) VALUES (?, ?, ...)", params);
```

## Throws

Error if mapping or parameter generation fails.

## See

 - [mapMonitorToRow](../../dynamicSchema/functions/mapMonitorToRow.md)
 - [generateSqlParameters](../../dynamicSchema/functions/generateSqlParameters.md)
