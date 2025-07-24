# Variable: monitorSchemas

> `const` **monitorSchemas**: `object`

Defined in: [shared/validation/schemas.ts:106](https://github.com/Nick2bad4u/Uptime-Watcher/blob/2a45eeb1723f8f7089001af2c92aa07d82dfe7e4/shared/validation/schemas.ts#L106)

## Type declaration

### http

> `readonly` **http**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodLiteral`\<`"http"`\>; `url`: `ZodString`; \}, `$strip`\> = `httpMonitorSchema`

### port

> `readonly` **port**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `host`: `ZodString`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `port`: `ZodNumber`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodLiteral`\<`"port"`\>; \}, `$strip`\> = `portMonitorSchema`
