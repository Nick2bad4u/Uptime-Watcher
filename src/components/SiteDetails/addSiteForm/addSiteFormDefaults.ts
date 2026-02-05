import type {
    MonitorValidationFieldValues,
    MonitorValidationFieldValuesInput,
} from "../../../utils/monitorValidationFields";

import {
    buildMonitorValidationFieldValues,
} from "../../../utils/monitorValidationFields";

/**
 * Default UI-facing monitor field inputs for the AddSiteForm hook.
 */
export const DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS: MonitorValidationFieldValuesInput =
    {
        baselineUrl: "",
        bodyKeyword: "",
        certificateWarningDays: "30",
        edgeLocations: "",
        expectedHeaderValue: "",
        expectedJsonValue: "",
        expectedStatusCode: "200",
        expectedValue: "",
        headerName: "",
        heartbeatExpectedStatus: "ok",
        heartbeatMaxDriftSeconds: "60",
        heartbeatStatusField: "status",
        heartbeatTimestampField: "timestamp",
        host: "",
        jsonPath: "",
        maxPongDelayMs: "1500",
        maxReplicationLagSeconds: "10",
        maxResponseTimeMs: "2000",
        port: "",
        primaryStatusUrl: "",
        recordType: "A",
        replicaStatusUrl: "",
        replicationTimestampField: "lastAppliedTimestamp",
        url: "",
    };

/**
 * Default canonical monitor field values (backend field names) derived from
 * {@link DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS}.
 */
export const DEFAULT_ADD_SITE_MONITOR_FIELD_VALUES: MonitorValidationFieldValues =
    buildMonitorValidationFieldValues(DEFAULT_ADD_SITE_MONITOR_FIELD_INPUTS);
