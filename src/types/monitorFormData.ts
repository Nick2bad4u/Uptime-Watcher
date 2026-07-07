/**
 * Type definitions for monitor form data interfaces.
 *
 * @remarks
 * Provides structured types that power renderer monitor forms, replacing loose
 * index signatures with explicit shapes while preserving runtime flexibility.
 *
 * @public
 */

import type { MonitorType } from "@shared/types";
import type { DnsRecordType } from "@shared/types/schemaTypes";
import type { Simplify, UnknownRecord } from "type-fest";

import type { RequireAllOrNoneFields } from "./typeUtils";

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
    /** Monitor type identifier */
    type?: MonitorType;
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
    recordType: DnsRecordType;
    type: "dns";
}

/**
 * Dynamic form data for extensible monitor types.
 *
 * @remarks
 * Used when the monitor fields are not known at compile time but the renderer
 * still wants autocomplete for shared primitives.
 *
 * @public
 */
export interface DynamicFormData extends UnknownRecord {
    /** Monitor check interval in milliseconds */
    checkInterval?: number;
    monitoring?: boolean;
    /** Number of retry attempts on failure */
    retryAttempts?: number;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Monitor type identifier */
    type?: MonitorType;
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

type HeaderExpectationFields = RequireAllOrNoneFields<HeaderExpectationShape>;

interface HeaderExpectationShape {
    /** Expected value for the specified response header */
    expectedHeaderValue?: string;
    /** Header name to inspect */
    headerName?: string;
}

type HeartbeatRequirementFields =
    RequireAllOrNoneFields<HeartbeatRequirementShape>;

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

type JsonExpectationFields = RequireAllOrNoneFields<JsonExpectationShape>;
interface JsonExpectationShape {
    /** Expected value at the JSON path */
    expectedJsonValue?: string;
    /** JSON path to evaluate in the response body */
    jsonPath?: string;
}
type ReplicationRequirementFields =
    RequireAllOrNoneFields<ReplicationRequirementShape>;
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
