/**
 * @file Comprehensive coverage tests for PortMonitor.ts This file addresses
 *   42.37% coverage by testing all public methods and error paths
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Site } from "@shared/types";
import type { MonitorCheckResult } from "../../../services/monitoring/types";
import { DEFAULT_REQUEST_TIMEOUT } from "../../../constants";

// Mock the modules before importing
vi.mock("../../../services/monitoring/utils/portRetry", () => ({
    performPortCheckWithRetry: vi.fn(),
}));

vi.mock("../../../services/monitoring/shared/monitorServiceHelpers", () => ({
    validateMonitorHostAndPort: vi.fn(),
    extractMonitorConfig: vi.fn(),
    createMonitorErrorResult: vi.fn(),
}));

import { PortMonitor } from "../../../services/monitoring/PortMonitor";
import { performPortCheckWithRetry } from "../../../services/monitoring/utils/portRetry";
import {
    validateMonitorHostAndPort,
    extractMonitorConfig,
    createMonitorErrorResult,
} from "../../../services/monitoring/shared/monitorServiceHelpers";

describe("PortMonitor Coverage Tests", () => {
    let portMonitor: PortMonitor;

    const validPortMonitor: Site["monitors"][0] = {
        id: "port-monitor-1",
        type: "port",
        host: "example.com",
        port: 443,
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        monitoring: false,
        status: "pending",
        responseTime: 0,
        lastChecked: undefined,
        history: [],
    };

    const successResult: MonitorCheckResult = {
        status: "up",
        responseTime: 150,
        details: "Port 443 is reachable",
    };

    const errorResult: MonitorCheckResult = {
        status: "down",
        responseTime: 0,
        details: "Port 443 is not reachable",
    };

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        // Set up default mock behaviors
        vi.mocked(performPortCheckWithRetry).mockResolvedValue(successResult);
        vi.mocked(validateMonitorHostAndPort).mockReturnValue(null); // No validation error
        vi.mocked(extractMonitorConfig).mockReturnValue({
            retryAttempts: 3,
            timeout: 10_000, // Match DEFAULT_REQUEST_TIMEOUT
        });
        vi.mocked(createMonitorErrorResult).mockReturnValue(errorResult);

        // Create a fresh instance for each test
        portMonitor = new PortMonitor();
    });

    describe("Constructor", () => {
        it("should initialize with default configuration", () => {
            const monitor = new PortMonitor();
            const config = monitor.getConfig();
            expect(config).toBeDefined();
            expect(monitor.getType()).toBe("port");
        });

        it("should initialize with custom configuration", () => {
            const customConfig = { timeout: 10_000 };
            const monitor = new PortMonitor(customConfig);
            const config = monitor.getConfig();
            expect(config.timeout).toBe(10_000);
        });

        it("should merge custom config with defaults", () => {
            const customConfig = { timeout: 10_000 };
            const monitor = new PortMonitor(customConfig);
            const config = monitor.getConfig();
            expect(config.timeout).toBe(10_000);
            // Should still have other default properties
            expect(config).toBeDefined();
        });

        it("should handle empty configuration object", () => {
            const monitor = new PortMonitor({});
            expect(monitor.getType()).toBe("port");
        });
    });

    describe("getType", () => {
        it('should return "port" as the monitor type', () => {
            expect(portMonitor.getType()).toBe("port");
        });
    });

    describe("getConfig", () => {
        it("should return a copy of the current configuration", () => {
            const config = portMonitor.getConfig();
            expect(config).toBeDefined();
            expect(typeof config).toBe("object");
        });

        it("should not allow external modification of returned config", () => {
            const config = portMonitor.getConfig();
            config.timeout = 99_999;
            // Get config again and verify it wasn't modified
            const newConfig = portMonitor.getConfig();
            expect(newConfig.timeout).not.toBe(99_999);
        });

        it("should return configuration with all set properties", () => {
            const config = portMonitor.getConfig();
            expect(config).toBeDefined();
            expect(typeof config).toBe("object");
        });
    });

    describe("updateConfig", () => {
        it("should update configuration with valid timeout", () => {
            const initialMonitor = new PortMonitor();
            initialMonitor.updateConfig({ timeout: 10_000 });

            const config = initialMonitor.getConfig();
            expect(config.timeout).toBe(10_000);
        });

        it("should merge partial configuration", () => {
            portMonitor.updateConfig({ timeout: 8000 });
            const config = portMonitor.getConfig();
            expect(config.timeout).toBe(8000);
        });

        it("should throw error for invalid timeout type", () => {
            expect(() => {
                portMonitor.updateConfig({ timeout: "invalid" as any });
            }).toThrow();
        });

        it("should throw error for negative timeout", () => {
            expect(() => {
                portMonitor.updateConfig({ timeout: -1000 });
            }).toThrow();
        });

        it("should throw error for zero timeout", () => {
            expect(() => {
                portMonitor.updateConfig({ timeout: 0 });
            }).toThrow();
        });

        it("should allow updating userAgent without validation", () => {
            portMonitor.updateConfig({ userAgent: "Custom Agent/1.0" });
            // Should not throw
            expect(true).toBe(true);
        });

        it("should handle undefined timeout in config", () => {
            portMonitor.updateConfig({ timeout: undefined });
            // Should not throw for undefined
            expect(true).toBe(true);
        });

        it("should allow updating with empty object", () => {
            portMonitor.updateConfig({});
            // Should not throw
            expect(true).toBe(true);
        });
    });

    describe("check method", () => {
        it("should successfully check a valid port monitor", async () => {
            const result = await portMonitor.check(validPortMonitor);

            expect(vi.mocked(validateMonitorHostAndPort)).toHaveBeenCalledWith(
                validPortMonitor
            );
            expect(vi.mocked(extractMonitorConfig)).toHaveBeenCalledWith(
                validPortMonitor,
                10_000
            );
            expect(vi.mocked(performPortCheckWithRetry)).toHaveBeenCalledWith(
                "example.com",
                443,
                10_000, // timeout as separate parameter
                3 // retryAttempts as separate parameter
            );
            expect(result).toEqual(successResult);
        });

        it("should throw error for non-port monitor type", async () => {
            const httpMonitor: Site["monitors"][0] = {
                ...validPortMonitor,
                type: "http",
            };

            await expect(portMonitor.check(httpMonitor)).rejects.toThrow(
                "PortMonitor cannot handle monitor type: http"
            );
        });

        it("should handle validation errors from validateMonitorHostAndPort", async () => {
            const validationError = "Host is required for port monitoring";
            vi.mocked(validateMonitorHostAndPort).mockReturnValue(
                validationError
            );

            const result = await portMonitor.check(validPortMonitor);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                validationError,
                0
            );
            expect(result).toEqual(errorResult);
            expect(vi.mocked(performPortCheckWithRetry)).not.toHaveBeenCalled();
        });

        it("should handle monitor with missing host", async () => {
            const monitorWithoutHost: Site["monitors"][0] = {
                ...validPortMonitor,
                host: undefined,
            };

            const result = await portMonitor.check(monitorWithoutHost);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should handle monitor with missing port", async () => {
            const monitorWithoutPort: Site["monitors"][0] = {
                ...validPortMonitor,
                port: undefined,
            };

            const result = await portMonitor.check(monitorWithoutPort);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should handle monitor with empty string host", async () => {
            const monitorWithEmptyHost: Site["monitors"][0] = {
                ...validPortMonitor,
                host: "",
            };

            const result = await portMonitor.check(monitorWithEmptyHost);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should handle monitor with zero port", async () => {
            const monitorWithZeroPort: Site["monitors"][0] = {
                ...validPortMonitor,
                port: 0,
            };

            const result = await portMonitor.check(monitorWithZeroPort);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should use monitor-specific timeout and retry configuration", async () => {
            const monitorWithCustomConfig: Site["monitors"][0] = {
                ...validPortMonitor,
                timeout: 8000,
                retryAttempts: 5,
            };

            vi.mocked(extractMonitorConfig).mockReturnValue({
                retryAttempts: 5,
                timeout: 8000,
            });

            await portMonitor.check(monitorWithCustomConfig);

            expect(vi.mocked(extractMonitorConfig)).toHaveBeenCalledWith(
                monitorWithCustomConfig,
                10_000
            );
            expect(vi.mocked(performPortCheckWithRetry)).toHaveBeenCalledWith(
                "example.com",
                443,
                8000, // timeout
                5 // retryAttempts
            );
        });

        it("should handle port check retry failure", async () => {
            const retryError = new Error("Port check failed after retries");
            vi.mocked(performPortCheckWithRetry).mockRejectedValue(retryError);

            await expect(portMonitor.check(validPortMonitor)).rejects.toThrow(
                "Port check failed after retries"
            );
        });

        it("should handle different host formats", async () => {
            const hosts = [
                "example.com",
                "localhost",
                "192.168.1.1",
                "2001:db8::1",
            ];

            for (const host of hosts) {
                const monitor: Site["monitors"][0] = {
                    ...validPortMonitor,
                    host,
                };

                await portMonitor.check(monitor);

                expect(
                    vi.mocked(performPortCheckWithRetry)
                ).toHaveBeenCalledWith(
                    host,
                    443,
                    10_000, // timeout
                    3 // retryAttempts
                );
            }
        });

        it("should handle different port numbers", async () => {
            const ports = [
                22,
                80,
                443,
                3000,
                8080,
                65_535,
            ];

            for (const port of ports) {
                const monitor: Site["monitors"][0] = {
                    ...validPortMonitor,
                    port,
                };

                await portMonitor.check(monitor);

                expect(
                    vi.mocked(performPortCheckWithRetry)
                ).toHaveBeenCalledWith(
                    "example.com",
                    port,
                    10_000, // timeout
                    3 // retryAttempts
                );
            }
        });

        it("should use service default timeout when monitor timeout is undefined", async () => {
            const monitorWithoutTimeout: Site["monitors"][0] = {
                ...validPortMonitor,
                timeout: undefined,
            };

            await portMonitor.check(monitorWithoutTimeout);

            expect(vi.mocked(extractMonitorConfig)).toHaveBeenCalledWith(
                monitorWithoutTimeout,
                10_000
            );
        });

        it("should work with custom service timeout configuration", async () => {
            const customTimeoutMonitor = new PortMonitor({ timeout: 10_000 });
            const customErrorResult: MonitorCheckResult = {
                status: "up",
                responseTime: 200,
                details: "Custom timeout test",
            };

            vi.mocked(performPortCheckWithRetry).mockResolvedValue(
                customErrorResult
            );

            // Actually call the monitor to trigger the expectation
            await customTimeoutMonitor.check(validPortMonitor);

            expect(vi.mocked(extractMonitorConfig)).toHaveBeenCalledWith(
                validPortMonitor,
                10_000
            );
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle performPortCheckWithRetry returning different error types", async () => {
            const customErrorResult: MonitorCheckResult = {
                status: "down",
                responseTime: -1,
                details: "Custom error handling test",
            };

            vi.mocked(performPortCheckWithRetry).mockResolvedValue(
                customErrorResult
            );

            const result = await portMonitor.check(validPortMonitor);
            expect(result).toEqual(customErrorResult);
        });

        it("should handle null validation error correctly", async () => {
            vi.mocked(validateMonitorHostAndPort).mockReturnValue(null);

            await portMonitor.check(validPortMonitor);

            expect(vi.mocked(performPortCheckWithRetry)).toHaveBeenCalled();
        });

        it("should handle empty string validation (no error case)", async () => {
            // Clear mocks to ensure fresh state
            vi.clearAllMocks();
            vi.mocked(validateMonitorHostAndPort).mockReturnValue(""); // Empty string means no validation error
            vi.mocked(performPortCheckWithRetry).mockResolvedValue(
                successResult
            );
            vi.mocked(extractMonitorConfig).mockReturnValue({
                retryAttempts: 3,
                timeout: DEFAULT_REQUEST_TIMEOUT,
            });

            const result = await portMonitor.check(validPortMonitor);

            // Should continue to performPortCheckWithRetry since no validation error
            expect(vi.mocked(performPortCheckWithRetry)).toHaveBeenCalledWith(
                validPortMonitor.host,
                validPortMonitor.port,
                DEFAULT_REQUEST_TIMEOUT,
                3
            );
            expect(result).toEqual(successResult);
        });

        it("should handle monitor with all optional fields", async () => {
            const minimalMonitor: Site["monitors"][0] = {
                id: "minimal-port",
                type: "port",
                host: "test.com",
                port: 80,
                checkInterval: 30_000,
                monitoring: false,
                status: "pending",
                responseTime: 0,
                history: [],
            };

            await portMonitor.check(minimalMonitor);

            expect(vi.mocked(validateMonitorHostAndPort)).toHaveBeenCalled();
        });
    });

    describe("Integration and Type Safety", () => {
        it("should maintain type safety with MonitorType", async () => {
            const monitor: Site["monitors"][0] = {
                ...validPortMonitor,
                type: "port" as const,
            };

            await portMonitor.check(monitor);
            expect(vi.mocked(validateMonitorHostAndPort)).toHaveBeenCalled();
        });

        it("should work with various monitor configurations", async () => {
            const configurations = [
                { timeout: 30_000 },
                { retryAttempts: 5 },
                { userAgent: "Test Agent" },
                { timeout: 10_000, retryAttempts: 2 },
            ];

            for (const config of configurations) {
                const testMonitor = new PortMonitor(config);
                await testMonitor.check(validPortMonitor);
            }

            expect(vi.mocked(performPortCheckWithRetry)).toHaveBeenCalled();
        });

        it("should handle concurrent check operations", async () => {
            const promises = Array.from({ length: 5 }, () =>
                portMonitor.check(validPortMonitor)
            );

            const results = await Promise.all(promises);

            for (const result of results) {
                expect(result).toEqual(successResult);
            }
        });
    });
});
