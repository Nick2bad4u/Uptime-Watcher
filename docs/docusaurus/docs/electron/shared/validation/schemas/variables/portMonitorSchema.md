# Variable: portMonitorSchema

> `const` **portMonitorSchema**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `host`: `ZodString`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `port`: `ZodNumber`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\` `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodLiteral`\<`"port"`\>; \`, `$strip`\>

Defined in: [shared/validation/schemas.ts:69](https://github.com/Nick2bad4u/Uptime-Watcher/blob/3cce0c3b352c8390536ca3c7399ece50a05faf18/shared/validation/schemas.ts#L69)
