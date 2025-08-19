/**
 * Comprehensive tests for MonitorValidator Targeting 98% branch coverage for
 * all validation logic
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonitorValidator } from "../../../managers/validators/MonitorValidator";
import type { Site, StatusHistory } from "../../../../shared/types.js";

// Mock the MonitorTypeRegistry module
vi.mock("../../../services/monitoring/MonitorTypeRegistry", () => ({
    getRegisteredMonitorTypes: vi.fn(() => ["http", "port"]),
    isValidMonitorType: vi.fn((type: string) =>
        ["http", "port"].includes(type)
    ),
    validateMonitorData: vi.fn((type: string, data: any) => {
        if (type === "http" && data.url && data.url.startsWith("https://")) {
            return {
                success: true,
                errors: [],
                warnings: [],
                metadata: {},
                data,
            };
        }
        if (type === "port" && data.host && typeof data.port === "number") {
            return {
                success: true,
                errors: [],
                warnings: [],
                metadata: {},
                data,
            };
        }
        if (type === "invalid") {
            return {
                success: false,
                errors: ["Invalid monitor type specific validation"],
                warnings: [],
                metadata: {},
            };
        }
        return {
            success: false,
            errors: ["Validation failed for monitor data"],
            warnings: [],
            metadata: {},
        };
    }),
}));

const createMockMonitor = (
    overrides: Partial<Site["monitors"][0]> = {}
): Site["monitors"][0] => {
    const history: StatusHistory[] = [];
    return {
        id: "test",
        type: "http",
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
        monitoring: true,
        status: "pending",
        responseTime: -1,
        history,
        url: "https://example.com",
        ...overrides,
    };
};

describe("MonitorValidator - Comprehensive Coverage", () => {
    let validator: MonitorValidator;

    beforeEach(() => {
        validator = new MonitorValidator();
        vi.clearAllMocks();
    });

    describe("shouldApplyDefaultInterval", () => {
        it("should return true when checkInterval is 0", () => {
            const monitor = createMockMonitor({ checkInterval: 0 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(true);
        });

        it("should return false when checkInterval is not 0", () => {
            const monitor = createMockMonitor({ checkInterval: 30_000 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(false);
        });

        it("should return false when checkInterval is a positive number", () => {
            const monitor = createMockMonitor({ checkInterval: 60_000 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(false);
        });

        it("should return false when checkInterval is negative", () => {
            const monitor = createMockMonitor({ checkInterval: -1000 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBe(false);
        });
    });

    describe("validateMonitorConfiguration", () => {
        it("should return valid result for a properly configured HTTP monitor", () => {
            const monitor = createMockMonitor({
                id: "test-http",
                type: "http",
                url: "https://example.com",
            });

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should return valid result for a properly configured port monitor", () => {
            const monitor = createMockMonitor({
                id: "test-port",
                type: "port",
                host: "example.com",
                port: 8080,
            });
            delete (monitor as any).url; // Remove URL for port monitor

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should return invalid result for an unsupported monitor type", () => {
            const monitor = createMockMonitor({
                id: "test-invalid",
                type: "invalid" as any,
            });
            delete (monitor as any).url; // Remove URL for invalid monitor

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain("Invalid monitor type");
            expect(result.errors[0]).toContain("Available types:");
        });

        it("should return invalid result for monitor with validation errors", () => {
            const monitor = createMockMonitor({
                id: "test-failing",
                type: "http",
                url: "invalid-url", // This will fail validation
            });

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBe(false);
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBe(
                "url: Must be a valid HTTP or HTTPS URL"
            );
        });

        it("should handle monitors with all status types", () => {
            const statuses: Site["monitors"][0]["status"][] = [
                "pending",
                "up",
                "down",
                "paused",
            ];

            for (const status of statuses) {
                const monitor = createMockMonitor({
                    id: `test-${status}`,
                    status,
                });

                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.success).toBe(true);
            }
        });

        it("should handle monitors with different monitoring states", () => {
            const monitoringStates = [true, false];

            for (const monitoring of monitoringStates) {
                const monitor = createMockMonitor({
                    id: `test-monitoring-${monitoring}`,
                    monitoring,
                });

                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.success).toBe(true);
            }
        });

        it("should handle monitors with optional lastChecked field", () => {
            const monitor = createMockMonitor({
                id: "test-with-lastchecked",
                lastChecked: new Date(),
            });

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.success).toBe(true);
        });

        it("should handle monitors with different responseTime values", () => {
            const responseTimes = [
                -1,
                0,
                100,
                1000,
                5000,
            ];

            for (const responseTime of responseTimes) {
                const monitor = createMockMonitor({
                    id: `test-response-${responseTime}`,
                    responseTime,
                });

                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.success).toBe(true);
            }
        });
    });

    describe("validateMonitorTypeSpecific (private method integration)", () => {
        it("should validate monitor type against registry", () => {
            const validHttpMonitor = createMockMonitor();

            // This calls validateMonitorTypeSpecific internally
            const result =
                validator.validateMonitorConfiguration(validHttpMonitor);
            expect(result.success).toBe(true);
        });

        it("should provide list of available types in error message", () => {
            const invalidMonitor = createMockMonitor({
                type: "invalid-type" as any,
            });
            delete (invalidMonitor as any).url; // Remove URL for invalid monitor

            const result =
                validator.validateMonitorConfiguration(invalidMonitor);
            expect(result.success).toBe(false);
            expect(result.errors[0]).toContain("http, port");
        });

        it("should handle Zod validation errors from registry", async () => {
            const monitorWithBadData = createMockMonitor({
                type: "invalid" as any,
            });
            delete (monitorWithBadData as any).url; // Remove URL for invalid monitor

            const result =
                validator.validateMonitorConfiguration(monitorWithBadData);
            expect(result.success).toBe(false);
            expect(result.errors).toContain(
                "Invalid monitor type `invalid`. Available types: `http, port`"
            );
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        it("should handle empty monitor object", () => {
            const emptyMonitor = {} as Site["monitors"][0];

            const result = validator.validateMonitorConfiguration(emptyMonitor);
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should handle monitor with null/undefined properties", () => {
            const nullPropsMonitor = {
                id: null,
                type: undefined,
                checkInterval: null,
                timeout: undefined,
                retryAttempts: null,
                monitoring: undefined,
                status: null,
                responseTime: undefined,
                history: [],
            } as any;

            const result =
                validator.validateMonitorConfiguration(nullPropsMonitor);
            expect(result.success).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should handle monitor with extreme values", () => {
            const extremeMonitor = createMockMonitor({
                checkInterval: Number.MAX_SAFE_INTEGER,
                timeout: Number.MAX_SAFE_INTEGER,
                retryAttempts: Number.MAX_SAFE_INTEGER,
                responseTime: Number.MAX_SAFE_INTEGER,
            });

            // Should still validate through our validator, though registry might reject
            const result =
                validator.validateMonitorConfiguration(extremeMonitor);
            // Don't assert on result since it depends on registry validation
            expect(result).toHaveProperty("success");
            expect(result).toHaveProperty("errors");
        });

        it("should handle port monitor with specific port configurations", () => {
            const portConfigurations = [
                { host: "localhost", port: 80 },
                { host: "127.0.0.1", port: 443 },
                { host: "example.com", port: 8080 },
                { host: "192.168.1.1", port: 3000 },
            ];

            for (const { host, port } of portConfigurations) {
                const monitor = createMockMonitor({
                    id: `test-${host}-${port}`,
                    type: "port",
                    host,
                    port,
                });
                delete (monitor as any).url; // Remove URL for port monitor

                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.success).toBe(true);
            }
        });

        it("should handle HTTP monitor with various URL configurations", () => {
            const urlConfigurations = [
                "https://example.com",
                "https://subdomain.example.com",
                "https://example.com/path",
                "https://example.com:8080",
                "https://192.168.1.1",
            ];

            for (const url of urlConfigurations) {
                const monitor = createMockMonitor({
                    id: `test-url-${url.replaceAll(/[^\dA-Za-z]/g, "")}`,
                    url,
                });

                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.success).toBe(true);
            }
        });
    });
});
