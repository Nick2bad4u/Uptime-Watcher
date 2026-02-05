import type { MonitorType } from "@shared/types";

import type {
    CdnEdgeConsistencyFormData,
    DnsFormData,
    HttpFormData,
    HttpHeaderFormData,
    HttpJsonFormData,
    HttpKeywordFormData,
    HttpLatencyFormData,
    HttpStatusFormData,
    PingFormData,
    PortFormData,
    ReplicationFormData,
    ServerHeartbeatFormData,
    SslFormData,
    WebsocketKeepaliveFormData,
} from "../../types/monitorFormData";
import type {
    MonitorFormValidatorMap,
    PartialMonitorFormDataByType,
} from "./monitorValidationTypes";

import {
    validateOptionalTrimmedStringField,
    validateRequiredIntegerField,
    validateRequiredNumberField,
    validateRequiredStringField,
} from "./formFieldValidators";

// Helper functions for monitor form validation (reduces complexity by
// composition)
const validateHttpMonitorFormData = (data: Partial<HttpFormData>): string[] =>
    validateRequiredStringField(
        "http",
        "url",
        data.url,
        "URL is required for HTTP monitors"
    );

const validateHttpKeywordMonitorFormData = (
    data: Partial<HttpKeywordFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-keyword",
        "url",
        data.url,
        "URL is required for HTTP keyword monitors"
    ),
    ...validateRequiredStringField(
        "http-keyword",
        "bodyKeyword",
        data.bodyKeyword,
        "Keyword is required for HTTP keyword monitors"
    ),
];

const validateHttpHeaderMonitorFormData = (
    data: Partial<HttpHeaderFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-header",
        "url",
        data.url,
        "URL is required for HTTP header monitors"
    ),
    ...validateRequiredStringField(
        "http-header",
        "headerName",
        data.headerName,
        "Header name is required for HTTP header monitors"
    ),
    ...validateRequiredStringField(
        "http-header",
        "expectedHeaderValue",
        data.expectedHeaderValue,
        "Expected header value is required for HTTP header monitors"
    ),
];

const validateHttpJsonMonitorFormData = (
    data: Partial<HttpJsonFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-json",
        "url",
        data.url,
        "URL is required for HTTP JSON monitors"
    ),
    ...validateRequiredStringField(
        "http-json",
        "jsonPath",
        data.jsonPath,
        "JSON path is required for HTTP JSON monitors"
    ),
    ...validateRequiredStringField(
        "http-json",
        "expectedJsonValue",
        data.expectedJsonValue,
        "Expected JSON value is required for HTTP JSON monitors"
    ),
];

const validateHttpStatusMonitorFormData = (
    data: Partial<HttpStatusFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-status",
        "url",
        data.url,
        "URL is required for HTTP status monitors"
    ),
    ...validateRequiredIntegerField(
        "http-status",
        "expectedStatusCode",
        data.expectedStatusCode,
        "Expected status code is required for HTTP status monitors"
    ),
];

const validateHttpLatencyMonitorFormData = (
    data: Partial<HttpLatencyFormData>
): string[] => [
    ...validateRequiredStringField(
        "http-latency",
        "url",
        data.url,
        "URL is required for HTTP latency monitors"
    ),
    ...validateRequiredNumberField(
        "http-latency",
        "maxResponseTime",
        data.maxResponseTime,
        "Maximum response time is required for HTTP latency monitors"
    ),
];

/**
 * Validates DNS monitor form data by checking required host and recordType
 * fields, with optional expectedValue field.
 */
const validateDnsMonitorFormData = (data: Partial<DnsFormData>): string[] => [
    ...validateRequiredStringField(
        "dns",
        "host",
        data.host,
        "Host is required for DNS monitors"
    ),
    ...validateRequiredStringField(
        "dns",
        "recordType",
        data.recordType,
        "Record type is required for DNS monitors"
    ),
    ...validateOptionalTrimmedStringField(
        "dns",
        "expectedValue",
        data.expectedValue
    ),
];

const validatePortMonitorFormData = (data: Partial<PortFormData>): string[] => [
    ...validateRequiredStringField(
        "port",
        "host",
        data.host,
        "Host is required for port monitors"
    ),
    ...validateRequiredNumberField(
        "port",
        "port",
        data.port,
        "Port is required for port monitors"
    ),
];

const validateSslMonitorFormData = (data: Partial<SslFormData>): string[] => [
    ...validateRequiredStringField(
        "ssl",
        "host",
        data.host,
        "Host is required for SSL monitors"
    ),
    ...validateRequiredNumberField(
        "ssl",
        "port",
        data.port,
        "Port is required for SSL monitors"
    ),
    ...validateRequiredNumberField(
        "ssl",
        "certificateWarningDays",
        data.certificateWarningDays,
        "Certificate warning threshold is required for SSL monitors"
    ),
];

const validateCdnEdgeConsistencyMonitorFormData = (
    data: Partial<CdnEdgeConsistencyFormData>
): string[] => [
    ...validateRequiredStringField(
        "cdn-edge-consistency",
        "baselineUrl",
        data.baselineUrl,
        "Baseline URL is required for CDN edge consistency monitors"
    ),
    ...validateRequiredStringField(
        "cdn-edge-consistency",
        "edgeLocations",
        data.edgeLocations,
        "Edge endpoints are required for CDN edge consistency monitors"
    ),
];

const validateReplicationMonitorFormData = (
    data: Partial<ReplicationFormData>
): string[] => [
    ...validateRequiredStringField(
        "replication",
        "primaryStatusUrl",
        data.primaryStatusUrl,
        "Primary status URL is required for replication monitors"
    ),
    ...validateRequiredStringField(
        "replication",
        "replicaStatusUrl",
        data.replicaStatusUrl,
        "Replica status URL is required for replication monitors"
    ),
    ...validateRequiredStringField(
        "replication",
        "replicationTimestampField",
        data.replicationTimestampField,
        "Replication timestamp field is required for replication monitors"
    ),
    ...validateRequiredNumberField(
        "replication",
        "maxReplicationLagSeconds",
        data.maxReplicationLagSeconds,
        "Maximum replication lag is required for replication monitors"
    ),
];

const validateServerHeartbeatMonitorFormData = (
    data: Partial<ServerHeartbeatFormData>
): string[] => [
    ...validateRequiredStringField(
        "server-heartbeat",
        "url",
        data.url,
        "Heartbeat URL is required for server heartbeat monitors"
    ),
    ...validateRequiredStringField(
        "server-heartbeat",
        "heartbeatStatusField",
        data.heartbeatStatusField,
        "Heartbeat status field is required for server heartbeat monitors"
    ),
    ...validateRequiredStringField(
        "server-heartbeat",
        "heartbeatTimestampField",
        data.heartbeatTimestampField,
        "Heartbeat timestamp field is required for server heartbeat monitors"
    ),
    ...validateRequiredStringField(
        "server-heartbeat",
        "heartbeatExpectedStatus",
        data.heartbeatExpectedStatus,
        "Expected heartbeat status is required for server heartbeat monitors"
    ),
    ...validateRequiredNumberField(
        "server-heartbeat",
        "heartbeatMaxDriftSeconds",
        data.heartbeatMaxDriftSeconds,
        "Heartbeat drift tolerance is required for server heartbeat monitors"
    ),
];

const validateWebsocketKeepaliveMonitorFormData = (
    data: Partial<WebsocketKeepaliveFormData>
): string[] => [
    ...validateRequiredStringField(
        "websocket-keepalive",
        "url",
        data.url,
        "WebSocket URL is required for keepalive monitors"
    ),
    ...validateRequiredNumberField(
        "websocket-keepalive",
        "maxPongDelayMs",
        data.maxPongDelayMs,
        "Maximum pong delay is required for WebSocket keepalive monitors"
    ),
];

const validatePingMonitorFormData = (data: Partial<PingFormData>): string[] =>
    validateRequiredStringField(
        "ping",
        "host",
        data.host,
        "Host is required for ping monitors"
    );

const monitorFormValidators: MonitorFormValidatorMap = {
    "cdn-edge-consistency": validateCdnEdgeConsistencyMonitorFormData,
    dns: validateDnsMonitorFormData,
    http: validateHttpMonitorFormData,
    "http-header": validateHttpHeaderMonitorFormData,
    "http-json": validateHttpJsonMonitorFormData,
    "http-keyword": validateHttpKeywordMonitorFormData,
    "http-latency": validateHttpLatencyMonitorFormData,
    "http-status": validateHttpStatusMonitorFormData,
    ping: validatePingMonitorFormData,
    port: validatePortMonitorFormData,
    replication: validateReplicationMonitorFormData,
    "server-heartbeat": validateServerHeartbeatMonitorFormData,
    ssl: validateSslMonitorFormData,
    "websocket-keepalive": validateWebsocketKeepaliveMonitorFormData,
} as const;

/**
 * Lightweight form validation of the user-editable fields for the given monitor
 * type.
 */
export function getMonitorFormValidationErrors<TType extends MonitorType>(
    type: TType,
    data: PartialMonitorFormDataByType<TType>
): string[] {
    const validator = monitorFormValidators[type];
    return validator(data);
}
