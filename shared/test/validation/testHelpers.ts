/**
 * Test helper utilities for creating valid monitor and site objects for schema
 * validation tests.
 *
 * @remarks
 * This file provides helper functions to create properly structured monitor
 * objects that satisfy all schema validation requirements, including the
 * required 'history' field.
 */

import type { StatusHistoryStatus } from "../../types";

interface BaseMonitorData {
    checkInterval: number;
    history: StatusHistoryData[];
    id: string;
    lastChecked?: Date;
    monitoring: boolean;
    responseTime: number;
    retryAttempts: number;
    status:
        | "down"
        | "paused"
        | "pending"
        | "up";
    timeout: number;
    type:
        | "http"
        | "ping"
        | "port";
}

interface HttpMonitorData extends BaseMonitorData {
    type: "http";
    url: string;
}

interface PortMonitorData extends BaseMonitorData {
    host: string;
    port: number;
    type: "port";
}

interface PingMonitorData extends BaseMonitorData {
    host: string;
    type: "ping";
}

interface SiteData {
    createdAt: Date;
    id: string;
    monitors: (
        | HttpMonitorData
        | PingMonitorData
        | PortMonitorData
    )[];
    name: string;
    status:
        | "down"
        | "paused"
        | "pending"
        | "up";
    updatedAt: Date;
}

interface StatusHistoryData {
    details?: string;
    responseTime: number;
    status: StatusHistoryStatus;
    timestamp: number;
}

type MonitorOverrides<TMonitor extends { type: string }> =
    Partial<Omit<TMonitor, "type">> & {
        type?: unknown;
    };

/**
 * Creates a valid base monitor object with all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid monitor object that passes baseMonitorSchema validation
 */
export function createValidBaseMonitor(
    ...args: [] | [Partial<BaseMonitorData>]
): BaseMonitorData {
    const overrides = args[0] ?? {};
    const result = {
        checkInterval: 30_000,
        history: [], // Required field that was missing in many tests
        id: "test-monitor",
        ...(args.length === 0 && { lastChecked: new Date() }),
        monitoring: true,
        responseTime: 200,
        retryAttempts: 3,
        status: "up" as const,
        timeout: 5000,
        type: "http" as const,
        ...overrides,
    };

    return result;
}

/**
 * Creates a valid HTTP monitor object with all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid HTTP monitor object that passes httpMonitorSchema validation
 */
export const createValidHttpMonitor = (
    overrides: MonitorOverrides<HttpMonitorData> = {}
): HttpMonitorData => {
    const baseMonitor = createValidBaseMonitor({
        type: "http",
        lastChecked: new Date(),
    });
    return {
        ...baseMonitor,
        url: "https://example.com",
        ...overrides,
        type: "http", // Ensure type is always HTTP
    };
};

/**
 * Creates a valid port monitor object with all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid port monitor object that passes portMonitorSchema validation
 */
export const createValidPortMonitor = (
    overrides: MonitorOverrides<PortMonitorData> = {}
): PortMonitorData => {
    const baseMonitor = createValidBaseMonitor({
        type: "port",
        lastChecked: new Date(),
    });
    return {
        ...baseMonitor,
        host: "example.com",
        port: 80,
        ...overrides,
        type: "port", // Ensure type is always port
    };
};

/**
 * Creates a valid ping monitor object with all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid ping monitor object that passes pingMonitorSchema validation
 */
export const createValidPingMonitor = (
    overrides: MonitorOverrides<PingMonitorData> = {}
): PingMonitorData => {
    const baseMonitor = createValidBaseMonitor({
        type: "ping",
        lastChecked: new Date(),
    });
    return {
        ...baseMonitor,
        host: "example.com",
        ...overrides,
        type: "ping", // Ensure type is always ping
    };
};

/**
 * Creates a valid site object with monitors containing all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid site object that passes siteSchema validation
 */
export const createValidSite = (
    overrides: Partial<SiteData> = {}
): SiteData => ({
    createdAt: new Date(),
    id: "test-site",
    monitors: [createValidHttpMonitor()],
    name: "Test Site",
    status: "up" as const,
    updatedAt: new Date(),
    ...overrides,
});

/**
 * Creates a valid status history entry
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid status history entry
 */
export function createValidStatusHistory(
    ...args: [] | [Partial<StatusHistoryData>]
): StatusHistoryData {
    const overrides = args[0] ?? {};
    const result = {
        ...(args.length === 0 && { details: "Response successful" }),
        responseTime: 150,
        status: "up" as const,
        timestamp: Date.now(),
        ...overrides,
    };

    return result;
}
