# Type Alias: CacheValue

> **CacheValue** = [`BaseValidationResult`](../../validation/interfaces/BaseValidationResult.md) \| [`ConfigValue`](ConfigValue.md) \| [`ErrorInfo`](../interfaces/ErrorInfo.md) \| [`MonitorData`](../interfaces/MonitorData.md) \| [`MonitorTypeConfig`](../../monitorTypes/interfaces/MonitorTypeConfig.md) \| [`MonitorTypeConfigArray`](MonitorTypeConfigArray.md) \| [`UIState`](../interfaces/UIState.md) \| [`ValidationResultArray`](ValidationResultArray.md)

Defined in: [shared/types/configTypes.ts:110](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/configTypes.ts#L110)

Cache value types for different cache domains.

## Remarks

Provides better typing for cached values based on their usage domain.
Includes support for MonitorTypeConfig and arrays of monitor configurations.
All unknown types have been replaced with specific type unions for type
safety.
