# Variable: httpMonitorSchema

> `const` **httpMonitorSchema**: `ZodObject`\<[`HttpMonitor`](../type-aliases/HttpMonitor.md)\>

Defined in: [shared/validation/schemas.ts:74](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L74)

Zod schema for HTTP monitor fields.

## Remarks

Extends [baseMonitorSchema](baseMonitorSchema.md) and adds the `url` field with robust validation.
