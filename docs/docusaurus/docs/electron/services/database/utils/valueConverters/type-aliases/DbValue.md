# Type Alias: DbValue

> **DbValue** = `null` \| `number` \| `string`

Defined in: [electron/services/database/utils/valueConverters.ts:18](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/database/utils/valueConverters.ts#L18)

Type for database parameter values.

## Remarks

Represents the valid types that can be stored in SQLite database parameters.

- `null`: Represents SQL NULL values
- `number`: Represents INTEGER and REAL values
- `string`: Represents TEXT values
