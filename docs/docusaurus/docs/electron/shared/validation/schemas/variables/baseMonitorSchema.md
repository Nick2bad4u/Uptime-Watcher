# Variable: baseMonitorSchema

> `const` **baseMonitorSchema**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\` `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodEnum`\<\` `http`: `"http"`; `port`: `"port"`; \`\>; \`, `$strip`\>

Defined in: [shared/validation/schemas.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/validation/schemas.ts#L28)
