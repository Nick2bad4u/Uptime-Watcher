/**
 * Canonical monitor field map used for client-side monitor validation.
 *
 * @remarks
 * Several UI modules need a consistent "field name to raw string" map for
 * validating monitor-type-specific fields and building monitor payloads.
 *
 * This module centralizes the mapping from UI-facing state keys (for example
 * `maxResponseTimeMs`) to canonical field names (for example
 * `maxResponseTime`).
 */

/**
 * Common monitor fields shared by the input and canonical field maps.
 */
interface MonitorValidationFieldValuesBase {
    baselineUrl: string;
    bodyKeyword: string;
    certificateWarningDays: string;
    edgeLocations: string;
    expectedHeaderValue: string;
    expectedJsonValue: string;
    expectedStatusCode: string;
    expectedValue: string;
    headerName: string;
    heartbeatExpectedStatus: string;
    heartbeatMaxDriftSeconds: string;
    heartbeatStatusField: string;
    heartbeatTimestampField: string;
    host: string;
    jsonPath: string;
    maxPongDelayMs: string;
    maxReplicationLagSeconds: string;
    port: string;
    primaryStatusUrl: string;
    recordType: string;
    replicaStatusUrl: string;
    replicationTimestampField: string;
    url: string;
}

/**
 * Canonical monitor validation fields.
 *
 * @remarks
 * All values are raw strings as entered by the user.
 */
export interface MonitorValidationFieldValues extends MonitorValidationFieldValuesBase {
    /**
     * Dynamic monitor field values are keyed by the backend field name.
     */
    [fieldName: string]: string;

    /** Canonical field name (milliseconds). */
    maxResponseTime: string;
}

/**
 * UI-facing inputs used to build {@link MonitorValidationFieldValues}.
 */
export interface MonitorValidationFieldValuesInput extends MonitorValidationFieldValuesBase {
    /** UI label (milliseconds). Mapped to `maxResponseTime`. */
    maxResponseTimeMs: string;
}

/**
 * Builds a canonical monitor validation field map from UI state.
 */
export function buildMonitorValidationFieldValues(
    input: MonitorValidationFieldValuesInput
): MonitorValidationFieldValues {
    return {
        baselineUrl: input.baselineUrl,
        bodyKeyword: input.bodyKeyword,
        certificateWarningDays: input.certificateWarningDays,
        edgeLocations: input.edgeLocations,
        expectedHeaderValue: input.expectedHeaderValue,
        expectedJsonValue: input.expectedJsonValue,
        expectedStatusCode: input.expectedStatusCode,
        expectedValue: input.expectedValue,
        headerName: input.headerName,
        heartbeatExpectedStatus: input.heartbeatExpectedStatus,
        heartbeatMaxDriftSeconds: input.heartbeatMaxDriftSeconds,
        heartbeatStatusField: input.heartbeatStatusField,
        heartbeatTimestampField: input.heartbeatTimestampField,
        host: input.host,
        jsonPath: input.jsonPath,
        maxPongDelayMs: input.maxPongDelayMs,
        maxReplicationLagSeconds: input.maxReplicationLagSeconds,
        maxResponseTime: input.maxResponseTimeMs,
        port: input.port,
        primaryStatusUrl: input.primaryStatusUrl,
        recordType: input.recordType,
        replicaStatusUrl: input.replicaStatusUrl,
        replicationTimestampField: input.replicationTimestampField,
        url: input.url,
    };
}
