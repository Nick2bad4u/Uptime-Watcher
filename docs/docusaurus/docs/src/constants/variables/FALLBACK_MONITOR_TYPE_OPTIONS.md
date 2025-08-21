# Variable: FALLBACK\_MONITOR\_TYPE\_OPTIONS

> `const` **FALLBACK\_MONITOR\_TYPE\_OPTIONS**: readonly \[\` `label`: `"HTTP (Website/API)"`; `value`: `"http"`; \`, \` `label`: `"Port (Host/Port)"`; `value`: `"port"`; \`, \` `label`: `"Ping (Host)"`; `value`: `"ping"`; \`\]

Defined in: [src/constants.ts:63](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/src/constants.ts#L63)

Fallback monitor type options when backend loading fails.

## Remarks

Used as a fallback to ensure the UI remains functional even when the backend
monitor type registry is unavailable. These should match the
BASE_MONITOR_TYPES defined in shared/types.ts.

## Example

```typescript
const options = FALLBACK_MONITOR_TYPE_OPTIONS;
// Result: [
//   { label: "HTTP (Website/API)", value: "http" },
//   { label: "Port (Host/Port)", value: "port" },
//   { label: "Ping (Host)", value: "ping" }
// ]
```
