# Function: getMonitorWithResult()

> **getMonitorWithResult**(`type`, `config?`, `forceConfigUpdate?`): [`MonitorServiceResult`](../interfaces/MonitorServiceResult.md)

Defined in: [electron/services/monitoring/MonitorFactory.ts:161](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/MonitorFactory.ts#L161)

Retrieves the monitor service instance with configuration application status.

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

[`MonitorServiceResult`](../interfaces/MonitorServiceResult.md)

Result object containing the service instance and configuration
  status.

## Remarks

Same as [getMonitor](getMonitor.md) but returns detailed result including configuration
application status. Use this method when you need to know if configuration
was successfully applied.

## Example

```typescript
const result = getMonitorWithResult("http", { timeout: 5000 });
if (!result.configurationApplied && result.configurationError) {
    console.warn("Config failed:", result.configurationError);
}
```

## Throws

Error If the monitor type is not supported or no service
  factory is registered for the type.
