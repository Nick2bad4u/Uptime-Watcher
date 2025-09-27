/**
 * Zod schema type definitions for validation schemas.
 */
import type * as z from "zod";

interface MonitorStatusEnumShape {
    readonly degraded: "degraded";
    readonly down: "down";
    readonly paused: "paused";
    readonly pending: "pending";
    readonly up: "up";
}

interface MonitorTypeEnumShape {
    readonly dns: "dns";
    readonly http: "http";
    readonly ping: "ping";
    readonly port: "port";
    readonly ssl: "ssl";
}

type MonitorStatusEnumType = z.ZodEnum<MonitorStatusEnumShape>;
type MonitorTypeEnumType = z.ZodEnum<MonitorTypeEnumShape>;

type MonitorHistoryStatusEnumShape = Pick<
    MonitorStatusEnumShape,
    "degraded" | "down" | "up"
>;

type MonitorHistoryEntrySchemaType = z.ZodObject<{
    details: z.ZodOptional<z.ZodString>;
    responseTime: z.ZodNumber;
    status: z.ZodEnum<MonitorHistoryStatusEnumShape>;
    timestamp: z.ZodNumber;
}>;

interface SharedMonitorShape<TypeField extends z.ZodType> {
    activeOperations: z.ZodOptional<z.ZodArray<z.ZodString>>;
    checkInterval: z.ZodNumber;
    history: z.ZodArray<MonitorHistoryEntrySchemaType>;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnumType;
    timeout: z.ZodNumber;
    type: TypeField;
}

type DnsRecordTypeEnum = z.ZodEnum<{
    readonly A: "A";
    readonly AAAA: "AAAA";
    readonly ANY: "ANY";
    readonly CAA: "CAA";
    readonly CNAME: "CNAME";
    readonly MX: "MX";
    readonly NAPTR: "NAPTR";
    readonly NS: "NS";
    readonly PTR: "PTR";
    readonly SOA: "SOA";
    readonly SRV: "SRV";
    readonly TLSA: "TLSA";
    readonly TXT: "TXT";
}>;

export type BaseMonitorSchemaType = z.ZodObject<
    SharedMonitorShape<MonitorTypeEnumType>
>;

export type HttpMonitorSchemaType = z.ZodObject<
    SharedMonitorShape<z.ZodLiteral<"http">> & {
        url: z.ZodString;
    }
>;

export type PortMonitorSchemaType = z.ZodObject<
    SharedMonitorShape<z.ZodLiteral<"port">> & {
        host: z.ZodString;
        port: z.ZodNumber;
    }
>;

export type PingMonitorSchemaType = z.ZodObject<
    SharedMonitorShape<z.ZodLiteral<"ping">> & {
        host: z.ZodString;
    }
>;

export type DnsMonitorSchemaType = z.ZodObject<
    SharedMonitorShape<z.ZodLiteral<"dns">> & {
        expectedValue: z.ZodOptional<z.ZodString>;
        host: z.ZodString;
        recordType: DnsRecordTypeEnum;
    }
>;

export type SslMonitorSchemaType = z.ZodObject<
    SharedMonitorShape<z.ZodLiteral<"ssl">> & {
        certificateWarningDays: z.ZodNumber;
        host: z.ZodString;
        port: z.ZodNumber;
    }
>;

export type MonitorSchemaType = z.ZodDiscriminatedUnion<
    [
        HttpMonitorSchemaType,
        PortMonitorSchemaType,
        PingMonitorSchemaType,
        DnsMonitorSchemaType,
        SslMonitorSchemaType,
    ]
>;

export type SiteSchemaType = z.ZodObject<{
    identifier: z.ZodString;
    monitoring: z.ZodBoolean;
    monitors: z.ZodArray<MonitorSchemaType>;
    name: z.ZodString;
}>;

export interface MonitorSchemas {
    readonly dns: DnsMonitorSchemaType;
    readonly http: HttpMonitorSchemaType;
    readonly ping: PingMonitorSchemaType;
    readonly port: PortMonitorSchemaType;
    readonly ssl: SslMonitorSchemaType;
}
