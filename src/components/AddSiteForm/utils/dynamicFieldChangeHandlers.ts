/**
 * Utilities for wiring AddSiteForm state setters into DynamicMonitorFields.
 */

/**
 * Setters needed to build the {@link src/components/AddSiteForm/DynamicMonitorFields#DynamicMonitorFields}
 * onChange map.
 */
export interface DynamicFieldChangeSetterBag {
    readonly setBaselineUrl: (value: string) => void;
    readonly setBodyKeyword: (value: string) => void;
    readonly setCertificateWarningDays: (value: string) => void;
    readonly setEdgeLocations: (value: string) => void;
    readonly setExpectedHeaderValue: (value: string) => void;
    readonly setExpectedJsonValue: (value: string) => void;
    readonly setExpectedStatusCode: (value: string) => void;
    readonly setExpectedValue: (value: string) => void;
    readonly setHeaderName: (value: string) => void;
    readonly setHeartbeatExpectedStatus: (value: string) => void;
    readonly setHeartbeatMaxDriftSeconds: (value: string) => void;
    readonly setHeartbeatStatusField: (value: string) => void;
    readonly setHeartbeatTimestampField: (value: string) => void;
    readonly setHost: (value: string) => void;
    readonly setJsonPath: (value: string) => void;
    readonly setMaxPongDelayMs: (value: string) => void;
    readonly setMaxReplicationLagSeconds: (value: string) => void;
    readonly setMaxResponseTimeMs: (value: string) => void;
    readonly setPort: (value: string) => void;
    readonly setPrimaryStatusUrl: (value: string) => void;
    readonly setRecordType: (value: string) => void;
    readonly setReplicaStatusUrl: (value: string) => void;
    readonly setReplicationTimestampField: (value: string) => void;
    readonly setUrl: (value: string) => void;
}

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
