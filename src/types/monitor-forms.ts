/**
 * Specific types for monitor form data and field handling. Replaces generic
 * `Record<string, unknown>` patterns.
 */

import type { HttpMethod, MonitorType } from "@shared/types";
import type { UnknownRecord } from "type-fest";

/**
 * Base monitor fields common to all monitor types
 */
export interface BaseMonitorFields {
    /** Check interval in milliseconds */
    checkInterval?: number;
    /** Monitor name */
    name?: string;
    /** Number of retry attempts */
    retryAttempts?: number;
    /** Timeout in milliseconds */
    timeout?: number;
}

/**
 * HTTP monitor specific fields
 */
export interface HttpMonitorFields extends BaseMonitorFields {
    /** Expected status code for primary checks */
    expectedStatusCode?: number;
    /** Follow redirects */
    followRedirects?: boolean;
    /** Request headers */
    headers?: Record<string, string>;
    /** HTTP method */
    method?: HttpMethod;
    /** URL to monitor */
    url: string;
}

/**
 * HTTP header monitor specific fields
 */
export interface HttpHeaderMonitorFields extends BaseMonitorFields {
    /** Expected header value to compare against */
    expectedHeaderValue: string;
    /** Header name to inspect */
    headerName: string;
    /** URL to monitor */
    url: string;
}

/**
 * HTTP JSON monitor specific fields
 */
export interface HttpJsonMonitorFields extends BaseMonitorFields {
    /** Expected value for the JSON path */
    expectedJsonValue: string;
    /** JSON path to evaluate */
    jsonPath: string;
    /** URL to monitor */
    url: string;
}

/**
 * HTTP latency monitor specific fields
 */
export interface HttpLatencyMonitorFields extends BaseMonitorFields {
    /** Maximum acceptable response time in milliseconds */
    maxResponseTime: number;
    /** URL to monitor */
    url: string;
}

/**
 * HTTP keyword monitor specific fields
 */
export interface HttpKeywordMonitorFields extends BaseMonitorFields {
    /** Keyword that must appear in the response body */
    bodyKeyword: string;
    /** URL to monitor */
    url: string;
}

/**
 * HTTP status monitor specific fields
 */
export interface HttpStatusMonitorFields extends BaseMonitorFields {
    /** Expected HTTP status code */
    expectedStatusCode: number;
    /** URL to monitor */
    url: string;
}

/**
 * Type-safe field change handlers for monitor forms
 */
export interface MonitorFieldChangeHandlers {
    /** Handler for boolean fields */
    boolean: (fieldName: string, value: boolean) => void;
    /** Handler for number fields */
    number: (fieldName: string, value: number) => void;
    /** Handler for object fields */
    object: (fieldName: string, value: UnknownRecord) => void;
    /** Handler for string fields */
    string: (fieldName: string, value: string) => void;
}

/**
 * Monitor field values organized by type
 */
export interface MonitorFieldValues {
    /** Boolean field values */
    booleans: Record<string, boolean>;
    /** Number field values */
    numbers: Record<string, number>;
    /** Object field values */
    objects: Record<string, UnknownRecord>;
    /** String field values */
    strings: Record<string, string>;
}

/**
 * Ping monitor specific fields
 */
export interface PingMonitorFields extends BaseMonitorFields {
    /** Host to ping */
    host: string;
}

/**
 * DNS monitor specific fields
 */
export interface DnsMonitorFields extends BaseMonitorFields {
    /** Expected value for the DNS response (optional) */
    expectedValue?: string;
    /** Host to query */
    host: string;
    /** DNS record type to query */
    recordType:
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
        | "TXT";
}

/**
 * Port monitor specific fields
 */
export interface PortMonitorFields extends BaseMonitorFields {
    /** Host to monitor */
    host: string;
    /** Internet Protocol version to use */
    ipVersion?: "ipv4" | "ipv6";
    /** Port number */
    port: number;
    /** Protocol-specific configuration */
    protocol?: {
        /** Whether to use TLS/SSL encryption */
        useTls?: boolean;
    };
}

/**
 * SSL monitor specific fields
 */
export interface SslMonitorFields extends BaseMonitorFields {
    /** Days before expiry to trigger warnings */
    certificateWarningDays: number;
    /** Host to validate */
    host: string;
    /** Port for TLS handshake */
    port: number;
}

/**
 * CDN edge consistency monitor specific fields.
 */
export interface CdnEdgeConsistencyMonitorFields extends BaseMonitorFields {
    /** Origin baseline URL that edge endpoints should match */
    baselineUrl: string;
    /** Comma or newline separated list of edge endpoints */
    edgeLocations: string;
}

/**
 * Replication monitor specific fields.
 */
export interface ReplicationMonitorFields extends BaseMonitorFields {
    /** Maximum allowed replication lag in seconds */
    maxReplicationLagSeconds: number;
    /** Primary status endpoint URL */
    primaryStatusUrl: string;
    /** Replica status endpoint URL */
    replicaStatusUrl: string;
    /** JSON path to the replication timestamp field */
    replicationTimestampField: string;
}

/**
 * Server heartbeat monitor specific fields.
 */
export interface ServerHeartbeatMonitorFields extends BaseMonitorFields {
    /** Expected heartbeat status value */
    heartbeatExpectedStatus: string;
    /** Maximum allowed heartbeat drift in seconds */
    heartbeatMaxDriftSeconds: number;
    /** JSON path to the heartbeat status field */
    heartbeatStatusField: string;
    /** JSON path to the heartbeat timestamp field */
    heartbeatTimestampField: string;
    /** Heartbeat endpoint URL */
    url: string;
}

/**
 * WebSocket keepalive monitor specific fields.
 */
export interface WebsocketKeepaliveMonitorFields extends BaseMonitorFields {
    /** Maximum delay allowed before pong is considered missing */
    maxPongDelayMs: number;
    /** WebSocket endpoint URL */
    url: string;
}

/**
 * Union type for all monitor field types
 */
export type MonitorFormFields =
    | CdnEdgeConsistencyMonitorFields
    | DnsMonitorFields
    | HttpHeaderMonitorFields
    | HttpJsonMonitorFields
    | HttpKeywordMonitorFields
    | HttpLatencyMonitorFields
    | HttpMonitorFields
    | HttpStatusMonitorFields
    | PingMonitorFields
    | PortMonitorFields
    | ReplicationMonitorFields
    | ServerHeartbeatMonitorFields
    | SslMonitorFields
    | WebsocketKeepaliveMonitorFields;

/**
 * Helper to get default fields for a monitor type.
 *
 * @remarks
 * For unknown monitor types, this function falls back to HTTP monitor fields as
 * they represent the most common monitoring use case. This ensures the function
 * always returns valid form fields even for unsupported types.
 *
 * @param type - The monitor type to get defaults for
 *
 * @returns Default field values for the specified monitor type
 */
export function getDefaultMonitorFields(type: MonitorType): MonitorFormFields {
    const baseFields: BaseMonitorFields = {
        checkInterval: 300_000, // 5 minutes
        retryAttempts: 3,
        timeout: 10_000, // 10 seconds
    };

    switch (type) {
        case "cdn-edge-consistency": {
            return {
                ...baseFields,
                baselineUrl: "",
                edgeLocations: "",
            } satisfies CdnEdgeConsistencyMonitorFields;
        }
        case "dns": {
            return {
                ...baseFields,
                expectedValue: "",
                host: "",
                recordType: "A",
            } satisfies DnsMonitorFields;
        }
        case "http": {
            return {
                ...baseFields,
                expectedStatusCode: 200,
                followRedirects: true,
                headers: {},
                method: "GET",
                url: "",
            } satisfies HttpMonitorFields;
        }
        case "http-header": {
            return {
                ...baseFields,
                expectedHeaderValue: "",
                headerName: "",
                url: "",
            } satisfies HttpHeaderMonitorFields;
        }
        case "http-json": {
            return {
                ...baseFields,
                expectedJsonValue: "",
                jsonPath: "",
                url: "",
            } satisfies HttpJsonMonitorFields;
        }
        case "http-keyword": {
            return {
                ...baseFields,
                bodyKeyword: "",
                url: "",
            } satisfies HttpKeywordMonitorFields;
        }
        case "http-latency": {
            return {
                ...baseFields,
                maxResponseTime: 2000,
                url: "",
            } satisfies HttpLatencyMonitorFields;
        }
        case "http-status": {
            return {
                ...baseFields,
                expectedStatusCode: 200,
                url: "",
            } satisfies HttpStatusMonitorFields;
        }
        case "ping": {
            return {
                ...baseFields,
                host: "",
            } satisfies PingMonitorFields;
        }
        case "port": {
            return {
                ...baseFields,
                host: "",
                ipVersion: "ipv4",
                port: 80,
                protocol: {
                    useTls: false,
                },
            } satisfies PortMonitorFields;
        }
        case "replication": {
            return {
                ...baseFields,
                maxReplicationLagSeconds: 10,
                primaryStatusUrl: "",
                replicaStatusUrl: "",
                replicationTimestampField: "lastAppliedTimestamp",
            } satisfies ReplicationMonitorFields;
        }
        case "server-heartbeat": {
            return {
                ...baseFields,
                heartbeatExpectedStatus: "ok",
                heartbeatMaxDriftSeconds: 60,
                heartbeatStatusField: "status",
                heartbeatTimestampField: "timestamp",
                url: "",
            } satisfies ServerHeartbeatMonitorFields;
        }
        case "ssl": {
            return {
                ...baseFields,
                certificateWarningDays: 30,
                host: "",
                port: 443,
            } satisfies SslMonitorFields;
        }
        case "websocket-keepalive": {
            return {
                ...baseFields,
                maxPongDelayMs: 1500,
                url: "",
            } satisfies WebsocketKeepaliveMonitorFields;
        }
        default: {
            // Fallback to HTTP fields for unknown types
            return {
                ...baseFields,
                url: "",
            } satisfies HttpMonitorFields;
        }
    }
}

/**
 * Type guard to check if fields are for HTTP monitor.
 *
 * @remarks
 * Checks for presence of required HTTP properties and absence of
 * port/ping-specific ones to provide more robust type detection and prevent
 * false positives.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain HTTP monitor properties
 */
export function isHttpMonitorFields(
    fields: MonitorFormFields
): fields is HttpMonitorFields {
    return "url" in fields && !("host" in fields);
}

/**
 * Type guard to check if fields are for Ping monitor.
 *
 * @remarks
 * Validates presence of host property and absence of port property to
 * distinguish from port monitors which also have a host field.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid ping monitor properties
 */
export function isPingMonitorFields(
    fields: MonitorFormFields
): fields is PingMonitorFields {
    return (
        "host" in fields &&
        !("port" in fields) &&
        !("url" in fields) &&
        typeof fields.host === "string"
    );
}

/**
 * Type guard to check if fields are for Port monitor.
 *
 * @remarks
 * Validates both presence and types of required properties to ensure runtime
 * type safety and prevent incorrect type assumptions.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid port monitor properties
 */
export function isPortMonitorFields(
    fields: MonitorFormFields
): fields is PortMonitorFields {
    return (
        "host" in fields &&
        "port" in fields &&
        typeof fields.host === "string" &&
        typeof fields.port === "number"
    );
}

/**
 * Type guard to check if fields are for SSL monitor.
 *
 * @remarks
 * Validates presence of host, port, and certificate warning properties to
 * ensure the fields are suitable for SSL monitoring.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid SSL monitor properties
 */
export function isSslMonitorFields(
    fields: MonitorFormFields
): fields is SslMonitorFields {
    return (
        "host" in fields &&
        "port" in fields &&
        "certificateWarningDays" in fields &&
        typeof fields.host === "string" &&
        typeof fields.port === "number" &&
        typeof fields.certificateWarningDays === "number"
    );
}

/**
 * Type guard to check if fields are for CDN edge consistency monitor.
 *
 * @remarks
 * Checks for presence of required CDN properties and absence of
 * port/ping-specific ones to provide more robust type detection and prevent
 * false positives.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain CDN edge consistency monitor properties
 */
export function isCdnEdgeConsistencyMonitorFields(
    fields: MonitorFormFields
): fields is CdnEdgeConsistencyMonitorFields {
    return "baselineUrl" in fields && "edgeLocations" in fields;
}

/**
 * Type guard to check if fields are for Replication monitor.
 *
 * @remarks
 * Validates both presence and types of required properties to ensure runtime
 * type safety and prevent incorrect type assumptions.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid Replication monitor properties
 */
export function isReplicationMonitorFields(
    fields: MonitorFormFields
): fields is ReplicationMonitorFields {
    return (
        "primaryStatusUrl" in fields &&
        "replicaStatusUrl" in fields &&
        "replicationTimestampField" in fields &&
        typeof fields.primaryStatusUrl === "string" &&
        typeof fields.replicaStatusUrl === "string" &&
        typeof fields.replicationTimestampField === "string"
    );
}

/**
 * Type guard to check if fields are for Server Heartbeat monitor.
 *
 * @remarks
 * Validates presence of URL, heartbeat status, and timestamp fields, ensuring
 * they are suitable for server heartbeat monitoring.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid Server Heartbeat monitor properties
 */
export function isServerHeartbeatMonitorFields(
    fields: MonitorFormFields
): fields is ServerHeartbeatMonitorFields {
    return (
        "url" in fields &&
        "heartbeatStatusField" in fields &&
        "heartbeatTimestampField" in fields &&
        typeof fields.url === "string" &&
        typeof fields.heartbeatStatusField === "string" &&
        typeof fields.heartbeatTimestampField === "string"
    );
}

/**
 * Type guard to check if fields are for WebSocket Keepalive monitor.
 *
 * @remarks
 * Checks for the presence of the URL and max pong delay properties to ensure
 * the fields are suitable for WebSocket keepalive monitoring.
 *
 * @param fields - Monitor form fields to check
 *
 * @returns True if fields contain valid WebSocket Keepalive monitor properties
 */
export function isWebsocketKeepaliveMonitorFields(
    fields: MonitorFormFields
): fields is WebsocketKeepaliveMonitorFields {
    return (
        "url" in fields &&
        "maxPongDelayMs" in fields &&
        typeof fields.url === "string" &&
        typeof fields.maxPongDelayMs === "number"
    );
}
