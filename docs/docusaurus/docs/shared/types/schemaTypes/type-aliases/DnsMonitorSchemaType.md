# Type Alias: DnsMonitorSchemaType

> **DnsMonitorSchemaType** = `z.ZodObject`\<\` `checkInterval`: `z.ZodNumber`; `expectedValue`: `z.ZodOptional`\<`z.ZodString`\>; `host`: `z.ZodString`; `id`: `z.ZodString`; `lastChecked`: `z.ZodOptional`\<`z.ZodDate`\>; `monitoring`: `z.ZodBoolean`; `recordType`: `z.ZodEnum`\<\{ `A`: `"A"`; `AAAA`: `"AAAA"`; `ANY`: `"ANY"`; `CAA`: `"CAA"`; `CNAME`: `"CNAME"`; `MX`: `"MX"`; `NAPTR`: `"NAPTR"`; `NS`: `"NS"`; `PTR`: `"PTR"`; `SOA`: `"SOA"`; `SRV`: `"SRV"`; `TLSA`: `"TLSA"`; `TXT`: `"TXT"`; \`\>; `responseTime`: `z.ZodNumber`; `retryAttempts`: `z.ZodNumber`; `status`: `z.ZodEnum`\<\` `down`: `"down"`; `paused`: `"paused"`; `pending`: `"pending"`; `up`: `"up"`; \`\>; `timeout`: `z.ZodNumber`; `type`: `z.ZodLiteral`\<`"dns"`\>; \}\>

Defined in: [shared/types/schemaTypes.ts:187](https://github.com/Nick2bad4u/Uptime-Watcher/blob/main/shared/types/schemaTypes.ts#L187)

Type definition for DNS monitor schema.
