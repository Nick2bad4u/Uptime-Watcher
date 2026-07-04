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
import type { SetOptional, Simplify, UnknownRecord } from "type-fest";

import { getOwnDataProperty } from "@shared/utils/errorPropertyAccess";
import { safeObjectAccess } from "@shared/utils/objectSafety";
import { isNonEmptyString } from "@shared/utils/typeGuards";
import { castUnchecked } from "@shared/utils/typeHelpers";
import { validateMonitorType } from "@shared/utils/validation";
import {
    isValidFQDN,
    isValidHost,
    isValidPort,
    isValidUrl,
} from "@shared/validation/validatorUtils";
import { isFinite as isFiniteNumber, isInteger } from "ts-extras";

import type { RequireAllOrNoneFields } from "./typeUtils";

const URL_VALIDATION_OPTIONS = {
    allowSingleQuotes: true,
    require_tld: false,
} as const;

const FQDN_VALIDATION_OPTIONS = {
    allow_trailing_dot: true,
    allow_underscores: true,
    require_tld: false,
} as const;

const WEBSOCKET_URL_VALIDATION_OPTIONS = {
    ...URL_VALIDATION_OPTIONS,
    protocols: ["ws", "wss"],
};

const getStringFormField = (
    data: object,
    fieldName: PropertyKey
): string | undefined => {
    const property = getOwnDataProperty(data, fieldName);
    return property.found && typeof property.value === "string"
        ? property.value
        : undefined;
};

const getNumberFormField = (
    data: object,
    fieldName: PropertyKey
): number | undefined => {
    const property = getOwnDataProperty(data, fieldName);
    return property.found && typeof property.value === "number"
        ? property.value
        : undefined;
};

const getNormalizedHostField = (data: object): string => {
    const hostCandidate = getStringFormField(data, "host");
    return isNonEmptyString(hostCandidate) ? hostCandidate.trim() : "";
};

const getMonitorTypeField = (data: object): MonitorType | undefined => {
    const type = getStringFormField(data, "type");
    return validateMonitorType(type) ? type : undefined;
};

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
export interface CreateDefaultFormData {
    (
        type: "cdn-edge-consistency"
    ): SetOptional<CdnEdgeConsistencyFormData, CdnEdgeConsistencyOptionalKeys>;
    (type: "dns"): SetOptional<DnsFormData, "host" | "recordType">;
    (
        type: "http-header"
    ): SetOptional<HttpHeaderFormData, HttpHeaderOptionalKeys>;
    (type: "http-json"): SetOptional<HttpJsonFormData, HttpJsonOptionalKeys>;
    (type: "http"): SetOptional<HttpFormData, "url">;
    (
        type: "http-keyword"
    ): SetOptional<HttpKeywordFormData, "bodyKeyword" | "url">;
    (
        type: "http-latency"
    ): SetOptional<HttpLatencyFormData, HttpLatencyOptionalKeys>;
    (
        type: "http-status"
    ): SetOptional<HttpStatusFormData, "expectedStatusCode" | "url">;
    (type: "ping"): SetOptional<PingFormData, "host">;
    (type: "port"): SetOptional<PortFormData, "host" | "port">;
    (
        type: "replication"
    ): SetOptional<ReplicationFormData, ReplicationOptionalKeys>;
    (
        type: "server-heartbeat"
    ): SetOptional<ServerHeartbeatFormData, ServerHeartbeatOptionalKeys>;
    (
        type: "ssl"
    ): SetOptional<SslFormData, "certificateWarningDays" | "host" | "port">;
    (
        type: "websocket-keepalive"
    ): SetOptional<WebsocketKeepaliveFormData, WebsocketKeepaliveOptionalKeys>;
    (type: MonitorType): SetOptional<BaseFormData, never>;
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

// Optional key definitions for default form data creation
type CdnEdgeConsistencyOptionalKeys = "baselineUrl" | "edgeLocations";

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

type HttpHeaderOptionalKeys = "expectedHeaderValue" | "headerName" | "url";

type HttpJsonOptionalKeys = "expectedJsonValue" | "jsonPath" | "url";

type HttpLatencyOptionalKeys = "maxResponseTime" | "url";
type JsonExpectationFields = RequireAllOrNoneFields<JsonExpectationShape>;
interface JsonExpectationShape {
    /** Expected value at the JSON path */
    expectedJsonValue?: string;
    /** JSON path to evaluate in the response body */
    jsonPath?: string;
}
type ReplicationOptionalKeys =
    | "maxReplicationLagSeconds"
    | "primaryStatusUrl"
    | "replicaStatusUrl"
    | "replicationTimestampField";
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
type ServerHeartbeatOptionalKeys =
    | "heartbeatExpectedStatus"
    | "heartbeatMaxDriftSeconds"
    | "heartbeatStatusField"
    | "heartbeatTimestampField"
    | "url";

type WebsocketKeepaliveOptionalKeys = "maxPongDelayMs" | "url";

function createDefaultFormDataImpl(
    type: MonitorType
): SetOptional<BaseFormData, never> {
    // Defensive runtime validation in case callers circumvent TypeScript.
    if (!validateMonitorType(type)) {
        throw new Error(
            "[createDefaultFormData] Invalid monitor type provided"
        );
    }

    return {
        checkInterval: 300_000, // 5 minutes
        monitoring: true,
        retryAttempts: 3,
        timeout: 10_000, // 10 seconds
        type,
    };
}

export const createDefaultFormData: CreateDefaultFormData = castUnchecked(
    createDefaultFormDataImpl
);

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
    const baselineUrl = getStringFormField(data, "baselineUrl");
    const edgeLocations = getStringFormField(data, "edgeLocations");

    return (
        getStringFormField(data, "type") === "cdn-edge-consistency" &&
        typeof baselineUrl === "string" &&
        isValidUrl(baselineUrl.trim(), URL_VALIDATION_OPTIONS) &&
        typeof edgeLocations === "string" &&
        edgeLocations.trim() !== ""
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
    const host = getNormalizedHostField(data);
    const recordType = getStringFormField(data, "recordType");

    return (
        getStringFormField(data, "type") === "dns" &&
        host.length > 0 &&
        (isValidHost(host) || isValidFQDN(host, FQDN_VALIDATION_OPTIONS)) &&
        typeof recordType === "string" &&
        recordType.trim() !== ""
    );
}

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
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "http" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS)
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
    const expectedHeaderValue = getStringFormField(data, "expectedHeaderValue");
    const headerName = getStringFormField(data, "headerName");
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "http-header" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS) &&
        typeof headerName === "string" &&
        headerName.trim() !== "" &&
        typeof expectedHeaderValue === "string" &&
        expectedHeaderValue.trim() !== ""
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
    const expectedJsonValue = getStringFormField(data, "expectedJsonValue");
    const jsonPath = getStringFormField(data, "jsonPath");
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "http-json" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS) &&
        typeof jsonPath === "string" &&
        jsonPath.trim() !== "" &&
        typeof expectedJsonValue === "string" &&
        expectedJsonValue.trim() !== ""
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
    const bodyKeyword = getStringFormField(data, "bodyKeyword");
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "http-keyword" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS) &&
        typeof bodyKeyword === "string" &&
        bodyKeyword.trim() !== ""
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
    const maxResponseTime = getNumberFormField(data, "maxResponseTime");
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "http-latency" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS) &&
        typeof maxResponseTime === "number" &&
        isFiniteNumber(maxResponseTime) &&
        maxResponseTime > 0
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
    const expectedStatusCode = getNumberFormField(data, "expectedStatusCode");
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "http-status" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS) &&
        typeof expectedStatusCode === "number" &&
        isInteger(expectedStatusCode) &&
        expectedStatusCode >= 100 &&
        expectedStatusCode <= 599
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
    const host = getNormalizedHostField(data);

    return (
        getStringFormField(data, "type") === "ping" &&
        host.length > 0 &&
        (isValidHost(host) || isValidFQDN(host, FQDN_VALIDATION_OPTIONS))
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
    const host = getNormalizedHostField(data);
    const port = getNumberFormField(data, "port");

    return (
        getStringFormField(data, "type") === "port" &&
        host.length > 0 &&
        (isValidHost(host) || isValidFQDN(host, FQDN_VALIDATION_OPTIONS)) &&
        typeof port === "number" &&
        isValidPort(port)
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
    const maxReplicationLagSeconds = getNumberFormField(
        data,
        "maxReplicationLagSeconds"
    );
    const primaryStatusUrl = getStringFormField(data, "primaryStatusUrl");
    const replicaStatusUrl = getStringFormField(data, "replicaStatusUrl");
    const replicationTimestampField = getStringFormField(
        data,
        "replicationTimestampField"
    );

    return (
        getStringFormField(data, "type") === "replication" &&
        typeof primaryStatusUrl === "string" &&
        isValidUrl(primaryStatusUrl.trim(), URL_VALIDATION_OPTIONS) &&
        typeof replicaStatusUrl === "string" &&
        isValidUrl(replicaStatusUrl.trim(), URL_VALIDATION_OPTIONS) &&
        isNonEmptyString(replicationTimestampField) &&
        typeof maxReplicationLagSeconds === "number" &&
        isFiniteNumber(maxReplicationLagSeconds)
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
    const heartbeatExpectedStatus = getStringFormField(
        data,
        "heartbeatExpectedStatus"
    );
    const heartbeatMaxDriftSeconds = getNumberFormField(
        data,
        "heartbeatMaxDriftSeconds"
    );
    const heartbeatStatusField = getStringFormField(
        data,
        "heartbeatStatusField"
    );
    const heartbeatTimestampField = getStringFormField(
        data,
        "heartbeatTimestampField"
    );
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "server-heartbeat" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), URL_VALIDATION_OPTIONS) &&
        isNonEmptyString(heartbeatStatusField) &&
        isNonEmptyString(heartbeatTimestampField) &&
        isNonEmptyString(heartbeatExpectedStatus) &&
        typeof heartbeatMaxDriftSeconds === "number" &&
        isFiniteNumber(heartbeatMaxDriftSeconds)
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
    const certificateWarningDays = getNumberFormField(
        data,
        "certificateWarningDays"
    );
    const host = getNormalizedHostField(data);
    const port = getNumberFormField(data, "port");

    return (
        getStringFormField(data, "type") === "ssl" &&
        host.length > 0 &&
        (isValidHost(host) || isValidFQDN(host, FQDN_VALIDATION_OPTIONS)) &&
        typeof port === "number" &&
        isValidPort(port) &&
        typeof certificateWarningDays === "number" &&
        certificateWarningDays >= 1 &&
        certificateWarningDays <= 365
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
    const maxPongDelayMs = getNumberFormField(data, "maxPongDelayMs");
    const url = getStringFormField(data, "url");

    return (
        getStringFormField(data, "type") === "websocket-keepalive" &&
        typeof url === "string" &&
        isValidUrl(url.trim(), WEBSOCKET_URL_VALIDATION_OPTIONS) &&
        typeof maxPongDelayMs === "number" &&
        isFiniteNumber(maxPongDelayMs)
    );
}

/**
 * Registry of type-specific validation functions.
 *
 * @remarks
 * Keep this registry in sync whenever a new monitor type is introduced.
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

    const monitorType = getMonitorTypeField(data);
    if (!monitorType) {
        return false;
    }

    const validator = FORM_DATA_VALIDATORS[monitorType];

    const typedFormData = castUnchecked<Partial<MonitorFormData>>(data);
    return validator(typedFormData);
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
    return safeObjectAccess(data, property, defaultValue);
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
export function safeSetFormProperty(
    data: DynamicFormData,
    property: string,
    value: unknown
): void {
    Object.defineProperty(data, property, {
        configurable: true,
        enumerable: true,
        value,
        writable: true,
    });
}
