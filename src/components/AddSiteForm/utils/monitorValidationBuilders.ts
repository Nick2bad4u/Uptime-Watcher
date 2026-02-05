import type { MonitorType } from "@shared/types";
import type { UnknownRecord } from "type-fest";

import type {
    PartialMonitorFormDataByType,
} from "../../../utils/monitorValidation";
import type {
    MonitorValidationFieldValues,
} from "../../../utils/monitorValidationFields";

import {
    parseOptionalInteger,
    safeTrim,
    toOptionalString,
} from "./valueNormalization";

/**
 * Builder map used to translate AddSiteForm field values into monitor-type
 * specific payloads for client-side validation.
 */
export type MonitorValidationBuilderMap = {
    [K in MonitorType]: (
        fields: MonitorValidationFieldValues
    ) => PartialMonitorFormDataByType<K>;
};

const monitorValidationBuilders: MonitorValidationBuilderMap = {
    "cdn-edge-consistency": ({ baselineUrl, edgeLocations }): UnknownRecord => ({
        baselineUrl: toOptionalString(baselineUrl),
        edgeLocations: toOptionalString(edgeLocations),
    }),
    dns: ({ expectedValue, host, recordType }): UnknownRecord => {
        const trimmedRecordType = safeTrim(recordType);
        const candidate = toOptionalString(expectedValue);
        const basePayload: UnknownRecord = {
            host: toOptionalString(host),
            recordType: trimmedRecordType || undefined,
        };

        if (
            trimmedRecordType.length > 0 &&
            trimmedRecordType.toUpperCase() !== "ANY" &&
            candidate !== undefined
        ) {
            return {
                ...basePayload,
                expectedValue: candidate,
            } satisfies UnknownRecord;
        }

        return basePayload;
    },
    http: ({ url }): UnknownRecord => ({
        url: toOptionalString(url),
    }),
    "http-header": ({ expectedHeaderValue, headerName, url }): UnknownRecord => ({
        expectedHeaderValue: toOptionalString(expectedHeaderValue),
        headerName: toOptionalString(headerName),
        url: toOptionalString(url),
    }),
    "http-json": ({ expectedJsonValue, jsonPath, url }): UnknownRecord => ({
        expectedJsonValue: toOptionalString(expectedJsonValue),
        jsonPath: toOptionalString(jsonPath),
        url: toOptionalString(url),
    }),
    "http-keyword": ({ bodyKeyword, url }): UnknownRecord => ({
        bodyKeyword: toOptionalString(bodyKeyword),
        url: toOptionalString(url),
    }),
    "http-latency": ({ maxResponseTime, url }): UnknownRecord => ({
        maxResponseTime: parseOptionalInteger(maxResponseTime),
        url: toOptionalString(url),
    }),
    "http-status": ({ expectedStatusCode, url }): UnknownRecord => ({
        expectedStatusCode: parseOptionalInteger(expectedStatusCode),
        url: toOptionalString(url),
    }),
    ping: ({ host }): UnknownRecord => ({
        host: toOptionalString(host),
    }),
    port: ({ host, port }): UnknownRecord => ({
        host: toOptionalString(host),
        port: parseOptionalInteger(port),
    }),
    replication: ({
        maxReplicationLagSeconds,
        primaryStatusUrl,
        replicaStatusUrl,
        replicationTimestampField,
    }): UnknownRecord => ({
        maxReplicationLagSeconds: parseOptionalInteger(maxReplicationLagSeconds),
        primaryStatusUrl: toOptionalString(primaryStatusUrl),
        replicaStatusUrl: toOptionalString(replicaStatusUrl),
        replicationTimestampField: toOptionalString(replicationTimestampField),
    }),
    "server-heartbeat": ({
        heartbeatExpectedStatus,
        heartbeatMaxDriftSeconds,
        heartbeatStatusField,
        heartbeatTimestampField,
        url,
    }): UnknownRecord => ({
        heartbeatExpectedStatus: toOptionalString(heartbeatExpectedStatus),
        heartbeatMaxDriftSeconds: parseOptionalInteger(heartbeatMaxDriftSeconds),
        heartbeatStatusField: toOptionalString(heartbeatStatusField),
        heartbeatTimestampField: toOptionalString(heartbeatTimestampField),
        url: toOptionalString(url),
    }),
    ssl: ({ certificateWarningDays, host, port }): UnknownRecord => ({
        certificateWarningDays: parseOptionalInteger(certificateWarningDays),
        host: toOptionalString(host),
        port: parseOptionalInteger(port),
    }),
    "websocket-keepalive": ({ maxPongDelayMs, url }): UnknownRecord => ({
        maxPongDelayMs: parseOptionalInteger(maxPongDelayMs),
        url: toOptionalString(url),
    }),
} as const;

/**
 * Resolves the monitor validation builder for the provided monitor type.
 */
export function resolveMonitorValidationBuilder<K extends MonitorType>(
    monitorType: K
): MonitorValidationBuilderMap[K] {
    const candidate = monitorValidationBuilders[monitorType];

    if (typeof candidate !== "function") {
        throw new TypeError(`Unsupported monitor type: ${monitorType}`);
    }

    return candidate;
}
