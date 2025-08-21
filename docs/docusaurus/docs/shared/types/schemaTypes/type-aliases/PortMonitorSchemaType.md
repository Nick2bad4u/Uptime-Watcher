# Type Alias: PortMonitorSchemaType

> **PortMonitorSchemaType** = `z.ZodObject`\<\` `checkInterval`: `z.ZodNumber`; `host`: `z.ZodString`; `id`: `z.ZodString`; `lastChecked`: `z.ZodOptional`\<`z.ZodDate`\>; `monitoring`: `z.ZodBoolean`; `port`: `z.ZodNumber`; `responseTime`: `z.ZodNumber`; `retryAttempts`: `z.ZodNumber`; `status`: `z.ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `z.ZodNumber`; `type`: `z.ZodLiteral`\<`"port"`\>; \}\>

Defined in: [shared/types/schemaTypes.ts:226](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/schemaTypes.ts#L226)

Type definition for port monitor schema.
