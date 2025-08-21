# Variable: httpMonitorSchema

> `const` **httpMonitorSchema**: [`HttpMonitorSchemaType`](../../../types/schemaTypes/type-aliases/HttpMonitorSchemaType.md)\<[`HttpMonitor`](../type-aliases/HttpMonitor.md)\>

Defined in: [shared/validation/schemas.ts:155](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/validation/schemas.ts#L155)

Zod schema for HTTP monitor fields.

## Remarks

Extends [baseMonitorSchema](baseMonitorSchema.md) and adds the `url` field with robust
validation.
