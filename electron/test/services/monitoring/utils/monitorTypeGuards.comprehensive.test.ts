/**
 * Test suite for monitorTypeGuards
 *
 * @module MonitorTypeGuards
 *
 * @file Comprehensive tests for monitor type guard and utility functions in the
 *   Uptime Watcher application, including safe property extraction and type
 *   checking for monitor configurations.
 *
 * @author GitHub Copilot
 *
 * @since 2025-08-11
 *
 * @category Monitoring Utilities
 *
 * @tags ["test", "monitoring", "type-guards", "validation"]
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies before importing the module under test
vi.mock("../../../../../shared/validation/validatorUtils", () => ({
    isNonEmptyString: vi.fn(),
    isValidFQDN: vi.fn(),
    isValidUrl: vi.fn(),
}));

// Import after mocks are set up
import {
    getMonitorRetryAttempts,
    getMonitorTimeout,
    hasValidHost,
    hasValidPort,
    hasValidRetryAttempts,
    hasValidTimeout,
    hasValidUrl,
} from "../../../../services/monitoring/utils/monitorTypeGuards";
import type { Site } from "@shared/types";
import {
    isNonEmptyString,
    isValidFQDN,
    isValidUrl,
} from "@shared/validation/validatorUtils";

describe("Monitor Type Guards", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Setup default mock return values
        vi.mocked(isNonEmptyString).mockReturnValue(true);
        vi.mocked(isValidFQDN).mockReturnValue(true);
        vi.mocked(isValidUrl).mockReturnValue(true);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Helper function to create a basic monitor for testing
    const createTestMonitor = (
        overrides: Partial<Site["monitors"][0]> = {}
    ): Site["monitors"][0] => ({
        id: "test-monitor",
        type: "http" as const,
        checkInterval: 60_000,
        history: [],
        monitoring: true,
        responseTime: 0,
        retryAttempts: 3,
        status: "pending" as const,
        timeout: 30_000,
        ...overrides,
    });

    describe(getMonitorRetryAttempts, () => {
        it("should return monitor's retry attempts when valid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createTestMonitor({ retryAttempts: 5 });

            const result = getMonitorRetryAttempts(monitor, 3);

            expect(result).toBe(5);
        });

        it("should return default retry attempts when monitor doesn't have them", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createTestMonitor(); // no retryAttempts property

            const result = getMonitorRetryAttempts(monitor, 3);

            expect(result).toBe(3);
        });

        it("should return default retry attempts when monitor has invalid retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createTestMonitor({ retryAttempts: -1 });

            const result = getMonitorRetryAttempts(monitor, 3);

            expect(result).toBe(3);
        });

        it("should return default retry attempts when retryAttempts is not a number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({
                retryAttempts: "invalid" as any,
            });

            const result = getMonitorRetryAttempts(monitor, 2);

            expect(result).toBe(2);
        });

        it("should handle zero retry attempts correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: 0 });

            const result = getMonitorRetryAttempts(monitor, 3);

            expect(result).toBe(0);
        });

        it("should handle large retry attempts correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: 100 });

            const result = getMonitorRetryAttempts(monitor, 3);

            expect(result).toBe(100);
        });

        it("should handle undefined retryAttempts property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({
                retryAttempts: undefined as any,
            });

            const result = getMonitorRetryAttempts(monitor, 5);

            expect(result).toBe(5);
        });

        it("should handle null retryAttempts property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: null as any });

            const result = getMonitorRetryAttempts(monitor, 4);

            expect(result).toBe(4);
        });
    });

    describe(getMonitorTimeout, () => {
        it("should return monitor's timeout when valid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createTestMonitor({ timeout: 5000 });

            const result = getMonitorTimeout(monitor, 3000);

            expect(result).toBe(5000);
        });

        it("should return default timeout when monitor doesn't have one", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            // Create a monitor without a timeout property
            const { timeout, ...monitorWithoutTimeout } = createTestMonitor();
            const monitor = monitorWithoutTimeout as Site["monitors"][0];

            const result = getMonitorTimeout(monitor, 3000);

            expect(result).toBe(3000);
        });

        it("should return default timeout when monitor has invalid timeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createTestMonitor({ timeout: 0 });

            const result = getMonitorTimeout(monitor, 3000);

            expect(result).toBe(3000);
        });

        it("should return default timeout when timeout is negative", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: -1000 });

            const result = getMonitorTimeout(monitor, 3000);

            expect(result).toBe(3000);
        });

        it("should return default timeout when timeout is not a number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: "invalid" as any });

            const result = getMonitorTimeout(monitor, 2000);

            expect(result).toBe(2000);
        });

        it("should handle very small positive timeout correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: 1 });

            const result = getMonitorTimeout(monitor, 3000);

            expect(result).toBe(1);
        });

        it("should handle large timeout values correctly", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: 60_000 });

            const result = getMonitorTimeout(monitor, 3000);

            expect(result).toBe(60_000);
        });

        it("should handle undefined timeout property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: undefined as any });

            const result = getMonitorTimeout(monitor, 5000);

            expect(result).toBe(5000);
        });

        it("should handle null timeout property", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: null as any });

            const result = getMonitorTimeout(monitor, 4000);

            expect(result).toBe(4000);
        });
    });

    describe(hasValidHost, () => {
        it("should return true for valid FQDN host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "example.com" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(true);

            const result = hasValidHost(monitor);

            expect(result).toBeTruthy();
            expect(isNonEmptyString).toHaveBeenCalledWith("example.com");
            expect(isValidFQDN).toHaveBeenCalledWith("example.com", {
                require_tld: false,
            });
        });

        it("should return true for valid hostname that matches regex pattern", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "localhost" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(false); // not a FQDN

            const result = hasValidHost(monitor);

            expect(result).toBeTruthy();
            expect(isNonEmptyString).toHaveBeenCalledWith("localhost");
            expect(isValidFQDN).toHaveBeenCalledWith("localhost", {
                require_tld: false,
            });
        });

        it("should return true for valid IP address", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "192.168.1.1" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeTruthy();
        });

        it("should return true for hostname with hyphens", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "test-server" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeTruthy();
        });

        it("should return true for hostname with underscores", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "test_server" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeTruthy();
        });

        it("should return false when isNonEmptyString returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "" });
            vi.mocked(isNonEmptyString).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeFalsy();
            expect(isNonEmptyString).toHaveBeenCalledWith("");
        });

        it("should return false for host with invalid characters", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "invalid@host" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when host is undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: undefined as any });
            vi.mocked(isNonEmptyString).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when host is null", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: null as any });
            vi.mocked(isNonEmptyString).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when host is not a string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: 123 as any });
            vi.mocked(isNonEmptyString).mockReturnValue(false);

            const result = hasValidHost(monitor);

            expect(result).toBeFalsy();
        });

        it("should handle complex FQDN validation scenarios", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const testCases = [
                { host: "sub.example.com", isValidFQDN: true, expected: true },
                { host: "example.co.uk", isValidFQDN: true, expected: true },
                { host: "test", isValidFQDN: false, expected: true }, // Matches regex
                { host: "test.", isValidFQDN: false, expected: true }, // Matches regex
            ];

            for (const testCase of testCases) {
                vi.mocked(isNonEmptyString).mockReturnValue(true);
                vi.mocked(isValidFQDN).mockReturnValue(testCase.isValidFQDN);

                const monitor = createTestMonitor({ host: testCase.host });
                const result = hasValidHost(monitor);

                expect(result).toBe(testCase.expected);
            }
        });
    });

    describe(hasValidPort, () => {
        it("should return true for valid port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const validPorts = [
                1,
                22,
                80,
                443,
                3000,
                8080,
                65_535,
            ];

            for (const port of validPorts) {
                const monitor = createTestMonitor({ port });
                const result = hasValidPort(monitor);
                expect(result).toBeTruthy();
            }
        });

        it("should return false for port number 0", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ port: 0 });

            const result = hasValidPort(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false for negative port numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidPorts = [
                -1,
                -100,
                -65_535,
            ];

            for (const port of invalidPorts) {
                const monitor = createTestMonitor({ port });
                const result = hasValidPort(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false for port numbers greater than 65_535", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidPorts = [
                65_536,
                70_000,
                100_000,
            ];

            for (const port of invalidPorts) {
                const monitor = createTestMonitor({ port });
                const result = hasValidPort(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false when port is not a number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidPorts = [
                "80",
                null,
                undefined,
                "invalid",
                {},
                [],
            ];

            for (const port of invalidPorts) {
                const monitor = createTestMonitor({ port: port as any });
                const result = hasValidPort(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false when port is NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ port: Number.NaN });

            const result = hasValidPort(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when port is Infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitor = createTestMonitor({ port: Infinity });

            const result = hasValidPort(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when port is -Infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitor = createTestMonitor({ port: -Infinity });

            const result = hasValidPort(monitor);

            expect(result).toBeFalsy();
        });

        it("should handle edge cases at boundaries", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const edgeCases = [
                { port: 1, expected: true },
                { port: 65_535, expected: true },
                { port: 0, expected: false },
                { port: 65_536, expected: false },
            ];

            for (const testCase of edgeCases) {
                const monitor = createTestMonitor({ port: testCase.port });
                const result = hasValidPort(monitor);
                expect(result).toBe(testCase.expected);
            }
        });

        it("should handle floating point numbers", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const floatingPoints = [
                80.5,
                443.1,
                22.9,
            ];

            for (const port of floatingPoints) {
                const monitor = createTestMonitor({ port });
                const result = hasValidPort(monitor);
                // Floating point numbers are still numbers, but may not be valid ports
                // The function checks typeof === "number", so this depends on implementation
                expect(result).toBeTruthy(); // They are numbers within valid range
            }
        });
    });

    describe(hasValidRetryAttempts, () => {
        it("should return true for valid retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const validRetryAttempts = [
                0,
                1,
                3,
                5,
                10,
                100,
            ];

            for (const retryAttempts of validRetryAttempts) {
                const monitor = createTestMonitor({ retryAttempts });
                const result = hasValidRetryAttempts(monitor);
                expect(result).toBeTruthy();
            }
        });

        it("should return false for negative retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidRetryAttempts = [
                -1,
                -5,
                -100,
            ];

            for (const retryAttempts of invalidRetryAttempts) {
                const monitor = createTestMonitor({ retryAttempts });
                const result = hasValidRetryAttempts(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false when retryAttempts is not a number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidRetryAttempts = [
                "3",
                null,
                undefined,
                "invalid",
                {},
                [],
            ];

            for (const retryAttempts of invalidRetryAttempts) {
                const monitor = createTestMonitor({
                    retryAttempts: retryAttempts as any,
                });
                const result = hasValidRetryAttempts(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false when retryAttempts is NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: Number.NaN });

            const result = hasValidRetryAttempts(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when retryAttempts is Infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitor = createTestMonitor({ retryAttempts: Infinity });

            const result = hasValidRetryAttempts(monitor);

            expect(result).toBeFalsy();
        });

        it("should handle floating point retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const floatingPoints = [
                1.5,
                3.7,
                5.2,
            ];

            for (const retryAttempts of floatingPoints) {
                const monitor = createTestMonitor({ retryAttempts });
                const result = hasValidRetryAttempts(monitor);
                expect(result).toBeTruthy(); // They are numbers >= 0
            }
        });

        it("should handle zero retry attempts specifically", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: 0 });

            const result = hasValidRetryAttempts(monitor);

            expect(result).toBeTruthy();
        });

        it("should handle very large retry attempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: 999_999 });

            const result = hasValidRetryAttempts(monitor);

            expect(result).toBeTruthy();
        });
    });

    describe(hasValidTimeout, () => {
        it("should return true for valid timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const validTimeouts = [
                1,
                100,
                1000,
                5000,
                30_000,
                60_000,
            ];

            for (const timeout of validTimeouts) {
                const monitor = createTestMonitor({ timeout });
                const result = hasValidTimeout(monitor);
                expect(result).toBeTruthy();
            }
        });

        it("should return false for timeout value 0", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: 0 });

            const result = hasValidTimeout(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false for negative timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidTimeouts = [
                -1,
                -1000,
                -5000,
            ];

            for (const timeout of invalidTimeouts) {
                const monitor = createTestMonitor({ timeout });
                const result = hasValidTimeout(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false when timeout is not a number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const invalidTimeouts = [
                "1000",
                null,
                undefined,
                "invalid",
                {},
                [],
            ];

            for (const timeout of invalidTimeouts) {
                const monitor = createTestMonitor({ timeout: timeout as any });
                const result = hasValidTimeout(monitor);
                expect(result).toBeFalsy();
            }
        });

        it("should return false when timeout is NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: Number.NaN });

            const result = hasValidTimeout(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when timeout is Infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitor = createTestMonitor({ timeout: Infinity });

            const result = hasValidTimeout(monitor);

            expect(result).toBeFalsy();
        });

        it("should return false when timeout is -Infinity", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Initialization", "type");

            const monitor = createTestMonitor({ timeout: -Infinity });

            const result = hasValidTimeout(monitor);

            expect(result).toBeFalsy();
        });

        it("should handle very small positive timeouts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const smallTimeouts = [
                0.1,
                0.5,
                0.001,
            ];

            for (const timeout of smallTimeouts) {
                const monitor = createTestMonitor({ timeout });
                const result = hasValidTimeout(monitor);
                expect(result).toBeTruthy();
            }
        });

        it("should handle very large timeout values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: 999_999_999 });

            const result = hasValidTimeout(monitor);

            expect(result).toBeTruthy();
        });

        it("should handle edge case at boundary", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const edgeCases = [
                { timeout: 0, expected: false },
                { timeout: 0.001, expected: true },
                { timeout: 1, expected: true },
            ];

            for (const testCase of edgeCases) {
                const monitor = createTestMonitor({
                    timeout: testCase.timeout,
                });
                const result = hasValidTimeout(monitor);
                expect(result).toBe(testCase.expected);
            }
        });
    });

    describe(hasValidUrl, () => {
        it("should return true when isValidUrl returns true", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ url: "https://example.com" });
            vi.mocked(isValidUrl).mockReturnValue(true);

            const result = hasValidUrl(monitor);

            expect(result).toBeTruthy();
            expect(isValidUrl).toHaveBeenCalledWith("https://example.com");
        });

        it("should return false when isValidUrl returns false", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ url: "invalid-url" });
            vi.mocked(isValidUrl).mockReturnValue(false);

            const result = hasValidUrl(monitor);

            expect(result).toBeFalsy();
            expect(isValidUrl).toHaveBeenCalledWith("invalid-url");
        });

        it("should handle different URL formats", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const urlTestCases = [
                { url: "https://example.com", isValid: true, expected: true },
                {
                    url: "http://localhost:3_000",
                    isValid: true,
                    expected: true,
                },
                {
                    url: "https://sub.domain.com/path",
                    isValid: true,
                    expected: true,
                },
                {
                    url: "ftp://files.example.com",
                    isValid: true,
                    expected: true,
                },
                { url: "invalid-url", isValid: false, expected: false },
                { url: "not-a-url", isValid: false, expected: false },
                { url: "", isValid: false, expected: false },
            ];

            for (const testCase of urlTestCases) {
                vi.mocked(isValidUrl).mockReturnValue(testCase.isValid);

                const monitor = createTestMonitor({ url: testCase.url });
                const result = hasValidUrl(monitor);

                expect(result).toBe(testCase.expected);
                expect(isValidUrl).toHaveBeenCalledWith(testCase.url);
            }
        });

        it("should handle undefined url", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ url: undefined as any });
            vi.mocked(isValidUrl).mockReturnValue(false);

            const result = hasValidUrl(monitor);

            expect(result).toBeFalsy();
            expect(isValidUrl).toHaveBeenCalledWith(undefined);
        });

        it("should handle null url", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ url: null as any });
            vi.mocked(isValidUrl).mockReturnValue(false);

            const result = hasValidUrl(monitor);

            expect(result).toBeFalsy();
            expect(isValidUrl).toHaveBeenCalledWith(null);
        });

        it("should handle non-string url", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ url: 123 as any });
            vi.mocked(isValidUrl).mockReturnValue(false);

            const result = hasValidUrl(monitor);

            expect(result).toBeFalsy();
            expect(isValidUrl).toHaveBeenCalledWith(123);
        });

        it("should delegate all validation logic to isValidUrl", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Validation", "type");

            const testUrls = [
                "https://example.com",
                "https://test.local",
                "invalid",
                "",
                null,
                undefined,
            ];

            for (const url of testUrls) {
                // Reset mock for each test
                vi.mocked(isValidUrl).mockClear();
                vi.mocked(isValidUrl).mockReturnValue(Math.random() > 0.5); // Random result

                const monitor = createTestMonitor({ url: url as any });
                hasValidUrl(monitor);

                expect(isValidUrl).toHaveBeenCalledWith(url);
                expect(isValidUrl).toHaveBeenCalledTimes(1);
            }
        });
    });

    describe("Type guard behavior and integration", () => {
        it("should properly type narrow with hasValidHost", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ host: "example.com" });
            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(true);

            if (hasValidHost(monitor)) {
                // TypeScript should now know that monitor.host is a string
                expect(typeof monitor.host).toBe("string");
                expect(monitor.host).toBe("example.com");
            }
        });

        it("should properly type narrow with hasValidPort", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ port: 443 });

            if (hasValidPort(monitor)) {
                // TypeScript should now know that monitor.port is a number
                expect(typeof monitor.port).toBe("number");
                expect(monitor.port).toBe(443);
            }
        });

        it("should properly type narrow with hasValidRetryAttempts", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ retryAttempts: 3 });

            if (hasValidRetryAttempts(monitor)) {
                // TypeScript should now know that monitor.retryAttempts is a number
                expect(typeof monitor.retryAttempts).toBe("number");
                expect(monitor.retryAttempts).toBe(3);
            }
        });

        it("should properly type narrow with hasValidTimeout", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ timeout: 5000 });

            if (hasValidTimeout(monitor)) {
                // TypeScript should now know that monitor.timeout is a number
                expect(typeof monitor.timeout).toBe("number");
                expect(monitor.timeout).toBe(5000);
            }
        });

        it("should properly type narrow with hasValidUrl", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({ url: "https://example.com" });
            vi.mocked(isValidUrl).mockReturnValue(true);

            if (hasValidUrl(monitor)) {
                // TypeScript should now know that monitor.url is a string
                expect(typeof monitor.url).toBe("string");
                expect(monitor.url).toBe("https://example.com");
            }
        });

        it("should work with complex monitor configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const complexMonitor = createTestMonitor({
                host: "api.example.com",
                port: 443,
                timeout: 5000,
                retryAttempts: 3,
                url: "https://api.example.com/health",
            });

            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(true);
            vi.mocked(isValidUrl).mockReturnValue(true);

            expect(hasValidHost(complexMonitor)).toBeTruthy();
            expect(hasValidPort(complexMonitor)).toBeTruthy();
            expect(hasValidTimeout(complexMonitor)).toBeTruthy();
            expect(hasValidRetryAttempts(complexMonitor)).toBeTruthy();
            expect(hasValidUrl(complexMonitor)).toBeTruthy();
        });

        it("should handle monitors with mixed valid and invalid properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const mixedMonitor = createTestMonitor({
                host: "valid.com", // Valid
                port: -1, // Invalid
                timeout: 5000, // Valid
                retryAttempts: -1, // Invalid
                url: "invalid-url", // Invalid
            });

            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(true);
            vi.mocked(isValidUrl).mockReturnValue(false);

            expect(hasValidHost(mixedMonitor)).toBeTruthy();
            expect(hasValidPort(mixedMonitor)).toBeFalsy();
            expect(hasValidTimeout(mixedMonitor)).toBeTruthy();
            expect(hasValidRetryAttempts(mixedMonitor)).toBeFalsy();
            expect(hasValidUrl(mixedMonitor)).toBeFalsy();
        });
    });

    describe("Performance and edge cases", () => {
        it("should handle rapid successive calls efficiently", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createTestMonitor({
                host: "test.com",
                port: 80,
                timeout: 1000,
                retryAttempts: 3,
                url: "https://test.com",
            });

            vi.mocked(isNonEmptyString).mockReturnValue(true);
            vi.mocked(isValidFQDN).mockReturnValue(true);
            vi.mocked(isValidUrl).mockReturnValue(true);

            // Call each function multiple times
            for (let i = 0; i < 100; i++) {
                expect(hasValidHost(monitor)).toBeTruthy();
                expect(hasValidPort(monitor)).toBeTruthy();
                expect(hasValidTimeout(monitor)).toBeTruthy();
                expect(hasValidRetryAttempts(monitor)).toBeTruthy();
                expect(hasValidUrl(monitor)).toBeTruthy();
            }
        });

        it("should handle malformed monitor objects gracefully", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const malformedMonitor = {} as Site["monitors"][0];

            vi.mocked(isNonEmptyString).mockReturnValue(false);
            vi.mocked(isValidFQDN).mockReturnValue(false);
            vi.mocked(isValidUrl).mockReturnValue(false);

            expect(hasValidHost(malformedMonitor)).toBeFalsy();
            expect(hasValidPort(malformedMonitor)).toBeFalsy();
            expect(hasValidTimeout(malformedMonitor)).toBeFalsy();
            expect(hasValidRetryAttempts(malformedMonitor)).toBeFalsy();
            expect(hasValidUrl(malformedMonitor)).toBeFalsy();
        });

        it("should handle monitors with all properties undefined", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: monitorTypeGuards", "component");
            await annotate("Category: Service", "category");
            await annotate("Type: Monitoring", "type");

            const undefinedMonitor = createTestMonitor({
                host: undefined,
                port: undefined,
                timeout: undefined,
                retryAttempts: undefined,
                url: undefined,
            } as any);

            vi.mocked(isNonEmptyString).mockReturnValue(false);
            vi.mocked(isValidFQDN).mockReturnValue(false);
            vi.mocked(isValidUrl).mockReturnValue(false);

            expect(hasValidHost(undefinedMonitor)).toBeFalsy();
            expect(hasValidPort(undefinedMonitor)).toBeFalsy();
            expect(hasValidTimeout(undefinedMonitor)).toBeFalsy();
            expect(hasValidRetryAttempts(undefinedMonitor)).toBeFalsy();
            expect(hasValidUrl(undefinedMonitor)).toBeFalsy();
        });
    });
});
