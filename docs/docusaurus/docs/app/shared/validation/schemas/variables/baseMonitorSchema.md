# Variable: baseMonitorSchema

> `const` **baseMonitorSchema**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\` `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodEnum`\<\` `http`: `"http"`; `port`: `"port"`; \`\>; \`, `$strip`\>

Defined in: [shared/validation/schemas.ts:28](https://github.com/Nick2bad4u/Uptime-Watcher/blob/dca5483e793478722cd3e6e125cafcec5fc771f0/shared/validation/schemas.ts#L28)
