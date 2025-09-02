/**
 * Comprehensive test suite for shared/utils/validation.ts
 *
 * Tests for validation functions that ensure data integrity and type safety
 * across the application. These functions validate monitor and site data
 * structures to prevent runtime errors and ensure consistency.
 *
 * @file Tests for shared validation utility functions
 */

import { describe, it, expect } from "vitest";
import {
    validateMonitorType,
    getMonitorValidationErrors,
    validateSite,
} from "@shared/utils/validation";
import type { Monitor, MonitorType, Site } from "../../types";

describe("validateMonitorType", () => {
    const validTypes: MonitorType[] = [
        "http",
        "port",
        "ping",
        "dns",
    ];

    for (const type of validTypes) {
        it(`should return true for valid type '${type}'`, () => {
            expect(validateMonitorType(type)).toBe(true);
        });
    }

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitorType(null)).toBe(false);
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitorType(undefined)).toBe(false);
    });

    it("should return false for non-string values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitorType(123)).toBe(false);
        expect(validateMonitorType(true)).toBe(false);
        expect(validateMonitorType({})).toBe(false);
        expect(validateMonitorType([])).toBe(false);
    });

    it("should return false for invalid type strings", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitorType("tcp")).toBe(false);
        expect(validateMonitorType("ssh")).toBe(false);
        expect(validateMonitorType("ftp")).toBe(false);
        expect(validateMonitorType("unknown")).toBe(false);
        expect(validateMonitorType("")).toBe(false);
    });

    it("should return false for case variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitorType("HTTP")).toBe(false);
        expect(validateMonitorType("Http")).toBe(false);
        expect(validateMonitorType("PORT")).toBe(false);
        expect(validateMonitorType("PING")).toBe(false);
        expect(validateMonitorType("DNS")).toBe(false);
    });

    it("should return false for whitespace variations", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateMonitorType(" http ")).toBe(false);
        expect(validateMonitorType("http ")).toBe(false);
        expect(validateMonitorType(" ping")).toBe(false);
    });
});

describe("getMonitorValidationErrors", () => {
    const createBaseMonitor = (): Partial<Monitor> => ({
        id: "test-monitor",
        type: "http",
        status: "up",
        checkInterval: 30_000,
        timeout: 5000,
        retryAttempts: 3,
    });

    describe("basic field validation", () => {
        it("should return no errors for valid monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                url: "https://example.com",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing id", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = { ...createBaseMonitor() };
            delete monitor.id;
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor id is required");
        });

        it("should return error for missing type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = { ...createBaseMonitor() };
            delete monitor.type;
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor type is required");
        });

        it("should return error for invalid type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = { ...createBaseMonitor(), type: "invalid" as any };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Invalid monitor type");
        });

        it("should return error for missing status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = { ...createBaseMonitor() };
            delete monitor.status;
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor status is required");
        });

        it("should return error for invalid status", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                status: "invalid" as any,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Invalid monitor status");
        });

        describe("checkInterval validation", () => {
            it("should accept valid checkInterval", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor = { ...createBaseMonitor(), checkInterval: 5000 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Check interval must be at least 1000ms"
                );
            });

            it("should return error for checkInterval too small", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = { ...createBaseMonitor(), checkInterval: 500 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Check interval must be at least 1000ms"
                );
            });

            it("should return error for non-number checkInterval", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    ...createBaseMonitor(),
                    checkInterval: "5000" as any,
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Check interval must be at least 1000ms"
                );
            });

            it("should not validate undefined checkInterval", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const monitor = { ...createBaseMonitor() };
                delete monitor.checkInterval;
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Check interval must be at least 1000ms"
                );
            });
        });

        describe("timeout validation", () => {
            it("should accept valid timeout", async ({ task, annotate }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor = { ...createBaseMonitor(), timeout: 1000 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Timeout must be a positive number"
                );
            });

            it("should return error for zero timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = { ...createBaseMonitor(), timeout: 0 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for negative timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = { ...createBaseMonitor(), timeout: -1000 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for non-number timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    ...createBaseMonitor(),
                    timeout: "5000" as any,
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should not validate undefined timeout", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const monitor = { ...createBaseMonitor() };
                delete monitor.timeout;
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Timeout must be a positive number"
                );
            });
        });

        describe("retryAttempts validation", () => {
            it("should accept valid retryAttempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor = { ...createBaseMonitor(), retryAttempts: 5 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should accept zero retryAttempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor = { ...createBaseMonitor(), retryAttempts: 0 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should accept maximum retryAttempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Business Logic", "type");

                const monitor = { ...createBaseMonitor(), retryAttempts: 10 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should return error for negative retryAttempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = { ...createBaseMonitor(), retryAttempts: -1 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should return error for retryAttempts too high", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = { ...createBaseMonitor(), retryAttempts: 11 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should return error for non-number retryAttempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Error Handling", "type");

                const monitor = {
                    ...createBaseMonitor(),
                    retryAttempts: "3" as any,
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });

            it("should not validate undefined retryAttempts", async ({
                task,
                annotate,
            }) => {
                await annotate(`Testing: ${task.name}`, "functional");
                await annotate("Component: validation-extras", "component");
                await annotate("Category: Utility", "category");
                await annotate("Type: Validation", "type");

                const monitor = { ...createBaseMonitor() };
                delete monitor.retryAttempts;
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Retry attempts must be between 0 and 10"
                );
            });
        });
    });

    describe("HTTP monitor validation", () => {
        it("should return no errors for valid HTTP monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
                url: "https://example.com",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("URL is required for HTTP monitors");
        });

        it("should return error for non-string URL", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
                url: 123 as any,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("URL is required for HTTP monitors");
        });

        it("should return error for empty URL", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
                url: "",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("URL is required for HTTP monitors");
        });
    });

    describe("ping monitor validation", () => {
        it("should return no errors for valid ping monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
                host: "example.com",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for ping monitors");
        });

        it("should return error for non-string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
                host: 123 as any,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for ping monitors");
        });

        it("should return error for empty host", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
                host: "",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for ping monitors");
        });
    });

    describe("port monitor validation", () => {
        it("should return no errors for valid port monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: 80,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                port: 80,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
        });

        it("should return error for non-string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: 123 as any,
                port: 80,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
        });

        it("should return error for empty host", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "",
                port: 80,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
        });

        it("should return error for missing port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Valid port number (1-65535) is required for port monitors"
            );
        });

        it("should return error for invalid port number", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: 0,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Valid port number (1-65535) is required for port monitors"
            );
        });

        it("should return error for port too high", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: 65_536,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Valid port number (1-65535) is required for port monitors"
            );
        });

        it("should return error for non-number port", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: "80" as any,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Valid port number (1-65535) is required for port monitors"
            );
        });

        it("should accept valid port numbers", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validPorts = [
                1,
                80,
                443,
                8080,
                65_535,
            ];
            for (const port of validPorts) {
                const monitor = {
                    ...createBaseMonitor(),
                    type: "port" as const,
                    host: "example.com",
                    port,
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    "Valid port number (1-65535) is required for port monitors"
                );
            }
        });
    });

    describe("DNS monitor validation", () => {
        it("should return no errors for valid DNS monitor", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "A",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                recordType: "A",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return error for non-string host", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: 123 as any,
                recordType: "A",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return error for empty host", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "",
                recordType: "A",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return error for missing recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Record type is required for DNS monitors"
            );
        });

        it("should return error for non-string recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: 123 as any,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Record type is required for DNS monitors"
            );
        });

        it("should return error for empty recordType", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Record type is required for DNS monitors"
            );
        });

        it("should accept valid DNS record types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const validRecordTypes = [
                "A",
                "AAAA",
                "ANY",
                "CAA",
                "CNAME",
                "MX",
                "NAPTR",
                "NS",
                "PTR",
                "SOA",
                "SRV",
                "TLSA",
                "TXT",
            ];

            for (const recordType of validRecordTypes) {
                const monitor = {
                    ...createBaseMonitor(),
                    type: "dns" as const,
                    host: "example.com",
                    recordType,
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(
                    expect.stringContaining("Invalid record type")
                );
            }
        });

        it("should accept lowercase DNS record types", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "a",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).not.toContain(
                expect.stringContaining("Invalid record type")
            );
        });

        it("should return error for invalid DNS record type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "INVALID",
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain(
                "Invalid record type: INVALID. Valid types are: A, AAAA, ANY, CAA, CNAME, MX, NAPTR, NS, PTR, SOA, SRV, TLSA, TXT"
            );
        });
    });

    describe("unknown monitor type", () => {
        it("should return error for unknown monitor type", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Error Handling", "type");

            const monitor = {
                ...createBaseMonitor(),
                type: "unknown" as any,
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Unknown monitor type: unknown");
        });
    });

    it("should accumulate multiple validation errors", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Error Handling", "type");

        const monitor = {
            type: "http" as const,
            checkInterval: 500,
            timeout: -1000,
            retryAttempts: 15,
        };
        const errors = getMonitorValidationErrors(monitor);

        expect(errors).toContain("Monitor id is required");
        expect(errors).toContain("Monitor status is required");
        expect(errors).toContain("URL is required for HTTP monitors");
        expect(errors).toContain("Check interval must be at least 1000ms");
        expect(errors).toContain("Timeout must be a positive number");
        expect(errors).toContain("Retry attempts must be between 0 and 10");
    });
});

describe("validateSite", () => {
    const createValidSite = (): Site => ({
        identifier: "test-site",
        name: "Test Site",
        monitoring: true,
        monitors: [],
    });

    it("should return true for valid site", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        const site = createValidSite();
        expect(validateSite(site)).toBe(true);
    });

    it("should return false for null", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateSite(null as any)).toBe(false);
    });

    it("should return false for undefined", async ({ task, annotate }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateSite(undefined as any)).toBe(false);
    });

    it("should return false for non-object values", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateSite("string" as any)).toBe(false);
        expect(validateSite(123 as any)).toBe(false);
        expect(validateSite(true as any)).toBe(false);
        expect(validateSite([] as any)).toBe(false);
    });

    describe("identifier validation", () => {
        it("should return false for missing identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            delete (site as any).identifier;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-string identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            (site as any).identifier = 123;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for empty identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            site.identifier = "";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept non-empty string identifier", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            site.identifier = "valid-id";
            expect(validateSite(site)).toBe(true);
        });
    });

    describe("name validation", () => {
        it("should return false for missing name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            delete (site as any).name;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-string name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            (site as any).name = 123;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for empty name", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            site.name = "";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept non-empty string name", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Business Logic", "type");

            const site = createValidSite();
            site.name = "Valid Name";
            expect(validateSite(site)).toBe(true);
        });
    });

    describe("monitoring validation", () => {
        it("should return false for missing monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            delete (site as any).monitoring;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-boolean monitoring", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            (site as any).monitoring = "true";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept true monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            site.monitoring = true;
            expect(validateSite(site)).toBe(true);
        });

        it("should accept false monitoring", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            site.monitoring = false;
            expect(validateSite(site)).toBe(true);
        });
    });

    describe("monitors validation", () => {
        it("should return false for missing monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            delete (site as any).monitors;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-array monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            (site as any).monitors = "not-array";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept empty monitors array", async ({ task, annotate }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const site = createValidSite();
            site.monitors = [];
            expect(validateSite(site)).toBe(true);
        });

        it("should validate each monitor in the array", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Validation", "type");

            const validMonitor: Monitor = {
                id: "test-monitor",
                type: "http",
                status: "up",
                monitoring: true,
                responseTime: 150,
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
                url: "https://example.com",
            };

            const site = createValidSite();
            site.monitors = [validMonitor];
            expect(validateSite(site)).toBe(true);
        });

        it("should return false if any monitor is invalid", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const invalidMonitor = {
                // Missing required fields
                type: "http",
            };

            const site = createValidSite();
            site.monitors = [invalidMonitor as any];
            expect(validateSite(site)).toBe(false);
        });

        it("should handle mixed valid and invalid monitors", async ({
            task,
            annotate,
        }) => {
            await annotate(`Testing: ${task.name}`, "functional");
            await annotate("Component: validation-extras", "component");
            await annotate("Category: Utility", "category");
            await annotate("Type: Monitoring", "type");

            const validMonitor: Monitor = {
                id: "test-monitor",
                type: "http",
                status: "up",
                monitoring: true,
                responseTime: 150,
                checkInterval: 30_000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
                url: "https://example.com",
            };

            const invalidMonitor = {
                type: "http",
            };

            const site = createValidSite();
            site.monitors = [validMonitor, invalidMonitor as any];
            expect(validateSite(site)).toBe(false);
        });
    });

    it("should return false for partial site objects", async ({
        task,
        annotate,
    }) => {
        await annotate(`Testing: ${task.name}`, "functional");
        await annotate("Component: validation-extras", "component");
        await annotate("Category: Utility", "category");
        await annotate("Type: Business Logic", "type");

        expect(validateSite({})).toBe(false);
        expect(validateSite({ identifier: "test" })).toBe(false);
        expect(
            validateSite({
                identifier: "test",
                name: "Test",
            })
        ).toBe(false);
        expect(
            validateSite({
                identifier: "test",
                name: "Test",
                monitoring: true,
            })
        ).toBe(false);
    });
});
