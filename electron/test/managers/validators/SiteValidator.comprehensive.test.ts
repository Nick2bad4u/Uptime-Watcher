/**
 * Comprehensive tests for SiteValidator
 * Targeting 98% branch coverage for all validation logic
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { SiteValidator } from "../../../managers/validators/SiteValidator";
import { MonitorValidator } from "../../../managers/validators/MonitorValidator";
import type { Site, StatusHistory } from "../../../types";
import validator from "validator";

// Mock the MonitorValidator
const mockValidateMonitorConfiguration = vi.fn();
const mockShouldApplyDefaultInterval = vi.fn();

vi.mock("../../../managers/validators/MonitorValidator", () => ({
    MonitorValidator: vi.fn().mockImplementation(() => ({
        validateMonitorConfiguration: mockValidateMonitorConfiguration,
        shouldApplyDefaultInterval: mockShouldApplyDefaultInterval,
    })),
}));

const createMockMonitor = (overrides: Partial<Site["monitors"][0]> = {}): Site["monitors"][0] => {
    const history: StatusHistory[] = [];
    return {
        id: "test-monitor",
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

const createMockSite = (overrides: Partial<Site> = {}): Site => ({
    identifier: "test-site",
    name: "Test Site",
    monitoring: true,
    monitors: [createMockMonitor()],
    ...overrides,
});

describe("SiteValidator - Comprehensive Coverage", () => {
    let validator: SiteValidator;

    beforeEach(() => {
        validator = new SiteValidator();
        // Clear all mocks first
        vi.clearAllMocks();
        
        // Reset mocks before each test
        mockValidateMonitorConfiguration.mockReset();
        mockShouldApplyDefaultInterval.mockReset();
        
        // Default mock implementations
        mockValidateMonitorConfiguration.mockImplementation((monitor) => {
            return monitor.id && monitor.type && (monitor.url || (monitor.host && monitor.port)) ? { isValid: true, errors: [] } : { isValid: false, errors: ["Invalid monitor configuration"] };
        });
        
        mockShouldApplyDefaultInterval.mockReturnValue(false);
    });

    describe("shouldIncludeInExport", () => {
        it("should return true for site with valid identifier", () => {
            const site = createMockSite({ identifier: "valid-site" });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(true);
        });

        it("should return true for site with identifier containing spaces", () => {
            const site = createMockSite({ identifier: "site with spaces" });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(true);
        });

        it("should return true for site with special characters in identifier", () => {
            const site = createMockSite({ identifier: "site-with_special.chars@123" });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(true);
        });

        it("should return false for site with empty string identifier", () => {
            const site = createMockSite({ identifier: "" });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should return false for site with whitespace-only identifier", () => {
            const site = createMockSite({ identifier: "   " });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should return false for site with tab-only identifier", () => {
            const site = createMockSite({ identifier: "\t\t" });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should return false for site with newline-only identifier", () => {
            const site = createMockSite({ identifier: "\n\r" });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should return false for site with mixed whitespace identifier", () => {
            const site = createMockSite({ identifier: " \t\n\r " });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should return false for site with null identifier", () => {
            const site = createMockSite({ identifier: null as any });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });

        it("should return false for site with undefined identifier", () => {
            const site = createMockSite({ identifier: undefined as any });

            const result = validator.shouldIncludeInExport(site);
            expect(result).toBe(false);
        });
    });

    describe("validateSiteConfiguration", () => {
        it("should return valid result for properly configured site", () => {
            const site = createMockSite();

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should return valid result for site with multiple monitors", () => {
            const site = createMockSite({
                monitors: [
                    createMockMonitor({ id: "monitor-1", type: "http", url: "https://example1.com" }),
                    createMockMonitor({ id: "monitor-2", type: "port", host: "example.com", port: 8080 }),
                ],
            });
            // Remove URL from port monitor
            delete (site.monitors[1] as any).url;

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });

        it("should return invalid result for site with empty identifier", () => {
            const site = createMockSite({ identifier: "" });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("identifier"))).toBe(true);
        });

        it("should return invalid result for site with whitespace-only identifier", () => {
            const site = createMockSite({ identifier: "   " });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("whitespace"))).toBe(true);
        });

        it("should return invalid result for site with non-string identifier", () => {
            const site = createMockSite({ identifier: 123 as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("string value"))).toBe(true);
        });

        it("should return invalid result for site with null identifier", () => {
            const site = createMockSite({ identifier: null as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("non-empty string"))).toBe(true);
        });

        it("should return invalid result for site with undefined identifier", () => {
            const site = createMockSite({ identifier: undefined as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("non-empty string"))).toBe(true);
        });

        it("should return invalid result for site with non-array monitors", () => {
            const site = createMockSite({ monitors: "not-an-array" as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("array"))).toBe(true);
        });

        it("should return invalid result for site with null monitors", () => {
            const site = createMockSite({ monitors: null as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("array"))).toBe(true);
        });

        it("should return invalid result for site with undefined monitors", () => {
            const site = createMockSite({ monitors: undefined as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => error.includes("array"))).toBe(true);
        });
    });

    describe("validateSiteIdentifier (private method integration)", () => {
        it("should validate through validateSiteConfiguration - valid identifier", () => {
            const site = createMockSite({ identifier: "valid-site-id" });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
        });

        it("should validate through validateSiteConfiguration - empty identifier", () => {
            const site = createMockSite({ identifier: "" });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes("empty"))).toBe(true);
        });

        it("should validate through validateSiteConfiguration - whitespace identifier", () => {
            const site = createMockSite({ identifier: "  \t\n  " });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes("whitespace"))).toBe(true);
        });

        it("should validate through validateSiteConfiguration - non-string identifier", () => {
            const site = createMockSite({ identifier: { invalid: true } as any });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(false);
            expect(result.errors.some(error => error.includes("string value"))).toBe(true);
        });
    });

    describe("validateSiteMonitors (private method integration)", () => {
        it("should validate monitors and include monitor ID in error messages", () => {
            // Mock invalid monitor validation for this test
            mockValidateMonitorConfiguration.mockReturnValueOnce({
                isValid: false,
                errors: ["Invalid monitor configuration"],
            });

            const site = createMockSite({
                monitors: [createMockMonitor({ id: "failing-monitor" })],
            });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => 
                error.includes("Monitor 1") && error.includes("failing-monitor")
            )).toBe(true);
        });

        it("should validate monitors without ID and include monitor index in error messages", () => {
            // Mock invalid monitor validation for this test
            mockValidateMonitorConfiguration.mockReturnValueOnce({
                isValid: false,
                errors: ["Invalid monitor configuration"],
            });

            const site = createMockSite({
                monitors: [createMockMonitor({ id: "" })], // Empty ID
            });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors.some(error => 
                error.includes("Monitor 1:") && error.includes("Invalid monitor configuration")
            )).toBe(true);
        });

        it("should validate multiple monitors and include all errors", () => {
            // Mock invalid monitor validation for multiple monitors
            mockValidateMonitorConfiguration
                .mockReturnValueOnce({
                    isValid: false,
                    errors: ["First monitor error"],
                })
                .mockReturnValueOnce({
                    isValid: false,
                    errors: ["Second monitor error", "Another second monitor error"],
                });

            const site = createMockSite({
                monitors: [
                    createMockMonitor({ id: "monitor-1" }),
                    createMockMonitor({ id: "monitor-2" }),
                ],
            });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBe(3); // 1 + 2 errors
            expect(result.errors.some(error => 
                error.includes("Monitor 1") && error.includes("monitor-1")
            )).toBe(true);
            expect(result.errors.some(error => 
                error.includes("Monitor 2") && error.includes("monitor-2")
            )).toBe(true);
        });

        it("should return early when monitors is not an array", () => {
            const site = createMockSite({ monitors: "invalid" as any });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors).toEqual(["Site monitors must be an array"]);
        });
    });

    describe("Edge Cases and Complex Scenarios", () => {
        it("should handle site with all valid properties and edge case values", () => {
            const site = createMockSite({
                identifier: "a", // Minimum valid identifier
                name: "A", // Minimum valid name
                monitoring: false, // Non-default monitoring state
                monitors: [
                    createMockMonitor({
                        id: "edge-case-monitor",
                        checkInterval: 5000, // Minimum interval
                        timeout: 1000, // Minimum timeout
                        retryAttempts: 0, // Minimum retries
                        responseTime: -1, // Sentinel value
                        status: "paused",
                        monitoring: false,
                    }),
                ],
            });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
        });

        it("should handle site with maximum length values", () => {
            const site = createMockSite({
                identifier: "a".repeat(100), // Maximum identifier length (assuming 100 char limit)
                name: "Test Site Name",
                monitors: [createMockMonitor()],
            });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
        });

        it("should handle site with multiple validation errors", () => {
            // Mock monitor validation to fail
            mockValidateMonitorConfiguration.mockReturnValue({
                isValid: false,
                errors: ["Monitor validation failed"],
            });

            const site = createMockSite({
                identifier: "", // Invalid identifier
                monitors: [createMockMonitor()], // Will also fail monitor validation
            });

            const result = validator.validateSiteConfiguration(site);

            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(1); // Both identifier and monitor errors
            expect(result.errors.some(error => error.includes("identifier"))).toBe(true);
            expect(result.errors.some(error => error.includes("Monitor 1"))).toBe(true);
        });

        it("should handle site with empty monitor array", () => {
            const site = createMockSite({ monitors: [] });

            // This should still be valid as an empty array is allowed
            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
        });

        it("should handle site with special unicode characters in identifier", () => {
            const site = createMockSite({ identifier: "site-测试-🚀-identifier" });

            const result = validator.validateSiteConfiguration(site);
            expect(result.isValid).toBe(true);
        });

        it("should properly integrate MonitorValidator", () => {
            // Verify that MonitorValidator is called for each monitor
            const site = createMockSite({
                monitors: [
                    createMockMonitor({ id: "monitor-1" }),
                    createMockMonitor({ id: "monitor-2" }),
                ],
            });

            validator.validateSiteConfiguration(site);

            expect(mockValidateMonitorConfiguration).toHaveBeenCalledTimes(2);
        });
    });

    describe("Constructor", () => {
        it("should create MonitorValidator instance", () => {
            new SiteValidator();
            expect(MonitorValidator).toHaveBeenCalled();
        });

        it("should create separate MonitorValidator instances for multiple SiteValidator instances", () => {
            const validator1 = new SiteValidator();
            const validator2 = new SiteValidator();

            expect(MonitorValidator).toHaveBeenCalledTimes(2);
            expect(validator1).not.toBe(validator2);
        });
    });
});
