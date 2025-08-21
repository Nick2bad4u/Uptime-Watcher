# Function: isBaseMonitorType()

> **isBaseMonitorType**(`type`): type is "http" \| "port" \| "ping" \| "dns"

Defined in: [electron/services/monitoring/monitorTypes.ts:66](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/electron/services/monitoring/monitorTypes.ts#L66)

Type guard to check if a string is a valid base monitor type.

## Parameters

### type

`string`

The string to check against base monitor types

## Returns

type is "http" \| "port" \| "ping" \| "dns"

True if the type is a known base monitor type

## Remarks

This function only validates against BASE monitor types (http, port). It does
NOT check against dynamically registered types in the registry. For full type
checking including dynamic types, use the registry.

## Example

```typescript
if (isBaseMonitorType("http")) {
    // TypeScript knows this is a valid MonitorType
}
```

## See

MonitorTypeRegistry.isValidType for complete type checking
