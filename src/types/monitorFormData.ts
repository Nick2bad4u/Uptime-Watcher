/**
 * Type definitions for monitor form data interfaces.
 *
 * @remarks
 * Provides type-safe interfaces for form handling and validation. form handling
 * and validation.
 * @remarks
 * These interfaces define the structure of form data used throughout the
 * application for creating and editing monitors. They help avoid index
 * signature access issues while maintaining type safety for form operations.
 *
 * @packageDocumentation
 */

import type { SetOptional, Simplify, UnknownRecord } from "type-fest";

/**
 * Base form data interface with common properties.
 */
export interface BaseFormData {
    /** Monitor check interval in milliseconds */
    checkInterval?: number;
    /** Whether monitoring is enabled */
    monitoring?: boolean;
    /** Number of retry attempts on failure */
    retryAttempts?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Monitor type identifier with autocomplete for known types */
    type?: string;
}

/**
 * Dynamic form data for extensible monitor types. Used when monitor type is not
 * known at compile time.
 */
export interface DynamicFormData extends UnknownRecord {
    /** Monitor check interval in milliseconds */
    checkInterval?: number;
    /** Whether monitoring is enabled */
    monitoring?: boolean;
    /** Number of retry attempts on failure */
    retryAttempts?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Monitor type identifier with autocomplete for known types */
    type?: string;
}

/**
 * Form data for HTTP monitors.
 */
export interface HttpFormData extends BaseFormData {
    type: "http";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for HTTP keyword monitors.
 */
export interface HttpKeywordFormData extends BaseFormData {
    /** Keyword that must appear in the response body */
    bodyKeyword: string;
    type: "http-keyword";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for HTTP header monitors.
 */
export interface HttpHeaderFormData extends BaseFormData {
    /** Expected value for the specified response header */
    expectedHeaderValue: string;
    /** Header name to inspect */
    headerName: string;
    type: "http-header";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for HTTP JSON monitors.
 */
export interface HttpJsonFormData extends BaseFormData {
    /** Expected value at the JSON path */
    expectedJsonValue: string;
    /** JSON path to evaluate in the response body */
    jsonPath: string;
    type: "http-json";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for HTTP status monitors.
 */
export interface HttpStatusFormData extends BaseFormData {
    /** Expected HTTP status code */
    expectedStatusCode: number;
    type: "http-status";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for HTTP latency monitors.
 */
export interface HttpLatencyFormData extends BaseFormData {
    /** Maximum acceptable response time in milliseconds */
    maxResponseTime: number;
    type: "http-latency";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for ping monitors.
 */
export interface PingFormData extends BaseFormData {
    /** Target host to ping */
    host: string;
    type: "ping";
}

/**
 * Form data for port monitors.
 */
export interface PortFormData extends BaseFormData {
    /** Target host to monitor */
    host: string;
    /** Target port to monitor */
    port: number;
    type: "port";
}

/**
 * Form data for DNS monitors.
 */
export interface DnsFormData extends BaseFormData {
    /** Expected value for DNS record (optional) */
    expectedValue?: string;
    /** Target host to resolve */
    host: string;
    /** DNS record type to query */
    recordType: string;
    type: "dns";
}

/**
 * Form data for SSL certificate monitors.
 */
export interface SslFormData extends BaseFormData {
    /** Warning threshold in days before certificate expiry */
    certificateWarningDays: number;
    /** Target host serving the certificate */
    host: string;
    /** TLS port to connect to */
    port: number;
    type: "ssl";
}

/**
 * Form data for CDN edge consistency monitors.
 */
export interface CdnEdgeConsistencyFormData extends BaseFormData {
    /** Origin baseline URL used for comparison */
    baselineUrl: string;
    /** Comma or newline separated list of edge URLs */
    edgeLocations: string;
    type: "cdn-edge-consistency";
}

/**
 * Form data for replication monitors.
 */
export interface ReplicationFormData extends BaseFormData {
    /** Maximum acceptable replication lag in seconds */
    maxReplicationLagSeconds: number;
    /** Primary status endpoint URL */
    primaryStatusUrl: string;
    /** Replica status endpoint URL */
    replicaStatusUrl: string;
    /** JSON path to replication timestamp value */
    replicationTimestampField: string;
    type: "replication";
}

/**
 * Form data for server heartbeat monitors.
 */
export interface ServerHeartbeatFormData extends BaseFormData {
    /** Expected status string reported by the heartbeat */
    heartbeatExpectedStatus: string;
    /** Maximum allowed drift in seconds */
    heartbeatMaxDriftSeconds: number;
    /** JSON path to the heartbeat status field */
    heartbeatStatusField: string;
    /** JSON path to the heartbeat timestamp field */
    heartbeatTimestampField: string;
    type: "server-heartbeat";
    /** Heartbeat endpoint URL */
    url: string;
}

/**
 * Form data for WebSocket keepalive monitors.
 */
export interface WebsocketKeepaliveFormData extends BaseFormData {
    /** Maximum allowed pong delay in milliseconds */
    maxPongDelayMs: number;
    type: "websocket-keepalive";
    /** WebSocket endpoint URL */
    url: string;
}

/**
 * Union type for all supported monitor form data types. Simplified for better
 * IntelliSense display.
 */
export type MonitorFormData = Simplify<
    | CdnEdgeConsistencyFormData
    | DnsFormData
    | HttpFormData
    | HttpHeaderFormData
    | HttpJsonFormData
    | HttpKeywordFormData
    | HttpLatencyFormData
    | HttpStatusFormData
    | PingFormData
    | PortFormData
    | ReplicationFormData
    | ServerHeartbeatFormData
    | SslFormData
    | WebsocketKeepaliveFormData
>;

// Optional key definitions for default form data creation
type CdnEdgeConsistencyOptionalKeys = "baselineUrl" | "edgeLocations";
type HttpHeaderOptionalKeys = "expectedHeaderValue" | "headerName" | "url";
type HttpJsonOptionalKeys = "expectedJsonValue" | "jsonPath" | "url";
type HttpLatencyOptionalKeys = "maxResponseTime" | "url";
type ReplicationOptionalKeys =
    | "maxReplicationLagSeconds"
    | "primaryStatusUrl"
    | "replicaStatusUrl"
    | "replicationTimestampField";
type ServerHeartbeatOptionalKeys =
    | "heartbeatExpectedStatus"
    | "heartbeatMaxDriftSeconds"
    | "heartbeatStatusField"
    | "heartbeatTimestampField"
    | "url";
type WebsocketKeepaliveOptionalKeys = "maxPongDelayMs" | "url";

/**
 * Create default form data for a specific monitor type.
 *
 * @param type - Monitor type
 *
 * @returns Default form data for the specified type
 */
/* eslint-disable no-redeclare -- Function overloads are legitimate TypeScript pattern */
export function createDefaultFormData(
    type: "cdn-edge-consistency"
): SetOptional<CdnEdgeConsistencyFormData, CdnEdgeConsistencyOptionalKeys>;
export function createDefaultFormData(
    type: "dns"
): SetOptional<DnsFormData, "host" | "recordType">;
export function createDefaultFormData(
    type: "http-header"
): SetOptional<HttpHeaderFormData, HttpHeaderOptionalKeys>;
export function createDefaultFormData(
    type: "http-json"
): SetOptional<HttpJsonFormData, HttpJsonOptionalKeys>;
export function createDefaultFormData(
    type: "http"
): SetOptional<HttpFormData, "url">;
export function createDefaultFormData(
    type: "http-keyword"
): SetOptional<HttpKeywordFormData, "bodyKeyword" | "url">;
export function createDefaultFormData(
    type: "http-latency"
): SetOptional<HttpLatencyFormData, HttpLatencyOptionalKeys>;
export function createDefaultFormData(
    type: "http-status"
): SetOptional<HttpStatusFormData, "expectedStatusCode" | "url">;
export function createDefaultFormData(
    type: "ping"
): SetOptional<PingFormData, "host">;
export function createDefaultFormData(
    type: "port"
): SetOptional<PortFormData, "host" | "port">;
export function createDefaultFormData(
    type: "replication"
): SetOptional<ReplicationFormData, ReplicationOptionalKeys>;
export function createDefaultFormData(
    type: "server-heartbeat"
): SetOptional<ServerHeartbeatFormData, ServerHeartbeatOptionalKeys>;
export function createDefaultFormData(
    type: "ssl"
): SetOptional<SslFormData, "certificateWarningDays" | "host" | "port">;
export function createDefaultFormData(
    type: "websocket-keepalive"
): SetOptional<WebsocketKeepaliveFormData, WebsocketKeepaliveOptionalKeys>;
export function createDefaultFormData(
    type: string
): SetOptional<BaseFormData, never> {
    /* eslint-enable no-redeclare -- Re-enable after necessary function overloading for type safety */
    return {
        checkInterval: 300_000, // 5 minutes
        monitoring: true,
        retryAttempts: 3,
        timeout: 10_000, // 10 seconds
        type,
    };
}

/**
 * Type guard to check if form data is for HTTP monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is HTTP form data
 */
export function isHttpFormData(
    data: Partial<MonitorFormData>
): data is HttpFormData {
    return (
        data.type === "http" &&
        typeof data.url === "string" &&
        data.url.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP header monitor.
 */
export function isHttpHeaderFormData(
    data: Partial<MonitorFormData>
): data is HttpHeaderFormData {
    return (
        data.type === "http-header" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.headerName === "string" &&
        data.headerName.trim() !== "" &&
        typeof data.expectedHeaderValue === "string" &&
        data.expectedHeaderValue.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP JSON monitor.
 */
export function isHttpJsonFormData(
    data: Partial<MonitorFormData>
): data is HttpJsonFormData {
    return (
        data.type === "http-json" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.jsonPath === "string" &&
        data.jsonPath.trim() !== "" &&
        typeof data.expectedJsonValue === "string" &&
        data.expectedJsonValue.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP keyword monitor.
 */
export function isHttpKeywordFormData(
    data: Partial<MonitorFormData>
): data is HttpKeywordFormData {
    return (
        data.type === "http-keyword" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.bodyKeyword === "string" &&
        data.bodyKeyword.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP status monitor.
 */
export function isHttpStatusFormData(
    data: Partial<MonitorFormData>
): data is HttpStatusFormData {
    return (
        data.type === "http-status" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.expectedStatusCode === "number" &&
        Number.isInteger(data.expectedStatusCode) &&
        data.expectedStatusCode >= 100 &&
        data.expectedStatusCode <= 599
    );
}

/**
 * Type guard to check if form data is for HTTP latency monitor.
 */
export function isHttpLatencyFormData(
    data: Partial<MonitorFormData>
): data is HttpLatencyFormData {
    return (
        data.type === "http-latency" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.maxResponseTime === "number" &&
        Number.isFinite(data.maxResponseTime) &&
        data.maxResponseTime > 0
    );
}

/**
 * Type guard to check if form data is for DNS monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is DNS form data
 */
export function isDnsFormData(
    data: Partial<MonitorFormData>
): data is DnsFormData {
    return (
        data.type === "dns" &&
        typeof data.host === "string" &&
        data.host.trim() !== "" &&
        typeof data.recordType === "string" &&
        data.recordType.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for ping monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is ping form data
 */
export function isPingFormData(
    data: Partial<MonitorFormData>
): data is PingFormData {
    return (
        data.type === "ping" &&
        typeof data.host === "string" &&
        data.host.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for port monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is port form data
 */
export function isPortFormData(
    data: Partial<MonitorFormData>
): data is PortFormData {
    return (
        data.type === "port" &&
        typeof data.host === "string" &&
        data.host.trim() !== "" &&
        typeof data.port === "number" &&
        data.port > 0 &&
        data.port <= 65_535
    );
}

/**
 * Type guard to check if form data is for SSL monitor.
 *
 * @param data - Form data to check
 *
 * @returns True if data is SSL form data
 */
export function isSslFormData(
    data: Partial<MonitorFormData>
): data is SslFormData {
    return (
        data.type === "ssl" &&
        typeof data.host === "string" &&
        data.host.trim() !== "" &&
        typeof data.port === "number" &&
        data.port > 0 &&
        data.port <= 65_535 &&
        typeof data.certificateWarningDays === "number" &&
        data.certificateWarningDays >= 1 &&
        data.certificateWarningDays <= 365
    );
}

/**
 * Type guard to check if form data is for CDN edge consistency monitor.
 */
export function isCdnEdgeConsistencyFormData(
    data: Partial<MonitorFormData>
): data is CdnEdgeConsistencyFormData {
    return (
        data.type === "cdn-edge-consistency" &&
        typeof data.baselineUrl === "string" &&
        data.baselineUrl.trim() !== "" &&
        typeof data.edgeLocations === "string" &&
        data.edgeLocations.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for replication monitor.
 */
export function isReplicationFormData(
    data: Partial<MonitorFormData>
): data is ReplicationFormData {
    return (
        data.type === "replication" &&
        typeof data.primaryStatusUrl === "string" &&
        data.primaryStatusUrl.trim() !== "" &&
        typeof data.replicaStatusUrl === "string" &&
        data.replicaStatusUrl.trim() !== "" &&
        typeof data.replicationTimestampField === "string" &&
        data.replicationTimestampField.trim() !== "" &&
        typeof data.maxReplicationLagSeconds === "number" &&
        Number.isFinite(data.maxReplicationLagSeconds)
    );
}

/**
 * Type guard to check if form data is for server heartbeat monitor.
 */
export function isServerHeartbeatFormData(
    data: Partial<MonitorFormData>
): data is ServerHeartbeatFormData {
    return (
        data.type === "server-heartbeat" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.heartbeatStatusField === "string" &&
        data.heartbeatStatusField.trim() !== "" &&
        typeof data.heartbeatTimestampField === "string" &&
        data.heartbeatTimestampField.trim() !== "" &&
        typeof data.heartbeatExpectedStatus === "string" &&
        data.heartbeatExpectedStatus.trim() !== "" &&
        typeof data.heartbeatMaxDriftSeconds === "number" &&
        Number.isFinite(data.heartbeatMaxDriftSeconds)
    );
}

/**
 * Type guard to check if form data is for WebSocket keepalive monitor.
 */
export function isWebsocketKeepaliveFormData(
    data: Partial<MonitorFormData>
): data is WebsocketKeepaliveFormData {
    return (
        data.type === "websocket-keepalive" &&
        typeof data.url === "string" &&
        data.url.trim() !== "" &&
        typeof data.maxPongDelayMs === "number" &&
        Number.isFinite(data.maxPongDelayMs)
    );
}

/**
 * Registry of type-specific validation functions. Add new monitor types here to
 * enable dynamic validation.
 */
const FORM_DATA_VALIDATORS = {
    "cdn-edge-consistency": isCdnEdgeConsistencyFormData,
    dns: isDnsFormData,
    http: isHttpFormData,
    "http-header": isHttpHeaderFormData,
    "http-json": isHttpJsonFormData,
    "http-keyword": isHttpKeywordFormData,
    "http-latency": isHttpLatencyFormData,
    "http-status": isHttpStatusFormData,
    ping: isPingFormData,
    port: isPortFormData,
    replication: isReplicationFormData,
    "server-heartbeat": isServerHeartbeatFormData,
    ssl: isSslFormData,
    "websocket-keepalive": isWebsocketKeepaliveFormData,
} as const;

/**
 * Type guard to check if form data is valid and complete.
 *
 * @param data - Form data to validate
 *
 * @returns True if data is valid monitor form data
 */
export function isValidMonitorFormData(data: unknown): data is MonitorFormData {
    if (typeof data !== "object" || data === null) {
        return false;
    }

    const formData = data as Partial<MonitorFormData>;

    if (!formData.type || typeof formData.type !== "string") {
        return false;
    }

    // Use type-safe access with proper typing
    const validator = (
        FORM_DATA_VALIDATORS as Simplify<
            Record<
                string,
                ((data: Partial<MonitorFormData>) => boolean) | undefined
            >
        >
    )[formData.type];
    if (!validator) {
        return false;
    }

    return validator(formData);
}

/**
 * Safely get a property from dynamic form data.
 *
 * @param data - Form data object
 * @param property - Property name to access
 * @param defaultValue - Default value if property is undefined
 *
 * @returns Property value or default
 */
export function safeGetFormProperty<T>(
    data: DynamicFormData,
    property: string,
    defaultValue: T
): T {
    if (property in data && data[property] !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- Caller provides type T and default value as contract for expected property type
        return data[property] as T;
    }
    return defaultValue;
}

/**
 * Safely set a property on dynamic form data.
 *
 * @param data - Form data object
 * @param property - Property name to set
 * @param value - Value to set
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- Type parameter ensures type safety for value at call site
export function safeSetFormProperty<T>(
    data: DynamicFormData,
    property: string,
    value: T
): void {
    data[property] = value;
}
