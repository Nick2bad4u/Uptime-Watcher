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
 * Validates monitor type.
 *
 * @remarks
 * Supports all monitor types: HTTP, port, ping, and DNS monitors.
 *
 * @param type - Value to check as monitor type
 *
 * @returns Type predicate indicating if the value is a valid MonitorType
 */
export function validateMonitorType(type: unknown): type is MonitorType {
    return (
        typeof type === "string" &&
        (BASE_MONITOR_TYPES as readonly string[]).includes(type)
    );
}

/**
 * Type guard to check if a value is a partial monitor object.
 *
 * @param value - Value to check
 *
 * @returns Type predicate indicating if the value could be a partial monitor
 */
function isPartialMonitor(value: unknown): value is Partial<Monitor> {
    return typeof value === "object" && value !== null;
}

/**
 * Validates basic required monitor fields.
 *
 * @remarks
 * Checks for required fields such as id, type, and status, and validates their
 * types. Adds error messages to the provided errors array for any missing or
 * invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates HTTP monitor-specific fields.
 *
 * @remarks
 * Checks that the url field is present and a string. Adds an error message if
 * missing or invalid.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates HTTP keyword monitor-specific fields.
 *
 * @remarks
 * Checks that the url and bodyKeyword fields are present and valid. The
 * bodyKeyword field must be a non-empty string. Adds error messages for any
 * missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates HTTP header monitor-specific fields.
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
 * Validates HTTP status monitor-specific fields.
 *
 * @remarks
 * Checks that the url field is present and a string, and that the
 * expectedStatusCode is a number between 100 and 599. Adds error messages for
 * any missing or invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates HTTP JSON monitor-specific fields.
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
 * Validates HTTP latency monitor-specific fields.
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
 * Validates ping monitor-specific fields.
 *
 * @remarks
 * Checks that the host field is present and a string. Ping monitors only
 * require a host field, unlike port monitors which also require a port number.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates port monitor-specific fields.
 *
 * @remarks
 * Checks that the host field is present and a string, and that the port is a
 * valid number in the range 1-65535. Adds error messages for any missing or
 * invalid fields.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates DNS monitor-specific fields.
 *
 * @remarks
 * Checks that the hostname field is present and a string, and that recordType
 * is a valid DNS record type. DNS monitors require hostname (not host) and
 * recordType fields for proper DNS resolution.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates SSL monitor-specific fields.
 *
 * @remarks
 * Ensures host, port, and certificate warning threshold are valid.
 *
 * @param monitor - Partial monitor object to validate.
 * @param errors - Array to collect validation error messages.
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
 * Validates CDN edge consistency monitor fields.
 *
 * Adds error messages for missing baseline URL or invalid edge locations.
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
 * Validates replication monitor fields.
 *
 * Ensures both endpoints, timestamp field, and lag threshold are present.
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
 * Validates server heartbeat monitor fields.
 *
 * Checks expected status, drift tolerance, and JSON path fields.
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
 * Validates WebSocket keepalive monitor fields.
 *
 * Confirms URL presence and positive pong delay threshold.
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
 * Gets validation errors for monitor fields based on monitor type.
 *
 * @remarks
 * Validates required fields and type-specific constraints for monitors. Returns
 * descriptive error messages for any validation failures.
 *
 * @param monitor - Partial monitor data to validate
 *
 * @returns Array of validation error messages (empty if valid)
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
 * Validates site data structure.
 *
 * @remarks
 * Performs comprehensive validation of site structure including all monitors.
 * Uses proper type guards to ensure runtime safety.
 *
 * @param site - Partial site data to validate
 *
 * @returns Type predicate indicating if the site is valid
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
