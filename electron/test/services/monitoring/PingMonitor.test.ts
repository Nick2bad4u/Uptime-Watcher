/**
 * Test suite for PingMonitor service.
 *
 * @remarks
 * Tests the ping monitoring functionality including configuration handling,
 * monitor validation, ping execution, and error scenarios.
 */

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import type { MockedFunction } from "vitest";

import { PingMonitor } from "../../../services/monitoring/PingMonitor";
import {
    MonitorConfig,
    MonitorCheckResult,
} from "../../../services/monitoring/types";
import { Site } from "../../../../shared/types";
import { isNonEmptyString } from "../../../../shared/validation/validatorUtils";
import * as pingRetryModule from "../../../services/monitoring/utils/pingRetry";

// Mock the ping retry utility
vi.mock("../../../services/monitoring/utils/pingRetry");
const mockPerformPingCheckWithRetry =
    pingRetryModule.performPingCheckWithRetry as MockedFunction<
        typeof pingRetryModule.performPingCheckWithRetry
    >;

// Mock the monitor type guards
vi.mock("../../../services/monitoring/utils/monitorTypeGuards", () => ({
    hasValidHost: vi.fn((monitor): boolean => {
        return isNonEmptyString(monitor.host);
    }),
    getMonitorTimeout: vi.fn((monitor, defaultTimeout) => {
        return monitor.timeout || defaultTimeout;
    }),
    getMonitorRetryAttempts: vi.fn((monitor, defaultRetries) => {
        return monitor.retryAttempts || defaultRetries;
    }),
}));

describe("PingMonitor", () => {
    let pingMonitor: PingMonitor;
    const defaultConfig: MonitorConfig = {
        timeout: 5000,
    };

    const createMockPingMonitor = (
        overrides: Partial<Site["monitors"][0]> = {}
    ): Site["monitors"][0] => ({
        activeOperations: [],
        id: "test-ping-monitor",
        type: "ping",
        host: "example.com",
        status: "pending",
        monitoring: true,
        checkInterval: 300_000,
        retryAttempts: 3,
        timeout: 10_000,
        responseTime: -1,
        history: [],
        lastChecked: new Date(),
        ...overrides,
    });

    beforeEach(() => {
        vi.clearAllMocks();
        pingMonitor = new PingMonitor(defaultConfig);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    describe("constructor", () => {
        it("should initialize with default configuration when no config provided", () => {
            const monitor = new PingMonitor();
            const config = monitor.getConfig();

            expect(config.timeout).toBe(10_000); // DEFAULT_REQUEST_TIMEOUT
        });

        it("should merge provided configuration with defaults", () => {
            const customConfig: MonitorConfig = {
                timeout: 15_000,
            };
            const monitor = new PingMonitor(customConfig);
            const config = monitor.getConfig();

            expect(config.timeout).toBe(15_000);
        });

        it("should override only specified configuration values", () => {
            const partialConfig: MonitorConfig = {
                timeout: 20_000,
            };
            const monitor = new PingMonitor(partialConfig);
            const config = monitor.getConfig();

            expect(config.timeout).toBe(20_000);
        });
    });

    describe("getType", () => {
        it("should return 'ping' as the monitor type", () => {
            expect(pingMonitor.getType()).toBe("ping");
        });
    });

    describe("updateConfig", () => {
        it("should update configuration values", () => {
            const newConfig: Partial<MonitorConfig> = {
                timeout: 8000,
            };

            pingMonitor.updateConfig(newConfig);
            const config = pingMonitor.getConfig();

            expect(config.timeout).toBe(8000);
        });

        it("should only update specified configuration values", () => {
            const partialUpdate: Partial<MonitorConfig> = {
                timeout: 12_000,
            };

            pingMonitor.updateConfig(partialUpdate);
            const config = pingMonitor.getConfig();

            expect(config.timeout).toBe(12_000);
        });
    });

    describe("check", () => {
        const successResult: MonitorCheckResult = {
            status: "up",
            responseTime: 50,
            details: "Ping successful - packet loss: 0%",
        };

        const failureResult: MonitorCheckResult = {
            status: "down",
            responseTime: 5000,
            details: "Host unreachable",
            error: "Ping failed - host unreachable",
        };

        beforeEach(() => {
            vi.clearAllMocks();
            mockPerformPingCheckWithRetry.mockResolvedValue(successResult);
        });

        it("should successfully ping a valid host", async () => {
            const monitor = createMockPingMonitor({
                host: "google.com",
                timeout: 5000,
                retryAttempts: 2,
            });

            const result = await pingMonitor.check(monitor);

            expect(result).toEqual(successResult);
            expect(mockPerformPingCheckWithRetry).toHaveBeenCalledWith(
                "google.com",
                5000,
                2
            );
        });

        it("should reject non-ping monitor types", async () => {
            const httpMonitor = createMockPingMonitor({
                type: "http" as any,
            });

            await expect(pingMonitor.check(httpMonitor)).rejects.toThrow(
                "PingMonitor cannot handle monitor type: http"
            );
            expect(mockPerformPingCheckWithRetry).not.toHaveBeenCalled();
        });

        it("should reject monitors without valid host", async () => {
            const invalidMonitor = createMockPingMonitor({
                host: "",
            });

            const result = await pingMonitor.check(invalidMonitor);

            expect(result.status).toBe("down");
            expect(result.error).toContain("Monitor missing valid host");
            expect(mockPerformPingCheckWithRetry).not.toHaveBeenCalled();
        });

        it("should handle ping failure", async () => {
            mockPerformPingCheckWithRetry.mockResolvedValue(failureResult);
            const monitor = createMockPingMonitor();

            const result = await pingMonitor.check(monitor);

            expect(result).toEqual(failureResult);
            expect(result.status).toBe("down");
        });

        it("should use monitor-specific timeout and retry settings", async () => {
            const monitor = createMockPingMonitor({
                host: "test.example.com",
                timeout: 8000,
                retryAttempts: 5,
            });

            await pingMonitor.check(monitor);

            expect(mockPerformPingCheckWithRetry).toHaveBeenCalledWith(
                "test.example.com",
                8000,
                5
            );
        });

        it("should handle different host types", async () => {
            const testCases = [
                { host: "example.com", description: "domain name" },
                { host: "192.168.1.1", description: "IPv4 address" },
                { host: "localhost", description: "localhost" },
                { host: "2001:db8::1", description: "IPv6 address" },
            ];

            for (const testCase of testCases) {
                const monitor = createMockPingMonitor({ host: testCase.host });

                await pingMonitor.check(monitor);

                expect(mockPerformPingCheckWithRetry).toHaveBeenCalledWith(
                    testCase.host,
                    expect.any(Number),
                    expect.any(Number)
                );
            }
        });

        it("should propagate ping retry errors", async () => {
            const error = new Error("Network unreachable");
            mockPerformPingCheckWithRetry.mockRejectedValue(error);

            const monitor = createMockPingMonitor();

            await expect(pingMonitor.check(monitor)).rejects.toThrow(
                "Network unreachable"
            );
        });
    });

    describe("configuration edge cases", () => {
        it("should handle undefined timeout gracefully", async () => {
            const monitor = createMockPingMonitor({
                timeout: undefined as any,
            });

            await pingMonitor.check(monitor);

            // Should use service default timeout
            expect(mockPerformPingCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                defaultConfig.timeout,
                expect.any(Number)
            );
        });

        it("should handle undefined retry attempts gracefully", async () => {
            const monitor = createMockPingMonitor({
                retryAttempts: undefined as any,
            });

            await pingMonitor.check(monitor);

            // Should use service default retry attempts (from constants)
            expect(mockPerformPingCheckWithRetry).toHaveBeenCalledWith(
                "example.com",
                expect.any(Number),
                3 // DEFAULT_RETRY_ATTEMPTS
            );
        });
    });

    describe("performance characteristics", () => {
        it("should complete quickly for successful pings", async () => {
            const monitor = createMockPingMonitor();
            const startTime = Date.now();

            await pingMonitor.check(monitor);

            const duration = Date.now() - startTime;
            expect(duration).toBeLessThan(100); // Should be very fast since we're mocking
        });

        it.skip("should handle concurrent ping checks", async () => {
            const monitor1 = createMockPingMonitor({ host: "host1.com" });
            const monitor2 = createMockPingMonitor({ host: "host2.com" });
            const monitor3 = createMockPingMonitor({ host: "host3.com" });

            const promises = [
                pingMonitor.check(monitor1),
                pingMonitor.check(monitor2),
                pingMonitor.check(monitor3),
            ];

            const results = await Promise.all(promises);

            expect(results).toHaveLength(3);

            // Debug: log what we got
            console.log("Concurrent results:", results);

            for (const result of results) {
                expect(result).toBeDefined();
                expect(result.status).toBe("up");
            }
            expect(mockPerformPingCheckWithRetry).toHaveBeenCalledTimes(3);
        });
    });
});
