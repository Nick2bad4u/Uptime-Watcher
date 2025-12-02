/**
 * Zod schema type definitions for validation schemas.
 */
import type { LiteralUnion } from "type-fest";
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

/**
 * DNS record identifiers accepted by monitor schemas with extension support.
 */
export type DnsRecordType = LiteralUnion<
    | "A"
    | "AAAA"
    | "ANY"
    | "CAA"
    | "CNAME"
    | "MX"
    | "NAPTR"
    | "NS"
    | "PTR"
    | "SOA"
    | "SRV"
    | "TLSA"
    | "TXT",
    string
>;

/**
 * Zod schema capturing common monitor fields shared by all monitor variants.
 *
 * @public
 */
interface BaseMonitorSchemaShape {
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
}

type MonitorSchemaShape<TAdditional extends z.ZodRawShape> =
    BaseMonitorSchemaShape & TAdditional;

type MonitorSchema<TAdditional extends z.ZodRawShape> = z.ZodObject<
    MonitorSchemaShape<TAdditional>
>;
/**
 * Base monitor Zod schema type shared by all monitor variants.
 */
export type BaseMonitorSchemaType = MonitorSchema<{
    type: MonitorTypeEnum;
}>;

/**
 * Zod schema describing HTTP monitor payloads stored in persisted state.
 *
 * @public
 */
export type HttpMonitorSchemaType = MonitorSchema<{
    type: z.ZodLiteral<"http">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing HTTP header monitor payloads.
 *
 * @public
 */
export type HttpHeaderMonitorSchemaType = MonitorSchema<{
    expectedHeaderValue: z.ZodString;
    headerName: z.ZodString;
    type: z.ZodLiteral<"http-header">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing HTTP JSON monitor payloads.
 *
 * @public
 */
export type HttpJsonMonitorSchemaType = MonitorSchema<{
    expectedJsonValue: z.ZodString;
    jsonPath: z.ZodString;
    type: z.ZodLiteral<"http-json">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing HTTP keyword monitor payloads.
 *
 * @public
 */
export type HttpKeywordMonitorSchemaType = MonitorSchema<{
    bodyKeyword: z.ZodString;
    type: z.ZodLiteral<"http-keyword">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing HTTP latency monitor payloads.
 *
 * @public
 */
export type HttpLatencyMonitorSchemaType = MonitorSchema<{
    maxResponseTime: z.ZodNumber;
    type: z.ZodLiteral<"http-latency">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing HTTP status monitor payloads.
 *
 * @public
 */
export type HttpStatusMonitorSchemaType = MonitorSchema<{
    expectedStatusCode: z.ZodNumber;
    type: z.ZodLiteral<"http-status">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing TCP port monitor payloads.
 *
 * @public
 */
export type PortMonitorSchemaType = MonitorSchema<{
    host: z.ZodString;
    port: z.ZodNumber;
    type: z.ZodLiteral<"port">;
}>;

/**
 * Zod schema describing replication monitor payloads.
 *
 * @public
 */
export type ReplicationMonitorSchemaType = MonitorSchema<{
    maxReplicationLagSeconds: z.ZodNumber;
    primaryStatusUrl: z.ZodString;
    replicaStatusUrl: z.ZodString;
    replicationTimestampField: z.ZodString;
    type: z.ZodLiteral<"replication">;
}>;

/**
 * Zod schema describing ICMP ping monitor payloads.
 *
 * @public
 */
export type PingMonitorSchemaType = MonitorSchema<{
    host: z.ZodString;
    type: z.ZodLiteral<"ping">;
}>;

/**
 * Zod schema describing DNS monitor payloads.
 *
 * @public
 */
export type DnsMonitorSchemaType = MonitorSchema<{
    expectedValue: z.ZodOptional<z.ZodString>;
    host: z.ZodString;
    recordType: DnsRecordEnum;
    type: z.ZodLiteral<"dns">;
}>;

/**
 * Zod schema describing SSL certificate monitor payloads.
 *
 * @public
 */
export type SslMonitorSchemaType = MonitorSchema<{
    certificateWarningDays: z.ZodNumber;
    host: z.ZodString;
    port: z.ZodNumber;
    type: z.ZodLiteral<"ssl">;
}>;

/**
 * Zod schema describing CDN edge consistency monitor payloads.
 *
 * @public
 */
export type CdnEdgeConsistencyMonitorSchemaType = MonitorSchema<{
    baselineUrl: z.ZodString;
    edgeLocations: z.ZodString;
    type: z.ZodLiteral<"cdn-edge-consistency">;
}>;

/**
 * Zod schema describing server heartbeat monitor payloads.
 *
 * @public
 */
export type ServerHeartbeatMonitorSchemaType = MonitorSchema<{
    heartbeatExpectedStatus: z.ZodString;
    heartbeatMaxDriftSeconds: z.ZodNumber;
    heartbeatStatusField: z.ZodString;
    heartbeatTimestampField: z.ZodString;
    type: z.ZodLiteral<"server-heartbeat">;
    url: z.ZodString;
}>;

/**
 * Zod schema describing WebSocket keepalive monitor payloads.
 *
 * @public
 */
export type WebsocketKeepaliveMonitorSchemaType = MonitorSchema<{
    maxPongDelayMs: z.ZodNumber;
    type: z.ZodLiteral<"websocket-keepalive">;
    url: z.ZodString;
}>;

/**
 * Zod discriminated union covering all monitor schema variants.
 *
 * @public
 */
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

/**
 * Zod schema describing persisted site payloads including nested monitors.
 *
 * @public
 */
export type SiteSchemaType = z.ZodObject<{
    identifier: z.ZodString;
    monitoring: z.ZodBoolean;
    monitors: z.ZodArray<MonitorSchemaType>;
    name: z.ZodString;
}>;

/**
 * Mapping of monitor type identifiers to their corresponding Zod schemas.
 *
 * @public
 */
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

/**
 * Monitor schema identifiers with autocomplete for built-in monitors.
 */
export type MonitorSchemaIdentifier = LiteralUnion<
    keyof MonitorSchemas,
    string
>;
