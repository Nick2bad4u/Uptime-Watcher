# Type Alias: DbValue

> **DbValue** = `null` \| `number` \| `string`

Defined in: [electron/services/database/utils/valueConverters.ts:17](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/electron/services/database/utils/valueConverters.ts#L17)

Type for database parameter values.

## Remarks

Represents the valid types that can be stored in SQLite database parameters.
- `null`: Represents SQL NULL values
- `number`: Represents INTEGER and REAL values
- `string`: Represents TEXT values
