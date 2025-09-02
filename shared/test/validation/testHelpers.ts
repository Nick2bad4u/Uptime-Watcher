/**
 * Test helper utilities for creating valid monitor and site objects for schema
 * validation tests.
 *
 * @remarks
 * This file provides helper functions to create properly structured monitor
 * objects that satisfy all schema validation requirements, including the
 * required 'history' field.
 */

interface BaseMonitorData {
    checkInterval: number;
    history: any[];
    id: string;
    lastChecked?: Date;
    monitoring: boolean;
    responseTime: number;
    retryAttempts: number;
    status: "up" | "down" | "pending" | "paused";
    timeout: number;
    type: "http" | "port" | "ping";
}

interface HttpMonitorData extends BaseMonitorData {
    type: "http";
    url: string;
}

interface PortMonitorData extends BaseMonitorData {
    type: "port";
    host: string;
    port: number;
}

interface PingMonitorData extends BaseMonitorData {
    type: "ping";
    host: string;
}

interface SiteData {
    createdAt: Date;
    id: string;
    monitors: any[];
    name: string;
    status: "up" | "down" | "pending" | "paused";
    updatedAt: Date;
}

interface StatusHistoryData {
    responseTime: number;
    status: "up" | "down";
    timestamp: number;
    details?: string;
}

/**
 * Creates a valid base monitor object with all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid monitor object that passes baseMonitorSchema validation
 */
export function createValidBaseMonitor(
    overrides: Partial<BaseMonitorData> = {}
): BaseMonitorData {
    const result = {
        checkInterval: 30_000,
        history: [], // Required field that was missing in many tests
        id: "test-monitor",
        monitoring: true,
        responseTime: 200,
        retryAttempts: 3,
        status: "up" as const,
        timeout: 5000,
        type: "http" as const,
        ...overrides,
    };

    // Include lastChecked by default only when called with no arguments
    // When called with any arguments (even empty object), don't include unless explicit
    if (arguments.length === 0) {
        (result as any).lastChecked = new Date();
    }

    return result as BaseMonitorData;
}

/**
 * Creates a valid HTTP monitor object with all required fields
 *
 * @param overrides - Optional fields to override default values
 *
 * @returns Valid HTTP monitor object that passes httpMonitorSchema validation
 */
export const createValidHttpMonitor = (
    overrides: Partial<HttpMonitorData> = {}
): HttpMonitorData => {
    const baseMonitor = createValidBaseMonitor({
        type: "http",
        lastChecked: new Date(),
    });
    return {
        ...baseMonitor,
        url: "https://example.com",
        ...overrides,
        type: "http", // Ensure type is always http
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
    overrides: Partial<PortMonitorData> = {}
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
    overrides: Partial<PingMonitorData> = {}
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
    overrides: Partial<StatusHistoryData> = {}
): StatusHistoryData {
    const result = {
        responseTime: 150,
        status: "up" as const,
        timestamp: Date.now(),
        ...overrides,
    };

    // Include details by default only when called with no arguments
    // When called with any arguments (even empty object), don't include unless explicit
    if (arguments.length === 0) {
        (result as any).details = "Response successful";
    }

    return result as StatusHistoryData;
}
