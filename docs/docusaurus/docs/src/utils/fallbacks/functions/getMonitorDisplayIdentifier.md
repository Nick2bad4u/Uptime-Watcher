# Function: getMonitorDisplayIdentifier()

> **getMonitorDisplayIdentifier**(`monitor`, `siteFallback`): `string`

Defined in: [src/utils/fallbacks.ts:231](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/utils/fallbacks.ts#L231)

Generate display identifier for a monitor dynamically. Replaces hardcoded
backward compatibility patterns.

## Parameters

### monitor

[`Monitor`](../../../../shared/types/interfaces/Monitor.md)

Monitor object

### siteFallback

`string`

Fallback site identifier

## Returns

`string`

Display identifier string

## Remarks

This function uses a configuration-driven approach to support new monitor
types without requiring code changes. To add support for a new monitor type:

1. Add an entry to MONITOR_IDENTIFIER_GENERATORS with a function that extracts
   the identifier 2. The function will automatically use the new generator

## Example

```typescript
// HTTP monitor
getMonitorDisplayIdentifier(
    { type: "http", url: "https://example.com" },
    "Site"
);
// Returns: "https://example.com"

// Port monitor
getMonitorDisplayIdentifier(
    { type: "port", host: "example.com", port: 80 },
    "Site"
);
// Returns: "example.com:80"

// Unknown type
getMonitorDisplayIdentifier({ type: "unknown" }, "My Site");
// Returns: "My Site"
```
