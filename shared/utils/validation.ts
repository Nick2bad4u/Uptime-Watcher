/**
 * Shared validation utilities for monitors and sites.
 *
 * @remarks
 * Provides consistent validation logic across frontend and backend
 * implementations, ensuring data integrity and type safety.
 *
 * @packageDocumentation
 */

import {
    BASE_MONITOR_TYPES,
    isMonitorStatus,
    type Monitor,
    type MonitorType,
    type Site,
    validateMonitor,
} from "@shared/types";
import validator from "validator";

/**
 * Determines whether a value matches a supported monitor type.
 *
 * @remarks
 * Valid monitor types are sourced from {@link BASE_MONITOR_TYPES}, covering all
 * HTTP, port, ping, DNS, and extended monitor categories available in the
 * platform.
 *
 * @param type - Value to evaluate as a monitor type.
 *
 * @returns `true` when the value is a member of {@link MonitorType}.
 */
export function validateMonitorType(type: unknown): type is MonitorType {
    return (
        typeof type === "string" &&
        (BASE_MONITOR_TYPES as readonly string[]).includes(type)
    );
}

/**
 * Determines whether a value resembles a {@link Monitor} object without
 * enforcing required fields.
 *
 * @param value - Arbitrary value supplied for validation.
 *
 * @returns `true` when the value is a non-null object.
 *
 * @internal
 */
function isPartialMonitor(value: unknown): value is Partial<Monitor> {
    return typeof value === "object" && value !== null;
}

/**
 * Validates base monitor metadata shared across all monitor types.
 *
 * @remarks
 * Ensures identifiers, monitor type, and status are present alongside numeric
 * guardrails for interval, timeout, and retry configuration.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateBasicMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.id) {
        errors.push("Monitor id is required");
    }

    if (!monitor.type) {
        errors.push("Monitor type is required");
    } else if (!validateMonitorType(monitor.type)) {
        errors.push("Invalid monitor type");
    }

    if (!monitor.status) {
        errors.push("Monitor status is required");
    } else if (!isMonitorStatus(monitor.status)) {
        errors.push("Invalid monitor status");
    }

    // Validate numeric fields
    if (
        monitor.checkInterval !== undefined &&
        (typeof monitor.checkInterval !== "number" ||
            !Number.isFinite(monitor.checkInterval) ||
            monitor.checkInterval < 1000)
    ) {
        errors.push("Check interval must be at least 1000ms");
    }

    if (
        monitor.timeout !== undefined &&
        (typeof monitor.timeout !== "number" ||
            !Number.isFinite(monitor.timeout) ||
            monitor.timeout <= 0)
    ) {
        errors.push("Timeout must be a positive number");
    }

    if (
        monitor.retryAttempts !== undefined &&
        (typeof monitor.retryAttempts !== "number" ||
            !Number.isFinite(monitor.retryAttempts) ||
            monitor.retryAttempts < 0 ||
            monitor.retryAttempts > 10)
    ) {
        errors.push("Retry attempts must be between 0 and 10");
    }
}

/**
 * Validates common HTTP monitor requirements.
 *
 * @remarks
 * Confirms HTTP monitors declare a URL string; additional HTTP variants layer
 * on top of this base validation.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateHttpMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.url || typeof monitor.url !== "string") {
        errors.push("URL is required for HTTP monitors");
    }
}

/**
 * Validates keyword-driven HTTP monitor requirements.
 *
 * @remarks
 * Builds on {@link validateHttpMonitorFields} by ensuring the expected keyword
 * is supplied and non-empty.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateHttpKeywordMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);
    if (!monitor.bodyKeyword || typeof monitor.bodyKeyword !== "string") {
        errors.push("Keyword is required for HTTP keyword monitors");
    } else if (monitor.bodyKeyword.trim().length === 0) {
        errors.push("Keyword must not be empty");
    }
}

/**
 * Validates header inspection requirements for HTTP monitors.
 *
 * @remarks
 * Ensures both the header name and expected value are supplied and non-empty.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateHttpHeaderMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);

    if (!monitor.headerName || typeof monitor.headerName !== "string") {
        errors.push("Header name is required for HTTP header monitors");
    } else if (monitor.headerName.trim().length === 0) {
        errors.push("Header name must not be empty");
    }

    if (
        !monitor.expectedHeaderValue ||
        typeof monitor.expectedHeaderValue !== "string"
    ) {
        errors.push(
            "Expected header value is required for HTTP header monitors"
        );
    } else if (monitor.expectedHeaderValue.trim().length === 0) {
        errors.push("Expected header value must not be empty");
    }
}

/**
 * Validates HTTP status monitor configuration.
 *
 * @remarks
 * Requires a numeric status code between 100 and 599 in addition to standard
 * HTTP monitor fields.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateHttpStatusMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);
    if (typeof monitor.expectedStatusCode !== "number") {
        errors.push(
            "Expected status code is required for HTTP status monitors"
        );
    } else if (
        !Number.isInteger(monitor.expectedStatusCode) ||
        monitor.expectedStatusCode < 100 ||
        monitor.expectedStatusCode > 599
    ) {
        errors.push("Expected status code must be between 100 and 599");
    }
}

/**
 * Validates HTTP JSON monitor configuration.
 *
 * @remarks
 * Ensures both the JSON path selector and expected value are provided and
 * non-empty, layering on top of base HTTP requirements.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateHttpJsonMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);

    if (!monitor.jsonPath || typeof monitor.jsonPath !== "string") {
        errors.push("JSON path is required for HTTP JSON monitors");
    } else if (monitor.jsonPath.trim().length === 0) {
        errors.push("JSON path must not be empty");
    }

    if (
        !monitor.expectedJsonValue ||
        typeof monitor.expectedJsonValue !== "string"
    ) {
        errors.push("Expected JSON value is required for HTTP JSON monitors");
    } else if (monitor.expectedJsonValue.trim().length === 0) {
        errors.push("Expected JSON value must not be empty");
    }
}

/**
 * Validates HTTP latency monitor thresholds.
 *
 * @remarks
 * Confirms the maximum response time is declared and positive, in addition to
 * the shared HTTP monitor requirements.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateHttpLatencyMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    validateHttpMonitorFields(monitor, errors);

    if (typeof monitor.maxResponseTime !== "number") {
        errors.push(
            "Maximum response time is required for HTTP latency monitors"
        );
        return;
    }

    if (
        !Number.isFinite(monitor.maxResponseTime) ||
        monitor.maxResponseTime <= 0
    ) {
        errors.push(
            "Maximum response time must be a positive number for HTTP latency monitors"
        );
    }
}

/**
 * Validates ping monitor configuration.
 *
 * @remarks
 * Ping monitors simply require a hostname, unlike port monitors which add
 * numeric constraints.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validatePingMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for ping monitors");
    }
}

/**
 * Validates TCP port monitor configuration.
 *
 * @remarks
 * Builds on {@link validatePingMonitorFields} by ensuring the port number falls
 * within the range 1-65,535.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validatePortMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for port monitors");
    }
    if (
        typeof monitor.port !== "number" ||
        !Number.isFinite(monitor.port) ||
        monitor.port < 1 ||
        monitor.port > 65_535
    ) {
        errors.push(
            "Valid port number (1-65535) is required for port monitors"
        );
    }
}

/**
 * Validates DNS monitor configuration.
 *
 * @remarks
 * Requires a hostname and known DNS record type prior to executing lookups.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateDnsMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for DNS monitors");
    }
    if (!monitor.recordType || typeof monitor.recordType !== "string") {
        errors.push("Record type is required for DNS monitors");
    } else {
        const validRecordTypes = [
            "A",
            "AAAA",
            "ANY",
            "CAA",
            "CNAME",
            "MX",
            "NAPTR",
            "NS",
            "PTR",
            "SOA",
            "SRV",
            "TLSA",
            "TXT",
        ];
        if (!validRecordTypes.includes(monitor.recordType.toUpperCase())) {
            errors.push(
                `Invalid record type: ${monitor.recordType}. Valid types are: ${validRecordTypes.join(
                    ", "
                )}`
            );
        }
    }
}

/**
 * Validates SSL monitor configuration.
 *
 * @remarks
 * Confirms host connectivity details and certificate warning thresholds fall
 * within supported bounds.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateSslMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.host || typeof monitor.host !== "string") {
        errors.push("Host is required for SSL monitors");
    }
    if (
        typeof monitor.port !== "number" ||
        !Number.isFinite(monitor.port) ||
        monitor.port < 1 ||
        monitor.port > 65_535
    ) {
        errors.push("Valid port number (1-65535) is required for SSL monitors");
    }
    if (
        typeof monitor.certificateWarningDays !== "number" ||
        !Number.isFinite(monitor.certificateWarningDays) ||
        monitor.certificateWarningDays < 1 ||
        monitor.certificateWarningDays > 365
    ) {
        errors.push(
            "Certificate warning threshold must be between 1 and 365 days for SSL monitors"
        );
    }
}

/**
 * Validates CDN edge consistency monitor configuration.
 *
 * @remarks
 * Ensures a baseline URL is provided and that every listed edge endpoint is a
 * valid HTTP or HTTPS URL. Entries may be separated by commas or newlines.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateCdnEdgeConsistencyMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.baselineUrl || typeof monitor.baselineUrl !== "string") {
        errors.push(
            "Baseline URL is required for CDN edge consistency monitors"
        );
    }

    if (!monitor.edgeLocations || typeof monitor.edgeLocations !== "string") {
        errors.push(
            "Edge locations are required for CDN edge consistency monitors"
        );
        return;
    }

    const entries = monitor.edgeLocations
        .split(/\r?\n|,/v)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0);

    if (entries.length === 0) {
        errors.push("At least one edge endpoint must be provided");
        return;
    }

    for (const entry of entries) {
        const isValid = validator.isURL(entry, {
            allow_protocol_relative_urls: false,
            allow_trailing_dot: false,
            allow_underscores: false,
            disallow_auth: false,
            protocols: ["http", "https"],
            require_host: true,
            require_protocol: true,
            require_tld: true,
            validate_length: true,
        });

        if (!isValid) {
            errors.push(`Invalid edge endpoint URL: ${entry}`);
            break;
        }
    }
}

/**
 * Validates replication monitor configuration.
 *
 * @remarks
 * Requires primary and replica endpoints alongside replication lag thresholds
 * and timestamp metadata field names.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateReplicationMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (
        !monitor.primaryStatusUrl ||
        typeof monitor.primaryStatusUrl !== "string"
    ) {
        errors.push("Primary status URL is required for replication monitors");
    }

    if (
        !monitor.replicaStatusUrl ||
        typeof monitor.replicaStatusUrl !== "string"
    ) {
        errors.push("Replica status URL is required for replication monitors");
    }

    if (
        typeof monitor.maxReplicationLagSeconds !== "number" ||
        !Number.isFinite(monitor.maxReplicationLagSeconds) ||
        monitor.maxReplicationLagSeconds < 0
    ) {
        errors.push(
            "Maximum replication lag seconds must be a non-negative number"
        );
    }

    if (
        !monitor.replicationTimestampField ||
        typeof monitor.replicationTimestampField !== "string" ||
        monitor.replicationTimestampField.trim().length === 0
    ) {
        errors.push(
            "Replication timestamp field is required for replication monitors"
        );
    }
}

/**
 * Validates server heartbeat monitor configuration.
 *
 * @remarks
 * Confirms the expected status, acceptable drift tolerance, and JSON path
 * selectors used to locate heartbeat information in responses.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateServerHeartbeatMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.url || typeof monitor.url !== "string") {
        errors.push("Heartbeat URL is required for server heartbeat monitors");
    }

    if (
        !monitor.heartbeatExpectedStatus ||
        typeof monitor.heartbeatExpectedStatus !== "string" ||
        monitor.heartbeatExpectedStatus.trim().length === 0
    ) {
        errors.push(
            "Expected status is required for server heartbeat monitors"
        );
    }

    if (
        typeof monitor.heartbeatMaxDriftSeconds !== "number" ||
        !Number.isFinite(monitor.heartbeatMaxDriftSeconds) ||
        monitor.heartbeatMaxDriftSeconds < 0
    ) {
        errors.push("Heartbeat drift tolerance must be a non-negative number");
    }

    if (
        !monitor.heartbeatStatusField ||
        typeof monitor.heartbeatStatusField !== "string" ||
        monitor.heartbeatStatusField.trim().length === 0
    ) {
        errors.push(
            "Heartbeat status field is required for server heartbeat monitors"
        );
    }

    if (
        !monitor.heartbeatTimestampField ||
        typeof monitor.heartbeatTimestampField !== "string" ||
        monitor.heartbeatTimestampField.trim().length === 0
    ) {
        errors.push(
            "Heartbeat timestamp field is required for server heartbeat monitors"
        );
    }
}

/**
 * Validates WebSocket keepalive monitor configuration.
 *
 * @remarks
 * Requires a WebSocket URL and positive pong delay threshold to ensure the
 * monitor detects stalled connections.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateWebsocketKeepaliveMonitorFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.url || typeof monitor.url !== "string") {
        errors.push("WebSocket URL is required for keepalive monitors");
    }

    if (
        typeof monitor.maxPongDelayMs !== "number" ||
        !Number.isFinite(monitor.maxPongDelayMs) ||
        monitor.maxPongDelayMs <= 0
    ) {
        errors.push(
            "Maximum pong delay must be a positive number for WebSocket keepalive monitors"
        );
    }
}

/**
 * Applies monitor-type-specific validation routines.
 *
 * @remarks
 * Delegates to individual validation helpers based on the monitor `type`. When
 * the type is unrecognized, an error entry is appended. The function assumes
 * core monitor fields have already been validated.
 *
 * @param monitor - Partial monitor under validation.
 * @param errors - Collector populated with descriptive validation messages.
 *
 * @internal
 */
function validateTypeSpecificFields(
    monitor: Partial<Monitor>,
    errors: string[]
): void {
    if (!monitor.type) {
        return; // Type validation handled separately
    }

    switch (monitor.type) {
        case "cdn-edge-consistency": {
            validateCdnEdgeConsistencyMonitorFields(monitor, errors);
            break;
        }
        case "dns": {
            validateDnsMonitorFields(monitor, errors);
            break;
        }
        case "http": {
            validateHttpMonitorFields(monitor, errors);
            break;
        }
        case "http-header": {
            validateHttpHeaderMonitorFields(monitor, errors);
            break;
        }
        case "http-json": {
            validateHttpJsonMonitorFields(monitor, errors);
            break;
        }
        case "http-keyword": {
            validateHttpKeywordMonitorFields(monitor, errors);
            break;
        }
        case "http-latency": {
            validateHttpLatencyMonitorFields(monitor, errors);
            break;
        }
        case "http-status": {
            validateHttpStatusMonitorFields(monitor, errors);
            break;
        }
        case "ping": {
            validatePingMonitorFields(monitor, errors);
            break;
        }
        case "port": {
            validatePortMonitorFields(monitor, errors);
            break;
        }
        case "replication": {
            validateReplicationMonitorFields(monitor, errors);
            break;
        }
        case "server-heartbeat": {
            validateServerHeartbeatMonitorFields(monitor, errors);
            break;
        }
        case "ssl": {
            validateSslMonitorFields(monitor, errors);
            break;
        }
        case "websocket-keepalive": {
            validateWebsocketKeepaliveMonitorFields(monitor, errors);
            break;
        }
        default: {
            errors.push(`Unknown monitor type: ${String(monitor.type)}`);
            break;
        }
    }
}

/**
 * Computes validation errors for a monitor payload.
 *
 * @remarks
 * Invokes shared and type-specific validators to produce a deterministic list
 * of error messages. The function never throws and always returns an array.
 *
 * @param monitor - Partial monitor data submitted for validation.
 *
 * @returns An array of human-readable error messages (empty when valid).
 */
export function getMonitorValidationErrors(
    monitor: Partial<Monitor>
): string[] {
    const errors: string[] = [];

    // Validate basic required fields
    validateBasicMonitorFields(monitor, errors);

    // Validate type-specific requirements
    validateTypeSpecificFields(monitor, errors);

    return errors;
}

/**
 * Determines whether a partial site payload satisfies the {@link Site} contract.
 *
 * @remarks
 * Validates required site fields and executes monitor-level validation using
 * {@link validateMonitor}. The guard is intentionally defensive to handle
 * user-supplied data.
 *
 * @param site - Partial site data under validation.
 *
 * @returns `true` when the payload represents a well-formed {@link Site}.
 */
export function validateSite(site: Partial<Site>): site is Site {
    // Defensive null/undefined check is necessary for runtime safety with user input
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- Defensive check needed for runtime type safety with potentially malformed user data
    if (typeof site !== "object" || !site) {
        return false;
    }

    return (
        typeof site.identifier === "string" &&
        site.identifier.length > 0 &&
        typeof site.name === "string" &&
        site.name.length > 0 &&
        typeof site.monitoring === "boolean" &&
        Array.isArray(site.monitors) &&
        site.monitors.every(
            (monitor: unknown) =>
                isPartialMonitor(monitor) && validateMonitor(monitor)
        )
    );
}
