/**
 * Utilities for wiring AddSiteForm state setters into DynamicMonitorFields.
 */

import type { MonitorFieldSetters } from "./monitorFieldSetters";

export type DynamicFieldChangeSetterBag = MonitorFieldSetters;

const toStringSetter =
    (setter: (value: string) => void) =>
    (value: number | string): void => {
        setter(String(value));
    };

/**
 * Creates the `onChange` handler map expected by
 * {@link src/components/AddSiteForm/DynamicMonitorFields#DynamicMonitorFields}.
 */
export function createDynamicFieldChangeHandlers(
    setters: DynamicFieldChangeSetterBag
): Readonly<Record<string, (value: number | string) => void>> {
    return {
        baselineUrl: toStringSetter(setters.setBaselineUrl),
        bodyKeyword: toStringSetter(setters.setBodyKeyword),
        certificateWarningDays: toStringSetter(
            setters.setCertificateWarningDays
        ),
        edgeLocations: toStringSetter(setters.setEdgeLocations),
        expectedHeaderValue: toStringSetter(setters.setExpectedHeaderValue),
        expectedJsonValue: toStringSetter(setters.setExpectedJsonValue),
        expectedStatusCode: toStringSetter(setters.setExpectedStatusCode),
        expectedValue: toStringSetter(setters.setExpectedValue),
        headerName: toStringSetter(setters.setHeaderName),
        heartbeatExpectedStatus: toStringSetter(
            setters.setHeartbeatExpectedStatus
        ),
        heartbeatMaxDriftSeconds: toStringSetter(
            setters.setHeartbeatMaxDriftSeconds
        ),
        heartbeatStatusField: toStringSetter(setters.setHeartbeatStatusField),
        heartbeatTimestampField: toStringSetter(
            setters.setHeartbeatTimestampField
        ),
        host: toStringSetter(setters.setHost),
        jsonPath: toStringSetter(setters.setJsonPath),
        maxPongDelayMs: toStringSetter(setters.setMaxPongDelayMs),
        maxReplicationLagSeconds: toStringSetter(
            setters.setMaxReplicationLagSeconds
        ),
        // Canonical backend field is `maxResponseTime` (milliseconds).
        // UI state uses `maxResponseTimeMs` for clarity.
        maxResponseTime: toStringSetter(setters.setMaxResponseTimeMs),
        port: toStringSetter(setters.setPort),
        primaryStatusUrl: toStringSetter(setters.setPrimaryStatusUrl),
        recordType: toStringSetter(setters.setRecordType),
        replicaStatusUrl: toStringSetter(setters.setReplicaStatusUrl),
        replicationTimestampField: toStringSetter(
            setters.setReplicationTimestampField
        ),
        url: toStringSetter(setters.setUrl),
    };
}
