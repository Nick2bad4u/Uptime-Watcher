# Variable: portMonitorSchema

> `const` **portMonitorSchema**: `ZodObject`\<[`PortMonitor`](../type-aliases/PortMonitor.md)\>

Defined in: [shared/validation/schemas.ts:98](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L98)

Zod schema for port monitor fields.

## Remarks

Extends [baseMonitorSchema](baseMonitorSchema.md) and adds `host` and `port` fields with strict validation.
