# Function: getMonitorTypeDisplayLabel()

> **getMonitorTypeDisplayLabel**(`monitorType`): `string`

Defined in: [src/utils/fallbacks.ts:206](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/utils/fallbacks.ts#L206)

Generate display label for monitor type dynamically.
Replaces hardcoded backward compatibility patterns.

## Parameters

### monitorType

`string`

Type of monitor

## Returns

`string`

Display label for the monitor type

## Remarks

This function uses a configuration-driven approach to support new monitor types
without requiring code changes. To add support for a new monitor type:
1. Add an entry to MONITOR_TYPE_LABELS
2. The function will automatically use the new label

## Example

```typescript
getMonitorTypeDisplayLabel("http"); // "Website URL"
getMonitorTypeDisplayLabel("port"); // "Host & Port"
getMonitorTypeDisplayLabel("unknown"); // "Unknown Monitor"
```
