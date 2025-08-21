# Type Alias: ConfigValue

> **ConfigValue** = `boolean` \| `null` \| `number` \| `string` \| `string`[]

Defined in: [shared/types/configTypes.ts:133](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/configTypes.ts#L133)

Union type representing all possible configuration values.

## Remarks

Configuration values are stored as strings in the database but can represent:

- Strings: theme names, language codes, etc.
- Numbers: history limits, timeouts, etc. (stored as string representations)
- Booleans: feature flags, etc. (stored as "true"/"false")
- Arrays: stored as JSON strings
