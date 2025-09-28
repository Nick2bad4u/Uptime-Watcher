/**
 * Zod schema type definitions for validation schemas.
 */
import type * as z from "zod";

type ActiveOperationsArray = z.ZodOptional<z.ZodArray<z.ZodString>>;

type HistoryEntrySchema = z.ZodObject<{
    details: z.ZodOptional<z.ZodString>;
    responseTime: z.ZodNumber;
    status: z.ZodEnum<{
        degraded: "degraded";
        down: "down";
        up: "up";
    }>;
    timestamp: z.ZodNumber;
}>;

type HistoryArray = z.ZodArray<HistoryEntrySchema>;

type MonitorStatusEnum = z.ZodEnum<{
    degraded: "degraded";
    down: "down";
    paused: "paused";
    pending: "pending";
    up: "up";
}>;

type MonitorTypeEnum = z.ZodEnum<{
    dns: "dns";
    http: "http";
    "http-keyword": "http-keyword";
    "http-status": "http-status";
    ping: "ping";
    port: "port";
    ssl: "ssl";
}>;

type DnsRecordEnum = z.ZodEnum<{
    A: "A";
    AAAA: "AAAA";
    ANY: "ANY";
    CAA: "CAA";
    CNAME: "CNAME";
    MX: "MX";
    NAPTR: "NAPTR";
    NS: "NS";
    PTR: "PTR";
    SOA: "SOA";
    SRV: "SRV";
    TLSA: "TLSA";
    TXT: "TXT";
}>;

export type BaseMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: MonitorTypeEnum;
}>;

export type HttpMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http">;
    url: z.ZodString;
}>;

export type HttpKeywordMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    bodyKeyword: z.ZodString;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http-keyword">;
    url: z.ZodString;
}>;

export type HttpStatusMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    expectedStatusCode: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http-status">;
    url: z.ZodString;
}>;

export type PortMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    port: z.ZodNumber;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"port">;
}>;

export type PingMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"ping">;
}>;

export type DnsMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    expectedValue: z.ZodOptional<z.ZodString>;
    history: HistoryArray;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    recordType: DnsRecordEnum;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"dns">;
}>;

export type SslMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    certificateWarningDays: z.ZodNumber;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    host: z.ZodString;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    port: z.ZodNumber;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"ssl">;
}>;

export type MonitorSchemaType = z.ZodDiscriminatedUnion<
    [
        HttpMonitorSchemaType,
        HttpKeywordMonitorSchemaType,
        HttpStatusMonitorSchemaType,
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
    readonly "http-keyword": HttpKeywordMonitorSchemaType;
    readonly "http-status": HttpStatusMonitorSchemaType;
    readonly ping: PingMonitorSchemaType;
    readonly port: PortMonitorSchemaType;
    readonly ssl: SslMonitorSchemaType;
}
