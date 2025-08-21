# Function: updateMonitorConfig()

> **updateMonitorConfig**(`config`): `void`

Defined in: [electron/services/monitoring/MonitorFactory.ts:302](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L302)

Updates configuration for all currently initialized monitor service
instances.

## Parameters

### config

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Monitor configuration object containing settings to apply to
  all monitor services.

## Returns

`void`

## Remarks

- Applies the provided configuration to all cached monitor service instances. -
  Only affects already-created instances; future instances require explicit
  config on creation. - Type-specific settings in the config object may be
  ignored by some monitor types if not applicable. - Errors during config
  update are logged and do not interrupt updates for other instances.

## Example

```typescript
updateMonitorConfig({ timeout: 10000 });
```

## See

[MonitorConfig](../../types/interfaces/MonitorConfig.md)
