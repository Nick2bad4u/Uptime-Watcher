# shared/types/configTypes

Configuration value type definitions for the Uptime Watcher application.

## Remarks

These types provide better type safety for configuration values stored in the
database and used throughout the application. All values are stored as
strings in the database but represent different underlying types.

## Interfaces

- [ErrorInfo](interfaces/ErrorInfo.md)
- [KnownConfigValues](interfaces/KnownConfigValues.md)
- [MonitorCheckResult](interfaces/MonitorCheckResult.md)
- [MonitorData](interfaces/MonitorData.md)
- [UIState](interfaces/UIState.md)

## Type Aliases

- [CacheValue](type-aliases/CacheValue.md)
- [ConfigValue](type-aliases/ConfigValue.md)
- [MonitorStatus](type-aliases/MonitorStatus.md)
- [MonitorTypeConfigArray](type-aliases/MonitorTypeConfigArray.md)
- [ValidationResultArray](type-aliases/ValidationResultArray.md)
