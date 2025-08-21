# Variable: portMonitorSchema

> `const` **portMonitorSchema**: [`PortMonitorSchemaType`](../../../types/schemaTypes/type-aliases/PortMonitorSchemaType.md)\<[`PortMonitor`](../type-aliases/PortMonitor.md)\>

Defined in: [shared/validation/schemas.ts:184](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L184)

Zod schema for port monitor fields.

## Remarks

Extends [baseMonitorSchema](baseMonitorSchema.md) and adds `host` and `port` fields with
strict validation.
