# Type Alias: PingMonitorSchemaType

> **PingMonitorSchemaType** = `z.ZodObject`\<\` `checkInterval`: `z.ZodNumber`; `host`: `z.ZodString`; `id`: `z.ZodString`; `lastChecked`: `z.ZodOptional`\<`z.ZodDate`\>; `monitoring`: `z.ZodBoolean`; `responseTime`: `z.ZodNumber`; `retryAttempts`: `z.ZodNumber`; `status`: `z.ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `z.ZodNumber`; `type`: `z.ZodLiteral`\<`"ping"`\>; \}\>

Defined in: [shared/types/schemaTypes.ts:164](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/schemaTypes.ts#L164)

Type definition for ping monitor schema.
