/**
 * @file Comprehensive coverage tests for PortMonitor.ts This file addresses
 *   42.37% coverage by testing all public methods and error paths
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Site } from "../../../../shared/types";
import type { MonitorCheckResult } from "../../../services/monitoring/types";

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
            timeout: 5000,
        });
        vi.mocked(createMonitorErrorResult).mockReturnValue(errorResult);

        // Create a fresh instance for each test
        portMonitor = new PortMonitor();
    });

    describe("Constructor", () => {
        it("should initialize with default configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitor = new PortMonitor();
            const config = monitor.getConfig();
            expect(config).toBeDefined();
            expect(monitor.getType()).toBe("port");
        });

        it("should initialize with custom configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const customConfig = { timeout: 10_000 };
            const monitor = new PortMonitor(customConfig);
            const config = monitor.getConfig();
            expect(config.timeout).toBe(10_000);
        });

        it("should merge custom config with defaults", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const customConfig = { timeout: 10_000 };
            const monitor = new PortMonitor(customConfig);
            const config = monitor.getConfig();
            expect(config.timeout).toBe(10_000);
            // Should still have other default properties
            expect(config).toBeDefined();
        });

        it("should handle empty configuration object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = new PortMonitor({});
            expect(monitor.getType()).toBe("port");
        });
    });

    describe("getType", () => {
        it('should return "port" as the monitor type', async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            expect(portMonitor.getType()).toBe("port");
        });
    });

    describe("getConfig", () => {
        it("should return a copy of the current configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config = portMonitor.getConfig();
            expect(config).toBeDefined();
            expect(typeof config).toBe("object");
        });

        it("should not allow external modification of returned config", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config = portMonitor.getConfig();
            config.timeout = 99_999;
            // Get config again and verify it wasn't modified
            const newConfig = portMonitor.getConfig();
            expect(newConfig.timeout).not.toBe(99_999);
        });

        it("should return configuration with all set properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const config = portMonitor.getConfig();
            expect(config).toBeDefined();
            expect(typeof config).toBe("object");
        });
    });

    describe("updateConfig", () => {
        it("should update configuration with valid timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            const initialMonitor = new PortMonitor();
            initialMonitor.updateConfig({ timeout: 10_000 });

            const config = initialMonitor.getConfig();
            expect(config.timeout).toBe(10_000);
        });

        it("should merge partial configuration", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            portMonitor.updateConfig({ timeout: 8000 });
            const config = portMonitor.getConfig();
            expect(config.timeout).toBe(8000);
        });

        it("should throw error for invalid timeout type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                portMonitor.updateConfig({ timeout: "invalid" as any });
            }).toThrow();
        });

        it("should throw error for negative timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                portMonitor.updateConfig({ timeout: -1000 });
            }).toThrow();
        });

        it("should throw error for zero timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            expect(() => {
                portMonitor.updateConfig({ timeout: 0 });
            }).toThrow();
        });

        it("should allow updating userAgent without validation", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            portMonitor.updateConfig({ userAgent: "Custom Agent/1.0" });
            // Should not throw
            expect(true).toBeTruthy();
        });

        it("should handle empty config update", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Data Update", "type");

            portMonitor.updateConfig({});
            // Should not throw for empty config
            expect(true).toBeTruthy();
        });

        it("should allow updating with empty object", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            portMonitor.updateConfig({});
            // Should not throw
            expect(true).toBeTruthy();
        });
    });

    describe("check method", () => {
        it("should successfully check a valid port monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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
                5000,
                3
            );
            expect(result).toEqual(successResult);
        });

        it("should throw error for non-port monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const httpMonitor: Site["monitors"][0] = {
                ...validPortMonitor,
                type: "http",
            };

            await expect(portMonitor.check(httpMonitor)).rejects.toThrow(
                "PortMonitor cannot handle monitor type: http"
            );
        });

        it("should handle validation errors from validateMonitorHostAndPort", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle monitor with missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const { host, ...monitorWithoutHost } = validPortMonitor;

            await expect(
                portMonitor.check(monitorWithoutHost as Site["monitors"][0])
            ).resolves.toBeDefined();

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should handle monitor with missing port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const { port, ...monitorWithoutPort } = validPortMonitor;

            await expect(
                portMonitor.check(monitorWithoutPort as Site["monitors"][0])
            ).resolves.toBeDefined();

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should handle monitor with empty string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithEmptyHost: Site["monitors"][0] = {
                ...validPortMonitor,
                host: "",
            };

            await portMonitor.check(monitorWithEmptyHost);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should handle monitor with zero port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitorWithZeroPort: Site["monitors"][0] = {
                ...validPortMonitor,
                port: 0,
            };

            await portMonitor.check(monitorWithZeroPort);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Port monitor missing valid host or port",
                0
            );
        });

        it("should use monitor-specific timeout and retry configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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
                8000,
                5
            );
        });

        it("should handle port check retry failure", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            const retryError = new Error("Port check failed after retries");
            vi.mocked(performPortCheckWithRetry).mockRejectedValue(retryError);

            await expect(portMonitor.check(validPortMonitor)).rejects.toThrow(
                "Port check failed after retries"
            );
        });

        it("should handle different host formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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
                ).toHaveBeenCalledWith(host, 443, 5000, 3);
            }
        });

        it("should handle different port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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
                ).toHaveBeenCalledWith("example.com", port, 5000, 3);
            }
        });

        it("should use service default timeout when monitor timeout is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const { timeout, ...monitorWithoutTimeout } = validPortMonitor;

            await portMonitor.check(
                monitorWithoutTimeout as Site["monitors"][0]
            );

            expect(vi.mocked(extractMonitorConfig)).toHaveBeenCalledWith(
                monitorWithoutTimeout,
                10_000
            );
        });

        it("should work with custom service timeout configuration", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const customTimeoutMonitor = new PortMonitor({ timeout: 10_000 });
            const customErrorResult: MonitorCheckResult = {
                status: "up",
                responseTime: 200,
                details: "Custom timeout test",
            };

            vi.mocked(performPortCheckWithRetry).mockResolvedValue(
                customErrorResult
            );

            await customTimeoutMonitor.check(validPortMonitor);

            expect(vi.mocked(extractMonitorConfig)).toHaveBeenCalledWith(
                validPortMonitor,
                10_000
            );
        });
    });

    describe("Error Handling Edge Cases", () => {
        it("should handle performPortCheckWithRetry returning different error types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

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

        it("should handle null validation error correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(validateMonitorHostAndPort).mockReturnValue(null);

            await portMonitor.check(validPortMonitor);

            expect(vi.mocked(performPortCheckWithRetry)).toHaveBeenCalled();
        });

        it("should handle empty string validation error", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Error Handling", "type");

            vi.mocked(validateMonitorHostAndPort).mockReturnValue("Empty host");

            await portMonitor.check(validPortMonitor);

            expect(vi.mocked(createMonitorErrorResult)).toHaveBeenCalledWith(
                "Empty host",
                0
            );
        });

        it("should handle monitor with all optional fields", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const minimalMonitor: Site["monitors"][0] = {
                id: "minimal-port",
                type: "port",
                host: "test.com",
                port: 80,
                checkInterval: 30_000,
                retryAttempts: 3,
                timeout: 5000,
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
        it("should maintain type safety with MonitorType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitor: Site["monitors"][0] = {
                ...validPortMonitor,
                type: "port" as const,
            };

            await portMonitor.check(monitor);
            expect(vi.mocked(validateMonitorHostAndPort)).toHaveBeenCalled();
        });

        it("should work with various monitor configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should handle concurrent check operations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate(
                "Component: PortMonitor-coverage-fixed",
                "component"
            );
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

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
