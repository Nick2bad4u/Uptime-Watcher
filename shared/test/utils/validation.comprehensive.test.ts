/**
 * Comprehensive test suite for shared validation utilities. Provides 100%
 * coverage for validation functions.
 */

import { describe, expect, it } from "vitest";
import type { Monitor, Site } from "../../types";
import {
    getMonitorValidationErrors,
    validateMonitorType,
    validateSite,
} from "../../utils/validation";

describe("Shared Validation Utilities - Comprehensive Coverage", () => {
    describe(getMonitorValidationErrors, () => {
        describe("Basic field validation", () => {
            it("should return no errors for valid HTTP monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    checkInterval: 60_000,
                    timeout: 5000,
                    retryAttempts: 3,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toEqual([]);
            });

            it("should return no errors for valid port monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: 80,
                    status: "up",
                    checkInterval: 30_000,
                    timeout: 3000,
                    retryAttempts: 2,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toEqual([]);
            });

            it("should return error for missing id", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Monitor id is required");
            });

            it("should return error for missing type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    url: "https://example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Monitor type is required");
            });

            it("should return error for invalid type", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "invalid",
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Invalid monitor type");
            });

            it("should return error for missing status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Monitor status is required");
            });

            it("should return error for invalid status", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "invalid",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Invalid monitor status");
            });
        });

        describe("Numeric field validation", () => {
            it("should return error for invalid check interval", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    checkInterval: 500, // Too low
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Check interval must be at least 1000ms"
                );
            });

            it("should return error for non-numeric check interval", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    checkInterval: "invalid",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Check interval must be at least 1000ms"
                );
            });

            it("should return error for invalid timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    timeout: -1,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for zero timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    timeout: 0,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for non-numeric timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    timeout: "invalid",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for negative retry attempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    retryAttempts: -1,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should return error for too high retry attempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    retryAttempts: 15,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should return error for non-numeric retry attempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    retryAttempts: "invalid",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });
        });

        describe("HTTP monitor validation", () => {
            it("should return error for missing URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("URL is required for HTTP monitors");
            });

            it("should return error for non-string URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: 123,
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("URL is required for HTTP monitors");
            });

            it("should return error for empty URL", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("URL is required for HTTP monitors");
            });
        });

        describe("Port monitor validation", () => {
            it("should return error for missing host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    port: 80,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for port monitors");
            });

            it("should return error for non-string host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "port",
                    host: 123,
                    port: 80,
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for port monitors");
            });

            it("should return error for empty host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "",
                    port: 80,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for port monitors");
            });

            it("should return error for missing port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Valid port number (1-65535) is required for port monitors"
                );
            });

            it("should return error for invalid port number - too low", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: 0,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Valid port number (1-65535) is required for port monitors"
                );
            });

            it("should return error for invalid port number - too high", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: 70_000,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Valid port number (1-65535) is required for port monitors"
                );
            });

            it("should return error for non-numeric port", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: "invalid",
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Valid port number (1-65535) is required for port monitors"
                );
            });
        });

        describe("Ping monitor validation", () => {
            it("should return error for missing host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "ping",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for ping monitors");
            });

            it("should return error for non-string host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    id: "test-id",
                    type: "ping",
                    host: 123,
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for ping monitors");
            });

            it("should return error for empty host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "ping",
                    host: "",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for ping monitors");
            });

            it("should not require port for ping monitors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "ping",
                    host: "example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                // Should not contain any port-related errors
                expect(
                    errors.some((error) => error.includes("port"))
                ).toBeFalsy();
            });

            it("should validate ping monitor with valid host", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "ping",
                    host: "example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                // Should not contain host-related errors for valid hosts
                expect(
                    errors.some((error) => error.includes("Host is required"))
                ).toBeFalsy();
            });
        });

        describe("Multiple errors", () => {
            it("should return multiple errors when multiple fields are invalid", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor: Partial<Monitor> = {
                    type: "http",
                    checkInterval: 500,
                    timeout: -1,
                    retryAttempts: 15,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toHaveLength(6);
                expect(errors).toContain("Monitor id is required");
                expect(errors).toContain("Monitor status is required");
                expect(errors).toContain(
                    "Check interval must be at least 1000ms"
                );
                expect(errors).toContain("Timeout must be a positive number");
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
                expect(errors).toContain("URL is required for HTTP monitors");
            });
        });

        describe("Edge cases", () => {
            it("should handle undefined fields gracefully", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    // checkInterval, timeout, and retryAttempts are intentionally omitted
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toEqual([]);
            });

            it("should handle empty monitor object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const monitor: Partial<Monitor> = {};

                const errors = getMonitorValidationErrors(monitor);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors).toContain("Monitor id is required");
                expect(errors).toContain("Monitor type is required");
            });
        });
    });

    describe(validateMonitorType, () => {
        it("should return true for valid http type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("http")).toBeTruthy();
        });

        it("should return true for valid port type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("port")).toBeTruthy();
        });

        it("should return true for valid ping type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("ping")).toBeTruthy();
        });

        it("should return false for invalid string type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("invalid")).toBeFalsy();
        });

        it("should return false for non-string values", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType(123)).toBeFalsy();
            expect(validateMonitorType(null)).toBeFalsy();
            expect(validateMonitorType(undefined)).toBeFalsy();
            expect(validateMonitorType({})).toBeFalsy();
            expect(validateMonitorType([])).toBeFalsy();
        });

        it("should return false for empty string", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("")).toBeFalsy();
        });

        it("should be case sensitive", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            expect(validateMonitorType("HTTP")).toBeFalsy();
            expect(validateMonitorType("Port")).toBeFalsy();
        });
    });

    describe(validateSite, () => {
        describe("Valid sites", () => {
            it("should return true for valid site with HTTP monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site: Site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "http",
                            url: "https://example.com",
                            checkInterval: 60_000,
                            timeout: 5000,
                            retryAttempts: 3,
                            monitoring: true,
                            status: "pending",
                            responseTime: 0,
                            history: [],
                        },
                    ],
                };

                expect(validateSite(site)).toBeTruthy();
            });

            it("should return true for valid site with port monitor", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site: Site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: false,
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "port",
                            host: "example.com",
                            port: 80,
                            checkInterval: 30_000,
                            timeout: 3000,
                            retryAttempts: 2,
                            monitoring: false,
                            status: "up",
                            responseTime: 100,
                            history: [],
                        },
                    ],
                };

                expect(validateSite(site)).toBeTruthy();
            });

            it("should return true for valid site with multiple monitors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site: Site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "http",
                            url: "https://example.com",
                            checkInterval: 60_000,
                            timeout: 5000,
                            retryAttempts: 3,
                            monitoring: true,
                            status: "pending",
                            responseTime: 0,
                            history: [],
                        },
                        {
                            id: "monitor-2",
                            type: "port",
                            host: "example.com",
                            port: 80,
                            checkInterval: 30_000,
                            timeout: 3000,
                            retryAttempts: 2,
                            monitoring: true,
                            status: "up",
                            responseTime: 100,
                            history: [],
                        },
                    ],
                };

                expect(validateSite(site)).toBeTruthy();
            });

            it("should return true for valid site with empty monitors array", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site: Site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: false,
                    monitors: [],
                };

                expect(validateSite(site)).toBeTruthy();
            });
        });

        describe("Invalid sites", () => {
            it("should return false for null", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    validateSite(null as unknown as Partial<Site>)
                ).toBeFalsy();
            });

            it("should return false for undefined", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    validateSite(undefined as unknown as Partial<Site>)
                ).toBeFalsy();
            });

            it("should return false for non-object", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                expect(
                    validateSite("string" as unknown as Partial<Site>)
                ).toBeFalsy();
                expect(
                    validateSite(123 as unknown as Partial<Site>)
                ).toBeFalsy();
                expect(
                    validateSite([] as unknown as Partial<Site>)
                ).toBeFalsy();
            });

            it("should return false for missing identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const site = {
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                } as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for non-string identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const site = {
                    identifier: 123,
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for empty identifier", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const site: Partial<Site> = {
                    identifier: "",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                };

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for missing name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const site = {
                    identifier: "test-site",
                    monitoring: true,
                    monitors: [],
                } as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for non-string name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const site = {
                    identifier: "test-site",
                    name: 123,
                    monitoring: true,
                    monitors: [],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for empty name", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const site: Partial<Site> = {
                    identifier: "test-site",
                    name: "",
                    monitoring: true,
                    monitors: [],
                };

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for missing monitoring", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [],
                } as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for non-boolean monitoring", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: "true",
                    monitors: [],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for missing monitors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                } as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for non-array monitors", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: "not-array",
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for invalid monitor in array", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [
                        {
                            id: "monitor-1",
                            type: "http",
                            // Missing required fields
                        },
                    ],
                } as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for non-object monitor in array", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: ["not-object"],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });

            it("should return false for null monitor in array", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Monitoring", "type");

                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [null],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBeFalsy();
            });
        });
    });
});
