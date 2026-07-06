/**
 * Shared setter contract for monitor-type-specific add-site form fields.
 */

/**
 * Setter bag for monitor-type-specific add-site form fields.
 */
export interface MonitorFieldSetters {
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
