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
    "cdn-edge-consistency": "cdn-edge-consistency";
    dns: "dns";
    http: "http";
    "http-header": "http-header";
    "http-json": "http-json";
    "http-keyword": "http-keyword";
    "http-latency": "http-latency";
    "http-status": "http-status";
    ping: "ping";
    port: "port";
    replication: "replication";
    "server-heartbeat": "server-heartbeat";
    ssl: "ssl";
    "websocket-keepalive": "websocket-keepalive";
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

export type HttpHeaderMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    expectedHeaderValue: z.ZodString;
    headerName: z.ZodString;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http-header">;
    url: z.ZodString;
}>;

export type HttpJsonMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    expectedJsonValue: z.ZodString;
    history: HistoryArray;
    id: z.ZodString;
    jsonPath: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http-json">;
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

export type HttpLatencyMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    maxResponseTime: z.ZodNumber;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"http-latency">;
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

export type ReplicationMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    maxReplicationLagSeconds: z.ZodNumber;
    monitoring: z.ZodBoolean;
    primaryStatusUrl: z.ZodString;
    replicaStatusUrl: z.ZodString;
    replicationTimestampField: z.ZodString;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"replication">;
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

export type CdnEdgeConsistencyMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    baselineUrl: z.ZodString;
    checkInterval: z.ZodNumber;
    edgeLocations: z.ZodString;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"cdn-edge-consistency">;
}>;

export type ServerHeartbeatMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    heartbeatExpectedStatus: z.ZodString;
    heartbeatMaxDriftSeconds: z.ZodNumber;
    heartbeatStatusField: z.ZodString;
    heartbeatTimestampField: z.ZodString;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"server-heartbeat">;
    url: z.ZodString;
}>;

export type WebsocketKeepaliveMonitorSchemaType = z.ZodObject<{
    activeOperations: ActiveOperationsArray;
    checkInterval: z.ZodNumber;
    history: HistoryArray;
    id: z.ZodString;
    lastChecked: z.ZodOptional<z.ZodDate>;
    maxPongDelayMs: z.ZodNumber;
    monitoring: z.ZodBoolean;
    responseTime: z.ZodNumber;
    retryAttempts: z.ZodNumber;
    status: MonitorStatusEnum;
    timeout: z.ZodNumber;
    type: z.ZodLiteral<"websocket-keepalive">;
    url: z.ZodString;
}>;

export type MonitorSchemaType = z.ZodDiscriminatedUnion<
    [
        HttpMonitorSchemaType,
        HttpHeaderMonitorSchemaType,
        HttpJsonMonitorSchemaType,
        HttpKeywordMonitorSchemaType,
        HttpLatencyMonitorSchemaType,
        HttpStatusMonitorSchemaType,
        PortMonitorSchemaType,
        PingMonitorSchemaType,
        DnsMonitorSchemaType,
        SslMonitorSchemaType,
        CdnEdgeConsistencyMonitorSchemaType,
        ReplicationMonitorSchemaType,
        ServerHeartbeatMonitorSchemaType,
        WebsocketKeepaliveMonitorSchemaType,
    ]
>;

export type SiteSchemaType = z.ZodObject<{
    identifier: z.ZodString;
    monitoring: z.ZodBoolean;
    monitors: z.ZodArray<MonitorSchemaType>;
    name: z.ZodString;
}>;

export interface MonitorSchemas {
    readonly "cdn-edge-consistency": CdnEdgeConsistencyMonitorSchemaType;
    readonly dns: DnsMonitorSchemaType;
    readonly http: HttpMonitorSchemaType;
    readonly "http-header": HttpHeaderMonitorSchemaType;
    readonly "http-json": HttpJsonMonitorSchemaType;
    readonly "http-keyword": HttpKeywordMonitorSchemaType;
    readonly "http-latency": HttpLatencyMonitorSchemaType;
    readonly "http-status": HttpStatusMonitorSchemaType;
    readonly ping: PingMonitorSchemaType;
    readonly port: PortMonitorSchemaType;
    readonly replication: ReplicationMonitorSchemaType;
    readonly "server-heartbeat": ServerHeartbeatMonitorSchemaType;
    readonly ssl: SslMonitorSchemaType;
    readonly "websocket-keepalive": WebsocketKeepaliveMonitorSchemaType;
}
