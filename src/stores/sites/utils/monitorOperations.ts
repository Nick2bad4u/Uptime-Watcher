/**
 * Monitor operations utility for handling monitor-related operations.
 *
 * @remarks
 * Provides utilities for working with monitor data and configurations,
 * including creation, validation, and manipulation of monitor objects.
 */

import type { UnknownRecord } from "type-fest";

import {
    DEFAULT_MONITOR_CHECK_INTERVAL_MS,
    MIN_MONITOR_CHECK_INTERVAL_MS,
} from "@shared/constants/monitoring";
import {
    BASE_MONITOR_TYPES,
    DEFAULT_MONITOR_STATUS,
    isMonitorStatus,
    type Monitor,
    type MonitorType,
    type Site,
} from "@shared/types";
import { DEFAULT_MONITOR_CONFIG as SHARED_MONITOR_CONFIG } from "@shared/types/monitorConfig";
import { ERROR_CATALOG } from "@shared/utils/errorCatalog";
import { ensureError } from "@shared/utils/errorHandling";
import {
    isNonEmptyString,
    isValidPort,
    isValidUrl,
    safeInteger,
} from "@shared/validation/validatorUtils";

import { logger } from "../../../services/logger";

// Import validateMonitor directly from "@shared/types" if needed

/**
 * Baseline defaults applied to every monitor regardless of type.
 */
const BASE_MONITOR_DEFAULTS = {
    activeOperations: [] as string[],
    history: [] as Monitor["history"],
    responseTime: -1,
    status: DEFAULT_MONITOR_STATUS,
} as const;

const HTTP_SHARED_DEFAULTS = SHARED_MONITOR_CONFIG.http;

function ensureNumberOrFallback(value: unknown, fallback: number): number {
    return typeof value === "number" && Number.isFinite(value)
        ? value
        : fallback;
}

function ensureBooleanOrFallback(value: unknown, fallback: boolean): boolean {
    return typeof value === "boolean" ? value : fallback;
}

function ensureTrimmedStringOrFallback(
    value: unknown,
    fallback: string
): string {
    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length > 0) {
            return trimmed;
        }
    }
    return fallback;
}

function hasSharedMonitorDefaults(
    type: MonitorType
): type is keyof typeof SHARED_MONITOR_CONFIG {
    return Object.hasOwn(SHARED_MONITOR_CONFIG, type);
}

function getSharedMonitorDefaults<T extends keyof typeof SHARED_MONITOR_CONFIG>(
    type: T
): (typeof SHARED_MONITOR_CONFIG)[T] | undefined {
    if (Object.hasOwn(SHARED_MONITOR_CONFIG, type)) {
        return SHARED_MONITOR_CONFIG[type];
    }

    return undefined;
}

const DEFAULT_SSL_WARNING_DAYS = ensureNumberOrFallback(
    (
        SHARED_MONITOR_CONFIG.ssl as
            | undefined
            | { certificateWarningDays?: number }
    )?.certificateWarningDays,
    30
);

const DEFAULT_SHARED_CHECK_INTERVAL = ensureNumberOrFallback(
    HTTP_SHARED_DEFAULTS.checkInterval,
    DEFAULT_MONITOR_CHECK_INTERVAL_MS
);
const DEFAULT_SHARED_RETRY_ATTEMPTS = ensureNumberOrFallback(
    HTTP_SHARED_DEFAULTS.retryAttempts,
    3
);
const DEFAULT_SHARED_TIMEOUT = ensureNumberOrFallback(
    HTTP_SHARED_DEFAULTS.timeout,
    30_000
);
const DEFAULT_SHARED_ENABLED = ensureBooleanOrFallback(
    HTTP_SHARED_DEFAULTS.enabled,
    true
);

const HTTP_HEADER_SHARED_DEFAULTS = getSharedMonitorDefaults("http-header");
const HTTP_HEADER_DEFAULT_HEADER_NAME = ensureTrimmedStringOrFallback(
    HTTP_HEADER_SHARED_DEFAULTS?.headerName,
    "content-type"
);
const HTTP_HEADER_DEFAULT_EXPECTED_VALUE = ensureTrimmedStringOrFallback(
    HTTP_HEADER_SHARED_DEFAULTS?.expectedHeaderValue,
    "application/json"
);
const HTTP_JSON_SHARED_DEFAULTS = getSharedMonitorDefaults("http-json");
const HTTP_JSON_DEFAULT_PATH = ensureTrimmedStringOrFallback(
    HTTP_JSON_SHARED_DEFAULTS?.jsonPath,
    "status"
);
const HTTP_JSON_DEFAULT_EXPECTED_VALUE = ensureTrimmedStringOrFallback(
    HTTP_JSON_SHARED_DEFAULTS?.expectedJsonValue,
    "ok"
);
const HTTP_LATENCY_SHARED_DEFAULTS = getSharedMonitorDefaults("http-latency");
const HTTP_LATENCY_DEFAULT_MAX_RESPONSE_MS = ensureNumberOrFallback(
    HTTP_LATENCY_SHARED_DEFAULTS?.maxResponseTime,
    2000
);
const WEBSOCKET_KEEPALIVE_SHARED_DEFAULTS = getSharedMonitorDefaults(
    "websocket-keepalive"
);
const WEBSOCKET_KEEPALIVE_DEFAULT_MAX_PONG_MS = ensureNumberOrFallback(
    WEBSOCKET_KEEPALIVE_SHARED_DEFAULTS?.maxPongDelayMs,
    1500
);
const WEBSOCKET_KEEPALIVE_DEFAULT_URL = ensureTrimmedStringOrFallback(
    undefined,
    "wss://example.com/socket"
);
const SERVER_HEARTBEAT_SHARED_DEFAULTS =
    getSharedMonitorDefaults("server-heartbeat");
const SERVER_HEARTBEAT_DEFAULT_URL = ensureTrimmedStringOrFallback(
    undefined,
    "https://example.com/heartbeat"
);
const SERVER_HEARTBEAT_DEFAULT_STATUS_FIELD = ensureTrimmedStringOrFallback(
    SERVER_HEARTBEAT_SHARED_DEFAULTS?.heartbeatStatusField,
    "status"
);
const SERVER_HEARTBEAT_DEFAULT_EXPECTED_STATUS = ensureTrimmedStringOrFallback(
    SERVER_HEARTBEAT_SHARED_DEFAULTS?.heartbeatExpectedStatus,
    "ok"
);
const SERVER_HEARTBEAT_DEFAULT_TIMESTAMP_FIELD = ensureTrimmedStringOrFallback(
    SERVER_HEARTBEAT_SHARED_DEFAULTS?.heartbeatTimestampField,
    "timestamp"
);
const SERVER_HEARTBEAT_DEFAULT_MAX_DRIFT_SECONDS = ensureNumberOrFallback(
    SERVER_HEARTBEAT_SHARED_DEFAULTS?.heartbeatMaxDriftSeconds,
    60
);
const REPLICATION_SHARED_DEFAULTS = getSharedMonitorDefaults("replication");
const REPLICATION_DEFAULT_PRIMARY_URL = ensureTrimmedStringOrFallback(
    REPLICATION_SHARED_DEFAULTS?.primaryStatusUrl,
    "https://primary.example.com/status"
);
const REPLICATION_DEFAULT_REPLICA_URL = ensureTrimmedStringOrFallback(
    REPLICATION_SHARED_DEFAULTS?.replicaStatusUrl,
    "https://replica.example.com/status"
);
const REPLICATION_DEFAULT_TIMESTAMP_FIELD = ensureTrimmedStringOrFallback(
    REPLICATION_SHARED_DEFAULTS?.replicationTimestampField,
    "lastAppliedTimestamp"
);
const REPLICATION_DEFAULT_MAX_LAG_SECONDS = ensureNumberOrFallback(
    REPLICATION_SHARED_DEFAULTS?.maxReplicationLagSeconds,
    10
);
const CDN_EDGE_SHARED_DEFAULTS = getSharedMonitorDefaults(
    "cdn-edge-consistency"
);
const CDN_EDGE_DEFAULT_BASELINE_URL = ensureTrimmedStringOrFallback(
    CDN_EDGE_SHARED_DEFAULTS?.baselineUrl,
    "https://origin.example.com/health"
);
const CDN_EDGE_DEFAULT_EDGE_LOCATIONS = ensureTrimmedStringOrFallback(
    CDN_EDGE_SHARED_DEFAULTS?.edgeLocations,
    "https://edge-1.example.com,https://edge-2.example.com"
);

interface MonitorTypeDefaults {
    checkInterval: number;
    enabled: boolean;
    retryAttempts: number;
    timeout: number;
}

function getMonitorTypeDefaults(type: MonitorType): MonitorTypeDefaults {
    const sharedDefaults = hasSharedMonitorDefaults(type)
        ? SHARED_MONITOR_CONFIG[type]
        : undefined;

    return {
        checkInterval: ensureNumberOrFallback(
            sharedDefaults?.checkInterval,
            DEFAULT_SHARED_CHECK_INTERVAL
        ),
        enabled: ensureBooleanOrFallback(
            sharedDefaults?.enabled,
            DEFAULT_SHARED_ENABLED
        ),
        retryAttempts: ensureNumberOrFallback(
            sharedDefaults?.retryAttempts,
            DEFAULT_SHARED_RETRY_ATTEMPTS
        ),
        timeout: ensureNumberOrFallback(
            sharedDefaults?.timeout,
            DEFAULT_SHARED_TIMEOUT
        ),
    };
}

/**
 * Validates and returns a monitor type or default
 */
function validateMonitorType(type: unknown): MonitorType {
    /* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Type validation with runtime checks ensures safe assertions */
    return typeof type === "string" &&
        BASE_MONITOR_TYPES.includes(type as MonitorType)
        ? (type as MonitorType)
        : BASE_MONITOR_TYPES[0];
    /* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Safe type assertion after runtime type validation */
}

/**
 * Adds a monitor to a site
 */
export function addMonitorToSite(site: Site, monitor: Monitor): Site {
    const updatedMonitors = [...site.monitors, monitor];
    return { ...site, monitors: updatedMonitors };
}

/**
 * Finds a monitor in a site by ID
 */
export function findMonitorInSite(
    site: Site,
    monitorId: string
): Monitor | undefined {
    return site.monitors.find((monitor) => monitor.id === monitorId);
}

/**
 * Normalizes monitor data ensuring all required fields are present
 *
 * @example
 *
 * ```typescript
 * const normalized = normalizeMonitor({
 *     id: "123",
 *     url: "https://example.com",
 * });
 * ```
 *
 * @param monitor - Partial monitor object to normalize
 *
 * @returns Complete monitor object with validated and normalized fields
 */
/**
 * Gets the allowed fields for a specific monitor type.
 *
 * @param type - The monitor type
 *
 * @returns Set of field names allowed for this monitor type
 *
 * @internal
 */
function getAllowedFieldsForMonitorType(type: MonitorType): Set<string> {
    // Base fields that all monitors have
    const baseFields = new Set([
        "activeOperations",
        "checkInterval",
        "history",
        "id",
        "lastChecked",
        "monitoring",
        "responseTime",
        "retryAttempts",
        "status",
        "timeout",
        "type",
    ]);

    // Add type-specific fields based on monitor type registry
    switch (type) {
        case "cdn-edge-consistency": {
            baseFields.add("baselineUrl");
            baseFields.add("edgeLocations");
            break;
        }
        case "dns": {
            baseFields.add("expectedValue");
            baseFields.add("host");
            baseFields.add("recordType");
            break;
        }
        case "http": {
            baseFields.add("url");
            break;
        }
        case "http-header": {
            baseFields.add("expectedHeaderValue");
            baseFields.add("headerName");
            baseFields.add("url");
            break;
        }
        case "http-json": {
            baseFields.add("expectedJsonValue");
            baseFields.add("jsonPath");
            baseFields.add("url");
            break;
        }
        case "http-keyword": {
            baseFields.add("bodyKeyword");
            baseFields.add("url");
            break;
        }
        case "http-latency": {
            baseFields.add("maxResponseTime");
            baseFields.add("url");
            break;
        }
        case "http-status": {
            baseFields.add("expectedStatusCode");
            baseFields.add("url");
            break;
        }
        case "ping": {
            baseFields.add("host");
            break;
        }
        case "port": {
            baseFields.add("host");
            baseFields.add("port");
            break;
        }
        case "replication": {
            baseFields.add("primaryStatusUrl");
            baseFields.add("replicaStatusUrl");
            baseFields.add("replicationTimestampField");
            baseFields.add("maxReplicationLagSeconds");
            break;
        }
        case "server-heartbeat": {
            baseFields.add("url");
            baseFields.add("heartbeatStatusField");
            baseFields.add("heartbeatTimestampField");
            baseFields.add("heartbeatExpectedStatus");
            baseFields.add("heartbeatMaxDriftSeconds");
            break;
        }
        case "ssl": {
            baseFields.add("certificateWarningDays");
            baseFields.add("host");
            baseFields.add("port");
            break;
        }
        case "websocket-keepalive": {
            baseFields.add("url");
            baseFields.add("maxPongDelayMs");
            break;
        }
        default: {
            throw new Error(`Unsupported monitor type: ${String(type)}`);
        }
    }

    return baseFields;
}

/**
 * Filters monitor object to only include fields appropriate for its type.
 *
 * @param monitor - Monitor object to filter
 * @param type - Monitor type to use for filtering
 *
 * @returns Filtered monitor object with only appropriate fields
 *
 * @internal
 */
function filterMonitorFieldsByType(
    monitor: Partial<Monitor>,
    type: MonitorType
): Partial<Monitor> {
    const allowedFields = getAllowedFieldsForMonitorType(type);
    const filtered: Partial<Monitor> = {};

    // Only include fields that are allowed for this monitor type
    // Use type assertion to safely access monitor properties
    const monitorRecord = monitor as UnknownRecord;
    for (const [key, value] of Object.entries(monitorRecord)) {
        if (allowedFields.has(key)) {
            (filtered as UnknownRecord)[key] = value;
        }
    }

    return filtered;
}

/**
 * Validates monitor input data before processing.
 *
 * @param monitor - Monitor data to validate
 *
 * @throws TypeError if monitor data is invalid
 *
 * @internal
 */
function validateMonitorInput(monitor: Partial<Monitor>): void {
    if (Array.isArray(monitor)) {
        throw new TypeError(
            "Invalid monitor data: must be an object, not an array"
        );
    }
}

/**
 * Applies type-specific field requirements and defaults for HTTP monitors.
 */
function applyHttpMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    // HTTP monitors require a URL - provide default if missing or invalid
    const urlValue = filteredData["url"];
    monitor.url = isValidUrl(urlValue) ? urlValue : "https://example.com";
}

function applyHttpKeywordMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    applyHttpMonitorDefaults(monitor, filteredData);

    const keywordValue = filteredData["bodyKeyword"];
    if (typeof keywordValue === "string" && keywordValue.trim()) {
        monitor.bodyKeyword = keywordValue.trim();
    } else {
        monitor.bodyKeyword = "status: ok";
    }
}

function applyHttpStatusMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    applyHttpMonitorDefaults(monitor, filteredData);

    const statusValue = filteredData["expectedStatusCode"];
    if (typeof statusValue === "number" && Number.isFinite(statusValue)) {
        const clamped = Math.trunc(statusValue);
        monitor.expectedStatusCode = Math.min(599, Math.max(100, clamped));
    } else {
        monitor.expectedStatusCode = 200;
    }
}

/**
 * Applies type-specific field requirements and defaults for port monitors.
 */
function applyPortMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    // Port monitors require host and port
    const hostValue = filteredData["host"];
    const portValue = filteredData["port"];

    monitor.host = isNonEmptyString(hostValue) ? hostValue : "localhost";
    monitor.port = isValidPort(portValue) ? Number(portValue) : 80;
}

/**
 * Applies type-specific field requirements and defaults for SSL monitors.
 */
function applySslMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    const {
        certificateWarningDays: warningValue,
        host: hostValue,
        port: portValue,
    } = filteredData as {
        certificateWarningDays?: unknown;
        host?: unknown;
        port?: unknown;
    };

    monitor.host = isNonEmptyString(hostValue) ? hostValue : "example.com";
    monitor.port = isValidPort(portValue) ? Number(portValue) : 443;

    const numericWarning =
        typeof warningValue === "number" && Number.isFinite(warningValue)
            ? Math.trunc(warningValue)
            : DEFAULT_SSL_WARNING_DAYS;
    monitor.certificateWarningDays = Math.min(Math.max(numericWarning, 1), 365);
}

/**
 * Applies type-specific field requirements and defaults for ping monitors.
 */
function applyPingMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    const { host: hostValue } = filteredData as { host?: unknown };
    monitor.host = isNonEmptyString(hostValue) ? hostValue : "localhost";
}

/**
 * Applies type-specific field requirements and defaults for DNS monitors.
 */
function applyDnsMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    const {
        expectedValue,
        host: hostValue,
        recordType: recordTypeValue,
    } = filteredData as {
        expectedValue?: unknown;
        host?: unknown;
        recordType?: unknown;
    };

    const recordType: string =
        typeof recordTypeValue === "string" && recordTypeValue
            ? recordTypeValue
            : "A";

    monitor.host = isNonEmptyString(hostValue) ? hostValue : "example.com";
    monitor.recordType = recordType;

    if (typeof expectedValue === "string" && expectedValue.trim()) {
        monitor.expectedValue = expectedValue;
    } else {
        delete monitor.expectedValue;
    }
}

/**
 * Applies type-specific field requirements and defaults for HTTP header
 * monitors.
 */
function applyHttpHeaderMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    applyHttpMonitorDefaults(monitor, filteredData);

    const { expectedHeaderValue, headerName } = filteredData as {
        expectedHeaderValue?: unknown;
        headerName?: unknown;
    };

    monitor.expectedHeaderValue = ensureTrimmedStringOrFallback(
        expectedHeaderValue,
        HTTP_HEADER_DEFAULT_EXPECTED_VALUE
    );
    monitor.headerName = ensureTrimmedStringOrFallback(
        headerName,
        HTTP_HEADER_DEFAULT_HEADER_NAME
    );
}

/**
 * Applies type-specific field requirements and defaults for HTTP JSON monitors.
 */
function applyHttpJsonMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    applyHttpMonitorDefaults(monitor, filteredData);

    const { expectedJsonValue, jsonPath } = filteredData as {
        expectedJsonValue?: unknown;
        jsonPath?: unknown;
    };

    monitor.expectedJsonValue = ensureTrimmedStringOrFallback(
        expectedJsonValue,
        HTTP_JSON_DEFAULT_EXPECTED_VALUE
    );
    monitor.jsonPath = ensureTrimmedStringOrFallback(
        jsonPath,
        HTTP_JSON_DEFAULT_PATH
    );
}

/**
 * Applies type-specific field requirements and defaults for HTTP latency
 * monitors.
 */
function applyHttpLatencyMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    applyHttpMonitorDefaults(monitor, filteredData);

    const { maxResponseTime } = filteredData as {
        maxResponseTime?: unknown;
    };

    let numericLatency = HTTP_LATENCY_DEFAULT_MAX_RESPONSE_MS;
    if (
        typeof maxResponseTime === "number" &&
        Number.isFinite(maxResponseTime)
    ) {
        numericLatency = Math.trunc(maxResponseTime);
    } else if (typeof maxResponseTime === "string") {
        const parsed = Number.parseFloat(maxResponseTime);
        if (Number.isFinite(parsed)) {
            numericLatency = Math.trunc(parsed);
        }
    }

    monitor.maxResponseTime = Math.max(1, numericLatency);
}

/**
 * Applies type-specific field requirements and defaults for WebSocket keepalive
 * monitors.
 */
function applyWebsocketKeepaliveMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    monitor.url = ensureTrimmedStringOrFallback(
        filteredData["url"],
        WEBSOCKET_KEEPALIVE_DEFAULT_URL
    );

    const maxPongDelayValue = filteredData["maxPongDelayMs"];
    let maxPongDelay = WEBSOCKET_KEEPALIVE_DEFAULT_MAX_PONG_MS;
    if (
        typeof maxPongDelayValue === "number" &&
        Number.isFinite(maxPongDelayValue)
    ) {
        maxPongDelay = Math.trunc(maxPongDelayValue);
    } else if (typeof maxPongDelayValue === "string") {
        const parsed = Number.parseInt(maxPongDelayValue, 10);
        if (Number.isFinite(parsed)) {
            maxPongDelay = parsed;
        }
    }

    monitor.maxPongDelayMs = Math.min(Math.max(maxPongDelay, 10), 60_000);
}

/**
 * Applies type-specific field requirements and defaults for server heartbeat
 * monitors.
 */
function applyServerHeartbeatMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    monitor.url = ensureTrimmedStringOrFallback(
        filteredData["url"],
        SERVER_HEARTBEAT_DEFAULT_URL
    );
    monitor.heartbeatStatusField = ensureTrimmedStringOrFallback(
        filteredData["heartbeatStatusField"],
        SERVER_HEARTBEAT_DEFAULT_STATUS_FIELD
    );
    monitor.heartbeatTimestampField = ensureTrimmedStringOrFallback(
        filteredData["heartbeatTimestampField"],
        SERVER_HEARTBEAT_DEFAULT_TIMESTAMP_FIELD
    );
    monitor.heartbeatExpectedStatus = ensureTrimmedStringOrFallback(
        filteredData["heartbeatExpectedStatus"],
        SERVER_HEARTBEAT_DEFAULT_EXPECTED_STATUS
    );

    const maxDriftValue = filteredData["heartbeatMaxDriftSeconds"];
    let maxDrift = SERVER_HEARTBEAT_DEFAULT_MAX_DRIFT_SECONDS;
    if (typeof maxDriftValue === "number" && Number.isFinite(maxDriftValue)) {
        maxDrift = Math.trunc(maxDriftValue);
    } else if (typeof maxDriftValue === "string") {
        const parsed = Number.parseInt(maxDriftValue, 10);
        if (Number.isFinite(parsed)) {
            maxDrift = parsed;
        }
    }

    monitor.heartbeatMaxDriftSeconds = Math.min(
        Math.max(Math.trunc(maxDrift), 1),
        3600
    );
}

/**
 * Applies type-specific field requirements and defaults for replication
 * monitors.
 */
function applyReplicationMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    monitor.primaryStatusUrl = ensureTrimmedStringOrFallback(
        filteredData["primaryStatusUrl"],
        REPLICATION_DEFAULT_PRIMARY_URL
    );
    monitor.replicaStatusUrl = ensureTrimmedStringOrFallback(
        filteredData["replicaStatusUrl"],
        REPLICATION_DEFAULT_REPLICA_URL
    );
    monitor.replicationTimestampField = ensureTrimmedStringOrFallback(
        filteredData["replicationTimestampField"],
        REPLICATION_DEFAULT_TIMESTAMP_FIELD
    );

    const maxLagValue = filteredData["maxReplicationLagSeconds"];
    let maxLagSeconds = REPLICATION_DEFAULT_MAX_LAG_SECONDS;
    if (typeof maxLagValue === "number" && Number.isFinite(maxLagValue)) {
        maxLagSeconds = Math.trunc(maxLagValue);
    } else if (typeof maxLagValue === "string") {
        const parsed = Number.parseInt(maxLagValue, 10);
        if (Number.isFinite(parsed)) {
            maxLagSeconds = parsed;
        }
    }

    monitor.maxReplicationLagSeconds = Math.min(
        Math.max(maxLagSeconds, 0),
        86_400
    );
}

/**
 * Applies type-specific field requirements and defaults for CDN edge
 * consistency monitors.
 */
function applyCdnEdgeConsistencyMonitorDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    monitor.baselineUrl = ensureTrimmedStringOrFallback(
        filteredData["baselineUrl"],
        CDN_EDGE_DEFAULT_BASELINE_URL
    );
    monitor.edgeLocations = ensureTrimmedStringOrFallback(
        filteredData["edgeLocations"],
        CDN_EDGE_DEFAULT_EDGE_LOCATIONS
    );
}

/**
 * Applies type-specific field requirements and defaults based on monitor type.
 */
function applyTypeSpecificDefaults(
    monitor: Monitor,
    filteredData: UnknownRecord
): void {
    switch (monitor.type) {
        case "cdn-edge-consistency": {
            applyCdnEdgeConsistencyMonitorDefaults(monitor, filteredData);
            break;
        }
        case "dns": {
            applyDnsMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http": {
            applyHttpMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http-header": {
            applyHttpHeaderMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http-json": {
            applyHttpJsonMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http-keyword": {
            applyHttpKeywordMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http-latency": {
            applyHttpLatencyMonitorDefaults(monitor, filteredData);
            break;
        }
        case "http-status": {
            applyHttpStatusMonitorDefaults(monitor, filteredData);
            break;
        }
        case "ping": {
            applyPingMonitorDefaults(monitor, filteredData);
            break;
        }
        case "port": {
            applyPortMonitorDefaults(monitor, filteredData);
            break;
        }
        case "replication": {
            applyReplicationMonitorDefaults(monitor, filteredData);
            break;
        }
        case "server-heartbeat": {
            applyServerHeartbeatMonitorDefaults(monitor, filteredData);
            break;
        }
        case "ssl": {
            applySslMonitorDefaults(monitor, filteredData);
            break;
        }
        case "websocket-keepalive": {
            applyWebsocketKeepaliveMonitorDefaults(monitor, filteredData);
            break;
        }
        default: {
            throw new Error(
                `Unsupported monitor type: ${String(monitor.type)}`
            );
        }
    }
}

/**
 * Normalizes a partial monitor object into a complete Monitor instance.
 *
 * @remarks
 * This function takes a partial monitor configuration and ensures it has all
 * required fields with appropriate defaults, validates the data types, and
 * filters fields based on monitor type.
 *
 * @param monitor - Partial monitor data to normalize
 *
 * @returns Complete Monitor object with validated and normalized data
 *
 * @throws TypeError if monitor data is invalid or malformed
 *
 * @public
 */
/* eslint-disable @typescript-eslint/no-unsafe-type-assertion -- Safe: Dynamic property access with runtime validation after filtering */
export function normalizeMonitor(monitor: Partial<Monitor>): Monitor {
    // Validate input data
    validateMonitorInput(monitor);

    // Cast to unknown first to avoid strict type issues with Partial<Monitor>
    const monitorData = monitor as unknown as UnknownRecord;
    const finalizedType = validateMonitorType(monitorData["type"]);

    // Filter the monitor data to only include fields appropriate for this type
    const filteredMonitor = filterMonitorFieldsByType(monitor, finalizedType);

    // Cast filtered monitor for safe access
    const filteredData = filteredMonitor as unknown as UnknownRecord;

    // Generate a valid ID - handle empty strings as falsy
    const rawId = filteredData["id"] as string | undefined;
    const validId = isNonEmptyString(rawId) ? rawId : crypto.randomUUID();

    const monitorTypeDefaults = getMonitorTypeDefaults(finalizedType);

    // Build base monitor object with guaranteed required fields
    const baseMonitor: Monitor = {
        activeOperations: Array.isArray(filteredData["activeOperations"])
            ? (filteredData["activeOperations"] as string[])
            : BASE_MONITOR_DEFAULTS.activeOperations,
        checkInterval: safeInteger(
            filteredData["checkInterval"] as number | undefined,
            monitorTypeDefaults.checkInterval,
            MIN_MONITOR_CHECK_INTERVAL_MS
        ),
        history: Array.isArray(filteredData["history"])
            ? (filteredData["history"] as Monitor["history"])
            : BASE_MONITOR_DEFAULTS.history,
        id: validId,
        monitoring:
            (filteredData["monitoring"] as boolean | undefined) ??
            monitorTypeDefaults.enabled,
        responseTime:
            typeof filteredData["responseTime"] === "number"
                ? filteredData["responseTime"]
                : BASE_MONITOR_DEFAULTS.responseTime,
        retryAttempts: safeInteger(
            filteredData["retryAttempts"] as number | undefined,
            monitorTypeDefaults.retryAttempts,
            0,
            10
        ),
        status:
            filteredData["status"] &&
            isMonitorStatus(filteredData["status"] as string)
                ? (filteredData["status"] as Monitor["status"])
                : BASE_MONITOR_DEFAULTS.status,
        timeout: safeInteger(
            filteredData["timeout"] as number | undefined,
            monitorTypeDefaults.timeout,
            1000,
            300_000
        ),
        type: finalizedType,
    };

    // Apply type-specific defaults
    applyTypeSpecificDefaults(baseMonitor, filteredData);

    // Add optional fields that were provided and valid
    if (filteredData["lastChecked"] instanceof Date) {
        baseMonitor.lastChecked = filteredData["lastChecked"];
    }

    return baseMonitor;
}
/* eslint-enable @typescript-eslint/no-unsafe-type-assertion -- Re-enable after safe monitor configuration type assertions */

/**
 * Creates a default monitor for a site
 *
 * @example
 *
 * ```typescript
 * const monitor = createDefaultMonitor({ url: "https://example.com" });
 * ```
 *
 * @param overrides - Partial monitor object to override defaults
 *
 * @returns Complete monitor object with defaults applied
 */
export function createDefaultMonitor(
    overrides: Partial<Monitor> = {}
): Monitor {
    // Delegate to normalizeMonitor to avoid divergence in default/validation logic
    return normalizeMonitor(overrides);
}

/**
 * Removes a monitor from a site
 *
 * @example
 *
 * ```typescript
 * const updatedSite = removeMonitorFromSite(site, "monitor-123");
 * ```
 *
 * @param site - The site to remove the monitor from
 * @param monitorId - The ID of the monitor to remove
 *
 * @returns Updated site without the specified monitor
 */
export function removeMonitorFromSite(site: Site, monitorId: string): Site {
    const updatedMonitors = site.monitors.filter(
        (monitor) => monitor.id !== monitorId
    );
    return { ...site, monitors: updatedMonitors };
}

/**
 * Updates a monitor in a site
 *
 * @example
 *
 * ```typescript
 * const updatedSite = updateMonitorInSite(site, "monitor-123", {
 *     timeout: 10000,
 * });
 * ```
 *
 * @param site - The site containing the monitor
 * @param monitorId - The ID of the monitor to update
 * @param updates - Partial monitor updates to apply
 *
 * @returns Updated site with modified monitor
 *
 * @throws Error if monitor is not found
 */
export function updateMonitorInSite(
    site: Site,
    monitorId: string,
    updates: Partial<Monitor>
): Site {
    const monitorExists = site.monitors.some(
        (monitor) => monitor.id === monitorId
    );
    if (!monitorExists) {
        throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
    }

    // Updates may be contaminated; rely on normalizeMonitor for sanitation instead of pre-validating which could throw
    const updatedMonitors = site.monitors.map((monitor) => {
        if (monitor.id !== monitorId) return monitor;

        // Preserve the original monitor ID throughout the update process
        const originalId = monitor.id;
        // Always work with a normalized baseline to avoid undefined fields lingering
        const baseline = normalizeMonitor(monitor);
        try {
            // Ignore any id field in updates to preserve original monitor identity
            const restUpdates = { ...updates };
            delete (restUpdates as { id?: unknown }).id;
            const merged: Partial<Monitor> = {
                ...baseline,
                ...restUpdates,
                id: originalId, // Use original ID, not the potentially changed baseline ID
            };
            const normalized = normalizeMonitor(merged);
            // Ensure the ID is definitely preserved after normalization
            normalized.id = originalId;
            return normalized;
        } catch (error) {
            // If updates are invalid, keep the baseline (already normalized) but preserve original ID
            logger.error(
                `Failed to update monitor ${monitorId}:`,
                ensureError(error)
            );
            baseline.id = originalId; // Ensure original ID is preserved even in error case
            return baseline;
        }
    });

    return { ...site, monitors: updatedMonitors };
}

/**
 * Validates that a monitor exists in a site
 *
 * @example
 *
 * ```typescript
 * validateMonitorExists(site, "monitor-123");
 * ```
 *
 * @param site - The site to check for the monitor
 * @param monitorId - The ID of the monitor to validate
 *
 * @throws Error if site is not found or monitor does not exist
 */
export function validateMonitorExists(
    site: Site | undefined,
    monitorId: string
): void {
    if (!site) {
        throw new Error(ERROR_CATALOG.sites.NOT_FOUND);
    }

    const monitor = findMonitorInSite(site, monitorId);
    if (!monitor) {
        throw new Error(ERROR_CATALOG.monitors.NOT_FOUND);
    }
}

/**
 * Creates monitor update operations
 */
export const monitorOperations = {
    /**
     * Toggle monitor monitoring state
     */
    toggleMonitoring: (monitor: Monitor): Monitor => ({
        ...monitor,
        monitoring: !monitor.monitoring,
    }),
    /**
     * Update monitor check interval
     */
    updateCheckInterval: (monitor: Monitor, interval: number): Monitor => ({
        ...monitor,
        checkInterval: interval,
    }),
    /**
     * Update monitor retry attempts
     */
    updateRetryAttempts: (
        monitor: Monitor,
        retryAttempts: number
    ): Monitor => ({
        ...monitor,
        retryAttempts,
    }),
    /**
     * Update monitor status
     *
     * @param monitor - The monitor to update
     * @param status - The new status to set
     *
     * @returns Updated monitor with validated status
     *
     * @throws Error if status is not valid
     */
    updateStatus: (monitor: Monitor, status: Monitor["status"]): Monitor => {
        if (!isMonitorStatus(status)) {
            throw new Error("Invalid monitor status");
        }
        return {
            ...monitor,
            status,
        };
    },
    /**
     * Update monitor timeout
     */
    updateTimeout: (monitor: Monitor, timeout: number): Monitor => ({
        ...monitor,
        timeout,
    }),
};
