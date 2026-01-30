import type { Monitor } from "@shared/types";

import { monitorSchemas } from "@shared/validation/monitorSchemas";

import type { BaseMonitorConfig } from "../MonitorTypeRegistry.types";

import { CdnEdgeConsistencyMonitor } from "../CdnEdgeConsistencyMonitor";
import { DnsMonitor } from "../DnsMonitor";
import { PingMonitor } from "../PingMonitor";
import { PortMonitor } from "../PortMonitor";
import { ReplicationMonitor } from "../ReplicationMonitor";
import { ServerHeartbeatMonitor } from "../ServerHeartbeatMonitor";
import { SslMonitor } from "../SslMonitor";
import {
    createHostPortTitleSuffixResolver,
    createHostTitleSuffixResolver,
    createRecordTypeHostTitleSuffixResolver,
    createTlsTitleSuffixResolver,
} from "../utils/monitorTitleSuffixResolvers";
import { WebsocketKeepaliveMonitor } from "../WebsocketKeepaliveMonitor";

/**
 * Registers the built-in non-HTTP monitor types.
 *
 * @remarks
 * Extracted from `MonitorTypeRegistry.ts` to reduce file size. This module
 * intentionally avoids runtime imports from `MonitorTypeRegistry` to prevent
 * circular dependencies (it only uses type-only imports).
 */
export function registerNonHttpMonitorTypes(deps: {
    readonly registerMonitorType: (config: BaseMonitorConfig) => void;
}): void {
    deps.registerMonitorType({
        description: "Monitors TCP port connectivity",
        displayName: "Port (Host/Port)",
        fields: [
            {
                helpText: "Enter a valid host (domain or IP)",
                label: "Host",
                name: "host",
                placeholder: "example.com or 192.168.1.1",
                required: true,
                type: "text",
            },
            {
                helpText: "Enter a port number (1-65535)",
                label: "Port",
                max: 65_535,
                min: 1,
                name: "port",
                placeholder: "80",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new PortMonitor(),
        type: "port",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "Port Response Time",
                historyDetail: (details: string) => `Port: ${details}`,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: false,
            },
            formatDetail: (details: string) => `Port: ${details}`,
            formatTitleSuffix: createHostPortTitleSuffixResolver({
                monitorType: "port",
            }),
            helpTexts: {
                primary: "Enter a valid host (domain or IP)",
                secondary: "Enter a port number (1-65535)",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas.port,
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description: "Monitors network connectivity via ping",
        displayName: "Ping (Host)",
        fields: [
            {
                helpText: "Enter a valid host (domain or IP)",
                label: "Host",
                name: "host",
                placeholder: "example.com or 192.168.1.1",
                required: true,
                type: "text",
            },
        ],
        serviceFactory: () => new PingMonitor(),
        type: "ping",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "Ping Response Time",
                historyDetail: (details: string) => `Ping: ${details}`,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: false,
            },
            formatDetail: (details: string) => `Ping: ${details}`,
            formatTitleSuffix: createHostTitleSuffixResolver({
                monitorType: "ping",
            }),
            helpTexts: {
                primary: "Enter a valid host (domain or IP)",
                secondary:
                    "The monitor will ping this host according to your monitoring interval",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas.ping,
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description: "Monitors DNS record resolution for domains",
        displayName: "DNS (Domain Resolution)",
        fields: [
            {
                helpText: "Enter a valid domain name",
                label: "Host",
                name: "host",
                placeholder: "example.com",
                required: true,
                type: "text",
            },
            {
                helpText: "DNS record type to monitor",
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
                    "Expected value in DNS response (optional). Ignored for ANY.",
                label: "Expected Value",
                name: "expectedValue",
                placeholder: "e.g., 192.168.1.1 or mail.example.com",
                required: false,
                type: "text",
            },
        ],
        serviceFactory: () => new DnsMonitor(),
        type: "dns",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "DNS Response Time",
                historyDetail: (details: string) => `DNS: ${details}`,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: false,
            },
            formatDetail: (details: string) => `DNS: ${details}`,
            formatTitleSuffix: createRecordTypeHostTitleSuffixResolver({
                monitorType: "dns",
            }),
            helpTexts: {
                primary: "Enter a valid host (domain or IP)",
                secondary: "Select the DNS record type to monitor",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas.dns,
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description: "Monitors TLS certificates for validity and expiry windows",
        displayName: "SSL Certificate",
        fields: [
            {
                helpText: "Enter the host name that serves the certificate",
                label: "Host",
                name: "host",
                placeholder: "example.com",
                required: true,
                type: "text",
            },
            {
                helpText: "Port used for the TLS handshake (defaults to 443)",
                label: "Port",
                max: 65_535,
                min: 1,
                name: "port",
                placeholder: "443",
                required: true,
                type: "number",
            },
            {
                helpText: "Days before expiry to warn and mark the monitor as degraded",
                label: "Expiry Warning (days)",
                max: 365,
                min: 1,
                name: "certificateWarningDays",
                placeholder: "30",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new SslMonitor(),
        type: "ssl",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "SSL Handshake Time",
                historyDetail: (details: string) => `Certificate: ${details}`,
            },
            display: {
                showAdvancedMetrics: false,
                showUrl: false,
            },
            formatDetail: (details: string) => `Certificate: ${details}`,
            formatTitleSuffix: createTlsTitleSuffixResolver({
                monitorType: "ssl",
            }),
            helpTexts: {
                primary:
                    "Provide the host and port of the TLS endpoint you want to monitor",
                secondary:
                    "Set the warning threshold to receive degraded alerts before the certificate expires",
            },
            supportsAdvancedAnalytics: false,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas.ssl,
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description:
            "Compares CDN edge responses against an origin baseline to detect drift in status codes or content.",
        displayName: "CDN Edge Consistency",
        fields: [
            {
                helpText:
                    "Enter the origin baseline URL that every edge should match.",
                label: "Baseline URL",
                name: "baselineUrl",
                placeholder: "https://origin.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "Provide one or more edge endpoint URLs separated by commas or new lines.",
                label: "Edge Endpoints",
                name: "edgeLocations",
                placeholder: "https://edge1.example.com\nhttps://edge2.example.com",
                required: true,
                type: "text",
            },
        ],
        serviceFactory: () => new CdnEdgeConsistencyMonitor(),
        type: "cdn-edge-consistency",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "CDN Consistency Response Time",
                historyDetail: (details: string) => details,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: false,
            },
            formatDetail: (details: string) => details,
            formatTitleSuffix: (monitor: Monitor) =>
                monitor.type === "cdn-edge-consistency" && monitor.baselineUrl
                    ? ` (${monitor.baselineUrl})`
                    : "",
            helpTexts: {
                primary:
                    "Compare CDN edge responses against your origin baseline URL.",
                secondary:
                    "List every edge URL on a new line or separated by commas to include it in the check.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas["cdn-edge-consistency"],
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description:
            "Tracks replication endpoints and raises alerts when lag exceeds the configured threshold.",
        displayName: "Replication Lag",
        fields: [
            {
                helpText:
                    "Primary database status endpoint returning replication metadata.",
                label: "Primary Status URL",
                name: "primaryStatusUrl",
                placeholder: "https://primary.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText: "Replica database status endpoint used for comparison.",
                label: "Replica Status URL",
                name: "replicaStatusUrl",
                placeholder: "https://replica.example.com/status",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "JSON path to the replication timestamp within the status payload (e.g., data.metrics.lastApplied).",
                label: "Timestamp Field",
                name: "replicationTimestampField",
                placeholder: "data.lastAppliedTimestamp",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Maximum acceptable replication lag before reporting a degraded status.",
                label: "Max Replication Lag (seconds)",
                min: 0,
                name: "maxReplicationLagSeconds",
                placeholder: "10",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new ReplicationMonitor(),
        type: "replication",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "Replication Check Response Time",
                historyDetail: (details: string) => details,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: true,
            },
            formatDetail: (details: string) => details,
            formatTitleSuffix: (monitor: Monitor) =>
                monitor.type === "replication" && monitor.primaryStatusUrl
                    ? ` (${monitor.primaryStatusUrl})`
                    : "",
            helpTexts: {
                primary:
                    "Provide primary and replica status endpoints along with the JSON path of the replication timestamp.",
                secondary:
                    "Set the maximum replication lag to receive early warnings about replica staleness.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas.replication,
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description:
            "Validates heartbeat endpoints by checking expected status values and timestamp drift.",
        displayName: "Server Heartbeat",
        fields: [
            {
                helpText:
                    "Heartbeat endpoint that returns server status information.",
                label: "Heartbeat URL",
                name: "url",
                placeholder: "https://api.example.com/heartbeat",
                required: true,
                type: "url",
            },
            {
                helpText:
                    "JSON path to the status field within the heartbeat payload (e.g., data.status).",
                label: "Status Field",
                name: "heartbeatStatusField",
                placeholder: "data.status",
                required: true,
                type: "text",
            },
            {
                helpText: "Expected heartbeat status value (e.g., ok, healthy).",
                label: "Expected Status",
                name: "heartbeatExpectedStatus",
                placeholder: "ok",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "JSON path to the timestamp field used to measure drift (e.g., data.timestamp).",
                label: "Timestamp Field",
                name: "heartbeatTimestampField",
                placeholder: "data.timestamp",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Maximum allowed heartbeat drift in seconds before the monitor is marked degraded.",
                label: "Max Drift (seconds)",
                min: 0,
                name: "heartbeatMaxDriftSeconds",
                placeholder: "60",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new ServerHeartbeatMonitor(),
        type: "server-heartbeat",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "Heartbeat Response Time",
                historyDetail: (details: string) => details,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: true,
            },
            formatDetail: (details: string) => details,
            formatTitleSuffix: (monitor: Monitor) =>
                monitor.type === "server-heartbeat" && monitor.url
                    ? ` (${monitor.url})`
                    : "",
            helpTexts: {
                primary:
                    "Heartbeat monitors ensure the endpoint reports an expected status within the allowed drift window.",
                secondary:
                    "Provide the JSON paths to the status and timestamp fields returned by the heartbeat endpoint.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas["server-heartbeat"],
        version: "1.0.0",
    });

    deps.registerMonitorType({
        description:
            "Confirms WebSocket endpoints respond to ping frames within the expected delay.",
        displayName: "WebSocket Keepalive",
        fields: [
            {
                helpText:
                    "Enter the ws:// or wss:// URL for the WebSocket endpoint.",
                label: "WebSocket URL",
                name: "url",
                placeholder: "wss://example.com/socket",
                required: true,
                type: "text",
            },
            {
                helpText:
                    "Maximum time in milliseconds to wait for a pong or message response.",
                label: "Max Pong Delay (ms)",
                max: 60_000,
                min: 10,
                name: "maxPongDelayMs",
                placeholder: "1500",
                required: true,
                type: "number",
            },
        ],
        serviceFactory: () => new WebsocketKeepaliveMonitor(),
        type: "websocket-keepalive",
        uiConfig: {
            detailFormats: {
                analyticsLabel: "WebSocket Keepalive Response Time",
                historyDetail: (details: string) => details,
            },
            display: {
                showAdvancedMetrics: true,
                showUrl: true,
            },
            formatDetail: (details: string) => details,
            formatTitleSuffix: (monitor: Monitor) =>
                monitor.type === "websocket-keepalive" && monitor.url
                    ? ` (${monitor.url})`
                    : "",
            helpTexts: {
                primary:
                    "Monitor WebSocket endpoints by ensuring they answer ping frames within the configured delay.",
                secondary:
                    "Set a strict pong delay in milliseconds to detect slow or stalled connections quickly.",
            },
            supportsAdvancedAnalytics: true,
            supportsResponseTime: true,
        },
        validationSchema: monitorSchemas["websocket-keepalive"],
        version: "1.0.0",
    });
}
