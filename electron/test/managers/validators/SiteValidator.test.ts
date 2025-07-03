/**
 * Comprehensive tests for SiteValidator class.
 * Tests site validation logic with 100% line and branch coverage.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { SiteValidator } from "../../../managers/validators/SiteValidator";
import type { Site, MonitorType } from "../../../types";

describe("SiteValidator", () => {
    let validator: SiteValidator;

    beforeEach(() => {
        validator = new SiteValidator();
    });

    describe("validateSiteConfiguration", () => {
        it("should validate a valid site configuration", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        history: [],
                        url: "https://example.com",
                        checkInterval: 300000,
                        timeout: 30000,
                        retryAttempts: 3,
                    },
                ],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should return errors for invalid site configuration", () => {
            const site: Site = {
                identifier: "",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http" as MonitorType, // Will test validation inside MonitorValidator
                        status: "up",
                        history: [],
                        url: "invalid-url",
                        checkInterval: 500, // below minimum
                        timeout: 500, // below minimum
                        retryAttempts: -1, // invalid
                    },
                ],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier cannot be empty");
            expect(result.errors.some(error => error.includes("Monitor 1:"))).toBe(true);
        });

        it("should validate site with empty identifier", () => {
            const site: Site = {
                identifier: "",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier cannot be empty");
        });

        it("should validate site with whitespace-only identifier", () => {
            const site: Site = {
                identifier: "   ",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier cannot be empty");
        });

        it("should validate site with null identifier", () => {
            const site: Site = {
                identifier: null as unknown as string,
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier is required");
        });

        it("should validate site with undefined identifier", () => {
            const site: Site = {
                identifier: undefined as unknown as string,
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site identifier is required");
        });

        it("should validate site with non-array monitors", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: "not-an-array" as unknown as Site["monitors"],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site monitors must be an array");
        });

        it("should validate site with multiple invalid monitors", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http" as MonitorType,
                        status: "up",
                        history: [],
                        url: "invalid-url",
                        checkInterval: 500,
                        timeout: 500,
                        retryAttempts: -1,
                    },
                    {
                        id: "monitor-2",
                        type: "port" as MonitorType,
                        status: "up",
                        history: [],
                        url: "",
                        checkInterval: 0,
                        timeout: 0,
                        retryAttempts: 100,
                    },
                ],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes("Monitor 1:"))).toBe(true);
            expect(result.errors.some(error => error.includes("Monitor 2:"))).toBe(true);
        });
    });

    describe("shouldIncludeInExport", () => {
        it("should include site with valid identifier", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(true);
        });

        it("should exclude site with empty identifier", () => {
            const site: Site = {
                identifier: "",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should exclude site with whitespace-only identifier", () => {
            const site: Site = {
                identifier: "   ",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should exclude site with null identifier", () => {
            const site: Site = {
                identifier: null as unknown as string,
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should exclude site with undefined identifier", () => {
            const site: Site = {
                identifier: undefined as unknown as string,
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });
    });

    describe("Edge cases", () => {
        it("should handle site with valid identifier and empty monitors array", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
            expect(result.errors).toEqual([]);
        });

        it("should handle site with valid identifier and null monitors", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: null as unknown as Site["monitors"],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site monitors must be an array");
        });

        it("should handle site with valid identifier and undefined monitors", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: undefined as unknown as Site["monitors"],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors).toContain("Site monitors must be an array");
        });

        it("should handle complex site with mixed valid and invalid monitors", () => {
            const site: Site = {
                identifier: "test-site",
                name: "Test Site",
                monitors: [
                    {
                        id: "monitor-1",
                        type: "http",
                        status: "up",
                        history: [],
                        url: "https://example.com",
                        checkInterval: 300000,
                        timeout: 30000,
                        retryAttempts: 3,
                    },
                    {
                        id: "monitor-2",
                        type: "http" as MonitorType,
                        status: "up",
                        history: [],
                        url: "invalid-url",
                        checkInterval: 500,
                        timeout: 500,
                        retryAttempts: -1,
                    },
                    {
                        id: "monitor-3",
                        type: "port",
                        status: "up",
                        history: [],
                        host: "localhost",
                        port: 8080,
                        checkInterval: 60000,
                        timeout: 5000,
                        retryAttempts: 2,
                    },
                ],
                monitoring: true,
            };

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes("Monitor 2:"))).toBe(true);
            expect(result.errors.some(error => error.includes("Monitor 1:"))).toBe(false);
            expect(result.errors.some(error => error.includes("Monitor 3:"))).toBe(false);
        });
    });
});
