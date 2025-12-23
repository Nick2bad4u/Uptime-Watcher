/**
 * Type definitions for monitor form data interfaces.
 *
 * @remarks
 * Provides structured types that power renderer monitor forms, replacing loose
 * index signatures with explicit shapes while preserving runtime flexibility.
 *
 * @public
 */

import type { SetOptional, Simplify, UnknownRecord } from "type-fest";

import { isNonEmptyString } from "@shared/utils/typeGuards";
import {
    isValidFQDN,
    isValidHost,
    isValidPort,
    isValidUrl,
} from "@shared/validation/validatorUtils";

import type { RequireAllOrNoneFields } from "./typeUtils";

interface HeaderExpectationShape {
    /** Expected value for the specified response header */
    expectedHeaderValue?: string;
    /** Header name to inspect */
    headerName?: string;
}

type HeaderExpectationFields = RequireAllOrNoneFields<HeaderExpectationShape>;

interface JsonExpectationShape {
    /** Expected value at the JSON path */
    expectedJsonValue?: string;
    /** JSON path to evaluate in the response body */
    jsonPath?: string;
}

type JsonExpectationFields = RequireAllOrNoneFields<JsonExpectationShape>;

interface ReplicationRequirementShape {
    /** Maximum acceptable replication lag in seconds */
    maxReplicationLagSeconds?: number;
    /** Primary status endpoint URL */
    primaryStatusUrl?: string;
    /** Replica status endpoint URL */
    replicaStatusUrl?: string;
    /** JSON path to replication timestamp value */
    replicationTimestampField?: string;
}

type ReplicationRequirementFields =
    RequireAllOrNoneFields<ReplicationRequirementShape>;

interface HeartbeatRequirementShape {
    /** Expected status string reported by the heartbeat */
    heartbeatExpectedStatus?: string;
    /** Maximum allowed drift in seconds */
    heartbeatMaxDriftSeconds?: number;
    /** JSON path to the heartbeat status field */
    heartbeatStatusField?: string;
    /** JSON path to the heartbeat timestamp field */
    heartbeatTimestampField?: string;
}

type HeartbeatRequirementFields =
    RequireAllOrNoneFields<HeartbeatRequirementShape>;

/**
 * Base form data interface with common properties.
 *
 * @public
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
 * Dynamic form data for extensible monitor types.
 *
 * @remarks
 * Used when the monitor type is not known at compile time but the renderer
 * still wants autocomplete for shared primitives.
 *
 * @public
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
 *
 * @public
 */
export interface HttpFormData extends BaseFormData {
    type: "http";
    /** Target URL to monitor */
    url: string;
}

/**
 * Form data for HTTP keyword monitors.
 *
 * @public
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
 *
 * @public
 */
/**
 * Form state representation for HTTP header monitors.
 */
export type HttpHeaderFormData = BaseFormData &
    HeaderExpectationFields & {
        type: "http-header";
        /** Target URL to monitor */
        url: string;
    };

/**
 * Form data for HTTP JSON monitors.
 *
 * @public
 */
/**
 * Form state representation for HTTP JSON monitors.
 */
export type HttpJsonFormData = BaseFormData &
    JsonExpectationFields & {
        type: "http-json";
        /** Target URL to monitor */
        url: string;
    };

/**
 * Form data for HTTP status monitors.
 *
 * @public
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
 *
 * @public
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
 *
 * @public
 */
export interface PingFormData extends BaseFormData {
    /** Target host to ping */
    host: string;
    type: "ping";
}

/**
 * Form data for port monitors.
 *
 * @public
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
 *
 * @public
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
 *
 * @public
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
 *
 * @public
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
 *
 * @public
 */
export type ReplicationFormData = BaseFormData &
    ReplicationRequirementFields & {
        type: "replication";
    };

/**
 * Form data for server heartbeat monitors.
 *
 * @public
 */
export type ServerHeartbeatFormData = BaseFormData &
    HeartbeatRequirementFields & {
        type: "server-heartbeat";
        /** Heartbeat endpoint URL */
        url: string;
    };

/**
 * Form data for WebSocket keepalive monitors.
 *
 * @public
 */
export interface WebsocketKeepaliveFormData extends BaseFormData {
    /** Maximum allowed pong delay in milliseconds */
    maxPongDelayMs: number;
    type: "websocket-keepalive";
    /** WebSocket endpoint URL */
    url: string;
}

/**
 * Union type for all supported monitor form data types.
 *
 * @remarks
 * Simplified to flatten nested intersections for improved IntelliSense output.
 *
 * @public
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
 *
 * @public
 */
/* eslint-disable no-redeclare -- Function overloads are legitimate TypeScript pattern */
/**
 * Creates default monitor form data for the specified monitor type.
 *
 * @remarks
 * This overloaded helper centralizes the initial values used by the add-site
 * and monitor editing flows so that new monitor types can define sensible
 * defaults in one place.
 *
 * @param type - Monitor type identifier for which to generate default form
 *   data.
 *
 * @returns A partially-populated form data object with required fields for the
 *   given monitor type.
 */
/* eslint-disable tsdoc-require/require -- Overloaded signatures share the implementation TSDoc. */
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

/* eslint-enable tsdoc-require/require -- re-enable after overloaded signatures */

/**
 * Type guard to check if form data is for HTTP monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link HttpFormData} contract.
 *
 * @public
 */
export function isHttpFormData(
    data: Partial<MonitorFormData>
): data is HttpFormData {
    return (
        data.type === "http" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        })
    );
}

/**
 * Type guard to check if form data is for HTTP header monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link HttpHeaderFormData} contract.
 *
 * @public
 */
export function isHttpHeaderFormData(
    data: Partial<MonitorFormData>
): data is HttpHeaderFormData {
    return (
        data.type === "http-header" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.headerName === "string" &&
        data.headerName.trim() !== "" &&
        typeof data.expectedHeaderValue === "string" &&
        data.expectedHeaderValue.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP JSON monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link HttpJsonFormData} contract.
 *
 * @public
 */
export function isHttpJsonFormData(
    data: Partial<MonitorFormData>
): data is HttpJsonFormData {
    return (
        data.type === "http-json" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.jsonPath === "string" &&
        data.jsonPath.trim() !== "" &&
        typeof data.expectedJsonValue === "string" &&
        data.expectedJsonValue.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP keyword monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link HttpKeywordFormData} contract.
 *
 * @public
 */
export function isHttpKeywordFormData(
    data: Partial<MonitorFormData>
): data is HttpKeywordFormData {
    return (
        data.type === "http-keyword" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.bodyKeyword === "string" &&
        data.bodyKeyword.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for HTTP status monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link HttpStatusFormData} contract.
 *
 * @public
 */
export function isHttpStatusFormData(
    data: Partial<MonitorFormData>
): data is HttpStatusFormData {
    return (
        data.type === "http-status" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.expectedStatusCode === "number" &&
        Number.isInteger(data.expectedStatusCode) &&
        data.expectedStatusCode >= 100 &&
        data.expectedStatusCode <= 599
    );
}

/**
 * Type guard to check if form data is for HTTP latency monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link HttpLatencyFormData} contract.
 *
 * @public
 */
export function isHttpLatencyFormData(
    data: Partial<MonitorFormData>
): data is HttpLatencyFormData {
    return (
        data.type === "http-latency" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.maxResponseTime === "number" &&
        Number.isFinite(data.maxResponseTime) &&
        data.maxResponseTime > 0
    );
}

/**
 * Type guard to check if form data is for DNS monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link DnsFormData} contract.
 *
 * @public
 */
export function isDnsFormData(
    data: Partial<MonitorFormData>
): data is DnsFormData {
    const hostCandidate: unknown = (data as UnknownRecord)["host"];
    const host = isNonEmptyString(hostCandidate) ? hostCandidate.trim() : "";

    return (
        data.type === "dns" &&
        host.length > 0 &&
        (isValidHost(host) ||
            isValidFQDN(host, {
                "allow_trailing_dot": true,
                "allow_underscores": true,
                "require_tld": false,
            })) &&
        typeof data.recordType === "string" &&
        data.recordType.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for ping monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link PingFormData} contract.
 *
 * @public
 */
export function isPingFormData(
    data: Partial<MonitorFormData>
): data is PingFormData {
    const hostCandidate: unknown = (data as UnknownRecord)["host"];
    const host = isNonEmptyString(hostCandidate) ? hostCandidate.trim() : "";

    return (
        data.type === "ping" &&
        host.length > 0 &&
        (isValidHost(host) ||
            isValidFQDN(host, {
                "allow_trailing_dot": true,
                "allow_underscores": true,
                "require_tld": false,
            }))
    );
}

/**
 * Type guard to check if form data is for port monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link PortFormData} contract.
 *
 * @public
 */
export function isPortFormData(
    data: Partial<MonitorFormData>
): data is PortFormData {
    const hostCandidate: unknown = (data as UnknownRecord)["host"];
    const host = isNonEmptyString(hostCandidate) ? hostCandidate.trim() : "";

    return (
        data.type === "port" &&
        host.length > 0 &&
        (isValidHost(host) ||
            isValidFQDN(host, {
                "allow_trailing_dot": true,
                "allow_underscores": true,
                "require_tld": false,
            })) &&
        typeof data.port === "number" &&
        isValidPort(data.port)
    );
}

/**
 * Type guard to check if form data is for SSL monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link SslFormData} contract.
 *
 * @public
 */
export function isSslFormData(
    data: Partial<MonitorFormData>
): data is SslFormData {
    const hostCandidate: unknown = (data as UnknownRecord)["host"];
    const host = isNonEmptyString(hostCandidate) ? hostCandidate.trim() : "";

    return (
        data.type === "ssl" &&
        host.length > 0 &&
        (isValidHost(host) ||
            isValidFQDN(host, {
                "allow_trailing_dot": true,
                "allow_underscores": true,
                "require_tld": false,
            })) &&
        typeof data.port === "number" &&
        isValidPort(data.port) &&
        typeof data.certificateWarningDays === "number" &&
        data.certificateWarningDays >= 1 &&
        data.certificateWarningDays <= 365
    );
}

/**
 * Type guard to check if form data is for CDN edge consistency monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link CdnEdgeConsistencyFormData}
 *   contract.
 *
 * @public
 */
export function isCdnEdgeConsistencyFormData(
    data: Partial<MonitorFormData>
): data is CdnEdgeConsistencyFormData {
    return (
        data.type === "cdn-edge-consistency" &&
        typeof data.baselineUrl === "string" &&
        isValidUrl(data.baselineUrl.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.edgeLocations === "string" &&
        data.edgeLocations.trim() !== ""
    );
}

/**
 * Type guard to check if form data is for replication monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link ReplicationFormData} contract.
 *
 * @public
 */
export function isReplicationFormData(
    data: Partial<MonitorFormData>
): data is ReplicationFormData {
    return (
        data.type === "replication" &&
        typeof data.primaryStatusUrl === "string" &&
        isValidUrl(data.primaryStatusUrl.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        typeof data.replicaStatusUrl === "string" &&
        isValidUrl(data.replicaStatusUrl.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        isNonEmptyString(data.replicationTimestampField) &&
        typeof data.maxReplicationLagSeconds === "number" &&
        Number.isFinite(data.maxReplicationLagSeconds)
    );
}

/**
 * Type guard to check if form data is for server heartbeat monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link ServerHeartbeatFormData}
 *   contract.
 *
 * @public
 */
export function isServerHeartbeatFormData(
    data: Partial<MonitorFormData>
): data is ServerHeartbeatFormData {
    return (
        data.type === "server-heartbeat" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            "require_tld": false,
        }) &&
        isNonEmptyString(data.heartbeatStatusField) &&
        isNonEmptyString(data.heartbeatTimestampField) &&
        isNonEmptyString(data.heartbeatExpectedStatus) &&
        typeof data.heartbeatMaxDriftSeconds === "number" &&
        Number.isFinite(data.heartbeatMaxDriftSeconds)
    );
}

/**
 * Type guard to check if form data is for WebSocket keepalive monitor.
 *
 * @param data - Form data to check.
 *
 * @returns `true` if data satisfies the {@link WebsocketKeepaliveFormData}
 *   contract.
 *
 * @public
 */
export function isWebsocketKeepaliveFormData(
    data: Partial<MonitorFormData>
): data is WebsocketKeepaliveFormData {
    return (
        data.type === "websocket-keepalive" &&
        typeof data.url === "string" &&
        isValidUrl(data.url.trim(), {
            allowSingleQuotes: true,
            protocols: ["ws", "wss"],
            "require_tld": false,
        }) &&
        typeof data.maxPongDelayMs === "number" &&
        Number.isFinite(data.maxPongDelayMs)
    );
}

/**
 * Registry of type-specific validation functions.
 *
 * @remarks
 * Non-exported helper powering {@link isValidMonitorFormData}. Extend this map
 * whenever a new monitor type is introduced.
 *
 * @internal
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
 * @param data - Form data candidate to validate.
 *
 * @returns `true` if data satisfies one of the supported monitor form types.
 *
 * @public
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
 * @param data - Form data object.
 * @param property - Property name to access.
 * @param defaultValue - Default value when the property is missing.
 *
 * @returns Property value or the provided default.
 *
 * @public
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
 * @param data - Form data object.
 * @param property - Property name to set.
 * @param value - Value to store for the property.
 *
 * @public
 */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters -- Type parameter ensures type safety for value at call site
export function safeSetFormProperty<T>(
    data: DynamicFormData,
    property: string,
    value: T
): void {
    data[property] = value;
}
