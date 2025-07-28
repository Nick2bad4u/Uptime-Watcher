# Variable: baseMonitorSchema

> `const` **baseMonitorSchema**: `ZodObject`\<\` `checkInterval`: `ZodNumber`; `id`: `ZodString`; `lastChecked`: `ZodOptional`\<`ZodDate`\>; `monitoring`: `ZodBoolean`; `responseTime`: `ZodNumber`; `retryAttempts`: `ZodNumber`; `status`: `ZodEnum`\<\{ `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `ZodNumber`; `type`: `ZodEnum`\<\` `http`: `"http"`; `port`: `"port"`; \`\>; \}, `$strip`\>

Defined in: [shared/validation/schemas.ts:40](https://github.com/Nick2bad4u/Uptime-Watcher/blob/8a1973382d5fe14c52996ecda381894eb7ecd4a6/shared/validation/schemas.ts#L40)

Zod schema for base monitor fields shared by all monitor types.

## Remarks

This schema is extended by type-specific monitor schemas.
