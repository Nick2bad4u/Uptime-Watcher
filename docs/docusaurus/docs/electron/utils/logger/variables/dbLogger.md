# Variable: dbLogger

> `const` **dbLogger**: `Logger`

Defined in: [electron/utils/logger.ts:159](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/utils/logger.ts#L159)

Database-specific logger for database operations and queries.

## Remarks

Uses "DB" prefix for clear categorization of database-related logs. Ideal for
logging SQL queries, connection events, migration operations, and database
performance metrics.

## Example

```typescript
import { dbLogger } from "./logger";

dbLogger.debug("Executing query", { sql: "SELECT * FROM sites" });
dbLogger.info("Database migration completed", { version: "1.2.0" });
dbLogger.error("Connection pool exhausted", connectionError);
```
