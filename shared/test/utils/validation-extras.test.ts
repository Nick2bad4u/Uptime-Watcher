/**
 * Comprehensive test suite for shared/utils/validation.ts
 * 
 * Tests for validation functions that ensure data integrity and type safety
 * across the application. These functions validate monitor and site data
 * structures to prevent runtime errors and ensure consistency.
 * 
 * @fileoverview Tests for shared validation utility functions
 */

import { describe, it, expect } from "vitest";
import {
    validateMonitorType,
    getMonitorValidationErrors,
    validateSite
} from "@shared/utils/validation";
import type {
    Monitor,
    MonitorType,
    Site
} from "../../types";

describe("validateMonitorType", () => {
    const validTypes: MonitorType[] = ["http", "port", "ping", "dns"];

    validTypes.forEach(type => {
        it(`should return true for valid type '${type}'`, () => {
            expect(validateMonitorType(type)).toBe(true);
        });
    });

    it("should return false for null", () => {
        expect(validateMonitorType(null)).toBe(false);
    });

    it("should return false for undefined", () => {
        expect(validateMonitorType(undefined)).toBe(false);
    });

    it("should return false for non-string values", () => {
        expect(validateMonitorType(123)).toBe(false);
        expect(validateMonitorType(true)).toBe(false);
        expect(validateMonitorType({})).toBe(false);
        expect(validateMonitorType([])).toBe(false);
    });

    it("should return false for invalid type strings", () => {
        expect(validateMonitorType("tcp")).toBe(false);
        expect(validateMonitorType("ssh")).toBe(false);
        expect(validateMonitorType("ftp")).toBe(false);
        expect(validateMonitorType("unknown")).toBe(false);
        expect(validateMonitorType("")).toBe(false);
    });

    it("should return false for case variations", () => {
        expect(validateMonitorType("HTTP")).toBe(false);
        expect(validateMonitorType("Http")).toBe(false);
        expect(validateMonitorType("PORT")).toBe(false);
        expect(validateMonitorType("PING")).toBe(false);
        expect(validateMonitorType("DNS")).toBe(false);
    });

    it("should return false for whitespace variations", () => {
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
        checkInterval: 30000,
        timeout: 5000,
        retryAttempts: 3
    });

    describe("basic field validation", () => {
        it("should return no errors for valid monitor", () => {
            const monitor = {
                ...createBaseMonitor(),
                url: "https://example.com"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing id", () => {
            const monitor = { ...createBaseMonitor() };
            delete monitor.id;
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor id is required");
        });

        it("should return error for missing type", () => {
            const monitor = { ...createBaseMonitor() };
            delete monitor.type;
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor type is required");
        });

        it("should return error for invalid type", () => {
            const monitor = { ...createBaseMonitor(), type: "invalid" as any };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Invalid monitor type");
        });

        it("should return error for missing status", () => {
            const monitor = { ...createBaseMonitor() };
            delete monitor.status;
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Monitor status is required");
        });

        it("should return error for invalid status", () => {
            const monitor = { ...createBaseMonitor(), status: "invalid" as any };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Invalid monitor status");
        });

        describe("checkInterval validation", () => {
            it("should accept valid checkInterval", () => {
                const monitor = { ...createBaseMonitor(), checkInterval: 5000 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Check interval must be at least 1000ms");
            });

            it("should return error for checkInterval too small", () => {
                const monitor = { ...createBaseMonitor(), checkInterval: 500 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Check interval must be at least 1000ms");
            });

            it("should return error for non-number checkInterval", () => {
                const monitor = { ...createBaseMonitor(), checkInterval: "5000" as any };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Check interval must be at least 1000ms");
            });

            it("should not validate undefined checkInterval", () => {
                const monitor = { ...createBaseMonitor() };
                delete monitor.checkInterval;
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Check interval must be at least 1000ms");
            });
        });

        describe("timeout validation", () => {
            it("should accept valid timeout", () => {
                const monitor = { ...createBaseMonitor(), timeout: 1000 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Timeout must be a positive number");
            });

            it("should return error for zero timeout", () => {
                const monitor = { ...createBaseMonitor(), timeout: 0 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for negative timeout", () => {
                const monitor = { ...createBaseMonitor(), timeout: -1000 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should return error for non-number timeout", () => {
                const monitor = { ...createBaseMonitor(), timeout: "5000" as any };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Timeout must be a positive number");
            });

            it("should not validate undefined timeout", () => {
                const monitor = { ...createBaseMonitor() };
                delete monitor.timeout;
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Timeout must be a positive number");
            });
        });

        describe("retryAttempts validation", () => {
            it("should accept valid retryAttempts", () => {
                const monitor = { ...createBaseMonitor(), retryAttempts: 5 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Retry attempts must be between 0 and 10");
            });

            it("should accept zero retryAttempts", () => {
                const monitor = { ...createBaseMonitor(), retryAttempts: 0 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Retry attempts must be between 0 and 10");
            });

            it("should accept maximum retryAttempts", () => {
                const monitor = { ...createBaseMonitor(), retryAttempts: 10 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Retry attempts must be between 0 and 10");
            });

            it("should return error for negative retryAttempts", () => {
                const monitor = { ...createBaseMonitor(), retryAttempts: -1 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Retry attempts must be between 0 and 10");
            });

            it("should return error for retryAttempts too high", () => {
                const monitor = { ...createBaseMonitor(), retryAttempts: 11 };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Retry attempts must be between 0 and 10");
            });

            it("should return error for non-number retryAttempts", () => {
                const monitor = { ...createBaseMonitor(), retryAttempts: "3" as any };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).toContain("Retry attempts must be between 0 and 10");
            });

            it("should not validate undefined retryAttempts", () => {
                const monitor = { ...createBaseMonitor() };
                delete monitor.retryAttempts;
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Retry attempts must be between 0 and 10");
            });
        });
    });

    describe("HTTP monitor validation", () => {
        it("should return no errors for valid HTTP monitor", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
                url: "https://example.com"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing URL", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("URL is required for HTTP monitors");
        });

        it("should return error for non-string URL", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
                url: 123 as any
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("URL is required for HTTP monitors");
        });

        it("should return error for empty URL", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "http" as const,
                url: ""
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("URL is required for HTTP monitors");
        });
    });

    describe("ping monitor validation", () => {
        it("should return no errors for valid ping monitor", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
                host: "example.com"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for ping monitors");
        });

        it("should return error for non-string host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
                host: 123 as any
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for ping monitors");
        });

        it("should return error for empty host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "ping" as const,
                host: ""
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for ping monitors");
        });
    });

    describe("port monitor validation", () => {
        it("should return no errors for valid port monitor", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: 80
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                port: 80
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
        });

        it("should return error for non-string host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: 123 as any,
                port: 80
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
        });

        it("should return error for empty host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "",
                port: 80
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for port monitors");
        });

        it("should return error for missing port", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
        });

        it("should return error for invalid port number", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: 0
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
        });

        it("should return error for port too high", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: 65536
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
        });

        it("should return error for non-number port", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "port" as const,
                host: "example.com",
                port: "80" as any
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Valid port number (1-65535) is required for port monitors");
        });

        it("should accept valid port numbers", () => {
            const validPorts = [1, 80, 443, 8080, 65535];
            validPorts.forEach(port => {
                const monitor = {
                    ...createBaseMonitor(),
                    type: "port" as const,
                    host: "example.com",
                    port
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain("Valid port number (1-65535) is required for port monitors");
            });
        });
    });

    describe("DNS monitor validation", () => {
        it("should return no errors for valid DNS monitor", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "A"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toEqual([]);
        });

        it("should return error for missing host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                recordType: "A"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return error for non-string host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: 123 as any,
                recordType: "A"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return error for empty host", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "",
                recordType: "A"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Host is required for DNS monitors");
        });

        it("should return error for missing recordType", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Record type is required for DNS monitors");
        });

        it("should return error for non-string recordType", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: 123 as any
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Record type is required for DNS monitors");
        });

        it("should return error for empty recordType", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: ""
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Record type is required for DNS monitors");
        });

        it("should accept valid DNS record types", () => {
            const validRecordTypes = [
                "A", "AAAA", "ANY", "CAA", "CNAME", "MX", 
                "NAPTR", "NS", "PTR", "SOA", "SRV", "TLSA", "TXT"
            ];
            
            validRecordTypes.forEach(recordType => {
                const monitor = {
                    ...createBaseMonitor(),
                    type: "dns" as const,
                    host: "example.com",
                    recordType
                };
                const errors = getMonitorValidationErrors(monitor);
                expect(errors).not.toContain(expect.stringContaining("Invalid record type"));
            });
        });

        it("should accept lowercase DNS record types", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "a"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).not.toContain(expect.stringContaining("Invalid record type"));
        });

        it("should return error for invalid DNS record type", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "dns" as const,
                host: "example.com",
                recordType: "INVALID"
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Invalid record type: INVALID. Valid types are: A, AAAA, ANY, CAA, CNAME, MX, NAPTR, NS, PTR, SOA, SRV, TLSA, TXT");
        });
    });

    describe("unknown monitor type", () => {
        it("should return error for unknown monitor type", () => {
            const monitor = {
                ...createBaseMonitor(),
                type: "unknown" as any
            };
            const errors = getMonitorValidationErrors(monitor);
            expect(errors).toContain("Unknown monitor type: unknown");
        });
    });

    it("should accumulate multiple validation errors", () => {
        const monitor = {
            type: "http" as const,
            checkInterval: 500,
            timeout: -1000,
            retryAttempts: 15
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
        monitors: []
    });

    it("should return true for valid site", () => {
        const site = createValidSite();
        expect(validateSite(site)).toBe(true);
    });

    it("should return false for null", () => {
        expect(validateSite(null as any)).toBe(false);
    });

    it("should return false for undefined", () => {
        expect(validateSite(undefined as any)).toBe(false);
    });

    it("should return false for non-object values", () => {
        expect(validateSite("string" as any)).toBe(false);
        expect(validateSite(123 as any)).toBe(false);
        expect(validateSite(true as any)).toBe(false);
        expect(validateSite([] as any)).toBe(false);
    });

    describe("identifier validation", () => {
        it("should return false for missing identifier", () => {
            const site = createValidSite();
            delete (site as any).identifier;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-string identifier", () => {
            const site = createValidSite();
            (site as any).identifier = 123;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for empty identifier", () => {
            const site = createValidSite();
            site.identifier = "";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept non-empty string identifier", () => {
            const site = createValidSite();
            site.identifier = "valid-id";
            expect(validateSite(site)).toBe(true);
        });
    });

    describe("name validation", () => {
        it("should return false for missing name", () => {
            const site = createValidSite();
            delete (site as any).name;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-string name", () => {
            const site = createValidSite();
            (site as any).name = 123;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for empty name", () => {
            const site = createValidSite();
            site.name = "";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept non-empty string name", () => {
            const site = createValidSite();
            site.name = "Valid Name";
            expect(validateSite(site)).toBe(true);
        });
    });

    describe("monitoring validation", () => {
        it("should return false for missing monitoring", () => {
            const site = createValidSite();
            delete (site as any).monitoring;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-boolean monitoring", () => {
            const site = createValidSite();
            (site as any).monitoring = "true";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept true monitoring", () => {
            const site = createValidSite();
            site.monitoring = true;
            expect(validateSite(site)).toBe(true);
        });

        it("should accept false monitoring", () => {
            const site = createValidSite();
            site.monitoring = false;
            expect(validateSite(site)).toBe(true);
        });
    });

    describe("monitors validation", () => {
        it("should return false for missing monitors", () => {
            const site = createValidSite();
            delete (site as any).monitors;
            expect(validateSite(site)).toBe(false);
        });

        it("should return false for non-array monitors", () => {
            const site = createValidSite();
            (site as any).monitors = "not-array";
            expect(validateSite(site)).toBe(false);
        });

        it("should accept empty monitors array", () => {
            const site = createValidSite();
            site.monitors = [];
            expect(validateSite(site)).toBe(true);
        });

        it("should validate each monitor in the array", () => {
            const validMonitor: Monitor = {
                id: "test-monitor",
                type: "http",
                status: "up",
                monitoring: true,
                responseTime: 150,
                checkInterval: 30000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
                url: "https://example.com"
            };

            const site = createValidSite();
            site.monitors = [validMonitor];
            expect(validateSite(site)).toBe(true);
        });

        it("should return false if any monitor is invalid", () => {
            const invalidMonitor = {
                // Missing required fields
                type: "http"
            };

            const site = createValidSite();
            site.monitors = [invalidMonitor as any];
            expect(validateSite(site)).toBe(false);
        });

        it("should handle mixed valid and invalid monitors", () => {
            const validMonitor: Monitor = {
                id: "test-monitor",
                type: "http",
                status: "up",
                monitoring: true,
                responseTime: 150,
                checkInterval: 30000,
                timeout: 5000,
                retryAttempts: 3,
                history: [],
                url: "https://example.com"
            };

            const invalidMonitor = {
                type: "http"
            };

            const site = createValidSite();
            site.monitors = [validMonitor, invalidMonitor as any];
            expect(validateSite(site)).toBe(false);
        });
    });

    it("should return false for partial site objects", () => {
        expect(validateSite({})).toBe(false);
        expect(validateSite({ identifier: "test" })).toBe(false);
        expect(validateSite({ 
            identifier: "test", 
            name: "Test" 
        })).toBe(false);
        expect(validateSite({ 
            identifier: "test", 
            name: "Test", 
            monitoring: true 
        })).toBe(false);
    });
});
