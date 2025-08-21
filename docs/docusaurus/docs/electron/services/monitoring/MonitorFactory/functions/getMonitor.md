# Function: getMonitor()

> **getMonitor**(`type`, `config?`, `forceConfigUpdate?`): [`IMonitorService`](../../types/interfaces/IMonitorService.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:269](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L269)

Retrieves the monitor service instance for a given monitor type, creating it
if necessary.

## Parameters

### type

The monitor type string. Must be a valid registered type.

`"http"` | `"port"` | `"ping"` | `"dns"`

### config?

[`MonitorConfig`](../../types/interfaces/MonitorConfig.md)

Optional monitor configuration to apply to the instance.

### forceConfigUpdate?

`boolean` = `false`

If true, updates the configuration on an existing
  instance even if already set.

## Returns

[`IMonitorService`](../../types/interfaces/IMonitorService.md)

The monitor service instance for the specified type.

## Remarks

- Validates the monitor type against the registry.
- Uses the singleton pattern: returns the cached instance if available,
  otherwise creates a new one. - If a configuration is provided, updates the
  instance's configuration if forced or if the instance is new. - Throws if
  the monitor type is unsupported or if no factory is registered for the
  type.
- Configuration failures are logged but do not prevent service retrieval.

## Example

```typescript
const monitor = getMonitor("http", { timeout: 5000 });
```

## Throws

Error If the monitor type is not supported or no service
  factory is registered for the type.

## See

 - [IMonitorService](../../types/interfaces/IMonitorService.md)
 - [MonitorConfig](../../types/interfaces/MonitorConfig.md)
 - [getMonitorServiceFactory](../../MonitorTypeRegistry/functions/getMonitorServiceFactory.md)
 - [isValidMonitorType](../../MonitorTypeRegistry/functions/isValidMonitorType.md)
 - [getMonitorWithResult](getMonitorWithResult.md) for version that returns configuration status
