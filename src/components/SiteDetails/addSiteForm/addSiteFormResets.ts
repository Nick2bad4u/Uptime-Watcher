import type {
    MonitorValidationFieldValues,
} from "../../../utils/monitorValidationFields";

import { DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES } from "./addSiteFormDefaults";

/**
 * Add-site operation mode.
 */
export type FormMode = "existing" | "new";

/**
 * Setter bag for monitor-type-specific fields in the add-site form.
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

/**
 * Resets hidden monitor fields to their defaults when the monitor type changes.
 */
export function resetFieldsForMonitorType(args: {
    readonly currentFieldNames: Set<string>;
    readonly currentValues: MonitorValidationFieldValues;
    readonly setters: MonitorFieldSetters;
}): void {
    const { currentFieldNames, currentValues, setters } = args;

    const fieldResetters: Array<{
        readonly defaultValue: string;
        readonly name: string;
        readonly setter: (value: string) => void;
        readonly value: string;
    }> = [
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.baselineUrl,
            name: "baselineUrl",
            setter: setters.setBaselineUrl,
            value: currentValues.baselineUrl,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.url,
            name: "url",
            setter: setters.setUrl,
            value: currentValues.url,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.host,
            name: "host",
            setter: setters.setHost,
            value: currentValues.host,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.port,
            name: "port",
            setter: setters.setPort,
            value: currentValues.port,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.recordType,
            name: "recordType",
            setter: setters.setRecordType,
            value: currentValues.recordType,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.expectedValue,
            name: "expectedValue",
            setter: setters.setExpectedValue,
            value: currentValues.expectedValue,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.certificateWarningDays,
            name: "certificateWarningDays",
            setter: setters.setCertificateWarningDays,
            value: currentValues.certificateWarningDays,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.edgeLocations,
            name: "edgeLocations",
            setter: setters.setEdgeLocations,
            value: currentValues.edgeLocations,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.bodyKeyword,
            name: "bodyKeyword",
            setter: setters.setBodyKeyword,
            value: currentValues.bodyKeyword,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.expectedStatusCode,
            name: "expectedStatusCode",
            setter: setters.setExpectedStatusCode,
            value: currentValues.expectedStatusCode,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.headerName,
            name: "headerName",
            setter: setters.setHeaderName,
            value: currentValues.headerName,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.expectedHeaderValue,
            name: "expectedHeaderValue",
            setter: setters.setExpectedHeaderValue,
            value: currentValues.expectedHeaderValue,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.jsonPath,
            name: "jsonPath",
            setter: setters.setJsonPath,
            value: currentValues.jsonPath,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.expectedJsonValue,
            name: "expectedJsonValue",
            setter: setters.setExpectedJsonValue,
            value: currentValues.expectedJsonValue,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.maxResponseTime,
            name: "maxResponseTime",
            setter: setters.setMaxResponseTimeMs,
            value: currentValues.maxResponseTime,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.maxPongDelayMs,
            name: "maxPongDelayMs",
            setter: setters.setMaxPongDelayMs,
            value: currentValues.maxPongDelayMs,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.maxReplicationLagSeconds,
            name: "maxReplicationLagSeconds",
            setter: setters.setMaxReplicationLagSeconds,
            value: currentValues.maxReplicationLagSeconds,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.primaryStatusUrl,
            name: "primaryStatusUrl",
            setter: setters.setPrimaryStatusUrl,
            value: currentValues.primaryStatusUrl,
        },
        {
            defaultValue: DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.replicaStatusUrl,
            name: "replicaStatusUrl",
            setter: setters.setReplicaStatusUrl,
            value: currentValues.replicaStatusUrl,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.replicationTimestampField,
            name: "replicationTimestampField",
            setter: setters.setReplicationTimestampField,
            value: currentValues.replicationTimestampField,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.heartbeatStatusField,
            name: "heartbeatStatusField",
            setter: setters.setHeartbeatStatusField,
            value: currentValues.heartbeatStatusField,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.heartbeatTimestampField,
            name: "heartbeatTimestampField",
            setter: setters.setHeartbeatTimestampField,
            value: currentValues.heartbeatTimestampField,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.heartbeatExpectedStatus,
            name: "heartbeatExpectedStatus",
            setter: setters.setHeartbeatExpectedStatus,
            value: currentValues.heartbeatExpectedStatus,
        },
        {
            defaultValue:
                DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES.heartbeatMaxDriftSeconds,
            name: "heartbeatMaxDriftSeconds",
            setter: setters.setHeartbeatMaxDriftSeconds,
            value: currentValues.heartbeatMaxDriftSeconds,
        },
    ];

    for (const field of fieldResetters) {
        if (
            !currentFieldNames.has(field.name) &&
            field.value !== field.defaultValue
        ) {
            field.setter(field.defaultValue);
        }
    }
}

/**
 * Resets mode-specific fields when switching between "new" and "existing".
 */
export function resetFieldsForModeChange(args: {
    readonly addMode: FormMode;
    readonly generateSiteIdentifier: () => string;
    readonly setName: (value: string) => void;
    readonly setSiteIdentifier: (value: string) => void;
}): void {
    if (args.addMode === "new") {
        args.setName("");
        args.setSiteIdentifier(args.generateSiteIdentifier());
        return;
    }

    args.setName("");
}
