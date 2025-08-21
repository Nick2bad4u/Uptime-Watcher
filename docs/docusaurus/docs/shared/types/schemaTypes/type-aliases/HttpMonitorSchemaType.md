# Type Alias: HttpMonitorSchemaType

> **HttpMonitorSchemaType** = `z.ZodObject`\<\` `checkInterval`: `z.ZodNumber`; `id`: `z.ZodString`; `lastChecked`: `z.ZodOptional`\<`z.ZodDate`\>; `monitoring`: `z.ZodBoolean`; `responseTime`: `z.ZodNumber`; `retryAttempts`: `z.ZodNumber`; `status`: `z.ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `z.ZodNumber`; `type`: `z.ZodLiteral`\<`"http"`\>; `url`: `z.ZodString`; \}\>

Defined in: [shared/types/schemaTypes.ts:46](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/schemaTypes.ts#L46)

Type definition for HTTP monitor schema.
