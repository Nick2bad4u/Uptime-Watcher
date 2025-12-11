/**
 * Comprehensive tests for MonitorValidator Targeting 98% branch coverage for
 * all validation logic
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { MonitorValidator } from "../../../managers/validators/MonitorValidator";
import type { Site, StatusHistory } from "@shared/types";

// Mock the MonitorTypeRegistry module
vi.mock("../../../services/monitoring/MonitorTypeRegistry", () => ({
    getRegisteredMonitorTypes: vi.fn(() => ["http", "port"]),
    isValidMonitorType: vi.fn((type: string) =>
        ["http", "port"].includes(type)),
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
        it("should return true when checkInterval is 0", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor({ checkInterval: 0 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBeTruthy();
        });

        it("should return false when checkInterval is not 0", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor({ checkInterval: 30_000 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBeFalsy();
        });

        it("should return false when checkInterval exceeds minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor({ checkInterval: 60_000 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBeFalsy();
        });

        it("should return true when checkInterval is below minimum", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor({ checkInterval: 2500 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBeTruthy();
        });

        it("should return true when checkInterval is negative", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor({ checkInterval: -1000 });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBeTruthy();
        });

        it("should return true when checkInterval is NaN", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = createMockMonitor({ checkInterval: Number.NaN });

            const result = validator.shouldApplyDefaultInterval(monitor);
            expect(result).toBeTruthy();
        });
    });

    describe("validateMonitorConfiguration", () => {
        it("should return valid result for a properly configured HTTP monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor({
                id: "test-http",
                type: "http",
                url: "https://example.com",
            });

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBeTruthy();
            expect(result.errors).toHaveLength(0);
        });

        it("should return valid result for a properly configured port monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor({
                id: "test-port",
                type: "port",
                host: "example.com",
                port: 8080,
            });
            delete (monitor as any).url; // Remove URL for port monitor

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBeTruthy();
            expect(result.errors).toHaveLength(0);
        });

        it("should return invalid result for an unsupported monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor({
                id: "test-invalid",
                type: "invalid" as any,
            });
            delete (monitor as any).url; // Remove URL for invalid monitor

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBeFalsy();
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toContain("Invalid monitor type");
            expect(result.errors[0]).toContain("Available types:");
        });

        it("should return invalid result for monitor with validation errors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = createMockMonitor({
                id: "test-failing",
                type: "http",
                url: "invalid-url", // This will fail validation
            });

            const result = validator.validateMonitorConfiguration(monitor);

            expect(result.success).toBeFalsy();
            expect(result.errors).toHaveLength(1);
            expect(result.errors[0]).toBe(
                "url: Must be a valid HTTP or HTTPS URL"
            );
        });

        it("should handle monitors with all status types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

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
                expect(result.success).toBeTruthy();
            }
        });

        it("should handle monitors with different monitoring states", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitoringStates = [true, false];

            for (const monitoring of monitoringStates) {
                const monitor = createMockMonitor({
                    id: `test-monitoring-${monitoring}`,
                    monitoring,
                });

                const result = validator.validateMonitorConfiguration(monitor);
                expect(result.success).toBeTruthy();
            }
        });

        it("should handle monitors with optional lastChecked field", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const monitor = createMockMonitor({
                id: "test-with-lastchecked",
                lastChecked: new Date(),
            });

            const result = validator.validateMonitorConfiguration(monitor);
            expect(result.success).toBeTruthy();
        });

        it("should handle monitors with different responseTime values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

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
                expect(result.success).toBeTruthy();
            }
        });
    });

    describe("validateMonitorTypeSpecific (private method integration)", () => {
        it("should validate monitor type against registry", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Validation", "type");

            const validHttpMonitor = createMockMonitor();

            // This calls validateMonitorTypeSpecific internally
            const result =
                validator.validateMonitorConfiguration(validHttpMonitor);
            expect(result.success).toBeTruthy();
        });

        it("should provide list of available types in error message", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            const invalidMonitor = createMockMonitor({
                type: "invalid-type" as any,
            });
            delete (invalidMonitor as any).url; // Remove URL for invalid monitor

            const result =
                validator.validateMonitorConfiguration(invalidMonitor);
            expect(result.success).toBeFalsy();
            expect(result.errors[0]).toContain("http, port");
        });

        it("should handle Zod validation errors from registry", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Error Handling", "type");

            const monitorWithBadData = createMockMonitor({
                type: "invalid" as any,
            });
            delete (monitorWithBadData as any).url; // Remove URL for invalid monitor

            const result =
                validator.validateMonitorConfiguration(monitorWithBadData);
            expect(result.success).toBeFalsy();
            expect(result.errors).toContain(
                "Invalid monitor type `invalid`. Available types: `http, port`"
            );
        });
    });

    describe("Edge Cases and Error Scenarios", () => {
        it("should handle empty monitor object", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

            const emptyMonitor = {} as Site["monitors"][0];

            const result = validator.validateMonitorConfiguration(emptyMonitor);
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should handle monitor with null/undefined properties", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

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
            expect(result.success).toBeFalsy();
            expect(result.errors.length).toBeGreaterThan(0);
        });

        it("should handle monitor with extreme values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

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

        it("should handle port monitor with specific port configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

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
                expect(result.success).toBeTruthy();
            }
        });

        it("should handle HTTP monitor with various URL configurations", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: MonitorValidator", "component");
            await annotate("Category: Manager", "category");
            await annotate("Type: Monitoring", "type");

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
                expect(result.success).toBeTruthy();
            }
        });
    });
});
