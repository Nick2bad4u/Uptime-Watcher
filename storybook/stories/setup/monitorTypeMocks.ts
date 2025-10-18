import type { MonitorTypeConfig } from "@shared/types/monitorTypes";

import { useMonitorTypesStore } from "@app/stores/monitor/useMonitorTypesStore";
import { clearMonitorTypeCache } from "@app/utils/monitorTypeHelper";
import { clearConfigCache } from "@app/utils/monitorUiHelpers";
import { setMockMonitorTypes } from "../../setup/electron-api-mock";

/**
 * Comprehensive Storybook monitor type mocks aligned with the runtime registry.
 */
export const SAMPLE_MONITOR_TYPES: MonitorTypeConfig[] = [
    {
        description:
            "Monitors HTTP/HTTPS endpoints for availability and response time",
        displayName: "HTTP (Website/API)",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com/health",
                required: true,
                type: "url",
            },
        ],
        type: "http",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "HTTP Response Time",
            },
            helpTexts: {
                primary: "Enter the full URL including http:// or https://",
                secondary:
                    "The monitor will check this URL according to your interval settings.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Validates keyword presence within an HTTP response body",
        displayName: "HTTP Keyword Match",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText: "Keyword that must appear within the response body",
                label: "Required Keyword",
                name: "bodyKeyword",
                placeholder: "uptime",
                required: true,
                type: "text",
            },
        ],
        type: "http-keyword",
        uiConfig: {
            helpTexts: {
                primary:
                    "Ensure the keyword is present in the returned body content.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Ensures HTTP responses return an expected status code",
        displayName: "HTTP Status Code",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com/api",
                required: true,
                type: "url",
            },
            {
                helpText: "Status code that should be returned by the endpoint",
                label: "Expected Status Code",
                max: 599,
                min: 100,
                name: "expectedStatusCode",
                placeholder: "200",
                required: true,
                type: "number",
            },
        ],
        type: "http-status",
        uiConfig: {
            helpTexts: {
                primary:
                    "Set the expected status code for the monitored endpoint.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Validates an HTTP header value returned by an endpoint",
        displayName: "HTTP Header Match",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com/header-check",
                required: true,
                type: "url",
            },
            {
                helpText: "Header to inspect in the HTTP response",
                label: "Header Name",
                name: "headerName",
                placeholder: "content-type",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Expected value for the HTTP header after trimming whitespace",
                label: "Expected Header Value",
                name: "expectedHeaderValue",
                placeholder: "application/json",
                required: true,
                type: "text",
            },
        ],
        type: "http-header",
        uiConfig: {
            helpTexts: {
                primary:
                    "Ensure the header contains the expected value for successful checks.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Evaluates JSON payloads using path expressions",
        displayName: "HTTP JSON Path",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com/api/status",
                required: true,
                type: "url",
            },
            {
                helpText: "JSON path to evaluate within the response payload",
                label: "JSON Path",
                name: "jsonPath",
                placeholder: "$.status",
                required: true,
                type: "text",
            },
            {
                helpText: "Expected value returned from the JSON path",
                label: "Expected JSON Value",
                name: "expectedJsonValue",
                placeholder: "ok",
                required: true,
                type: "text",
            },
        ],
        type: "http-json",
        uiConfig: {
            helpTexts: {
                primary:
                    "Provide a JSON path and expected value to validate API responses.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Monitors response latency for HTTP endpoints",
        displayName: "HTTP Latency",
        fields: [
            {
                helpText: "Enter the full URL including http:// or https://",
                label: "Website URL",
                name: "url",
                placeholder: "https://example.com/perf",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "Maximum allowable response time before marking degraded",
                label: "Max Response Time (ms)",
                min: 100,
                name: "maxResponseTime",
                placeholder: "2000",
                required: true,
                type: "number",
            },
        ],
        type: "http-latency",
        uiConfig: {
            helpTexts: {
                primary:
                    "Set how fast the endpoint must respond before alerting.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Monitors TCP port availability on a host",
        displayName: "Port (Host/Port)",
        fields: [
            {
                helpText: "Enter a valid host name or IP address",
                label: "Host",
                name: "host",
                placeholder: "db.example.com",
                required: true,
                type: "text",
            },
            {
                helpText: "Port number to probe (1-65535)",
                label: "Port",
                max: 65_535,
                min: 1,
                name: "port",
                placeholder: "443",
                required: true,
                type: "number",
            },
        ],
        type: "port",
        uiConfig: {
            helpTexts: {
                primary: "Provide the host and port to test connectivity.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Monitors network reachability using ICMP ping",
        displayName: "Ping (Host)",
        fields: [
            {
                helpText: "Enter a host or IP address to ping",
                label: "Host",
                name: "host",
                placeholder: "192.0.2.42",
                required: true,
                type: "text",
            },
        ],
        type: "ping",
        uiConfig: {
            helpTexts: {
                primary:
                    "Use IP addresses or hostnames that respond to ICMP ping.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Monitors DNS records for expected responses",
        displayName: "DNS (Domain Resolution)",
        fields: [
            {
                helpText: "Enter the domain name to query",
                label: "Host",
                name: "host",
                placeholder: "example.com",
                required: true,
                type: "text",
            },
            {
                helpText: "DNS record type to look up",
                label: "Record Type",
                name: "recordType",
                options: [
                    { label: "A (IPv4 Address)", value: "A" },
                    { label: "AAAA (IPv6 Address)", value: "AAAA" },
                    { label: "ANY (All Records)", value: "ANY" },
                    {
                        label: "CAA (Certificate Authority Authorization)",
                        value: "CAA",
                    },
                    { label: "CNAME (Canonical Name)", value: "CNAME" },
                    { label: "MX (Mail Exchange)", value: "MX" },
                    {
                        label: "NAPTR (Naming Authority Pointer)",
                        value: "NAPTR",
                    },
                    { label: "NS (Name Server)", value: "NS" },
                    { label: "PTR (Pointer)", value: "PTR" },
                    { label: "SOA (Start of Authority)", value: "SOA" },
                    { label: "SRV (Service Record)", value: "SRV" },
                    { label: "TLSA (TLS Authentication)", value: "TLSA" },
                    { label: "TXT (Text Record)", value: "TXT" },
                ],
                placeholder: "Select record type",
                required: true,
                type: "select",
            },
            {
                helpText:
                    "Optional expected value to compare against the DNS response",
                label: "Expected Value",
                name: "expectedValue",
                placeholder: "198.51.100.24",
                required: false,
                type: "text",
            },
        ],
        type: "dns",
        uiConfig: {
            helpTexts: {
                primary:
                    "Select which DNS record type to monitor for your domain.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Tracks TLS certificate expiry windows",
        displayName: "SSL Certificate",
        fields: [
            {
                helpText: "Enter the host name serving the TLS certificate",
                label: "Host",
                name: "host",
                placeholder: "secure.example.com",
                required: true,
                type: "text",
            },
            {
                helpText: "TLS port to use when checking the certificate",
                label: "Port",
                max: 65_535,
                min: 1,
                name: "port",
                placeholder: "443",
                required: true,
                type: "number",
            },
            {
                helpText: "Days before expiry that should trigger warnings",
                label: "Expiry Warning (days)",
                max: 365,
                min: 1,
                name: "certificateWarningDays",
                placeholder: "30",
                required: true,
                type: "number",
            },
        ],
        type: "ssl",
        uiConfig: {
            helpTexts: {
                primary:
                    "Monitor TLS certificates to renew them before expiry.",
            },
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description: "Ensures CDN edge responses match an origin baseline",
        displayName: "CDN Edge Consistency",
        fields: [
            {
                helpText:
                    "Origin baseline URL that all edge locations should match",
                label: "Baseline URL",
                name: "baselineUrl",
                placeholder: "https://origin.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText: "Provide edge URLs separated by commas or new lines",
                label: "Edge Endpoints",
                name: "edgeLocations",
                placeholder:
                    "https://edge1.example.com\nhttps://edge2.example.com",
                required: true,
                type: "text",
            },
        ],
        type: "cdn-edge-consistency",
        uiConfig: {
            helpTexts: {
                primary:
                    "Compare CDN edge responses against your origin to detect drift.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description:
            "Monitors replication lag between primary and replica endpoints",
        displayName: "Replication Lag",
        fields: [
            {
                helpText: "Status endpoint for the primary data source",
                label: "Primary Status URL",
                name: "primaryStatusUrl",
                placeholder: "https://primary.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText: "Status endpoint for the replica",
                label: "Replica Status URL",
                name: "replicaStatusUrl",
                placeholder: "https://replica.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText: "JSON path to the replication timestamp",
                label: "Timestamp Field",
                name: "replicationTimestampField",
                placeholder: "data.lastAppliedTimestamp",
                required: true,
                type: "text",
            },
            {
                helpText: "Maximum allowable replication lag in seconds",
                label: "Max Replication Lag (seconds)",
                min: 0,
                name: "maxReplicationLagSeconds",
                placeholder: "30",
                required: true,
                type: "number",
            },
        ],
        type: "replication",
        uiConfig: {
            helpTexts: {
                primary:
                    "Ensure replicas stay within acceptable lag compared to the primary.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description:
            "Validates server heartbeat endpoints for status and drift",
        displayName: "Server Heartbeat",
        fields: [
            {
                helpText: "Heartbeat endpoint returning status information",
                label: "Heartbeat URL",
                name: "url",
                placeholder: "https://api.example.com/heartbeat",
                required: true,
                type: "url",
            },
            {
                helpText: "JSON path to the status field (e.g. data.status)",
                label: "Status Field",
                name: "heartbeatStatusField",
                placeholder: "data.status",
                required: true,
                type: "text",
            },
            {
                helpText: "Expected heartbeat status value",
                label: "Expected Status",
                name: "heartbeatExpectedStatus",
                placeholder: "ok",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "JSON path to the timestamp used for drift calculations",
                label: "Timestamp Field",
                name: "heartbeatTimestampField",
                placeholder: "data.timestamp",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Maximum drift in seconds before flagging the monitor",
                label: "Max Drift (seconds)",
                min: 0,
                name: "heartbeatMaxDriftSeconds",
                placeholder: "60",
                required: true,
                type: "number",
            },
        ],
        type: "server-heartbeat",
        uiConfig: {
            helpTexts: {
                primary:
                    "Verify heartbeat endpoints stay healthy within allowed drift.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
    {
        description:
            "Ensures WebSocket endpoints respond to ping frames within the expected delay",
        displayName: "WebSocket Keepalive",
        fields: [
            {
                helpText:
                    "Enter the ws:// or wss:// URL for the WebSocket endpoint",
                label: "WebSocket URL",
                name: "url",
                placeholder: "wss://example.com/socket",
                required: true,
                type: "text",
            },
            {
                helpText: "Maximum milliseconds to wait for a pong response",
                label: "Max Pong Delay (ms)",
                max: 60_000,
                min: 10,
                name: "maxPongDelayMs",
                placeholder: "1500",
                required: true,
                type: "number",
            },
        ],
        type: "websocket-keepalive",
        uiConfig: {
            helpTexts: {
                primary:
                    "Ensure WebSocket endpoints respond quickly to keep-alive probes.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        version: "1.0.0",
    },
];

export const prepareMonitorTypeMocks = (
    monitorTypes: MonitorTypeConfig[] = SAMPLE_MONITOR_TYPES
): void => {
    setMockMonitorTypes(monitorTypes);
    clearMonitorTypeCache();
    clearConfigCache();
    useMonitorTypesStore.setState(
        {
            fieldConfigs: {},
            isLoaded: false,
            monitorTypes: [],
        },
        false
    );
};
