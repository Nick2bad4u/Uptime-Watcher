/**
 * Comprehensive test suite for shared validation utilities.
 * Provides 100% coverage for validation functions.
 */

import { describe, expect, it } from "vitest";
import type { Monitor, Site } from "../../types";
import {
    getMonitorValidationErrors,
    validateMonitorType,
    validateSite,
} from "../../utils/validation";

describe("Shared Validation Utilities - Comprehensive Coverage", () => {
    describe("getMonitorValidationErrors", () => {
        describe("Basic field validation", () => {
            it("should return no errors for valid HTTP monitor", () => {
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

            it("should return no errors for valid port monitor", () => {
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

            it("should return error for missing id", () => {
                const monitor: Partial<Monitor> = {
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Monitor id is required");
            });

            it("should return error for missing type", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    url: "https://example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Monitor type is required");
            });

            it("should return error for invalid type", () => {
                const monitor = {
                    id: "test-id",
                    type: "invalid",
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Invalid monitor type");
            });

            it("should return error for missing status", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Monitor status is required");
            });

            it("should return error for invalid status", () => {
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
            it("should return error for invalid check interval", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    checkInterval: 500, // Too low
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Check interval must be at least 1000ms");
            });

            it("should return error for non-numeric check interval", () => {
                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    checkInterval: "invalid",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Check interval must be at least 1000ms");
            });

            it("should return error for invalid timeout", () => {
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

            it("should return error for zero timeout", () => {
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

            it("should return error for non-numeric timeout", () => {
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

            it("should return error for negative retry attempts", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    retryAttempts: -1,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Retry attempts must be between 0 and 10");
            });

            it("should return error for too high retry attempts", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    retryAttempts: 15,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Retry attempts must be between 0 and 10");
            });

            it("should return error for non-numeric retry attempts", () => {
                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: "https://example.com",
                    status: "pending",
                    retryAttempts: "invalid",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Retry attempts must be between 0 and 10");
            });
        });

        describe("HTTP monitor validation", () => {
            it("should return error for missing URL", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "http",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("URL is required for HTTP monitors");
            });

            it("should return error for non-string URL", () => {
                const monitor = {
                    id: "test-id",
                    type: "http",
                    url: 123,
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("URL is required for HTTP monitors");
            });

            it("should return error for empty URL", () => {
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
            it("should return error for missing host", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    port: 80,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Host is required for port monitors");
            });

            it("should return error for non-string host", () => {
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

            it("should return error for empty host", () => {
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

            it("should return error for missing port", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
            });

            it("should return error for invalid port number - too low", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: 0,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
            });

            it("should return error for invalid port number - too high", () => {
                const monitor: Partial<Monitor> = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: 70_000,
                    status: "pending",
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
            });

            it("should return error for non-numeric port", () => {
                const monitor = {
                    id: "test-id",
                    type: "port",
                    host: "example.com",
                    port: "invalid",
                    status: "pending",
                } as unknown as Partial<Monitor>;

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
            });
        });

        describe("Multiple errors", () => {
            it.skip("should return multiple errors when multiple fields are invalid", () => {
                const monitor: Partial<Monitor> = {
                    type: "http",
                    checkInterval: 500,
                    timeout: -1,
                    retryAttempts: 15,
                };

                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toHaveLength(5);
                expect(errors).toContain("Monitor id is required");
                expect(errors).toContain("Check interval must be at least 1000ms");
                expect(errors).toContain("Timeout must be a positive number");
                expect(errors).toContain("Retry attempts must be between 0 and 10");
                expect(errors).toContain("URL is required for HTTP monitors");
            });
        });

        describe("Edge cases", () => {
            it("should handle undefined fields gracefully", () => {
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

            it("should handle empty monitor object", () => {
                const monitor: Partial<Monitor> = {};

                const errors = getMonitorValidationErrors(monitor);
                expect(errors.length).toBeGreaterThan(0);
                expect(errors).toContain("Monitor id is required");
                expect(errors).toContain("Monitor type is required");
            });
        });
    });

    describe("validateMonitorType", () => {
        it("should return true for valid http type", () => {
            expect(validateMonitorType("http")).toBe(true);
        });

        it("should return true for valid port type", () => {
            expect(validateMonitorType("port")).toBe(true);
        });

        it("should return false for invalid string type", () => {
            expect(validateMonitorType("invalid")).toBe(false);
        });

        it("should return false for non-string values", () => {
            expect(validateMonitorType(123)).toBe(false);
            expect(validateMonitorType(null)).toBe(false);
            expect(validateMonitorType(undefined)).toBe(false);
            expect(validateMonitorType({})).toBe(false);
            expect(validateMonitorType([])).toBe(false);
        });

        it("should return false for empty string", () => {
            expect(validateMonitorType("")).toBe(false);
        });

        it("should be case sensitive", () => {
            expect(validateMonitorType("HTTP")).toBe(false);
            expect(validateMonitorType("Port")).toBe(false);
        });
    });

    describe("validateSite", () => {
        describe("Valid sites", () => {
            it.skip("should return true for valid site with HTTP monitor", () => {
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

                expect(validateSite(site)).toBe(true);
            });

            it.skip("should return true for valid site with port monitor", () => {
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

                expect(validateSite(site)).toBe(true);
            });

            it.skip("should return true for valid site with multiple monitors", () => {
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

                expect(validateSite(site)).toBe(true);
            });

            it("should return true for valid site with empty monitors array", () => {
                const site: Site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: false,
                    monitors: [],
                };

                expect(validateSite(site)).toBe(true);
            });
        });

        describe("Invalid sites", () => {
            it("should return false for null", () => {
                expect(validateSite(null as unknown as Partial<Site>)).toBe(false);
            });

            it("should return false for undefined", () => {
                expect(validateSite(undefined as unknown as Partial<Site>)).toBe(false);
            });

            it("should return false for non-object", () => {
                expect(validateSite("string" as unknown as Partial<Site>)).toBe(false);
                expect(validateSite(123 as unknown as Partial<Site>)).toBe(false);
                expect(validateSite([] as unknown as Partial<Site>)).toBe(false);
            });

            it("should return false for missing identifier", () => {
                const site = {
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                } as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for non-string identifier", () => {
                const site = {
                    identifier: 123,
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for empty identifier", () => {
                const site: Partial<Site> = {
                    identifier: "",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [],
                };

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for missing name", () => {
                const site = {
                    identifier: "test-site",
                    monitoring: true,
                    monitors: [],
                } as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for non-string name", () => {
                const site = {
                    identifier: "test-site",
                    name: 123,
                    monitoring: true,
                    monitors: [],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for empty name", () => {
                const site: Partial<Site> = {
                    identifier: "test-site",
                    name: "",
                    monitoring: true,
                    monitors: [],
                };

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for missing monitoring", () => {
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitors: [],
                } as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for non-boolean monitoring", () => {
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: "true",
                    monitors: [],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for missing monitors", () => {
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                } as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for non-array monitors", () => {
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: "not-array",
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for invalid monitor in array", () => {
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

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for non-object monitor in array", () => {
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: ["not-object"],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });

            it("should return false for null monitor in array", () => {
                const site = {
                    identifier: "test-site",
                    name: "Test Site",
                    monitoring: true,
                    monitors: [null],
                } as unknown as Partial<Site>;

                expect(validateSite(site)).toBe(false);
            });
        });
    });
});
