# Type Alias: BaseMonitorSchemaType

> **BaseMonitorSchemaType** = `z.ZodObject`\<\` `checkInterval`: `z.ZodNumber`; `id`: `z.ZodString`; `lastChecked`: `z.ZodOptional`\<`z.ZodDate`\>; `monitoring`: `z.ZodBoolean`; `responseTime`: `z.ZodNumber`; `retryAttempts`: `z.ZodNumber`; `status`: `z.ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `z.ZodNumber`; `type`: `z.ZodEnum`\<\` `dns`: `"dns"`; `http`: `"http"`; `ping`: `"ping"`; `port`: `"port"`; \`\>; \}\>

Defined in: [shared/types/schemaTypes.ts:19](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/schemaTypes.ts#L19)

Type definition for base monitor schema.
