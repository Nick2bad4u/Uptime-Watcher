# Variable: FALLBACK\_MONITOR\_TYPE\_OPTIONS

> `const` **FALLBACK\_MONITOR\_TYPE\_OPTIONS**: readonly \[\` `label`: `"HTTP (Website/API)"`; `value`: `"http"`; \`, \` `label`: `"Port (Host/Port)"`; `value`: `"port"`; \`\]

Defined in: [src/constants.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/src/constants.ts#L28)

Fallback monitor type options when backend loading fails.
These match the core monitor types available in the system.

## Remarks

Used as a fallback to ensure the UI remains functional even when
the backend monitor type registry is unavailable. These should
match the BASE_MONITOR_TYPES defined in shared/types.ts.
