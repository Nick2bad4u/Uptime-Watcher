/**
 * Monitor configuration type definitions for Uptime Watcher.
 *
 * @remarks
 * These interfaces provide type-safe configuration structures for different
 * monitor types. Each monitor type has its own specific configuration
 * interface that extends the base configuration. This ensures proper
 * validation and type checking throughout the monitoring system.
 *
 * @packageDocumentation
 */

import type { MonitorType } from "@shared/types";

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
 * Monitor configuration validation result.
 *
 * @remarks
 * Used to return validation results for monitor configurations.
 * Import directly from "./validation" for MonitorConfigValidationResult if
 * needed.
 *
 * @public
 */

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
 * Union type representing all possible monitor configurations.
 *
 * @remarks
 * Use this type when you need to handle configuration for any monitor type.
 * TypeScript will ensure type safety through discriminated unions based on the
 * `type` field.
 *
 * @public
 */
export type MonitorConfig =
    | HttpMonitorConfig
    | PingMonitorConfig
    | PortMonitorConfig;

/**
 * Type guard to check if configuration is for HTTP monitors.
 *
 * @param config - The monitor configuration to check
 * @returns True if the configuration is for an HTTP monitor
 *
 * @public
 */
export function isHttpMonitorConfig(
    config: MonitorConfig
): config is HttpMonitorConfig {
    return config.type === "http";
}

/**
 * Type guard to check if configuration is for ping monitors.
 *
 * @param config - The monitor configuration to check
 * @returns True if the configuration is for a ping monitor
 *
 * @public
 */
export function isPingMonitorConfig(
    config: MonitorConfig
): config is PingMonitorConfig {
    return config.type === "ping";
}

/**
 * Type guard to check if configuration is for port monitors.
 *
 * @param config - The monitor configuration to check
 * @returns True if the configuration is for a port monitor
 *
 * @public
 */
export function isPortMonitorConfig(
    config: MonitorConfig
): config is PortMonitorConfig {
    return config.type === "port";
}

/**
 * Default monitor configuration values.
 *
 * @public
 */
export const DEFAULT_MONITOR_CONFIG = {
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
} as const;
