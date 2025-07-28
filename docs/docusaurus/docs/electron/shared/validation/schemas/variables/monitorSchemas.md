# Variable: monitorSchemas

> `const` **monitorSchemas**: `object`

Defined in: [shared/validation/schemas.ts:150](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L150)

Organized monitor schemas by type.

## Type declaration

### http

> `readonly` **http**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodLiteral`\<`"http"`\>; `url`: `ZodString`; \}, `$strip`\> = `httpMonitorSchema`

### port

> `readonly` **port**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `host`: `ZodString`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `port`: `ZodNumber`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodLiteral`\<`"port"`\>; \}, `$strip`\> = `portMonitorSchema`

## Remarks

Useful for dynamic schema selection.
