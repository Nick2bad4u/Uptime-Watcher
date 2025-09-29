/**
 * Monitor configuration type definitions for Uptime Watcher.
 *
 * @remarks
 * These interfaces provide type-safe configuration structures for different
 * monitor types. Each monitor type has its own specific configuration interface
 * that extends the base configuration. This ensures proper validation and type
 * checking throughout the monitoring system.
 *
 * @packageDocumentation
 */

import type { MonitorType } from "@shared/types";
import type { Simplify } from "type-fest";

/**
 * Advanced monitoring configuration options.
 *
 * @remarks
 * Additional configuration options for advanced monitoring features.
 *
 * @public
 */
export interface AdvancedMonitorConfig {
    /** Alert thresholds and rules */
    alerting?: {
        /** Types of alerts to send */
        alertTypes: Array<"email" | "slack" | "webhook">;
        /** Consecutive failures before triggering alert */
        failureThreshold: number;
        /** Alert message template */
        messageTemplate?: string;
        /** Consecutive successes before clearing alert */
        recoveryThreshold: number;
    };
    /** Data retention configuration */
    dataRetention?: {
        /** How long to keep aggregated data in days */
        aggregatedDataDays: number;
        /** Whether to automatically clean up old data */
        autoCleanup: boolean;
        /** How long to keep detailed history in days */
        detailedHistoryDays: number;
    };
    /** Performance monitoring thresholds */
    performanceThresholds?: {
        /** Response time critical threshold in milliseconds */
        responseTimeCritical: number;
        /** Response time warning threshold in milliseconds */
        responseTimeWarning: number;
        /** Uptime percentage critical threshold */
        uptimeCritical: number;
        /** Uptime percentage warning threshold */
        uptimeWarning: number;
    };
    /** Scheduling configuration */
    scheduling?: {
        /** Days of the week when monitoring is active */
        activeDays?: Array<
            | "friday"
            | "monday"
            | "saturday"
            | "sunday"
            | "thursday"
            | "tuesday"
            | "wednesday"
        >;
        /** Time ranges when monitoring is active */
        activeHours?: {
            end: string; // HH:mm format
            start: string; // HH:mm format
        };
        /** Time zones where monitoring should be active */
        activeTimeZones?: string[];
        /** Maintenance windows when monitoring is paused */
        maintenanceWindows?: Array<{
            end: string; // ISO date string
            start: string; // ISO date string
        }>;
    };
}

/**
 * Base monitor configuration interface that all monitor configurations extend.
 *
 * @remarks
 * Contains common configuration fields that all monitor types require.
 *
 * @public
 */
export interface BaseMonitorConfig {
    /** Interval between checks in milliseconds */
    checkInterval: number;
    /** Whether the monitor is enabled */
    enabled: boolean;
    /** Unique identifier for the monitor */
    id: string;
    /** Human-readable name for the monitor */
    name: string;
    /** Number of retry attempts when a check fails */
    retryAttempts: number;
    /** Timeout for the monitor check in milliseconds */
    timeout: number;
    /** The type of monitor */
    type: MonitorType;
}

/**
 * Configuration interface for HTTP monitors.
 *
 * @remarks
 * Used for monitors that check HTTP/HTTPS endpoints.
 *
 * @public
 */
export interface HttpMonitorConfig extends BaseMonitorConfig {
    /** Authentication configuration */
    auth?: {
        password: string;
        type: "basic" | "bearer";
        username: string;
    };
    /** Custom certificate configuration */
    certificate?: {
        /** Path to custom CA certificate */
        caPath?: string;
        /** Path to client certificate */
        certPath?: string;
        /** Whether to ignore SSL certificate errors */
        ignoreSslErrors: boolean;
        /** Path to client private key */
        keyPath?: string;
    };
    /** Expected response body content patterns */
    expectedContent?: {
        /** Content that must be present in the response */
        contains?: string[];
        /** Content that must not be present in the response */
        notContains?: string[];
        /** Regular expression patterns to match */
        patterns?: string[];
    };
    /** Expected HTTP status codes */
    expectedStatusCodes: number[];
    /** Whether to follow HTTP redirects */
    followRedirects: boolean;
    /** Custom headers to send with the request */
    headers?: Record<string, string>;
    /** HTTP method to use */
    method: "DELETE" | "GET" | "HEAD" | "POST" | "PUT";
    /** Request body for POST/PUT requests */
    requestBody?: {
        /** Content type of the request body */
        contentType: string;
        /** The actual request body data */
        data: string;
    };
    type: "http";
    /** The URL to monitor */
    url: string;
    /** User agent string to use */
    userAgent?: string;
}

/**
 * Monitor configuration template interface.
 *
 * @remarks
 * Used for predefined monitor configuration templates.
 *
 * @public
 */
export interface MonitorConfigTemplate {
    /** Template category */
    category: string;
    /** Default configuration values */
    config: Partial<MonitorConfig>;
    /** Template description */
    description: string;
    /** Template identifier */
    id: string;
    /** Template name */
    name: string;
    /** Tags for filtering templates */
    tags: string[];
}

/**
 * Configuration interface for ping monitors.
 *
 * @remarks
 * Used for monitors that check host reachability via ICMP ping.
 *
 * @public
 */
export interface PingMonitorConfig extends BaseMonitorConfig {
    /** The hostname or IP address to ping */
    host: string;
    /** Internet Protocol version to use */
    ipVersion?: "ipv4" | "ipv6";
    /** Maximum allowed packet loss percentage (0-100) */
    maxPacketLoss: number;
    /** Maximum allowed round trip time in milliseconds */
    maxRtt?: number;
    /** Number of ping packets to send per check */
    packetCount: number;
    /** Size of ping packets in bytes */
    packetSize: number;
    type: "ping";
}

/**
 * Configuration interface for port monitors.
 *
 * @remarks
 * Used for monitors that check TCP port connectivity.
 *
 * @public
 */
export interface PortMonitorConfig extends BaseMonitorConfig {
    /** Connection timeout in milliseconds */
    connectionTimeout: number;
    /** The hostname or IP address to monitor */
    host: string;
    /** Internet Protocol version to use */
    ipVersion?: "ipv4" | "ipv6";
    /** The port number to check */
    port: number;
    /** Protocol-specific configuration */
    protocol?: {
        /** Expected response data patterns */
        expectedResponse?: string;
        /** Custom data to send after connection */
        sendData?: string;
        /** Whether to use TLS/SSL encryption */
        useTls?: boolean;
    };
    type: "port";
}

/**
 * Configuration interface for SSL certificate monitors.
 *
 * @remarks
 * Used for monitors that check the status of SSL certificates.
 *
 * @public
 */
export interface SslMonitorConfig extends BaseMonitorConfig {
    /** Days before expiry that should trigger degraded status */
    certificateWarningDays: number;
    /** Hostname to inspect for TLS certificate status */
    host: string;
    /** Target port for the TLS handshake (defaults to 443) */
    port: number;
    type: "ssl";
}

/**
 * Configuration interface for HTTP keyword monitors.
 *
 * @remarks
 * Used for monitors that check HTTP/HTTPS endpoints for specific keywords in
 * the response body.
 *
 * @public
 */
export interface HttpKeywordMonitorConfig extends BaseMonitorConfig {
    /** Keyword that must appear in the HTTP response body */
    bodyKeyword: string;
    type: "http-keyword";
    /** Target URL to monitor */
    url: string;
}

/**
 * Configuration interface for HTTP header monitors.
 *
 * @remarks
 * Used for monitors that ensure specific HTTP headers are returned by the
 * target endpoint.
 *
 * @public
 */
export interface HttpHeaderMonitorConfig extends BaseMonitorConfig {
    /** Expected value for the specified HTTP header */
    expectedHeaderValue: string;
    /** Header name to inspect */
    headerName: string;
    type: "http-header";
    /** Target URL to monitor */
    url: string;
}

/**
 * Configuration interface for HTTP status monitors.
 *
 * @remarks
 * Used for monitors that check HTTP/HTTPS endpoints for specific status codes.
 *
 * @public
 */
export interface HttpStatusMonitorConfig extends BaseMonitorConfig {
    /** Expected HTTP status code that indicates success */
    expectedStatusCode: number;
    type: "http-status";
    /** Target URL to monitor */
    url: string;
}

/**
 * Configuration interface for HTTP JSON content monitors.
 *
 * @remarks
 * Used for monitors that validate JSON responses against expected values.
 *
 * @public
 */
export interface HttpJsonMonitorConfig extends BaseMonitorConfig {
    /** Expected value found at the JSON path */
    expectedJsonValue: string;
    /** Dot-notation JSON path to inspect */
    jsonPath: string;
    type: "http-json";
    /** Target URL to monitor */
    url: string;
}

/**
 * Configuration interface for HTTP latency monitors.
 *
 * @remarks
 * Used for monitors that enforce response time thresholds.
 *
 * @public
 */
export interface HttpLatencyMonitorConfig extends BaseMonitorConfig {
    /** Maximum acceptable response time in milliseconds */
    maxResponseTime: number;
    type: "http-latency";
    /** Target URL to monitor */
    url: string;
}

/**
 * Configuration interface for WebSocket keepalive monitors.
 *
 * @remarks
 * Ensures WebSocket endpoints respond to ping/pong frames within a configurable
 * latency budget.
 *
 * @public
 */
export interface WebsocketKeepaliveMonitorConfig extends BaseMonitorConfig {
    /** Maximum acceptable time in milliseconds for a pong response */
    maxPongDelayMs: number;
    type: "websocket-keepalive";
    /** WebSocket endpoint to monitor */
    url: string;
}

/**
 * Configuration interface for server heartbeat monitors.
 *
 * @remarks
 * Polls JSON heartbeat endpoints and validates status plus timestamp recency.
 *
 * @public
 */
export interface ServerHeartbeatMonitorConfig extends BaseMonitorConfig {
    /** Expected status value returned by the heartbeat endpoint */
    heartbeatExpectedStatus: string;
    /** Maximum allowed heartbeat staleness in seconds */
    heartbeatMaxDriftSeconds: number;
    /** Field name (dot notation supported) containing the status value */
    heartbeatStatusField: string;
    /** Field name (dot notation supported) containing the timestamp */
    heartbeatTimestampField: string;
    type: "server-heartbeat";
    /** Heartbeat endpoint URL */
    url: string;
}

/**
 * Configuration interface for replication monitors.
 *
 * @remarks
 * Compares timestamps from primary and replica status endpoints to determine
 * replication lag.
 *
 * @public
 */
export interface ReplicationMonitorConfig extends BaseMonitorConfig {
    /** Maximum tolerated replication lag in seconds */
    maxReplicationLagSeconds: number;
    /** Primary node status URL */
    primaryStatusUrl: string;
    /** Replica node status URL */
    replicaStatusUrl: string;
    /** Field name (dot notation supported) containing replication timestamp */
    replicationTimestampField: string;
    type: "replication";
}

/**
 * Configuration interface for CDN edge consistency monitors.
 *
 * @remarks
 * Compares responses from multiple edge endpoints against an origin baseline to
 * detect drift between CDN nodes.
 *
 * @public
 */
export interface CdnEdgeConsistencyMonitorConfig extends BaseMonitorConfig {
    /** Baseline origin URL used for comparison */
    baselineUrl: string;
    /** List of edge URLs encoded as comma or newline separated string */
    edgeLocations: string;
    type: "cdn-edge-consistency";
}

/**
 * Union type representing all possible monitor configurations.
 *
 * @remarks
 * Use this type when you need to handle configuration for any monitor type.
 * TypeScript will ensure type safety through discriminated unions based on the
 * `type` field. Uses Simplify to provide better IntelliSense and type display.
 *
 * @public
 */
export type MonitorConfig = Simplify<
    | CdnEdgeConsistencyMonitorConfig
    | HttpHeaderMonitorConfig
    | HttpJsonMonitorConfig
    | HttpKeywordMonitorConfig
    | HttpLatencyMonitorConfig
    | HttpMonitorConfig
    | HttpStatusMonitorConfig
    | PingMonitorConfig
    | PortMonitorConfig
    | ReplicationMonitorConfig
    | ServerHeartbeatMonitorConfig
    | SslMonitorConfig
    | WebsocketKeepaliveMonitorConfig
>;

function isMonitorConfigOfType<T extends MonitorConfig>(
    config: MonitorConfig | null | undefined,
    type: T["type"]
): config is T {
    return config !== null && config !== undefined && config.type === type;
}

/**
 * Type guard to check if configuration is for HTTP monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an HTTP monitor
 *
 * @public
 */
export function isHttpMonitorConfig(
    config: MonitorConfig | null | undefined
): config is HttpMonitorConfig {
    return config !== null && config !== undefined && config.type === "http";
}

/**
 * Type guard to check if configuration is for ping monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for a ping monitor
 *
 * @public
 */
export function isPingMonitorConfig(
    config: MonitorConfig | null | undefined
): config is PingMonitorConfig {
    return config !== null && config !== undefined && config.type === "ping";
}

/**
 * Type guard to check if configuration is for port monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for a port monitor
 *
 * @public
 */
export function isPortMonitorConfig(
    config: MonitorConfig | null | undefined
): config is PortMonitorConfig {
    return config !== null && config !== undefined && config.type === "port";
}

/**
 * Type guard to check if configuration is for SSL monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an SSL monitor
 *
 * @public
 */
export function isSslMonitorConfig(
    config: MonitorConfig | null | undefined
): config is SslMonitorConfig {
    return config !== null && config !== undefined && config.type === "ssl";
}

/**
 * Type guard to check if configuration is for HTTP keyword monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an HTTP keyword monitor
 *
 * @public
 */
export function isHttpKeywordMonitorConfig(
    config: MonitorConfig | null | undefined
): config is HttpKeywordMonitorConfig {
    return isMonitorConfigOfType<HttpKeywordMonitorConfig>(
        config,
        "http-keyword"
    );
}

/**
 * Type guard to check if configuration is for HTTP header monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an HTTP header monitor
 *
 * @public
 */
export function isHttpHeaderMonitorConfig(
    config: MonitorConfig | null | undefined
): config is HttpHeaderMonitorConfig {
    return isMonitorConfigOfType<HttpHeaderMonitorConfig>(
        config,
        "http-header"
    );
}

/**
 * Type guard to check if configuration is for HTTP status monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an HTTP status monitor
 *
 * @public
 */
export function isHttpStatusMonitorConfig(
    config: MonitorConfig | null | undefined
): config is HttpStatusMonitorConfig {
    return isMonitorConfigOfType<HttpStatusMonitorConfig>(
        config,
        "http-status"
    );
}

/**
 * Type guard to check if configuration is for HTTP JSON monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an HTTP JSON monitor
 *
 * @public
 */
export function isHttpJsonMonitorConfig(
    config: MonitorConfig | null | undefined
): config is HttpJsonMonitorConfig {
    return isMonitorConfigOfType<HttpJsonMonitorConfig>(config, "http-json");
}

/**
 * Type guard to check if configuration is for HTTP latency monitors.
 *
 * @param config - The monitor configuration to check
 *
 * @returns True if the configuration is for an HTTP latency monitor
 *
 * @public
 */
export function isHttpLatencyMonitorConfig(
    config: MonitorConfig | null | undefined
): config is HttpLatencyMonitorConfig {
    return isMonitorConfigOfType<HttpLatencyMonitorConfig>(
        config,
        "http-latency"
    );
}

/**
 * Type guard to check if configuration is for CDN edge consistency monitors.
 */
export function isCdnEdgeConsistencyMonitorConfig(
    config: MonitorConfig | null | undefined
): config is CdnEdgeConsistencyMonitorConfig {
    return isMonitorConfigOfType<CdnEdgeConsistencyMonitorConfig>(
        config,
        "cdn-edge-consistency"
    );
}

/**
 * Type guard to check if configuration is for replication monitors.
 */
export function isReplicationMonitorConfig(
    config: MonitorConfig | null | undefined
): config is ReplicationMonitorConfig {
    return isMonitorConfigOfType<ReplicationMonitorConfig>(
        config,
        "replication"
    );
}

/**
 * Type guard to check if configuration is for server heartbeat monitors.
 */
export function isServerHeartbeatMonitorConfig(
    config: MonitorConfig | null | undefined
): config is ServerHeartbeatMonitorConfig {
    return isMonitorConfigOfType<ServerHeartbeatMonitorConfig>(
        config,
        "server-heartbeat"
    );
}

/**
 * Type guard to check if configuration is for WebSocket keepalive monitors.
 */
export function isWebsocketKeepaliveMonitorConfig(
    config: MonitorConfig | null | undefined
): config is WebsocketKeepaliveMonitorConfig {
    return isMonitorConfigOfType<WebsocketKeepaliveMonitorConfig>(
        config,
        "websocket-keepalive"
    );
}

/**
 * Default monitor configuration values.
 *
 * @public
 */
export const DEFAULT_MONITOR_CONFIG = {
    /** Default values for CDN edge consistency monitors */
    "cdn-edge-consistency": {
        baselineUrl: "",
        checkInterval: 300_000,
        edgeLocations: "",
        enabled: true,
        retryAttempts: 3,
        timeout: 30_000,
        type: "cdn-edge-consistency" as const,
    } as Partial<CdnEdgeConsistencyMonitorConfig>,

    /** Default values for HTTP monitors */
    http: {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        expectedStatusCodes: [200],
        followRedirects: true,
        method: "GET" as const,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http" as const,
    } as Partial<HttpMonitorConfig>,

    /** Default values for HTTP header monitors */
    "http-header": {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        expectedHeaderValue: "",
        headerName: "",
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http-header" as const,
    } as Partial<HttpHeaderMonitorConfig>,

    /** Default values for HTTP JSON monitors */
    "http-json": {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        expectedJsonValue: "",
        jsonPath: "",
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http-json" as const,
    } as Partial<HttpJsonMonitorConfig>,

    /** Default values for HTTP keyword monitors */
    "http-keyword": {
        bodyKeyword: "",
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http-keyword" as const,
    } as Partial<HttpKeywordMonitorConfig>,

    /** Default values for HTTP latency monitors */
    "http-latency": {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        maxResponseTime: 2000,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http-latency" as const,
    } as Partial<HttpLatencyMonitorConfig>,

    /** Default values for HTTP status monitors */
    "http-status": {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        expectedStatusCode: 200,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "http-status" as const,
    } as Partial<HttpStatusMonitorConfig>,

    /** Default values for ping monitors */
    ping: {
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        maxPacketLoss: 0, // 0% packet loss
        packetCount: 4,
        packetSize: 32,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "ping" as const,
    } as Partial<PingMonitorConfig>,

    /** Default values for port monitors */
    port: {
        checkInterval: 300_000, // 5 minutes
        connectionTimeout: 10_000, // 10 seconds
        enabled: true,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "port" as const,
    } as Partial<PortMonitorConfig>,

    /** Default values for replication monitors */
    replication: {
        checkInterval: 120_000,
        enabled: true,
        maxReplicationLagSeconds: 10,
        primaryStatusUrl: "",
        replicaStatusUrl: "",
        replicationTimestampField: "lastAppliedTimestamp",
        retryAttempts: 3,
        timeout: 30_000,
        type: "replication" as const,
    } as Partial<ReplicationMonitorConfig>,

    /** Default values for server heartbeat monitors */
    "server-heartbeat": {
        checkInterval: 60_000,
        enabled: true,
        heartbeatExpectedStatus: "ok",
        heartbeatMaxDriftSeconds: 60,
        heartbeatStatusField: "status",
        heartbeatTimestampField: "timestamp",
        retryAttempts: 3,
        timeout: 30_000,
        type: "server-heartbeat" as const,
    } as Partial<ServerHeartbeatMonitorConfig>,

    /** Default values for SSL certificate monitors */
    ssl: {
        certificateWarningDays: 30,
        checkInterval: 300_000, // 5 minutes
        enabled: true,
        port: 443,
        retryAttempts: 3,
        timeout: 30_000, // 30 seconds
        type: "ssl" as const,
    } as Partial<SslMonitorConfig>,

    /** Default values for WebSocket keepalive monitors */
    "websocket-keepalive": {
        checkInterval: 60_000,
        enabled: true,
        maxPongDelayMs: 1500,
        retryAttempts: 3,
        timeout: 30_000,
        type: "websocket-keepalive" as const,
    } as Partial<WebsocketKeepaliveMonitorConfig>,
} as const;

/**
 * Monitor configuration validation result.
 *
 * @remarks
 * Used to return validation results for monitor configurations. Import directly
 * from "./validation" for MonitorConfigValidationResult if needed.
 *
 * @public
 */

/**
 * Configuration interface for port monitors.
 */
